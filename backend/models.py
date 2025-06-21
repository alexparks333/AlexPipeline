# backend/models.py - SQLAlchemy Database Models
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Settings(Base):
    """Settings table for application configuration"""
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    root_path = Column(String(500), nullable=False, default="")
    auto_launch_electron = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=True)
    enable_notifications = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Project(Base):
    """Projects table for VFX projects"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    folder_name = Column(String(255), nullable=False, unique=True)
    type = Column(String(100), default="general_vfx")
    client = Column(String(255))
    workspace_path = Column(String(500), nullable=False)
    shots = Column(JSON, default=list)  # Store shots as JSON array
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Library(Base):
    """Libraries table for organizing assets"""
    __tablename__ = "libraries"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), default="hdri")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to items
    items = relationship("LibraryItem", back_populates="library", cascade="all, delete-orphan")


class LibraryItem(Base):
    """Library items table for individual assets like HDRIs"""
    __tablename__ = "library_items"
    
    id = Column(Integer, primary_key=True, index=True)
    library_id = Column(Integer, ForeignKey("libraries.id"), nullable=False)
    name = Column(String(255), nullable=False)
    path = Column(String(500), nullable=False)
    preview_path = Column(String(500))
    category = Column(String(100), default="hdri")
    tags = Column(JSON, default=list)  # Store tags as JSON array
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to library
    library = relationship("Library", back_populates="items")


class Tool(Base):
    """Tools table for application shortcuts"""
    __tablename__ = "tools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100), default="utility")
    executable_path = Column(String(500))
    is_favorite = Column(Boolean, default=False)
    last_used = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
