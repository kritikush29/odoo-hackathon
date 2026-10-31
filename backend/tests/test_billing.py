from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_billing_run_returns_job_id():
    response = client.post("/billing/run", json={"dry_run": False})
    assert response.status_code == 200
    payload = response.json()
    assert "job_id" in payload


def test_billing_status_lookup():
    run_response = client.post("/billing/run", json={"dry_run": True})
    job_id = run_response.json()["job_id"]
    response = client.get(f"/billing/jobs/{job_id}")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "dry-run"
    assert body["skipped"] == 3
