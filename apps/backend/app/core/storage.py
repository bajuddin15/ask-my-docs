"""
MVP file storage: save uploaded files to local disk under a per-workspace
folder. Swappable later for S3 — every function here takes/returns a
storage_path string, so the caller never needs to know it's local disk.
"""
import os
import uuid

UPLOAD_ROOT = os.environ.get("UPLOAD_ROOT", "./uploads")


def save_upload(workspace_id: uuid.UUID, filename: str, content: bytes) -> str:
    workspace_dir = os.path.join(UPLOAD_ROOT, str(workspace_id))
    os.makedirs(workspace_dir, exist_ok=True)

    safe_name = f"{uuid.uuid4().hex}_{filename}"
    full_path = os.path.join(workspace_dir, safe_name)

    with open(full_path, "wb") as f:
        f.write(content)

    return full_path