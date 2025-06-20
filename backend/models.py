# backend/models.py (FIXED - metadata renamed to project_metadata)
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100), nullable=False)  # tracking, houdini_fx, compositing, general_vfx
    client = Column(String(255), nullable=True)
    workspace_path = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships - FIXED: renamed 'metadata' to 'project_metadata'
    project_metadata = relationship("ProjectMetadata", back_populates="project", uselist=False)


class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="utility")  # utility, 3d, compositing, tracking, etc.
    executable_path = Column(Text, nullable=True)
    is_favorite = Column(Boolean, default=False)
    last_used = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProjectMetadata(Base):
    __tablename__ = "project_metadata"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    client = Column(String(255), nullable=True)
    delivery_date = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    tags = Column(JSON, default=list)  # Store as JSON array
    status = Column(String(50), default="in_progress")  # in_progress, completed, on_hold, cancelled
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    estimated_hours = Column(Integer, default=0)
    actual_hours = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="project_metadata")
