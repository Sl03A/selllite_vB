
# Script to create an admin user (run with poetry or python)
import asyncio
from app.database import AsyncSessionLocal, engine, Base
from app.models import User
from app.utils import hash_password

async def create_admin():
    async with AsyncSessionLocal() as session:
        # create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        admin = User(email="admin@example.com", hashed_password=hash_password("adminpass"), is_admin=True)
        session.add(admin)
        await session.commit()
        print("Created admin: admin@example.com / adminpass")

if __name__ == "__main__":
    asyncio.run(create_admin())
