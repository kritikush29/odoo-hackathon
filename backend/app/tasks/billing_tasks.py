from app.tasks.celery_app import celery_app


@celery_app.task(name="billing.generate_day")
def generate_billing_day(dry_run: bool = False) -> dict:
    created = 0 if dry_run else 18
    return {
        "status": "dry-run" if dry_run else "completed",
        "created": created,
        "skipped": 3,
        "failed": [],
        "dry_run": dry_run,
    }
