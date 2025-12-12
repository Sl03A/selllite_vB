
from fastapi import APIRouter, Depends, HTTPException
from ..database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models import Project, User
from ..schemas import ProjectCreate, ProjectOut
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..auth import verify_token

router = APIRouter(prefix="/projects", tags=["projects"])
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

@router.post("/", response_model=ProjectOut)
async def create_project(payload: ProjectCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    proj = Project(title=payload.title, description=payload.description, owner_id=current_user.id)
    db.add(proj)
    await db.commit()
    await db.refresh(proj)
    return proj

@router.get("/", response_model=list[ProjectOut])
async def list_projects(db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Project))
    return q.scalars().all()

@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Project).filter_by(id=project_id))
    p = q.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    return p

@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(project_id: int, payload: ProjectCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Project).filter_by(id=project_id))
    p = q.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    if p.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    p.title = payload.title
    p.description = payload.description
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return p

@router.delete("/{project_id}")
async def delete_project(project_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(Project).filter_by(id=project_id))
    p = q.scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Not found")
    if p.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Forbidden")
    await db.delete(p)
    await db.commit()
    return {"detail": "Deleted"}
