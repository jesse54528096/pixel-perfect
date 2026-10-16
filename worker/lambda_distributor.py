"""
M4 distributor: an AWS Lambda fired every minute by EventBridge. Replaces the
M1 EC2 distributor.py loop.

Each tick: find jobs with status='pending', make sure each has a linked
job_sessions row, and launch one ECS Fargate task per session that has no
fargate_task_arn yet. The ARN is written right after RunTask, so the next tick
skips it (the Lambda is stateless; the DB column is the idempotency).

Credentials: SUPABASE_URL / SUPABASE_SECRET_KEY / OPENAI_API_KEY are read from
AWS Secrets Manager (the Lambda role can read exactly those three secrets) and
forwarded to the Fargate task as env vars, so the task role stays empty.

Deployed with the AWS API (zip), not by CodeBuild; the Lambda's reserved
concurrency is 1 so two ticks never spawn the same job.
"""
import os

import boto3
from supabase import create_client

SECRET_NAMES = {
    "SUPABASE_URL": "supabase-url",
    "SUPABASE_SECRET_KEY": "supabase-secret-key",
    "OPENAI_API_KEY": "openai-api-key",
}

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
        session = (db.table("job_sessions").select("fargate_task_arn")
                   .eq("id", session_id).single().execute().data)
        if session.get("fargate_task_arn"):
            continue  # already spawned on an earlier tick
        arn = _run_task(job["id"], secrets)
        if arn is None:
            continue  # retried next tick
        db.table("job_sessions").update(
            {"fargate_task_arn": arn}).eq("id", session_id).execute()
        print(f"[{job['id']}] spawned {arn}")
        spawned.append(job["id"])

    return {"pending": len(jobs), "spawned": spawned}
