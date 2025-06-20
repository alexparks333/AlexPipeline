from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Project schemas
class ProjectBase(BaseModel):
    name: str
    type: str
    client: Optional[str] = None


class ProjectCreate(ProjectBase):
    workspacePath: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    client: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: int
    workspace_path: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Tool schemas
class ToolBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "utility"


class ToolCreate(ToolBase):
    executable_path: Optional[str] = None
    is_favorite: bool = False


class ToolUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    executable_path: Optional[str] = None
    is_favorite: Optional[bool] = None


class ToolResponse(ToolBase):
    id: int
    executable_path: Optional[str] = None
    is_favorite: bool
    last_used: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Metadata schemas
class MetadataBase(BaseModel):
    client: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    tags: List[str] = []
    status: str = "in_progress"
    priority: str = "medium"
    estimated_hours: int = 0
    actual_hours: int = 0


class MetadataCreate(MetadataBase):
    delivery_date: Optional[datetime] = None


class MetadataUpdate(BaseModel):
    client: Optional[str] = None
    delivery_date: Optional[datetime] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    estimated_hours: Optional[int] = None
    actual_hours: Optional[int] = None


class MetadataResponse(MetadataBase):
    id: Optional[int] = None
    project_id: int
    delivery_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Folder structure schema
class FolderStructureCreate(BaseModel):
    template_type: str