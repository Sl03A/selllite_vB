
from fastapi import APIRouter, Depends, HTTPException
from ..database import get_db
from ..models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..schemas import UserOut
from ..auth import verify_token
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

router = APIRouter(prefix="/users", tags=["users"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_db)):
    token = credentials.credentials
    data = verify_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid token")
    q = await db.execute(select(User).filter_by(id=data.user_id))
    user = q.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
