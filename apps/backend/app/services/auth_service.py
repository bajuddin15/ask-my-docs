import re
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import MemberRole, MemberStatus, WorkspaceMember
from app.schemas.auth import LoginRequest, SignupRequest


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "workspace"


async def signup(db: AsyncSession, payload: SignupRequest) -> tuple[User, str]:
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    user = User(
        id=uuid.uuid4(),
        email=payload.email,
        hashed_password=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
    )
    db.add(user)
    await db.flush()  # get user.id without committing yet

    # every signup creates their first workspace, and they become its Owner
    base_slug = slugify(payload.workspace_name)
    slug = base_slug
    suffix = 1
    while (await db.execute(select(Workspace).where(Workspace.slug == slug))).scalar_one_or_none():
        suffix += 1
        slug = f"{base_slug}-{suffix}"

    workspace = Workspace(
        id=uuid.uuid4(),
        name=payload.workspace_name,
        slug=slug,
        owner_id=user.id,
    )
    db.add(workspace)
    await db.flush()

    membership = WorkspaceMember(
        id=uuid.uuid4(),
        workspace_id=workspace.id,
        user_id=user.id,
        role=MemberRole.owner,
        status=MemberStatus.active,
        joined_at=datetime.now(timezone.utc),
    )
    db.add(membership)

    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=str(user.id))
    return user, token


async def login(db: AsyncSession, payload: LoginRequest) -> tuple[User, str]:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")

    token = create_access_token(subject=str(user.id))
    return user, token