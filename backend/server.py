from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header, Query, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import re
import jwt
import bcrypt
import requests
import certifi
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['mongodb+srv://oyi_admin:g4smbDjj9DEMRmSA@cluster0.l5bwr5i.mongodb.net/ouryoungindia?retryWrites=true&w=majority&ssl=true']
client = AsyncIOMotorClient(
    mongo_url,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000
)
db = client[os.environ['ouryoungindia']]

# Constants
JWT_SECRET = os.environ.get('JWT_SECRET', 'oyi-super-secret-change-in-prod')
JWT_ALGO = 'HS256'
JWT_EXPIRE_HOURS = 24 * 7

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = "ouryoungindia"
storage_key = None

logger = logging.getLogger(__name__)


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY not set, storage disabled")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------- Pydantic Models ----------------

class Resource(BaseModel):
    icon: str = "📚"
    name: str
    type: str = ""
    description: str = ""
    link: str = ""
    price: str = ""


class Takeaway(BaseModel):
    icon: str = "💡"
    title: str
    description: str


class JourneySection(BaseModel):
    heading: str
    body: str


class Story(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    age: int
    field: str  # Academics, Sports, etc
    achievement: str
    hook: str = ""  # 1-line hook
    city: str
    state: str
    youtube_url: str = ""
    youtube_id: str = ""
    thumbnail: str = ""
    photo_url: str = ""
    watch_time: str = "10 min"
    daily_practice: str = ""
    journey_started: str = ""
    grade: str = ""
    coaching_cost: str = ""
    journey_sections: List[JourneySection] = []
    pull_quote: str = ""
    takeaways: List[Takeaway] = []
    resources: List[Resource] = []
    advice: str = ""
    next_goal: str = ""
    support_system: str = ""
    tags: List[str] = []
    views: int = 0
    reactions: dict = Field(default_factory=lambda: {"inspiring": 0, "love": 0, "amazing": 0, "motivating": 0})
    published_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class StoryCreate(BaseModel):
    name: str
    age: int
    field: str
    achievement: str
    hook: str = ""
    city: str
    state: str
    youtube_url: str = ""
    thumbnail: str = ""
    photo_url: str = ""
    watch_time: str = "10 min"
    daily_practice: str = ""
    journey_started: str = ""
    grade: str = ""
    coaching_cost: str = ""
    journey_sections: List[JourneySection] = []
    pull_quote: str = ""
    takeaways: List[Takeaway] = []
    resources: List[Resource] = []
    advice: str = ""
    next_goal: str = ""
    support_system: str = ""
    tags: List[str] = []


class StatusHistoryEntry(BaseModel):
    status: str
    note: str = ""
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Nomination(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    your_name: str
    your_email: str
    relationship: str
    nominee_name: str
    nominee_age: int
    field: str
    achievement_brief: str
    why_feature: str
    contact_info: str
    city: str
    state: str
    photo_url: str = ""
    instagram: str = ""
    youtube: str = ""
    consent: bool = True
    status: str = "pending"  # pending, approved, contacted, scheduled, in_production, published, rejected, needs_info
    internal_notes: str = ""
    rejection_reason: str = ""
    interview_date: str = ""
    interview_link: str = ""
    status_history: List[StatusHistoryEntry] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class NominationCreate(BaseModel):
    your_name: str
    your_email: EmailStr
    relationship: str
    nominee_name: str
    nominee_age: int
    field: str
    achievement_brief: str
    why_feature: str
    contact_info: str
    city: str
    state: str
    photo_url: str = ""
    instagram: str = ""
    youtube: str = ""
    consent: bool = True


class Comment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    story_id: str
    name: str = "Anonymous"
    text: str
    approved: bool = True  # auto-approve for demo; in prod set False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CommentCreate(BaseModel):
    story_id: str
    name: str = "Anonymous"
    text: str


class ReactionCreate(BaseModel):
    story_id: str
    type: str  # inspiring, love, amazing, motivating


class LoginRequest(BaseModel):
    email: str
    password: str


# ---------------- Helpers ----------------

def slugify(text: str) -> str:
    text = re.sub(r'[^a-zA-Z0-9\s-]', '', text).lower().strip()
    text = re.sub(r'[\s_-]+', '-', text)
    return text[:80]


def extract_youtube_id(url: str) -> str:
    if not url:
        return ""
    patterns = [
        r'(?:v=|/v/|youtu\.be/|/embed/|/shorts/)([0-9A-Za-z_-]{11})',
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    if len(url) == 11 and re.match(r'^[0-9A-Za-z_-]{11}$', url):
        return url
    return ""


def youtube_thumbnail(yt_id: str) -> str:
    if not yt_id:
        return ""
    return f"https://i.ytimg.com/vi/{yt_id}/hqdefault.jpg"


def create_jwt_token(payload: dict) -> str:
    payload = {**payload, "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def verify_jwt_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def admin_required(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    payload = verify_jwt_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return payload


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ---------------- App + Router ----------------

app = FastAPI(title="Our Young India API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "Our Young India API", "version": "1.0"}


# ---------- Stories ----------

@api_router.get("/stories")
async def list_stories(
    search: Optional[str] = None,
    age: Optional[str] = None,  # "6-8", "9-11", "12-14", "15-17"
    field: Optional[str] = None,
    state: Optional[str] = None,
    sort: Optional[str] = "latest",  # latest, popular, az
    limit: int = 100,
    skip: int = 0,
):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"achievement": {"$regex": search, "$options": "i"}},
            {"city": {"$regex": search, "$options": "i"}},
            {"state": {"$regex": search, "$options": "i"}},
            {"hook": {"$regex": search, "$options": "i"}},
        ]
    if age and age != "all":
        try:
            lo, hi = age.split("-")
            query["age"] = {"$gte": int(lo), "$lte": int(hi)}
        except Exception:
            pass
    if field and field.lower() != "all":
        query["field"] = {"$regex": f"^{re.escape(field)}$", "$options": "i"}
    if state and state.lower() != "all":
        query["state"] = {"$regex": f"^{re.escape(state)}$", "$options": "i"}

    sort_spec = [("created_at", -1)]
    if sort == "popular":
        sort_spec = [("views", -1)]
    elif sort == "az":
        sort_spec = [("name", 1)]

    cursor = db.stories.find(query, {"_id": 0}).sort(sort_spec).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    total = await db.stories.count_documents(query)
    return {"items": items, "total": total}


@api_router.get("/stories/{slug}")
async def get_story(slug: str):
    story = await db.stories.find_one({"slug": slug}, {"_id": 0})
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    # Increment views
    await db.stories.update_one({"slug": slug}, {"$inc": {"views": 1}})
    story["views"] = story.get("views", 0) + 1

    # Related: same field, exclude this one
    related_cursor = db.stories.find(
        {"field": story["field"], "slug": {"$ne": slug}}, {"_id": 0}
    ).limit(4)
    related = await related_cursor.to_list(length=4)
    if len(related) < 3:
        more = await db.stories.find({"slug": {"$ne": slug}}, {"_id": 0}).limit(4 - len(related)).to_list(4)
        seen = {r["slug"] for r in related}
        for m in more:
            if m["slug"] not in seen:
                related.append(m)

    return {"story": story, "related": related}


@api_router.post("/stories")
async def create_story(payload: StoryCreate, _admin: dict = Depends(admin_required)):
    data = payload.model_dump()
    yt_id = extract_youtube_id(data.get("youtube_url", ""))
    data["youtube_id"] = yt_id
    if not data.get("thumbnail") and yt_id:
        data["thumbnail"] = youtube_thumbnail(yt_id)
    base_slug = slugify(data["name"]) or "story"
    slug = base_slug
    i = 1
    while await db.stories.find_one({"slug": slug}, {"_id": 1}):
        slug = f"{base_slug}-{i}"
        i += 1
    story = Story(slug=slug, **data)
    doc = story.model_dump()
    await db.stories.insert_one(dict(doc))
    return story


@api_router.put("/stories/{story_id}")
async def update_story(story_id: str, payload: StoryCreate, _admin: dict = Depends(admin_required)):
    data = payload.model_dump()
    yt_id = extract_youtube_id(data.get("youtube_url", ""))
    data["youtube_id"] = yt_id
    if not data.get("thumbnail") and yt_id:
        data["thumbnail"] = youtube_thumbnail(yt_id)
    result = await db.stories.update_one({"id": story_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    updated = await db.stories.find_one({"id": story_id}, {"_id": 0})
    return updated


@api_router.delete("/stories/{story_id}")
async def delete_story(story_id: str, _admin: dict = Depends(admin_required)):
    result = await db.stories.delete_one({"id": story_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story not found")
    return {"ok": True}


# ---------- Stats ----------

@api_router.get("/stats")
async def get_stats():
    total = await db.stories.count_documents({})
    fields = await db.stories.distinct("field")
    states = await db.stories.distinct("state")
    # Fixed inspirational number for "kids inspired"
    return {
        "stories_published": max(total, 0),
        "fields_covered": len(fields),
        "states_reached": len(states),
        "kids_inspired": 50000,
    }


@api_router.get("/categories")
async def get_categories():
    pipeline = [{"$group": {"_id": "$field", "count": {"$sum": 1}}}]
    rows = await db.stories.aggregate(pipeline).to_list(length=100)
    return {row["_id"]: row["count"] for row in rows if row["_id"]}


# ---------- Nominations ----------

@api_router.post("/nominations")
async def create_nomination(payload: NominationCreate):
    nom = Nomination(**payload.model_dump())
    nom.status_history = [StatusHistoryEntry(status="pending", note="Submitted via website")]
    await db.nominations.insert_one(dict(nom.model_dump()))
    return {"ok": True, "id": nom.id, "nominee_name": nom.nominee_name}


@api_router.get("/nominations")
async def list_nominations(_admin: dict = Depends(admin_required)):
    items = await db.nominations.find({}, {"_id": 0}).sort([("created_at", -1)]).to_list(500)
    # Backfill: normalize legacy "new" status to "pending"
    for it in items:
        if it.get("status") == "new":
            it["status"] = "pending"
        if not it.get("status_history"):
            it["status_history"] = [{
                "status": it.get("status", "pending"),
                "note": "Submitted",
                "timestamp": it.get("created_at", datetime.now(timezone.utc).isoformat())
            }]
    return {"items": items}


class NominationUpdate(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = ""
    internal_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    interview_date: Optional[str] = None
    interview_link: Optional[str] = None


VALID_NOM_STATUSES = {"pending", "approved", "contacted", "scheduled", "in_production", "published", "rejected", "needs_info"}


@api_router.put("/nominations/{nom_id}")
async def update_nomination(nom_id: str, payload: NominationUpdate, _admin: dict = Depends(admin_required)):
    existing = await db.nominations.find_one({"id": nom_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")

    update_doc = {}
    push_doc = {}

    if payload.status is not None:
        if payload.status not in VALID_NOM_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {sorted(VALID_NOM_STATUSES)}")
        if payload.status != existing.get("status"):
            update_doc["status"] = payload.status
            push_doc["status_history"] = {
                "status": payload.status,
                "note": payload.note or "",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
    if payload.internal_notes is not None:
        update_doc["internal_notes"] = payload.internal_notes
    if payload.rejection_reason is not None:
        update_doc["rejection_reason"] = payload.rejection_reason
    if payload.interview_date is not None:
        update_doc["interview_date"] = payload.interview_date
    if payload.interview_link is not None:
        update_doc["interview_link"] = payload.interview_link

    mongo_update = {}
    if update_doc:
        mongo_update["$set"] = update_doc
    if push_doc:
        mongo_update["$push"] = push_doc

    if mongo_update:
        await db.nominations.update_one({"id": nom_id}, mongo_update)

    updated = await db.nominations.find_one({"id": nom_id}, {"_id": 0})
    return updated


# ---------- Comments ----------

@api_router.post("/comments")
async def create_comment(payload: CommentCreate):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Empty comment")
    if len(payload.text) > 1000:
        raise HTTPException(status_code=400, detail="Comment too long")
    comment = Comment(**payload.model_dump())
    await db.comments.insert_one(dict(comment.model_dump()))
    return comment


@api_router.get("/comments")
async def list_comments(story_id: str, limit: int = 50):
    items = await db.comments.find(
        {"story_id": story_id, "approved": True}, {"_id": 0}
    ).sort([("created_at", -1)]).limit(limit).to_list(length=limit)
    return {"items": items}


# ---------- Reactions ----------

@api_router.post("/reactions")
async def add_reaction(payload: ReactionCreate):
    valid = {"inspiring", "love", "amazing", "motivating"}
    if payload.type not in valid:
        raise HTTPException(status_code=400, detail="Invalid reaction type")
    result = await db.stories.update_one(
        {"id": payload.story_id},
        {"$inc": {f"reactions.{payload.type}": 1}}
    )
    if result.matched_count == 0:
        # try by slug as fallback
        result = await db.stories.update_one(
            {"slug": payload.story_id},
            {"$inc": {f"reactions.{payload.type}": 1}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Story not found")
    return {"ok": True}


# ---------- Auth ----------

@api_router.post("/auth/login")
async def login(payload: LoginRequest):
    admin = await db.admins.find_one({"email": payload.email}, {"_id": 0})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_jwt_token({"sub": admin["email"], "role": "admin"})
    return {"token": token, "email": admin["email"]}


@api_router.get("/auth/me")
async def me(payload: dict = Depends(admin_required)):
    return {"email": payload.get("sub"), "role": payload.get("role")}


# ---------- Newsletter ----------

@api_router.post("/newsletter")
async def subscribe(email: str = Query(...)):
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email):
        raise HTTPException(status_code=400, detail="Invalid email")
    await db.newsletter.update_one(
        {"email": email},
        {"$set": {"email": email, "subscribed_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"ok": True}


# ---------- File Upload ----------

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}


@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP images allowed")
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    ext = (file.filename or "img").rsplit(".", 1)[-1] if "." in (file.filename or "") else "jpg"
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/uploads/public/{file_id}.{ext}"
    try:
        result = put_object(path, data, content_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed")
    record = {
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.files.insert_one(record)
    return {"id": file_id, "url": f"/api/files/{file_id}", "path": result["path"]}


@api_router.get("/files/{file_id}")
async def serve_file(file_id: str):
    record = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = get_object(record["storage_path"])
    except Exception as e:
        logger.error(f"File fetch failed: {e}")
        raise HTTPException(status_code=500, detail="File fetch failed")
    return Response(content=data, media_type=record.get("content_type", content_type))


# ---------- Seed Data ----------

DEMO_STORIES = [
    {
        "name": "Aarav Sharma", "age": 14, "field": "Sports",
        "achievement": "Maharashtra State Chess Champion 2024",
        "hook": "From beginner to state champion in 2 years",
        "city": "Mumbai", "state": "Maharashtra",
        "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "photo_url": "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=800&q=80",
        "watch_time": "15 min", "daily_practice": "2 hours", "journey_started": "Age 10",
        "grade": "9th Grade", "coaching_cost": "₹5,000/month",
        "pull_quote": "Champions aren't born in victory — they're built in defeat.",
        "advice": "Start early, practice daily, never give up. Even when you lose, you're learning.",
        "next_goal": "National Championship 2026, then International Grandmaster by age 18",
        "support_system": "Parents, school principal, coach Mr. Rao",
        "tags": ["chess", "champion"],
        "journey_sections": [
            {"heading": "The Spark", "body": "Aarav first touched a chess piece when he was 9 years old, during a school workshop. He was fascinated by how each piece moved differently, and within weeks, he was playing against his father every evening."},
            {"heading": "The Struggle", "body": "The first tournament was a disaster. Aarav lost every single game. He came home crying, ready to quit. But his coach told him, 'Champions aren't born in victory — they're built in defeat.'"},
            {"heading": "The Turning Point", "body": "At age 12, Aarav won his first district-level tournament. That win changed everything. He realized hard work was finally paying off."},
            {"heading": "The Support", "body": "His parents invested in a coach, even though money was tight. His school allowed him to skip classes for tournaments. His younger sister became his biggest cheerleader."},
            {"heading": "Where He Is Today", "body": "Today, Aarav is the Maharashtra State Champion and training for nationals. His dream? To become India's youngest Grandmaster."},
        ],
        "takeaways": [
            {"icon": "💡", "title": "Their Advice", "description": "Start early, practice daily, never give up."},
            {"icon": "📚", "title": "Resources Used", "description": "Chess.com, YouTube tutorials, local chess academy"},
            {"icon": "⏰", "title": "Practice Schedule", "description": "2 hours daily after school, 4-6 hours on weekends"},
            {"icon": "💰", "title": "Investment", "description": "₹5,000/month for coaching + ₹2,000 for tournament fees"},
            {"icon": "🎯", "title": "Next Goal", "description": "National Championship 2026"},
        ],
        "resources": [
            {"icon": "♟️", "name": "Chess.com", "type": "Website/App", "description": "Free online chess platform with lessons and puzzles", "link": "https://chess.com", "price": "Free / ₹300/mo Premium"},
            {"icon": "📺", "name": "Gotham Chess YouTube", "type": "Video Tutorials", "description": "Beginner to advanced chess lessons", "link": "https://youtube.com/@GothamChess", "price": "Free"},
            {"icon": "📖", "name": "My System by Aron Nimzowitsch", "type": "Book", "description": "Classic chess strategy book", "link": "", "price": "₹600"},
        ],
    },
    {
        "name": "Priya Iyer", "age": 12, "field": "Arts",
        "achievement": "Youngest Bharatanatyam Performer at Chennai Music Festival",
        "hook": "Dancing since she could walk, performing on national stage at 12",
        "city": "Chennai", "state": "Tamil Nadu",
        "youtube_url": "https://www.youtube.com/watch?v=2Vv-BfVoq4g",
        "photo_url": "https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1580834341580-8c17a3a630ca?w=800&q=80",
        "watch_time": "12 min", "daily_practice": "3 hours", "journey_started": "Age 4",
        "grade": "7th Grade", "coaching_cost": "₹8,000/month",
        "pull_quote": "Dance is not just movement — it is prayer in motion.",
        "advice": "Respect the art, respect your guru, and the rest will follow.",
        "next_goal": "Arangetram debut by age 14",
        "support_system": "Guru Smt. Lakshmi, parents, grandmother who taught her first steps",
        "tags": ["dance", "classical"],
        "journey_sections": [
            {"heading": "The Spark", "body": "At age 4, Priya watched her grandmother perform a Bharatanatyam piece and was mesmerized. She refused to eat dinner until her grandmother showed her the basic steps."},
            {"heading": "The Struggle", "body": "Three hours of daily practice meant no playtime with friends. She often cried herself to sleep, missing birthday parties and weekends out."},
            {"heading": "The Turning Point", "body": "Her first solo performance at school changed everything. The standing ovation taught her that sacrifice has rewards."},
            {"heading": "Where She Is Today", "body": "Priya is preparing for her Arangetram and recently performed at the Chennai Music Festival — the youngest soloist in the festival's history."},
        ],
        "takeaways": [
            {"icon": "💡", "title": "Their Advice", "description": "Respect tradition, but bring your own heart to it."},
            {"icon": "⏰", "title": "Practice Schedule", "description": "3 hours daily, 5 hours on weekends"},
            {"icon": "🎯", "title": "Next Goal", "description": "Arangetram by age 14"},
        ],
        "resources": [
            {"icon": "💃", "name": "Kalakshetra Foundation", "type": "Institute", "description": "Renowned Bharatanatyam institute in Chennai", "link": "", "price": "Varies"},
        ],
    },
    {
        "name": "Vihaan Kapoor", "age": 11, "field": "Technology",
        "achievement": "Built India's first kid-led mental wellness app, 50,000+ downloads",
        "hook": "From watching YouTube tutorials to launching on Play Store at age 11",
        "city": "Bengaluru", "state": "Karnataka",
        "youtube_url": "https://www.youtube.com/watch?v=L_jWHffIx5E",
        "photo_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
        "watch_time": "18 min", "daily_practice": "1.5 hours", "journey_started": "Age 8",
        "grade": "6th Grade", "coaching_cost": "Free (online)",
        "pull_quote": "Code is just letters. But it can change lives.",
        "advice": "Don't wait until you're 'old enough'. Start with what you have.",
        "next_goal": "Build version 2 with AI for emotional support",
        "support_system": "Father (a software engineer), online communities, school computer lab",
        "tags": ["coding", "app"],
        "journey_sections": [
            {"heading": "The Spark", "body": "Vihaan saw his cousin struggling with anxiety and wondered if technology could help. He searched 'how to make an app' on YouTube."},
            {"heading": "The Struggle", "body": "Months of broken builds, mysterious errors, and tutorials that assumed too much. He almost gave up three times."},
            {"heading": "Where He Is Today", "body": "His app, MindKid, has crossed 50,000 downloads with features like mood tracking, breathing exercises, and a kid-friendly journal."},
        ],
        "takeaways": [
            {"icon": "💡", "title": "Their Advice", "description": "Build something useful, not impressive."},
            {"icon": "📚", "title": "Resources", "description": "freeCodeCamp, YouTube channels, Stack Overflow"},
        ],
        "resources": [
            {"icon": "💻", "name": "freeCodeCamp", "type": "Online Course", "description": "Free coding tutorials", "link": "https://freecodecamp.org", "price": "Free"},
        ],
    },
    {
        "name": "Diya Reddy", "age": 10, "field": "Academics",
        "achievement": "Youngest International Math Olympiad Bronze Medalist from India",
        "hook": "Solving differential equations at an age most kids learn fractions",
        "city": "Hyderabad", "state": "Telangana",
        "youtube_url": "https://www.youtube.com/watch?v=ZbZSe6N_BXs",
        "photo_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
        "watch_time": "14 min", "daily_practice": "2 hours", "journey_started": "Age 6",
        "grade": "5th Grade", "coaching_cost": "₹3,000/month",
        "pull_quote": "Numbers don't lie — and they don't care how old you are.",
        "advice": "Math is a puzzle. Have fun solving it.",
        "next_goal": "IMO Gold Medal by age 14",
        "support_system": "Math teacher, mother, online math community",
        "tags": ["math", "olympiad"],
        "journey_sections": [
            {"heading": "The Spark", "body": "Diya's grandmother used to play number games with her every evening. Math became a language she spoke fluently before she learned English."},
            {"heading": "Where She Is Today", "body": "Diya is the youngest Bronze medalist from India at the International Mathematical Olympiad."},
        ],
        "takeaways": [
            {"icon": "💡", "title": "Their Advice", "description": "Treat math problems like puzzles, not homework."},
        ],
        "resources": [
            {"icon": "🔢", "name": "Brilliant.org", "type": "App", "description": "Interactive math problems", "link": "https://brilliant.org", "price": "₹500/mo"},
        ],
    },
    {
        "name": "Arjun Singh", "age": 13, "field": "Sports",
        "achievement": "Under-14 National Cricket Team Captain",
        "hook": "From a small town in Punjab to leading India's youth cricket team",
        "city": "Amritsar", "state": "Punjab",
        "youtube_url": "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        "photo_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
        "watch_time": "16 min", "daily_practice": "4 hours", "journey_started": "Age 7",
        "grade": "8th Grade", "coaching_cost": "₹6,000/month",
        "pull_quote": "Cricket is religion in Punjab. I'm just trying to live up to it.",
        "advice": "Discipline beats talent every single day.",
        "next_goal": "Selection for Under-19 World Cup squad",
        "support_system": "Father (former club cricketer), academy coach, teammates",
        "tags": ["cricket", "captain"],
        "journey_sections": [
            {"heading": "The Spark", "body": "His father gave him a wooden bat at age 5. By 7, he was playing in local matches against boys twice his age."},
        ],
        "takeaways": [
            {"icon": "🏏", "title": "Practice Schedule", "description": "4 hours daily, 6 hours on weekends"},
        ],
        "resources": [],
    },
    {
        "name": "Saanvi Bose", "age": 9, "field": "Literature",
        "achievement": "Published author at age 9, debut novel 'The Sky Children' on bestseller list",
        "hook": "Her bedtime stories became a bestselling novel",
        "city": "Kolkata", "state": "West Bengal",
        "youtube_url": "https://www.youtube.com/watch?v=YlUKcNNmywk",
        "photo_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
        "watch_time": "11 min", "daily_practice": "1 hour writing", "journey_started": "Age 7",
        "grade": "4th Grade", "coaching_cost": "Free",
        "pull_quote": "If grown-ups can write books, why can't kids?",
        "advice": "Read everything. Then write what you wish existed.",
        "next_goal": "Second book about Indian mythology for kids",
        "support_system": "Mother (a journalist), librarian Aunt, school English teacher",
        "tags": ["author", "books"],
        "journey_sections": [
            {"heading": "The Spark", "body": "She made up stories every night for her younger brother. Her mother started writing them down."},
        ],
        "takeaways": [
            {"icon": "📖", "title": "Their Advice", "description": "Read 30 minutes daily, write 30 minutes daily."},
        ],
        "resources": [],
    },
    {
        "name": "Kabir Mehta", "age": 15, "field": "Social Impact",
        "achievement": "Founded NGO 'CleanFuture' — planted 10,000+ trees across rural Gujarat",
        "hook": "Started with one sapling, now leads a movement of 500 student volunteers",
        "city": "Ahmedabad", "state": "Gujarat",
        "youtube_url": "https://www.youtube.com/watch?v=hT_nvWreIhg",
        "photo_url": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
        "watch_time": "20 min", "daily_practice": "Weekends", "journey_started": "Age 11",
        "grade": "10th Grade", "coaching_cost": "Self-funded",
        "pull_quote": "We don't inherit the earth from our parents. We borrow it from our children.",
        "advice": "Don't wait for permission to make a difference.",
        "next_goal": "Plant 1 lakh trees by 2026",
        "support_system": "School principal, local farmers, parents",
        "tags": ["environment", "ngo"],
        "journey_sections": [
            {"heading": "The Spark", "body": "After a heatwave killed cattle in his grandfather's village, Kabir asked, 'What can a 11-year-old do?' His grandfather answered, 'Plant a tree.'"},
        ],
        "takeaways": [
            {"icon": "🌱", "title": "Their Advice", "description": "Start small, stay consistent, build community."},
        ],
        "resources": [],
    },
    {
        "name": "Aanya Pillai", "age": 8, "field": "Entertainment",
        "achievement": "Youngest playback singer in Malayalam cinema",
        "hook": "Her voice charmed a film director at a school cultural fest — the rest is history",
        "city": "Kochi", "state": "Kerala",
        "youtube_url": "https://www.youtube.com/watch?v=9bZkp7q19f0",
        "photo_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
        "watch_time": "10 min", "daily_practice": "1.5 hours singing", "journey_started": "Age 5",
        "grade": "3rd Grade", "coaching_cost": "₹4,000/month",
        "pull_quote": "I sing because the song wants to come out.",
        "advice": "Listen more than you sing. Music starts in the ears.",
        "next_goal": "Tamil and Hindi film playback debuts",
        "support_system": "Mother, music teacher Mr. Pillai",
        "tags": ["singer", "playback"],
        "journey_sections": [],
        "takeaways": [],
        "resources": [],
    },
    {
        "name": "Rohan Banerjee", "age": 16, "field": "Science",
        "achievement": "ISRO Young Scientist Award for low-cost satellite design",
        "hook": "Built a working CubeSat prototype in his apartment balcony",
        "city": "Pune", "state": "Maharashtra",
        "youtube_url": "https://www.youtube.com/watch?v=tgbNymZ7vqY",
        "photo_url": "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&q=80",
        "watch_time": "22 min", "daily_practice": "3 hours", "journey_started": "Age 12",
        "grade": "11th Grade", "coaching_cost": "Free (mentored by ISRO)",
        "pull_quote": "Space isn't far. It's just up.",
        "advice": "Read research papers. Yes, even at 14. They're not as scary as they look.",
        "next_goal": "IIT Bombay Aerospace, then ISRO",
        "support_system": "Father (engineer), school physics teacher, ISRO mentor",
        "tags": ["space", "satellite"],
        "journey_sections": [],
        "takeaways": [],
        "resources": [],
    },
    {
        "name": "Meera Joshi", "age": 7, "field": "Arts",
        "achievement": "Featured in National Children's Art Exhibition, Delhi",
        "hook": "Painting Madhubani art with the precision of a master craftswoman",
        "city": "Madhubani", "state": "Bihar",
        "youtube_url": "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
        "photo_url": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
        "thumbnail": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
        "watch_time": "9 min", "daily_practice": "2 hours painting", "journey_started": "Age 4",
        "grade": "2nd Grade", "coaching_cost": "Free (taught by grandmother)",
        "pull_quote": "Every line tells a story my grandmother told me.",
        "advice": "Learn from elders. Their hands carry centuries.",
        "next_goal": "International exhibition by age 10",
        "support_system": "Grandmother (master artist), parents, school art teacher",
        "tags": ["madhubani", "painting"],
        "journey_sections": [],
        "takeaways": [],
        "resources": [],
    },
]


async def seed_data():
    # Seed admin
    existing_admin = await db.admins.find_one({"email": "admin@ouryoungindia.in"}, {"_id": 0})
    if not existing_admin:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": "admin@ouryoungindia.in",
            "password_hash": hash_password("Admin@123"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user")

    # Seed stories
    count = await db.stories.count_documents({})
    if count == 0:
        for s in DEMO_STORIES:
            yt_id = extract_youtube_id(s.get("youtube_url", ""))
            base_slug = slugify(s["name"])
            slug = base_slug
            i = 1
            while await db.stories.find_one({"slug": slug}, {"_id": 1}):
                slug = f"{base_slug}-{i}"
                i += 1
            story = Story(slug=slug, youtube_id=yt_id, **s)
            await db.stories.insert_one(dict(story.model_dump()))
        logger.info(f"Seeded {len(DEMO_STORIES)} demo stories")


# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("startup")
async def startup_event():
    init_storage()
    await seed_data()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
