# backend/working_main.py - VFX Backend that definitely works
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import json
import os
import re
from pathlib import Path
from typing import List

print("🚀 Starting VFX Pipeline Companion API...")

app = FastAPI(title="VFX Pipeline Companion API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Settings file path
SETTINGS_FILE = Path(__file__).parent / "data" / "settings.json"
PROJECTS_FILE = Path(__file__).parent / "data" / "projects.json"


def ensure_data_directory():
    """Ensure data directory exists"""
    data_dir = Path(__file__).parent / "data"
    data_dir.mkdir(exist_ok=True)
    return data_dir


def load_settings():
    """Load settings from JSON file"""
    ensure_data_directory()
    if SETTINGS_FILE.exists():
        try:
            with open(SETTINGS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading settings: {e}")

    return {
        "rootPath": "",
        "autoLaunchElectron": True,
        "darkMode": True,
        "enableNotifications": True
    }


def save_settings_data(settings_data):
    """Save settings to JSON file"""
    ensure_data_directory()
    try:
        with open(SETTINGS_FILE, 'w') as f:
            json.dump(settings_data, f, indent=2)
        print(f"✅ Settings saved to {SETTINGS_FILE}")
    except Exception as e:
        print(f"❌ Error saving settings: {e}")
        raise


def load_projects():
    """Load projects from JSON file"""
    ensure_data_directory()
    if PROJECTS_FILE.exists():
        try:
            with open(PROJECTS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading projects: {e}")
    return []


def save_projects(projects):
    """Save projects to JSON file"""
    ensure_data_directory()
    try:
        with open(PROJECTS_FILE, 'w') as f:
            json.dump(projects, f, indent=2)
        print(f"✅ Projects saved to {PROJECTS_FILE}")
    except Exception as e:
        print(f"❌ Error saving projects: {e}")
        raise


def get_next_project_number():
    """Calculate the next project number with year prefix"""
    current_year = datetime.now().year
    year_prefix = str(current_year)[-2:]  # Last 2 digits of year

    projects = load_projects()

    if not projects:
        return f"{year_prefix}0001"

    # Extract numbers from project names
    numbers = []
    for project in projects:
        project_name = project.get("folder_name", "")
        match = re.match(rf'{year_prefix}(\d{{4}})', project_name)
        if match:
            numbers.append(int(match.group(1)))

    if not numbers:
        return f"{year_prefix}0001"

    # Get next number
    next_num = max(numbers) + 1
    return f"{year_prefix}{next_num:04d}"


def create_detailed_vfx_structure(shot_path: Path):
    """Create detailed VFX shot folder structure"""
    try:
        print(f"📁 Creating detailed structure for: {shot_path}")

        # Artwork folder
        (shot_path / "artwork").mkdir(exist_ok=True)

        # Modeling structure
        modeling_apps = ["maya", "houdini", "zbrush"]
        for app in modeling_apps:
            app_path = shot_path / "modeling" / app
            (app_path / "work" / "scenes").mkdir(parents=True, exist_ok=True)
            (app_path / "work" / "cache" / "alembic").mkdir(parents=True, exist_ok=True)
            (app_path / "work" / "cache" / "fbx").mkdir(parents=True, exist_ok=True)
            (app_path / "publish").mkdir(parents=True, exist_ok=True)

        # Texturing structure
        substance_path = shot_path / "texturing" / "substance"
        (substance_path / "scenes").mkdir(parents=True, exist_ok=True)
        (substance_path / "imports" / "v01").mkdir(parents=True, exist_ok=True)
        (substance_path / "exports" / "v01").mkdir(parents=True, exist_ok=True)

        zbrush_tex_path = shot_path / "texturing" / "zbrush"
        (zbrush_tex_path / "exports" / "v01").mkdir(parents=True, exist_ok=True)

        # FX structure
        fx_houdini_path = shot_path / "fx" / "houdini"
        (fx_houdini_path / "work" / "scenes").mkdir(parents=True, exist_ok=True)
        (fx_houdini_path / "work" / "cache" / "alembic").mkdir(parents=True, exist_ok=True)
        (fx_houdini_path / "work" / "cache" / "fbx").mkdir(parents=True, exist_ok=True)
        (fx_houdini_path / "publish").mkdir(parents=True, exist_ok=True)

        # Lighting structure
        lighting_apps = ["maya", "houdini", "zbrush"]
        for app in lighting_apps:
            lighting_path = shot_path / "lighting" / app
            (lighting_path / "work" / "scenes").mkdir(parents=True, exist_ok=True)
            (lighting_path / "work" / "cache" / "alembic").mkdir(parents=True, exist_ok=True)
            (lighting_path / "work" / "cache" / "fbx").mkdir(parents=True, exist_ok=True)
            if app in ["maya", "houdini"]:
                (lighting_path / "work" / "renders").mkdir(parents=True, exist_ok=True)
            (lighting_path / "publish").mkdir(parents=True, exist_ok=True)

        # Compositing structure
        nuke_path = shot_path / "compositing" / "nuke"
        (nuke_path / "scenes").mkdir(parents=True, exist_ok=True)
        (nuke_path / "images").mkdir(parents=True, exist_ok=True)
        (nuke_path / "renders").mkdir(parents=True, exist_ok=True)

        print(f"✅ Detailed VFX structure created for {shot_path.name}")

    except Exception as e:
        print(f"❌ Error creating detailed shot structure: {e}")
        raise


def create_vfx_project_structure(project_path: Path, shots: List[str]):
    """Create complete VFX project structure"""
    try:
        print(f"📁 Creating VFX project structure: {project_path}")

        # Create main IN folders
        (project_path / "in" / "tracking").mkdir(parents=True, exist_ok=True)
        (project_path / "in" / "reference" / "media").mkdir(parents=True, exist_ok=True)
        (project_path / "in" / "reference" / "notes").mkdir(parents=True, exist_ok=True)
        (project_path / "in" / "models").mkdir(parents=True, exist_ok=True)

        # Create VFX shots with detailed structure
        for shot in shots:
            shot_path = project_path / "vfx" / shot
            shot_path.mkdir(parents=True, exist_ok=True)
            create_detailed_vfx_structure(shot_path)

        # Create OUT folders
        (project_path / "out" / "postings" / "Posting01").mkdir(parents=True, exist_ok=True)

        print(f"✅ Complete VFX project structure created")

    except Exception as e:
        print(f"❌ Error creating VFX project structure: {e}")
        raise


# ENDPOINTS

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "VFX Pipeline Companion API is running",
        "time": datetime.now().isoformat(),
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    return {
        "message": "VFX Pipeline Companion API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": ["/health", "/settings", "/projects/create", "/projects/next-number", "/projects"]
    }


@app.get("/settings")
async def get_settings():
    """Get current settings"""
    try:
        settings = load_settings()
        print(f"📄 Settings loaded: {settings}")
        return settings
    except Exception as e:
        print(f"❌ Error in get_settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/settings")
async def save_settings_endpoint(settings: dict):
    """Save settings"""
    try:
        print(f"💾 Saving settings: {settings}")
        save_settings_data(settings)
        return {"message": "Settings saved successfully", "settings": settings}
    except Exception as e:
        print(f"❌ Error in save_settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/settings/validate-path")
async def validate_path(path_data: dict):
    """Validate if a path exists and has the expected structure"""
    try:
        path = path_data.get("path", "")
        print(f"🔍 Validating path: {path}")

        if not path:
            return {"isValid": False, "message": "Path cannot be empty"}

        path_obj = Path(path)

        if not path_obj.exists():
            return {"isValid": False, "message": "Path does not exist"}

        if not path_obj.is_dir():
            return {"isValid": False, "message": "Path is not a directory"}

        # Check for Projects and Tools folders
        projects_folder = path_obj / "Projects"
        tools_folder = path_obj / "Tools"

        missing_folders = []
        if not projects_folder.exists():
            missing_folders.append("Projects")
        if not tools_folder.exists():
            missing_folders.append("Tools")

        if missing_folders:
            return {
                "isValid": False,
                "message": f"Missing folders: {', '.join(missing_folders)}. These will be created automatically."
            }

        return {"isValid": True, "message": "Valid project root with Projects and Tools folders"}

    except Exception as e:
        print(f"❌ Error in validate_path: {e}")
        return {"isValid": False, "message": f"Error: {str(e)}"}


@app.get("/projects/next-number")
async def get_next_project_number_endpoint():
    """Get the next project number"""
    try:
        next_number = get_next_project_number()
        print(f"🔢 Next project number: {next_number}")
        return {"next_number": next_number}
    except Exception as e:
        print(f"❌ Error in get_next_project_number: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/projects/create")
async def create_vfx_project(project_data: dict):
    """Create a VFX project with detailed folder structure and shots"""
    try:
        print(f"🎬 Creating VFX project with data: {project_data}")

        # Extract data
        name = project_data.get("name", "").strip()
        project_type = "general_vfx"
        client = project_data.get("client", "")
        shots = project_data.get("shots", ["shot01"])
        folder_name = project_data.get("folderName", "")
        root_path = project_data.get("rootPath", "")

        print(f"📝 Project details: name={name}, folder={folder_name}, shots={shots}")

        # Validate required fields
        if not name:
            raise HTTPException(status_code=400, detail="Project name is required")

        if not root_path:
            raise HTTPException(status_code=400, detail="Root path is required")

        if not folder_name:
            raise HTTPException(status_code=400, detail="Folder name is required")

        if not shots or len(shots) == 0:
            raise HTTPException(status_code=400, detail="At least one shot is required")

        # Create the project directory structure
        root_path_obj = Path(root_path)
        projects_folder = root_path_obj / "Projects"
        project_path = projects_folder / folder_name

        print(f"📁 Full project path: {project_path}")

        # Ensure Projects folder exists
        projects_folder.mkdir(exist_ok=True)

        # Check if project already exists
        if project_path.exists():
            raise HTTPException(status_code=400, detail=f"Project folder already exists: {folder_name}")

        # Create project folder
        project_path.mkdir(parents=True)

        # Create VFX project structure with detailed shot folders
        create_vfx_project_structure(project_path, shots)

        # Create project info file
        project_info = {
            "name": name,
            "type": project_type,
            "client": client,
            "shots": shots,
            "created_at": datetime.now().isoformat(),
            "folder_structure": "Professional VFX Pipeline Structure"
        }

        with open(project_path / "project_info.json", 'w') as f:
            json.dump(project_info, f, indent=2)

        # Save project to our JSON database
        projects = load_projects()
        new_project = {
            "id": len(projects) + 1,
            "name": name,
            "folder_name": folder_name,
            "type": project_type,
            "client": client,
            "workspace_path": str(project_path),
            "created_at": datetime.now().isoformat(),
            "shots": shots
        }
        projects.append(new_project)
        save_projects(projects)

        print(f"🎉 VFX Project created successfully: {folder_name}")

        return {
            "message": "VFX Project created successfully",
            "project": {
                "id": new_project["id"],
                "name": name,
                "folder_name": folder_name,
                "type": project_type,
                "client": client,
                "shots": shots,
                "path": str(project_path),
                "structure": "Professional VFX Pipeline with detailed shot folders"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating VFX project: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create VFX project: {str(e)}")


@app.get("/projects")
async def get_projects():
    """Get all projects"""
    try:
        projects = load_projects()
        print(f"📋 Retrieved {len(projects)} projects")
        return projects
    except Exception as e:
        print(f"❌ Error getting projects: {e}")
        return []


@app.get("/tools")
async def get_tools():
    """Get tools"""
    try:
        # Return sample tools for now
        tools = [
            {
                "id": 1,
                "name": "Maya",
                "description": "3D modeling and animation software",
                "category": "3d",
                "executable_path": None,
                "is_favorite": False,
                "last_used": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 2,
                "name": "Nuke",
                "description": "Professional compositing software",
                "category": "compositing",
                "executable_path": None,
                "is_favorite": True,
                "last_used": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            },
            {
                "id": 3,
                "name": "Houdini",
                "description": "Procedural 3D software",
                "category": "3d",
                "executable_path": None,
                "is_favorite": False,
                "last_used": None,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
        ]
        print(f"🔧 Retrieved {len(tools)} tools")
        return tools
    except Exception as e:
        print(f"❌ Error getting tools: {e}")
        return []


if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting VFX Pipeline API (Working Version)")
    print(f"📁 Working directory: {Path(__file__).parent}")
    uvicorn.run(app, host="127.0.0.1", port=8000)