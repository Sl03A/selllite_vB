
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..schemas import UserCreate, Token, UserOut, TokenData
from ..models import User
from ..database import get_db
from ..utils import hash_password, verify_password
from ..auth import create_access_token, create_refresh_token, verify_token
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()

@router.post("/register", response_model=UserOut)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(User).filter_by(email=payload.email))
    existing = q.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=Token)
async def login(form: UserCreate, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(User).filter_by(email=form.email))
    user = q.scalars().first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access = create_access_token({"sub": user.email, "user_id": user.id, "is_admin": user.is_admin})
    refresh = create_refresh_token({"sub": user.email, "user_id": user.id, "is_admin": user.is_admin})
    return {"access_token": access, "token_type": "bearer", "refresh_token": refresh}

@router.post("/refresh", response_model=Token)
async def refresh(token_payload: dict):
    refresh_token = token_payload.get("refresh_token")
    data = verify_token(refresh_token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access = create_access_token({"sub": data.email, "user_id": data.user_id, "is_admin": data.is_admin})
    refresh = create_refresh_token({"sub": data.email, "user_id": data.user_id, "is_admin": data.is_admin})
    return {"access_token": access, "token_type": "bearer", "refresh_token": refresh}
