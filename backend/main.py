from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import os
import json
import subprocess
from pathlib import Path
from typing import List, Optional

from database import SessionLocal, engine, Base
from models import Project, Tool, ProjectMetadata
from schemas import (
    ProjectCreate, ProjectResponse, ProjectUpdate,
    ToolCreate, ToolResponse, ToolUpdate,
    MetadataCreate, MetadataResponse, MetadataUpdate,
    FolderStructureCreate
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VFX Pipeline Companion API", version="1.0.0")

# CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3004", "http://localhost:3000", "http://127.0.0.1:3004", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "VFX Pipeline Companion API is running"}


# Project endpoints
@app.get("/projects", response_model=List[ProjectResponse])
async def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return projects


@app.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    # Create project directory structure
    workspace_path = project.workspacePath or get_default_workspace()
    project_path = Path(workspace_path) / project.name

    try:
        # Create the project folder structure
        create_folder_structure(project_path, project.type)

        # Save project to database
        db_project = Project(
            name=project.name,
            type=project.type,
            client=project.client,
            workspace_path=str(project_path),
            created_at=datetime.utcnow()
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)

        return db_project
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")


@app.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, value in project_update.dict(exclude_unset=True).items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@app.delete("/projects/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}


# Project Metadata endpoints
@app.get("/projects/{project_id}/metadata", response_model=MetadataResponse)
async def get_project_metadata(project_id: int, db: Session = Depends(get_db)):
    metadata = db.query(ProjectMetadata).filter(ProjectMetadata.project_id == project_id).first()
    if not metadata:
        # Return default metadata if none exists
        return MetadataResponse(
            project_id=project_id,
            client="",
            delivery_date=None,
            description="",
            notes="",
            tags=[],
            status="in_progress",
            priority="medium",
            estimated_hours=0,
            actual_hours=0
        )
    return metadata


@app.put("/projects/{project_id}/metadata", response_model=MetadataResponse)
async def update_project_metadata(project_id: int, metadata_update: MetadataUpdate, db: Session = Depends(get_db)):
    # Check if project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get or create metadata
    metadata = db.query(ProjectMetadata).filter(ProjectMetadata.project_id == project_id).first()
    if not metadata:
        metadata = ProjectMetadata(project_id=project_id)
        db.add(metadata)

    # Update metadata fields
    for field, value in metadata_update.dict(exclude_unset=True).items():
        setattr(metadata, field, value)

    db.commit()
    db.refresh(metadata)
    return metadata


# Tool endpoints
@app.get("/tools", response_model=List[ToolResponse])
async def get_tools(db: Session = Depends(get_db)):
    tools = db.query(Tool).all()
    # If no tools in database, return sample tools
    if not tools:
        return get_sample_tools()
    return tools


@app.post("/tools", response_model=ToolResponse)
async def create_tool(tool: ToolCreate, db: Session = Depends(get_db)):
    db_tool = Tool(**tool.dict())
    db.add(db_tool)
    db.commit()
    db.refresh(db_tool)
    return db_tool


@app.get("/tools/{tool_id}", response_model=ToolResponse)
async def get_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


@app.put("/tools/{tool_id}", response_model=ToolResponse)
async def update_tool(tool_id: int, tool_update: ToolUpdate, db: Session = Depends(get_db)):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    for field, value in tool_update.dict(exclude_unset=True).items():
        setattr(tool, field, value)

    db.commit()
    db.refresh(tool)
    return tool


@app.delete("/tools/{tool_id}")
async def delete_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    db.delete(tool)
    db.commit()
    return {"message": "Tool deleted successfully"}


@app.post("/tools/{tool_id}/launch")
async def launch_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")

    try:
        # Update last used timestamp
        tool.last_used = datetime.utcnow()
        db.commit()

        # Launch the tool
        if tool.executable_path and Path(tool.executable_path).exists():
            subprocess.Popen([tool.executable_path], shell=True)
            return {"message": f"Tool '{tool.name}' launched successfully"}
        else:
            raise HTTPException(status_code=400, detail="Tool executable not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to launch tool: {str(e)}")


# Folder structure templates
@app.get("/templates")
async def get_folder_templates():
    return get_folder_templates()


@app.post("/projects/{project_id}/folders")
async def create_project_folders(project_id: int, folder_data: FolderStructureCreate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        create_folder_structure(Path(project.workspace_path), folder_data.template_type)
        return {"message": "Folder structure created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create folder structure: {str(e)}")


# Helper functions
def get_default_workspace():
    """Get the default workspace path"""
    return str(Path.home() / "VFX_Projects")


def create_folder_structure(project_path: Path, project_type: str):
    """Create folder structure based on project type"""
    templates = get_folder_templates()
    template = next((t for t in templates if t["type"] == project_type), templates[0])

    project_path.mkdir(parents=True, exist_ok=True)

    for folder in template["folders"]:
        folder_path = project_path / folder
        folder_path.mkdir(parents=True, exist_ok=True)

    # Create a project info file
    project_info = {
        "name": project_path.name,
        "type": project_type,
        "created": datetime.utcnow().isoformat(),
        "structure": template["folders"]
    }

    with open(project_path / "project_info.json", "w") as f:
        json.dump(project_info, f, indent=2)


def get_folder_templates():
    """Get folder structure templates for different project types"""
    return [
        {
            "type": "tracking",
            "name": "Motion Tracking",
            "folders": [
                "01_footage",
                "02_reference",
                "03_tracking",
                "04_export",
                "05_render",
                "06_delivery",
                "scripts",
                "notes"
            ]
        },
        {
            "type": "houdini_fx",
            "name": "Houdini FX",
            "folders": [
                "01_assets",
                "02_cache",
                "03_hip",
                "04_render",
                "05_comp",
                "06_delivery",
                "scripts",
                "reference"
            ]
        },
        {
            "type": "compositing",
            "name": "Compositing",
            "folders": [
                "01_plates",
                "02_elements",
                "03_scripts",
                "04_render",
                "05_delivery",
                "reference",
                "notes"
            ]
        },
        {
            "type": "modeling",
            "name": "3D Modeling",
            "folders": [
                "01_concept",
                "02_modeling",
                "03_textures",
                "04_rigging",
                "05_animation",
                "06_render",
                "reference",
                "export"
            ]
        },
        {
            "type": "animation",
            "name": "Animation",
            "folders": [
                "01_assets",
                "02_animation",
                "03_lighting",
                "04_render",
                "05_comp",
                "06_delivery",
                "reference",
                "playblasts"
            ]
        },
        {
            "type": "general",
            "name": "General VFX",
            "folders": [
                "01_assets",
                "02_footage",
                "03_work",
                "04_render",
                "05_comp",
                "06_delivery",
                "reference",
                "scripts"
            ]
        }
    ]


# Settings endpoints
@app.get("/settings")
async def get_settings():
    """Get application settings"""
    settings_file = Path("data/settings.json")
    if settings_file.exists():
        with open(settings_file, "r") as f:
            return json.load(f)
    else:
        # Return default settings
        default_settings = {
            "default_workspace": get_default_workspace(),
            "tools_directory": str(Path.home() / "VFX_Tools"),
            "auto_create_folders": True,
            "theme": "dark"
        }
        return default_settings


@app.put("/settings")
async def update_settings(settings: dict):
    """Update application settings"""
    settings_file = Path("data/settings.json")
    settings_file.parent.mkdir(exist_ok=True)

    with open(settings_file, "w") as f:
        json.dump(settings, f, indent=2)

    return {"message": "Settings updated successfully", "settings": settings}


def get_sample_tools():
    """Return sample tools for demonstration"""
    return [
        {
            "id": 1,
            "name": "SynthEyes",
            "description": "Professional camera tracking software",
            "category": "tracking",
            "executable_path": "",
            "is_favorite": True,
            "last_used": None
        },
        {
            "id": 2,
            "name": "Houdini",
            "description": "3D animation and VFX software",
            "category": "modeling",
            "executable_path": "",
            "is_favorite": True,
            "last_used": None
        },
        {
            "id": 3,
            "name": "Nuke",
            "description": "Professional compositing software",
            "category": "compositing",
            "executable_path": "",
            "is_favorite": False,
            "last_used": None
        },
        {
            "id": 4,
            "name": "File Converter",
            "description": "Batch file format conversion utility",
            "category": "utility",
            "executable_path": "",
            "is_favorite": False,
            "last_used": None
        },
        {
            "id": 5,
            "name": "Custom Export Script",
            "description": "Automated asset export pipeline",
            "category": "custom",
            "executable_path": "",
            "is_favorite": False,
            "last_used": None
        }
    ]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)