import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_workspace
from app.core.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import MemberRole, MemberStatus, WorkspaceMember
from app.schemas.workspace import (
    CreateWorkspaceRequest,
    InviteMemberRequest,
    MemberResponse,
    WorkspaceResponse,
    WorkspaceSettingsRequest,
    WorkspaceSettingsResponse,
)

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "workspace"


def _to_response(ws: Workspace, role: str) -> WorkspaceResponse:
    return WorkspaceResponse(
        id=ws.id, name=ws.name, slug=ws.slug, plan=ws.plan.value, role=role,
        monthly_query_count=ws.monthly_query_count, monthly_query_limit=ws.monthly_query_limit,
    )


@router.get("", response_model=list[WorkspaceResponse])
async def list_my_workspaces(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(WorkspaceMember, Workspace)
        .join(Workspace, Workspace.id == WorkspaceMember.workspace_id)
        .where(WorkspaceMember.user_id == current_user.id, WorkspaceMember.status == MemberStatus.active)
    )
    rows = result.all()
    return [_to_response(ws, member.role.value) for member, ws in rows]


@router.post("", response_model=WorkspaceResponse, status_code=201)
async def create_workspace(
    payload: CreateWorkspaceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    base_slug = _slugify(payload.name)
    slug = base_slug
    suffix = 1
    while (await db.execute(select(Workspace).where(Workspace.slug == slug))).scalar_one_or_none():
        suffix += 1
        slug = f"{base_slug}-{suffix}"

    workspace = Workspace(id=uuid.uuid4(), name=payload.name, slug=slug, owner_id=current_user.id)
    db.add(workspace)
    await db.flush()

    membership = WorkspaceMember(
        id=uuid.uuid4(), workspace_id=workspace.id, user_id=current_user.id,
        role=MemberRole.owner, status=MemberStatus.active, joined_at=datetime.now(timezone.utc),
    )
    db.add(membership)
    await db.commit()
    await db.refresh(workspace)

    return _to_response(workspace, "owner")


@router.get("/members", response_model=list[MemberResponse])
async def list_members(
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, _membership = workspace_membership
    result = await db.execute(
        select(WorkspaceMember, User)
        .join(User, User.id == WorkspaceMember.user_id)
        .where(WorkspaceMember.workspace_id == workspace.id)
        .order_by(WorkspaceMember.created_at.asc())
    )
    rows = result.all()
    return [
        MemberResponse(
            id=m.id, user_id=u.id, email=u.email, first_name=u.first_name, last_name=u.last_name,
            role=m.role.value, status=m.status.value,
            joined_at=m.joined_at.isoformat() if m.joined_at else None,
        )
        for m, u in rows
    ]


@router.post("/members", response_model=MemberResponse, status_code=201)
async def invite_member(
    payload: InviteMemberRequest,
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, membership = workspace_membership
    if membership.role.value not in ("owner", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only owners and admins can invite members")

    # MVP simplification: the invited person must already have an account.
    # A full "invite by email + accept" flow is post-MVP.
    result = await db.execute(select(User).where(User.email == payload.email))
    invited_user = result.scalar_one_or_none()
    if invited_user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No account found for this email yet — they need to sign up first")

    existing = await db.execute(
        select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace.id, WorkspaceMember.user_id == invited_user.id
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "This person is already a member of this workspace")

    new_member = WorkspaceMember(
        id=uuid.uuid4(), workspace_id=workspace.id, user_id=invited_user.id,
        role=MemberRole(payload.role), status=MemberStatus.active,
        invited_email=payload.email, joined_at=datetime.now(timezone.utc),
    )
    db.add(new_member)
    await db.commit()

    return MemberResponse(
        id=new_member.id, user_id=invited_user.id, email=invited_user.email,
        first_name=invited_user.first_name, last_name=invited_user.last_name,
        role=new_member.role.value, status=new_member.status.value,
        joined_at=new_member.joined_at.isoformat() if new_member.joined_at else None,
    )


@router.get("/settings", response_model=WorkspaceSettingsResponse)
async def get_settings(workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace)):
    workspace, _membership = workspace_membership
    return WorkspaceSettingsResponse(
        critic_enabled=workspace.critic_enabled,
        max_critic_retries=workspace.max_critic_retries,
        answer_model=workspace.answer_model,
    )


@router.patch("/settings", response_model=WorkspaceSettingsResponse)
async def update_settings(
    payload: WorkspaceSettingsRequest,
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, membership = workspace_membership
    if membership.role.value not in ("owner", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only owners and admins can change agent settings")

    if payload.critic_enabled is not None:
        workspace.critic_enabled = payload.critic_enabled
    if payload.max_critic_retries is not None:
        workspace.max_critic_retries = payload.max_critic_retries
    if payload.answer_model is not None:
        workspace.answer_model = payload.answer_model

    await db.commit()
    await db.refresh(workspace)

    return WorkspaceSettingsResponse(
        critic_enabled=workspace.critic_enabled,
        max_critic_retries=workspace.max_critic_retries,
        answer_model=workspace.answer_model,
    )