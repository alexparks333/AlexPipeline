# backend/main.py - VFX Pipeline Companion Backend
import json
import logging
import os
import re
import traceback
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from schemas import PathData, Settings, VFXProjectCreate, Library, LibraryItem, LibraryCreate, LibraryItemCreate, LibraryItemUpdate
from database import get_db, init_db, SessionLocal
from models import Settings as SettingsModel, Project, Library as LibraryModel, LibraryItem as LibraryItemModel, Tool

# --- Basic Setup ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info("Starting VFX Pipeline Companion API...")

app = FastAPI(title="VFX Pipeline Companion API", version="1.0.0")

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Constants ---
DATA_DIR = Path(__file__).parent / "data"

# --- Startup Event ---
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()

# --- Business Logic ---
def scan_for_existing_projects(workspace_path: str | None = None) -> List[dict]:
    """Scan for existing VFX projects in the workspace"""
    discovered_projects = []
    
    # Get settings to find workspace path
    db = SessionLocal()
    try:
        settings = db.query(SettingsModel).first()
        logger.info(f"Settings found: {settings}")
        
        if not settings:
            logger.warning("No settings found, cannot scan for projects")
            return discovered_projects
            
        # Use provided workspace_path or get from settings
        if workspace_path is None:
            workspace_path = settings.root_path or ""
            logger.info(f"Using workspace path from settings: '{workspace_path}'")
        
        if not workspace_path:
            logger.warning("No workspace path available, cannot scan for projects")
            return discovered_projects
            
        projects_dir = Path(workspace_path) / "Projects"
        logger.info(f"Looking for projects in: {projects_dir}")
        
        if not projects_dir.exists():
            logger.warning(f"Projects directory does not exist: {projects_dir}")
            return discovered_projects
        
        logger.info(f"Scanning for projects in: {projects_dir}")
        
        # Look for project folders (typically named with year prefix like 24xxxx)
        for project_folder in projects_dir.iterdir():
            if project_folder.is_dir():
                logger.info(f"Found folder: {project_folder.name}")
                # Check if it looks like a VFX project (has vfx folder)
                vfx_folder = project_folder / "vfx"
                if vfx_folder.exists() and vfx_folder.is_dir():
                    logger.info(f"Found VFX project: {project_folder.name}")
                    # Extract project info
                    folder_name = project_folder.name
                    
                    # Try to extract project name from folder name
                    # Remove year prefix if present (e.g., "24xxxx_ProjectName" -> "ProjectName")
                    project_name = folder_name
                    if len(folder_name) >= 6 and folder_name[:2].isdigit() and folder_name[2:6].isdigit():
                        # Has year prefix, extract the rest
                        underscore_pos = folder_name.find('_')
                        if underscore_pos > 0:
                            project_name = folder_name[underscore_pos + 1:]
                        else:
                            project_name = folder_name[6:]
                    
                    # Check if project already exists in database
                    existing_project = db.query(Project).filter(Project.folder_name == folder_name).first()
                    
                    if not existing_project:
                        # Create new project record
                        new_project = Project(
                            name=project_name,
                            folder_name=folder_name,
                            type="vfx",
                            client="",  # Could be extracted from folder name or config
                            workspace_path=str(project_folder),
                            shots=[]  # Could scan vfx folder for shots
                        )
                        db.add(new_project)
                        logger.info(f"Discovered new project: {project_name} ({folder_name})")
                    else:
                        logger.info(f"Project already in database: {project_name} ({folder_name})")
        
        db.commit()
        
        # Return all projects (including newly discovered ones)
        all_projects = db.query(Project).all()
        logger.info(f"Total projects in database: {len(all_projects)}")
        return [
            {
                "id": p.id,
                "name": p.name,
                "folder_name": p.folder_name,
                "type": p.type,
                "client": p.client,
                "workspace_path": p.workspace_path,
                "created_at": p.created_at.isoformat(),
                "shots": p.shots
            }
            for p in all_projects
        ]
        
    except Exception as e:
        logger.error(f"Error scanning for projects: {e}")
        db.rollback()
        return discovered_projects
    finally:
        db.close()


def get_next_project_number() -> str:
    """Calculate the next project number with a two-digit year prefix."""
    current_year = datetime.now().strftime("%y")
    
    # Get database session
    db = SessionLocal()
    try:
        # Get all projects that start with current year
        projects = db.query(Project).filter(Project.folder_name.like(f"{current_year}%")).all()
        
        if not projects:
            return f"{current_year}0001"

        numbers = [int(p.folder_name[-4:]) for p in projects if p.folder_name.startswith(current_year)]
        next_num = max(numbers) + 1 if numbers else 1
        return f"{current_year}{next_num:04d}"
    finally:
        db.close()


def create_dir_structure(base_path: Path, structure: dict):
    """Recursively create directory structure."""
    for name, content in structure.items():
        current_path = base_path / name
        current_path.mkdir(exist_ok=True)
        if isinstance(content, dict):
            create_dir_structure(current_path, content)


def get_vfx_shot_structure() -> dict:
    """Returns the dictionary defining the VFX shot folder structure."""
    common_app_structure = {
        "work": {"scenes": {}, "cache": {"alembic": {}}},
        "publish": {"maya_exports": {}, "obj": {}}
    }
    return {
        "artwork": {},
        "modeling": {app: common_app_structure for app in ["maya", "houdini", "zbrush"]},
        "animation": {app: common_app_structure for app in ["maya", "houdini"]},
        "fx": {
            app: {
                "work": {"scenes": {}, "cache": {"sim": {}, "geo": {}}},
                "publish": {"fx_exports": {}}
            } for app in ["houdini", "maya", "realflow"]
        },
        "lighting": {
            app: {
                "work": {"scenes": {}, "cache": {}},
                "publish": {"lighting_exports": {}}
            } for app in ["maya", "houdini", "katana"]
        },
        "rendering": {
            "beauty": {},
            "passes": {pass_name: {} for pass_name in ["diffuse", "specular", "reflection", "shadow", "ambient_occlusion"]}
        },
        "comp": {
            "nuke": {
                "work": {"scripts": {}, "precomps": {}},
                "publish": {"comp_exports": {}},
                "elements": {}, "images": {}, "renders": {}
            }
        }
    }


def create_vfx_project_structure(project_path: Path, shots: List[str]):
    """Create a complete VFX project structure, including shots."""
    logger.info(f"Creating VFX project structure at: {project_path}")
    project_structure = {
        "in": {"tracking": {}, "reference": {"media": {}, "notes": {}}, "models": {}},
        "out": {"postings": {"Posting01": {}}},
        "vfx": {shot: get_vfx_shot_structure() for shot in shots}
    }
    create_dir_structure(project_path, project_structure)
    logger.info(f"Complete VFX project structure created for {project_path.name}")

# --- API Endpoints ---
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "VFX Pipeline Companion API is running", "time": datetime.now().isoformat()}


@app.get("/")
async def root():
    return {"message": "VFX Pipeline Companion API", "status": "running"}


@app.get("/settings", response_model=Settings)
async def get_settings(db: Session = Depends(get_db)):
    """Get current settings"""
    settings = db.query(SettingsModel).first()
    if not settings:
        # Create default settings if none exist
        settings = SettingsModel(
            root_path="",
            auto_launch_electron=True,
            dark_mode=True,
            enable_notifications=True
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return Settings(
        rootPath=settings.root_path,
        autoLaunchElectron=settings.auto_launch_electron,
        darkMode=settings.dark_mode,
        enableNotifications=settings.enable_notifications
    )


@app.post("/settings")
async def save_settings_endpoint(settings: Settings, db: Session = Depends(get_db)):
    """Save settings"""
    try:
        db_settings = db.query(SettingsModel).first()
        if not db_settings:
            db_settings = SettingsModel()
            db.add(db_settings)
        
        db_settings.root_path = settings.rootPath
        db_settings.auto_launch_electron = settings.autoLaunchElectron
        db_settings.dark_mode = settings.darkMode
        db_settings.enable_notifications = settings.enableNotifications
        db_settings.updated_at = datetime.utcnow()
        
        db.commit()
        return {"message": "Settings saved successfully", "settings": settings}
    except Exception as e:
        logger.error(f"Error in save_settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/settings/validate-path")
async def validate_path(path_data: PathData):
    """Validate if a path exists and has the expected structure"""
    try:
        path_obj = Path(path_data.path)
        if not path_obj.exists() or not path_obj.is_dir():
            return {"isValid": False, "message": "Path must be an existing directory."}

        projects_folder = path_obj / "Projects"
        tools_folder = path_obj / "Tools"
        missing = [f for f in ["Projects", "Tools"] if not (path_obj / f).exists()]

        if missing:
            return {"isValid": False, "message": f"Missing: {', '.join(missing)}. These will be created."}

        return {"isValid": True, "message": "Valid project root."}
    except Exception as e:
        logger.error(f"Error in validate_path: {e}")
        return {"isValid": False, "message": f"Error: {str(e)}"}


@app.get("/projects/next-number")
async def get_next_project_number_endpoint():
    """Get the next project number"""
    return {"next_number": get_next_project_number()}


@app.post("/projects/create")
async def create_vfx_project(project_data: VFXProjectCreate, db: Session = Depends(get_db)):
    """Create a VFX project with detailed folder structure and shots"""
    try:
        logger.info(f"Creating VFX project with data: {project_data.name}")
        root_path_obj = Path(project_data.rootPath)
        projects_folder = root_path_obj / "Projects"
        project_path = projects_folder / project_data.folderName

        projects_folder.mkdir(exist_ok=True)

        if project_path.exists():
            raise HTTPException(status_code=400, detail=f"Project folder '{project_data.folderName}' already exists.")

        project_path.mkdir(parents=True)
        create_vfx_project_structure(project_path, project_data.shots)

        project_info = {
            "name": project_data.name,
            "type": "general_vfx",
            "client": project_data.client,
            "shots": project_data.shots,
            "created_at": datetime.now().isoformat(),
        }
        
        # Save project info to file
        with open(project_path / "project_info.json", 'w') as f:
            json.dump(project_info, f, indent=2)

        # Save to database
        new_project = Project(
            name=project_data.name,
            folder_name=project_data.folderName,
            type="general_vfx",
            client=project_data.client,
            workspace_path=str(project_path),
            shots=project_data.shots
        )
        db.add(new_project)
        db.commit()
        db.refresh(new_project)

        logger.info(f"VFX Project created successfully: {project_data.folderName}")
        return {"message": "VFX Project created successfully", "project": new_project}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create VFX project: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create VFX project: {str(e)}")


@app.get("/projects/scan")
async def scan_projects():
    """Manually trigger project scanning"""
    try:
        projects = scan_for_existing_projects()
        return {
            "message": f"Project scan completed. Found {len(projects)} projects.",
            "projects": projects
        }
    except Exception as e:
        logger.error(f"Error scanning projects: {e}")
        raise HTTPException(status_code=500, detail=f"Error scanning projects: {str(e)}")


@app.get("/projects")
async def get_projects(db: Session = Depends(get_db)):
    """Get all projects, including newly discovered ones"""
    try:
        # Scan for existing projects first
        all_projects = scan_for_existing_projects()
        return all_projects
    except Exception as e:
        logger.error(f"Error getting projects: {e}")
        # Fallback to database-only projects
        projects = db.query(Project).all()
        return [
            {
                "id": p.id,
                "name": p.name,
                "folder_name": p.folder_name,
                "type": p.type,
                "client": p.client,
                "workspace_path": p.workspace_path,
                "created_at": p.created_at.isoformat(),
                "shots": p.shots
            }
            for p in projects
        ]


@app.get("/tools")
async def get_tools(db: Session = Depends(get_db)):
    """Get all tools"""
    tools = db.query(Tool).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "category": t.category,
            "description": t.description,
            "executable_path": t.executable_path,
            "is_favorite": t.is_favorite,
            "last_used": t.last_used.isoformat() if t.last_used else None
        }
        for t in tools
    ]


@app.get("/libraries")
async def get_libraries(db: Session = Depends(get_db)):
    """Get all libraries with their items"""
    libraries = db.query(LibraryModel).all()
    result = []
    
    for library in libraries:
        library_dict = {
            "id": library.id,
            "name": library.name,
            "description": library.description,
            "category": library.category,
            "created_at": library.created_at.isoformat(),
            "updated_at": library.updated_at.isoformat(),
            "items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "path": item.path,
                    "preview_path": item.preview_path,
                    "category": item.category,
                    "tags": item.tags,
                    "created_at": item.created_at.isoformat(),
                    "updated_at": item.updated_at.isoformat()
                }
                for item in library.items
            ]
        }
        result.append(library_dict)
    
    return result


@app.post("/libraries")
async def create_library(library: LibraryCreate, db: Session = Depends(get_db)):
    """Create a new library"""
    try:
        new_library = LibraryModel(
            name=library.name,
            description=library.description,
            category=library.category
        )
        db.add(new_library)
        db.commit()
        db.refresh(new_library)
        
        return {"message": "Library created successfully", "library": new_library}
    except Exception as e:
        logger.error(f"Failed to create library: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create library: {str(e)}")


@app.post("/libraries/{library_id}/items")
async def add_library_item(library_id: int, item: LibraryItemCreate, db: Session = Depends(get_db)):
    """Add a new item to a library"""
    try:
        # Check if library exists
        library = db.query(LibraryModel).filter(LibraryModel.id == library_id).first()
        if not library:
            raise HTTPException(status_code=404, detail="Library not found")
        
        new_item = LibraryItemModel(
            library_id=library_id,
            name=item.name,
            path=item.path,
            preview_path=item.preview_path,
            category=item.category,
            tags=item.tags
        )
        
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        logger.info(f"Added new item '{item.name}' to library {library_id}")
        return {
            "id": new_item.id,
            "name": new_item.name,
            "path": new_item.path,
            "preview_path": new_item.preview_path,
            "category": new_item.category,
            "tags": new_item.tags,
            "created_at": new_item.created_at.isoformat(),
            "updated_at": new_item.updated_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add item to library {library_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to add item to library")


@app.put("/libraries/{library_id}/items/{item_id}")
async def update_library_item(library_id: int, item_id: int, item: LibraryItemUpdate, db: Session = Depends(get_db)):
    """Update an existing library item"""
    try:
        # Find the item
        db_item = db.query(LibraryItemModel).filter(
            LibraryItemModel.id == item_id,
            LibraryItemModel.library_id == library_id
        ).first()
        
        if not db_item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        # Update fields
        if item.name is not None:
            db_item.name = item.name
        if item.path is not None:
            db_item.path = item.path
        if item.preview_path is not None:
            db_item.preview_path = item.preview_path
        if item.tags is not None:
            db_item.tags = item.tags
        
        db_item.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_item)
        
        logger.info(f"Updated item {item_id} in library {library_id}")
        return {
            "id": db_item.id,
            "name": db_item.name,
            "path": db_item.path,
            "preview_path": db_item.preview_path,
            "category": db_item.category,
            "tags": db_item.tags,
            "created_at": db_item.created_at.isoformat(),
            "updated_at": db_item.updated_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update item {item_id} in library {library_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update item")


@app.delete("/libraries/{library_id}/items/{item_id}")
async def delete_library_item(library_id: int, item_id: int, db: Session = Depends(get_db)):
    """Delete a library item"""
    try:
        # Find the item
        db_item = db.query(LibraryItemModel).filter(
            LibraryItemModel.id == item_id,
            LibraryItemModel.library_id == library_id
        ).first()
        
        if not db_item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        item_name = db_item.name
        db.delete(db_item)
        db.commit()
        
        logger.info(f"Deleted item {item_id} from library {library_id}")
        return {"message": f"Item '{item_name}' deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete item {item_id} from library {library_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete item")


@app.get("/test/workspace")
async def test_workspace():
    """Test endpoint to check workspace structure"""
    try:
        db = SessionLocal()
        settings = db.query(SettingsModel).first()
        
        if not settings:
            return {"error": "No settings found"}
        
        workspace_path = settings.root_path or ""
        if not workspace_path:
            return {"error": "No workspace path configured"}
        
        projects_dir = Path(workspace_path) / "Projects"
        
        result = {
            "workspace_path": workspace_path,
            "projects_dir": str(projects_dir),
            "projects_dir_exists": projects_dir.exists(),
            "folders": []
        }
        
        if projects_dir.exists():
            for item in projects_dir.iterdir():
                if item.is_dir():
                    vfx_folder = item / "vfx"
                    result["folders"].append({
                        "name": item.name,
                        "path": str(item),
                        "has_vfx_folder": vfx_folder.exists() and vfx_folder.is_dir(),
                        "vfx_folder_path": str(vfx_folder) if vfx_folder.exists() else None
                    })
        
        return result
        
    except Exception as e:
        logger.error(f"Error testing workspace: {e}")
        return {"error": str(e)}
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn

    print("*** Starting VFX Pipeline API")
    print(f"*** Working directory: {Path(__file__).parent}")
    uvicorn.run(app, host="127.0.0.1", port=8000)