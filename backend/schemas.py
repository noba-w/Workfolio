from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from enum import Enum


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class ClientCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None


class ClientResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    weekly_hours: float = 0.0
    created_at: datetime


class ProjectStatus(str, Enum):
    active = "active"
    paused = "paused"
    finished = "finished"


class ProjectCreate(BaseModel):
    client_id: str
    name: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.active
    hourly_rate: float
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    hourly_rate: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ProjectResponse(BaseModel):
    id: str
    client_id: str
    name: str
    description: Optional[str] = None
    status: ProjectStatus
    hourly_rate: float
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    created_at: datetime
