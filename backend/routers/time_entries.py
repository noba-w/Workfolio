from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from deps import get_current_user, CurrentUser
from schemas import TimeEntryCreate, TimeEntryResponse

router = APIRouter(prefix="/api/time-entries", tags=["time_entries"])


@router.get("", response_model=List[TimeEntryResponse])
def list_time_entries(project_id: Optional[str] = None, user: CurrentUser = Depends(get_current_user)):
    query = user.sb.table("time_entries").select("*")
    if project_id:
        query = query.eq("project_id", project_id)
    return query.execute().data


@router.post("", response_model=TimeEntryResponse, status_code=201)
def create_time_entry(body: TimeEntryCreate, user: CurrentUser = Depends(get_current_user)):
    data = body.model_dump()
    data["date"] = str(data["date"])
    if data["start_time"] is not None:
        data["start_time"] = str(data["start_time"])
    if data["end_time"] is not None:
        data["end_time"] = str(data["end_time"])
    res = user.sb.table("time_entries").insert({**data, "user_id": user.id}).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create time entry")
    return res.data[0]
