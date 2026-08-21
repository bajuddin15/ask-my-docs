import uuid

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import MemberStatus, WorkspaceMember

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


async def get_current_workspace(
    x_workspace_id: uuid.UUID = Header(..., alias="X-Workspace-Id"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> tuple[Workspace, WorkspaceMember]:
    """
    Returns (workspace, membership) only if current_user is an ACTIVE
    member of x_workspace_id. Every document/chat query downstream filters
    by workspace.id from here — never by anything the client sends directly.
    """
    
    # DEBUG: Print all values
    print(f"🔍 Current User ID: {current_user.id}")
    print(f"🔍 X-Workspace-Id: {x_workspace_id}")
    print(f"🔍 Both IDs type: {type(current_user.id)}, {type(x_workspace_id)}")
    
    result = await db.execute(
        select(WorkspaceMember, Workspace)
        .join(Workspace, Workspace.id == WorkspaceMember.workspace_id)
        .where(
            WorkspaceMember.workspace_id == x_workspace_id,
            WorkspaceMember.user_id == current_user.id,
            WorkspaceMember.status == MemberStatus.active,
        )
    )
    row = result.first()
    print({"row": row})
    print({"result": result})
    if row is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "You are not an active member of this workspace",
        )
    membership, workspace = row
    return workspace, membership