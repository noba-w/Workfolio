from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import date, timedelta
from deps import get_current_user, CurrentUser
from schemas import ClientCreate, ClientUpdate, ClientResponse

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("", response_model=List[ClientResponse])
def list_clients(user: CurrentUser = Depends(get_current_user)):
    clients = user.sb.table("clients").select("*").execute().data

    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    projects = user.sb.table("projects").select("id,client_id").execute().data
    project_to_client = {p["id"]: p["client_id"] for p in projects}

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
        cid = project_to_client.get(e["project_id"])
        if cid:
            weekly[cid] = weekly.get(cid, 0.0) + float(e["hours"])

    for c in clients:
        c["weekly_hours"] = weekly.get(c["id"], 0.0)

    return clients


@router.post("", response_model=ClientResponse, status_code=201)
def create_client(body: ClientCreate, user: CurrentUser = Depends(get_current_user)):
    res = user.sb.table("clients").insert({**body.model_dump(), "user_id": user.id}).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Could not create client")
    return res.data[0]


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: str, user: CurrentUser = Depends(get_current_user)):
    res = user.sb.table("clients").select("*").eq("id", client_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return res.data[0]


@router.patch("/{client_id}", response_model=ClientResponse)
def update_client(client_id: str, body: ClientUpdate, user: CurrentUser = Depends(get_current_user)):
    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = user.sb.table("clients").update(updates).eq("id", client_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return res.data[0]


@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: str, user: CurrentUser = Depends(get_current_user)):
    user.sb.table("clients").delete().eq("id", client_id).execute()
