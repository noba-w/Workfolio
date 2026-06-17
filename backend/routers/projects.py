from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import date, timedelta
from deps import get_current_user, CurrentUser
from schemas import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _serialize(data: dict) -> dict:
    if data.get("start_date"):
        data["start_date"] = str(data["start_date"])
    if data.get("end_date"):
        data["end_date"] = str(data["end_date"])
    if "status" in data and hasattr(data["status"], "value"):
        data["status"] = data["status"].value
    return data


@router.get("", response_model=List[ProjectResponse])
def list_projects(user: CurrentUser = Depends(get_current_user)):
    projects = user.sb.table("projects").select("*").execute().data

    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    entries = (
        user.sb.table("time_entries")
        .select("project_id,hours")
        .gte("date", str(week_start))
        .lte("date", str(week_end))
        .execute()
        .data
    )

    weekly: dict = {}
    for e in entries:
        weekly[e["project_id"]] = weekly.get(e["project_id"], 0.0) + float(e["hours"])

    for p in projects:
        p["weekly_hours"] = weekly.get(p["id"], 0.0)

    return projects


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(body: ProjectCreate, user: CurrentUser = Depends(get_current_user)):
    data = _serialize(body.model_dump())
    res = user.sb.table("projects").insert({**data, "user_id": user.id}).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create project")
    return res.data[0]


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, user: CurrentUser = Depends(get_current_user)):
    res = user.sb.table("projects").select("*").eq("id", project_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return res.data[0]


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, body: ProjectUpdate, user: CurrentUser = Depends(get_current_user)):
    updates = _serialize(body.model_dump(exclude_none=True))
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = user.sb.table("projects").update(updates).eq("id", project_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return res.data[0]


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, user: CurrentUser = Depends(get_current_user)):
    user.sb.table("projects").delete().eq("id", project_id).execute()
