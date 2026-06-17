from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import date, timedelta
from deps import get_current_user, CurrentUser
from schemas import TimeEntryCreate, TimeEntryResponse

router = APIRouter(prefix="/api/time-entries", tags=["time_entries"])


@router.get("", response_model=List[TimeEntryResponse])
def list_time_entries(project_id: Optional[str] = None, user: CurrentUser = Depends(get_current_user)):
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    query = (
        user.sb.table("time_entries")
        .select("*")
        .gte("date", str(week_start))
        .lte("date", str(week_end))
    )
    if project_id:
        query = query.eq("project_id", project_id)
    return query.execute().data


@router.post("", response_model=TimeEntryResponse, status_code=201)
def create_time_entry(body: TimeEntryCreate, user: CurrentUser = Depends(get_current_user)):
    data = body.model_dump()
    data["date"] = str(data["date"])
    res = user.sb.table("time_entries").insert({**data, "user_id": user.id}).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create time entry")
    return res.data[0]
