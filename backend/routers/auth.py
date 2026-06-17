from fastapi import APIRouter, HTTPException
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_ANON_KEY
from schemas import RegisterRequest, LoginRequest, RefreshRequest, AuthResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(body: RegisterRequest):
    sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    try:
        res = sb.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {"data": {"name": body.name}},
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    if res.user is None or res.session is None:
        raise HTTPException(status_code=400, detail="Registration failed — confirm your email and try again")
    return AuthResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user=UserResponse(id=res.user.id, email=res.user.email, name=body.name),
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    try:
        res = sb.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if res.user is None or res.session is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    name = (res.user.user_metadata or {}).get("name", "")
    return AuthResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user=UserResponse(id=res.user.id, email=res.user.email, name=name),
    )


@router.post("/refresh", response_model=AuthResponse)
def refresh(body: RefreshRequest):
    sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    try:
        res = sb.auth.refresh_session(body.refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    if res.user is None or res.session is None:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    name = (res.user.user_metadata or {}).get("name", "")
    return AuthResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user=UserResponse(id=res.user.id, email=res.user.email, name=name),
    )
