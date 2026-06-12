from dataclasses import dataclass
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_ANON_KEY

security = HTTPBearer()


@dataclass
class CurrentUser:
    id: str
    email: str
    sb: Client


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUser:
    token = credentials.credentials
    sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    try:
        res = sb.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    if res.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    sb.postgrest.auth(token)
    return CurrentUser(id=res.user.id, email=res.user.email, sb=sb)
