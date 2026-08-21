from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_workspace
from app.core.database import get_db
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.overview import ActivityItem, OverviewStats
from app.services import overview_service

router = APIRouter(prefix="/overview", tags=["overview"])
notifications_router = APIRouter(prefix="/notifications", tags=["overview"])


@router.get("", response_model=OverviewStats)
async def get_overview(
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, _membership = workspace_membership
    return await overview_service.get_overview_stats(db, workspace.id)


@router.get("/activity", response_model=list[ActivityItem])
async def get_activity(
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, _membership = workspace_membership
    return await overview_service.get_recent_activity(db, workspace.id)


@notifications_router.get("", response_model=list[ActivityItem])
async def get_notifications(
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    """Reuses the activity feed, filtered to interruption-worthy items only —
    no separate notifications table, since these events already live in
    messages/documents."""
    workspace, _membership = workspace_membership
    activity = await overview_service.get_recent_activity(db, workspace.id, limit=20)
    return [a for a in activity if a.kind in ("query_unverified", "document_failed", "document_indexed")][:5]