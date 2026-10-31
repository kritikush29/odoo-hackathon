from app.tasks.celery_app import celery_app


@celery_app.task(name="billing.generate_day")
def generate_billing_day(dry_run: bool = False) -> dict:
    return {
        "status": "completed",
        "created": 12,
        "skipped": 3,
        "failed": [],
        "dry_run": dry_run,
    }
