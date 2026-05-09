"""
Backend tests for Nomination workflow:
- POST /api/nominations creates with status_history seeded
- GET /api/nominations returns items normalized (legacy 'new' -> 'pending')
- PUT /api/nominations/{id} updates status / notes / interview, requires admin
- Invalid status -> 400; without admin token -> 401/403
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.strip().split("=", 1)[1].rstrip("/")

ADMIN_EMAIL = "admin@ouryoungindia.in"
ADMIN_PASS = "Admin@123"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASS},
                      timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def created_nom_id():
    payload = {
        "your_name": "TEST_Nominator",
        "your_email": "test_nominator@example.com",
        "relationship": "Parent",
        "nominee_name": "TEST_Nominee",
        "nominee_age": 12,
        "field": "Science",
        "achievement_brief": "TEST achievement brief for testing",
        "why_feature": "TEST why feature reason for testing",
        "contact_info": "test_contact@example.com",
        "city": "TestCity",
        "state": "TestState",
        "consent": True,
    }
    r = requests.post(f"{BASE_URL}/api/nominations", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("ok") is True
    assert "id" in data
    return data["id"]


# --- POST /api/nominations creates with status_history seeded ---
def test_create_nomination_seeds_status_history(auth_headers, created_nom_id):
    r = requests.get(f"{BASE_URL}/api/nominations", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    items = r.json()["items"]
    nom = next((x for x in items if x["id"] == created_nom_id), None)
    assert nom is not None, "created nomination not in GET list"
    assert nom["status"] == "pending"
    assert isinstance(nom.get("status_history"), list)
    assert len(nom["status_history"]) >= 1
    assert nom["status_history"][0]["status"] == "pending"
    assert "Submitted" in nom["status_history"][0]["note"]


# --- GET /api/nominations requires admin ---
def test_list_nominations_requires_admin():
    r = requests.get(f"{BASE_URL}/api/nominations", timeout=15)
    assert r.status_code in (401, 403), f"expected 401/403 got {r.status_code}"


# --- GET returns status_history backfilled, no _id leak ---
def test_list_nominations_no_objectid_and_backfilled(auth_headers):
    r = requests.get(f"{BASE_URL}/api/nominations", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    items = r.json()["items"]
    for it in items:
        assert "_id" not in it
        assert it.get("status") != "new", "legacy 'new' should be normalized to 'pending'"
        assert isinstance(it.get("status_history"), list) and len(it["status_history"]) >= 1


# --- PUT requires admin ---
def test_put_requires_admin(created_nom_id):
    r = requests.put(f"{BASE_URL}/api/nominations/{created_nom_id}",
                     json={"status": "approved"}, timeout=15)
    assert r.status_code in (401, 403)


# --- PUT invalid status -> 400 ---
def test_put_invalid_status_returns_400(auth_headers, created_nom_id):
    r = requests.put(f"{BASE_URL}/api/nominations/{created_nom_id}",
                     headers=auth_headers,
                     json={"status": "garbage"}, timeout=15)
    assert r.status_code == 400, f"expected 400 got {r.status_code}: {r.text}"


# --- PUT status approved with note appends to history ---
def test_put_status_approved_appends_history(auth_headers, created_nom_id):
    r = requests.put(f"{BASE_URL}/api/nominations/{created_nom_id}",
                     headers=auth_headers,
                     json={"status": "approved", "note": "Approved by admin TEST"},
                     timeout=15)
    assert r.status_code == 200, r.text
    updated = r.json()
    assert updated["status"] == "approved"
    history = updated.get("status_history", [])
    assert len(history) >= 2
    last = history[-1]
    assert last["status"] == "approved"
    assert "TEST" in last["note"]

    # Verify persistence via GET
    g = requests.get(f"{BASE_URL}/api/nominations", headers=auth_headers, timeout=15)
    nom = next(x for x in g.json()["items"] if x["id"] == created_nom_id)
    assert nom["status"] == "approved"
    assert any(h["status"] == "approved" for h in nom["status_history"])


# --- PUT internal_notes saves ---
def test_put_internal_notes(auth_headers, created_nom_id):
    note_text = "TEST private internal note text"
    r = requests.put(f"{BASE_URL}/api/nominations/{created_nom_id}",
                     headers=auth_headers,
                     json={"internal_notes": note_text}, timeout=15)
    assert r.status_code == 200
    assert r.json().get("internal_notes") == note_text

    g = requests.get(f"{BASE_URL}/api/nominations", headers=auth_headers, timeout=15)
    nom = next(x for x in g.json()["items"] if x["id"] == created_nom_id)
    assert nom["internal_notes"] == note_text


# --- PUT scheduled with date/link ---
def test_put_scheduled_with_date_and_link(auth_headers, created_nom_id):
    date_str = "2026-02-15T10:00:00"
    link = "https://meet.google.com/test-abc-xyz"
    r = requests.put(f"{BASE_URL}/api/nominations/{created_nom_id}",
                     headers=auth_headers,
                     json={"status": "scheduled",
                           "interview_date": date_str,
                           "interview_link": link,
                           "note": "Scheduled TEST"},
                     timeout=15)
    assert r.status_code == 200, r.text
    updated = r.json()
    assert updated["status"] == "scheduled"
    assert updated["interview_date"] == date_str
    assert updated["interview_link"] == link
    assert any(h["status"] == "scheduled" for h in updated.get("status_history", []))


# --- PUT rejection_reason ---
def test_put_rejection_reason(auth_headers, created_nom_id):
    r = requests.put(f"{BASE_URL}/api/nominations/{created_nom_id}",
                     headers=auth_headers,
                     json={"status": "rejected",
                           "rejection_reason": "TEST out of age range",
                           "note": "TEST reject"}, timeout=15)
    assert r.status_code == 200
    updated = r.json()
    assert updated["status"] == "rejected"
    assert updated["rejection_reason"] == "TEST out of age range"


# --- PUT non-existent id -> 404 ---
def test_put_nonexistent_returns_404(auth_headers):
    r = requests.put(f"{BASE_URL}/api/nominations/does-not-exist-xyz",
                     headers=auth_headers,
                     json={"status": "approved"}, timeout=15)
    assert r.status_code == 404
