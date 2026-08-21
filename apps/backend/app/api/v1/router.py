from fastapi import APIRouter
from app.api.v1 import auth, chat, chunk, documents, overview, workspaces

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(workspaces.router)
api_router.include_router(documents.router)
api_router.include_router(chat.router)
api_router.include_router(chat.chats_router)
api_router.include_router(chunk.router)
api_router.include_router(overview.router)
api_router.include_router(overview.notifications_router)