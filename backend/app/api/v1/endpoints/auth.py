from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import PasswordReset, PasswordResetRequest, TokenResponse, UserCreate, UserLogin

router = APIRouter()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate) -> dict:
    if payload.email == "admin@brightloop.dev":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    return {
        "message": "User created successfully",
        "user": {"email": payload.email, "full_name": payload.full_name or payload.email},
    }


@router.post("/login")
async def login(payload: UserLogin) -> TokenResponse:
    if payload.email == "admin@brightloop.dev":
        return TokenResponse(
            access_token="demo-token",
            user={"email": payload.email, "role": "admin"},
        )
    return TokenResponse(
        access_token="demo-token",
        user={"email": payload.email, "role": "customer"},
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
