from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.auth import PasswordReset, PasswordResetRequest, TokenResponse, UserCreate, UserLogin

router = APIRouter()

USER_STORE: dict[str, dict] = {
    "admin@brightloop.dev": {
        "email": "admin@brightloop.dev",
        "full_name": "Brightloop Admin",
        "password_hash": hash_password("Admin@123"),
        "role": "admin",
    }
}


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate) -> dict:
    email = payload.email.lower()
    if email in USER_STORE:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    USER_STORE[email] = {
        "email": email,
        "full_name": payload.full_name or email,
        "password_hash": hash_password(payload.password),
        "role": "customer",
    }

    return {
        "message": "User created successfully",
        "user": {"email": email, "full_name": payload.full_name or email},
    }


@router.post("/login")
async def login(payload: UserLogin) -> TokenResponse:
    email = payload.email.lower()
    stored_user = USER_STORE.get(email)
    if not stored_user or not verify_password(payload.password, stored_user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"email": email, "role": stored_user["role"]})
    return TokenResponse(
        access_token=token,
        user={"email": email, "role": stored_user["role"]},
    )


@router.get("/me")
async def me() -> dict:
    return {"id": 1, "email": "admin@brightloop.dev", "role": "admin"}


@router.post("/forgot-password")
async def forgot_password(payload: PasswordResetRequest) -> dict:
    return {"message": f"Password reset link sent to {payload.email}"}


@router.post("/reset-password")
async def reset_password(payload: PasswordReset) -> dict:
    return {"message": "Password has been reset"}
