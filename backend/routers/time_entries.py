from fastapi import APIRouter, HTTPException, Depends
from deps import get_current_user, CurrentUser
from schemas import TimeEntryCreate, TimeEntryResponse

router = APIRouter(prefix="/api/time-entries", tags=["time_entries"])


@router.post("", response_model=TimeEntryResponse, status_code=201)
def create_time_entry(body: TimeEntryCreate, user: CurrentUser = Depends(get_current_user)):
    data = body.model_dump()
    data["date"] = str(data["date"])
    res = user.sb.table("time_entries").insert({**data, "user_id": user.id}).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create time entry")
    return res.data[0]
