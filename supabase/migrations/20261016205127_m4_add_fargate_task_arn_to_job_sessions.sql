-- M4: the stateless Lambda distributor keeps its idempotency in the DB.
-- It only spawns a Fargate task for sessions WHERE fargate_task_arn IS NULL
-- and writes the task ARN right after ecs:RunTask.
ALTER TABLE job_sessions ADD COLUMN IF NOT EXISTS fargate_task_arn TEXT;
CREATE INDEX IF NOT EXISTS idx_job_sessions_unspawned
  ON job_sessions (id) WHERE fargate_task_arn IS NULL;
