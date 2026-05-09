"""Comprehensive backend API tests for Our Young India."""
import os
import io
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    # Fallback: read frontend/.env
    try:
        with open('/app/frontend/.env') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    BASE_URL = line.split('=', 1)[1].strip().strip('"').rstrip('/')
                    break
    except Exception:
        pass

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@ouryoungindia.in"
ADMIN_PASS = "Admin@123"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed ({r.status_code}): {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------------- Health & Root ----------------
class TestRoot:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        assert "message" in r.json()


# ---------------- Stories ----------------
class TestStories:
    def test_list_stories_seeded(self, client):
        r = client.get(f"{API}/stories")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data and "total" in data
        assert data["total"] >= 10, f"Expected >=10 seeded, got {data['total']}"
        names = [s["name"] for s in data["items"]]
        assert "Aarav Sharma" in names

    def test_filters_search(self, client):
        r = client.get(f"{API}/stories", params={"search": "Aarav"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert any("Aarav" in s["name"] for s in items)

    def test_filters_age(self, client):
        r = client.get(f"{API}/stories", params={"age": "9-11"})
        assert r.status_code == 200
        for s in r.json()["items"]:
            assert 9 <= s["age"] <= 11

    def test_filters_field(self, client):
        r = client.get(f"{API}/stories", params={"field": "Sports"})
        assert r.status_code == 200
        for s in r.json()["items"]:
            assert s["field"].lower() == "sports"

    def test_filters_state(self, client):
        r = client.get(f"{API}/stories", params={"state": "Maharashtra"})
        assert r.status_code == 200
        items = r.json()["items"]
        assert len(items) > 0
        for s in items:
            assert s["state"].lower() == "maharashtra"

    def test_filters_sort_az(self, client):
        r = client.get(f"{API}/stories", params={"sort": "az"})
        assert r.status_code == 200
        names = [s["name"] for s in r.json()["items"]]
        assert names == sorted(names)

    def test_get_story_by_slug(self, client):
        r = client.get(f"{API}/stories/aarav-sharma")
        assert r.status_code == 200
        data = r.json()
        assert "story" in data and "related" in data
        assert data["story"]["slug"] == "aarav-sharma"
        assert data["story"]["youtube_id"]  # non-empty
        assert isinstance(data["related"], list)

    def test_get_story_404(self, client):
        r = client.get(f"{API}/stories/non-existent-xyz-{uuid.uuid4().hex[:6]}")
        assert r.status_code == 404


# ---------------- Stats / Categories ----------------
class TestStats:
    def test_stats(self, client):
        r = client.get(f"{API}/stats")
        assert r.status_code == 200
        d = r.json()
        for key in ["stories_published", "fields_covered", "states_reached", "kids_inspired"]:
            assert key in d
        assert d["stories_published"] >= 10

    def test_categories(self, client):
        r = client.get(f"{API}/categories")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, dict)
        assert "Sports" in d


# ---------------- Auth ----------------
class TestAuth:
    def test_login_success(self, client):
        r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and isinstance(d["token"], str)
        assert d["email"] == ADMIN_EMAIL

    def test_login_bad(self, client):
        r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_token(self, client):
        r = client.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, client, auth_headers):
        r = requests.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"


# ---------------- Nominations ----------------
class TestNominations:
    nomination_id = None

    def test_create_nomination(self, client):
        payload = {
            "your_name": "TEST_Nominator",
            "your_email": "test_nom@example.com",
            "relationship": "Parent",
            "nominee_name": "TEST_Kid",
            "nominee_age": 10,
            "field": "Sports",
            "achievement_brief": "Won state level chess",
            "why_feature": "Inspires others",
            "contact_info": "9999999999",
            "city": "Mumbai",
            "state": "Maharashtra",
            "consent": True,
        }
        r = client.post(f"{API}/nominations", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ok"] is True
        assert d["nominee_name"] == "TEST_Kid"
        TestNominations.nomination_id = d["id"]

    def test_create_nomination_missing_required(self, client):
        r = client.post(f"{API}/nominations", json={"your_name": "x"})
        assert r.status_code in (400, 422)

    def test_list_nominations_admin(self, client, auth_headers):
        r = requests.get(f"{API}/nominations", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()["items"]
        assert any(n["nominee_name"] == "TEST_Kid" for n in items)

    def test_list_nominations_unauth(self, client):
        r = client.get(f"{API}/nominations")
        assert r.status_code == 401


# ---------------- Comments ----------------
class TestComments:
    def test_create_and_list(self, client):
        # Get a story id
        story = client.get(f"{API}/stories/aarav-sharma").json()["story"]
        sid = story["id"]
        r = client.post(f"{API}/comments", json={"story_id": sid, "name": "TEST_user", "text": "Great story!"})
        assert r.status_code == 200, r.text
        c = r.json()
        assert c["story_id"] == sid
        assert c["text"] == "Great story!"

        r2 = client.get(f"{API}/comments", params={"story_id": sid})
        assert r2.status_code == 200
        items = r2.json()["items"]
        assert any(it["text"] == "Great story!" for it in items)

    def test_empty_comment_rejected(self, client):
        r = client.post(f"{API}/comments", json={"story_id": "xxx", "text": "  "})
        assert r.status_code == 400


# ---------------- Reactions ----------------
class TestReactions:
    def test_reaction_increments(self, client):
        story = client.get(f"{API}/stories/priya-iyer").json()["story"]
        sid = story["id"]
        before = story.get("reactions", {}).get("inspiring", 0)
        r = client.post(f"{API}/reactions", json={"story_id": sid, "type": "inspiring"})
        assert r.status_code == 200
        after = client.get(f"{API}/stories/priya-iyer").json()["story"]["reactions"]["inspiring"]
        assert after == before + 1

    def test_reaction_invalid_type(self, client):
        r = client.post(f"{API}/reactions", json={"story_id": "x", "type": "haha"})
        assert r.status_code == 400

    def test_reaction_by_slug(self, client):
        r = client.post(f"{API}/reactions", json={"story_id": "diya-reddy", "type": "love"})
        assert r.status_code == 200


# ---------------- Newsletter ----------------
class TestNewsletter:
    def test_subscribe(self, client):
        r = client.post(f"{API}/newsletter", params={"email": "test_news@example.com"})
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_subscribe_bad_email(self, client):
        r = client.post(f"{API}/newsletter", params={"email": "not-an-email"})
        assert r.status_code == 400


# ---------------- Story CRUD (Admin) ----------------
class TestStoryAdminCRUD:
    created_id = None
    created_slug = None

    def test_create_unauth(self, client):
        r = client.post(f"{API}/stories", json={
            "name": "X", "age": 10, "field": "Sports",
            "achievement": "y", "city": "z", "state": "w",
        })
        assert r.status_code == 401

    def test_create_story(self, client, auth_headers):
        payload = {
            "name": "TEST_Kid_AdminCRUD",
            "age": 11,
            "field": "Technology",
            "achievement": "Built app",
            "hook": "hook",
            "city": "Mumbai",
            "state": "Maharashtra",
            "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        }
        r = requests.post(f"{API}/stories", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["slug"] == "test-kid-admincrud"
        assert d["youtube_id"] == "dQw4w9WgXcQ"
        TestStoryAdminCRUD.created_id = d["id"]
        TestStoryAdminCRUD.created_slug = d["slug"]

        # Verify GET works
        g = requests.get(f"{API}/stories/{d['slug']}")
        assert g.status_code == 200

    def test_update_story(self, client, auth_headers):
        assert TestStoryAdminCRUD.created_id
        payload = {
            "name": "TEST_Kid_AdminCRUD",
            "age": 12,
            "field": "Technology",
            "achievement": "Built better app",
            "hook": "hook2",
            "city": "Pune",
            "state": "Maharashtra",
        }
        r = requests.put(f"{API}/stories/{TestStoryAdminCRUD.created_id}", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        assert r.json()["age"] == 12
        assert r.json()["city"] == "Pune"

    def test_delete_story(self, client, auth_headers):
        assert TestStoryAdminCRUD.created_id
        r = requests.delete(f"{API}/stories/{TestStoryAdminCRUD.created_id}", headers=auth_headers)
        assert r.status_code == 200
        # Verify gone
        g = requests.get(f"{API}/stories/{TestStoryAdminCRUD.created_slug}")
        assert g.status_code == 404


# ---------------- File Upload ----------------
class TestUpload:
    def test_upload_image(self, client):
        # Tiny valid PNG (1x1)
        png_bytes = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4"
            "890000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
        )
        files = {"file": ("test.png", io.BytesIO(png_bytes), "image/png")}
        r = requests.post(f"{API}/upload", files=files)
        if r.status_code == 503:
            pytest.skip("Storage unavailable")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "id" in d and "url" in d
        # Try fetching via served url
        file_url = f"{BASE_URL}{d['url']}"
        g = requests.get(file_url)
        assert g.status_code == 200
        assert g.headers.get("content-type", "").startswith("image/")

    def test_upload_invalid_type(self, client):
        files = {"file": ("test.txt", io.BytesIO(b"hello"), "text/plain")}
        r = requests.post(f"{API}/upload", files=files)
        assert r.status_code == 400
