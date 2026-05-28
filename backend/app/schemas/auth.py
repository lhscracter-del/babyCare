from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    name: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
