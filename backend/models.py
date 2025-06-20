from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, nullable=False)
    client = Column(String)
    workspace_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to metadata
    project_metadata = relationship("ProjectMetadata", back_populates="project", uselist=False)


class ProjectMetadata(Base):
    __tablename__ = "project_metadata"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True)
    client = Column(String)
    delivery_date = Column(DateTime)
    description = Column(Text)
    notes = Column(Text)
    tags = Column(JSON, default=list)
    status = Column(String, default="in_progress")
    priority = Column(String, default="medium")
    estimated_hours = Column(Integer, default=0)
    actual_hours = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to project
    project = relationship("Project", back_populates="metadata")


class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, default="utility")
    executable_path = Column(String)
    is_favorite = Column(Boolean, default=False)
    last_used = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)