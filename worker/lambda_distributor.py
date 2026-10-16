"""
M4 distributor: an AWS Lambda fired every minute by EventBridge. Replaces the
M1 EC2 distributor.py loop.

Each tick: find jobs with status='pending', make sure each has a linked
job_sessions row, and launch one ECS Fargate task per session that has no
fargate_task_arn yet. The session is claimed first (fargate_task_arn set from
NULL to a placeholder in one conditional UPDATE), so two overlapping ticks can't
both spawn it; the real ARN replaces the placeholder right after RunTask (the
Lambda is stateless; the DB column is the idempotency).

Credentials: SUPABASE_URL / SUPABASE_SECRET_KEY / OPENAI_API_KEY are read from
AWS Secrets Manager (the Lambda role can read exactly those three secrets) and
forwarded to the Fargate task as env vars, so the task role stays empty.

Deployed with the AWS API (zip), not by CodeBuild.
"""
import os

import boto3
from supabase import create_client

SECRET_NAMES = {
    "SUPABASE_URL": "supabase-url",
    "SUPABASE_SECRET_KEY": "supabase-secret-key",
    "OPENAI_API_KEY": "openai-api-key",
}

CLAIMED = "claimed"  # placeholder while RunTask is in flight

ecs = boto3.client("ecs")
_secrets: dict[str, str] | None = None


def _load_secrets() -> dict[str, str]:
    global _secrets
    if _secrets is None:
        sm = boto3.client("secretsmanager")
        _secrets = {
            key: sm.get_secret_value(SecretId=name)["SecretString"]
            for key, name in SECRET_NAMES.items()
        }
    return _secrets


def _ensure_session(db, job: dict) -> str:
    """Return the job's current session id, creating and linking one if missing.

    POST /api/jobs already creates and links the session; this covers jobs
    inserted directly (tests). Without the jobs.current_session_id update the
    worker crashes at its first update_session().
    """
    if job.get("current_session_id"):
        return job["current_session_id"]
    row = db.table("job_sessions").insert(
        {"job_id": job["id"], "session_number": 1}).execute().data[0]
    db.table("jobs").update(
        {"current_session_id": row["id"]}).eq("id", job["id"]).execute()
    return row["id"]


def _run_task(job_id: str, secrets: dict[str, str]) -> str | None:
    env = [{"name": "JOB_ID", "value": job_id}] + [
        {"name": k, "value": v} for k, v in secrets.items()
    ]
    resp = ecs.run_task(
        cluster=os.environ["ECS_CLUSTER"],
        taskDefinition=os.environ["TASK_DEFINITION"],
        launchType="FARGATE",
        count=1,
        networkConfiguration={"awsvpcConfiguration": {
            "subnets": os.environ["SUBNETS"].split(","),
            "securityGroups": os.environ["SECURITY_GROUPS"].split(","),
            "assignPublicIp": "ENABLED",
        }},
        overrides={"containerOverrides": [{"name": "worker", "environment": env}]},
    )
    if resp.get("failures") or not resp.get("tasks"):
        print(f"[{job_id}] run_task failed: {resp.get('failures')}")
        return None
    return resp["tasks"][0]["taskArn"]


def handler(event, context):
    secrets = _load_secrets()
    db = create_client(secrets["SUPABASE_URL"], secrets["SUPABASE_SECRET_KEY"])

    jobs = (db.table("jobs").select("id,current_session_id")
            .eq("status", "pending").execute().data)
    spawned = []
    for job in jobs:
        session_id = _ensure_session(db, job)
        claimed = (db.table("job_sessions").update({"fargate_task_arn": CLAIMED})
                   .eq("id", session_id).is_("fargate_task_arn", "null")
                   .execute().data)
        if not claimed:
            continue  # already spawned (or being spawned) by another tick
        try:
            arn = _run_task(job["id"], secrets)
        except Exception as e:
            print(f"[{job['id']}] run_task error: {e}")
            arn = None
        if arn is None:  # release the claim so the next tick retries
            db.table("job_sessions").update(
                {"fargate_task_arn": None}).eq("id", session_id).execute()
            continue
        db.table("job_sessions").update(
            {"fargate_task_arn": arn}).eq("id", session_id).execute()
        print(f"[{job['id']}] spawned {arn}")
        spawned.append(job["id"])

    return {"pending": len(jobs), "spawned": spawned}
