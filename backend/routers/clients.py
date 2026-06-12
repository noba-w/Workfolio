from fastapi import APIRouter, HTTPException, Depends
from typing import List
from deps import get_current_user, CurrentUser
from schemas import ClientCreate, ClientUpdate, ClientResponse

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("", response_model=List[ClientResponse])
def list_clients(user: CurrentUser = Depends(get_current_user)):
    res = user.sb.table("clients").select("*").execute()
    return res.data


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
