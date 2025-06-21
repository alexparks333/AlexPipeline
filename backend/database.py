# backend/database.py - Database Configuration
import os
from pathlib import Path
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

# Database file path
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DATABASE_URL = f"sqlite:///{DATA_DIR}/pipeline.db"

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Needed for SQLite
    echo=False  # Set to True for SQL query logging
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database with tables and sample data"""
    from models import Base, Settings, Library, LibraryItem, Project, Tool
    from datetime import datetime
    
    # Check if tables already exist
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # Only create tables if they don't exist
    if not existing_tables:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
    else:
        print("Database tables already exist")
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Check if we already have data
        existing_settings = db.query(Settings).first()
        if existing_settings:
            print("Database already initialized with data")
            return
        
        print("Initializing database with sample data...")
        
        # Create default settings
        default_settings = Settings(
            root_path="",
            auto_launch_electron=True,
            dark_mode=True,
            enable_notifications=True
        )
        db.add(default_settings)
        
        # Create sample library
        sample_library = Library(
            name="HDRIS",
            description="High Dynamic Range Images for lighting and reflections",
            category="hdri"
        )
        db.add(sample_library)
        db.flush()  # Flush to get the library ID
        
        # Create sample library items
        sample_items = [
            LibraryItem(
                library_id=sample_library.id,
                name="Studio HDRI 01",
                path="C:\\Users\\alexh\\Desktop\\AlexParksCreative\\Library\\HDRIS\\studio_hdri_01.hdr",
                preview_path="C:\\Users\\alexh\\Desktop\\AlexParksCreative\\Library\\HDRIS\\previews\\studio_hdri_01.jpg",
                category="hdri",
                tags=["studio", "neutral", "clean"]
            ),
            LibraryItem(
                library_id=sample_library.id,
                name="Sunset HDRI 01",
                path="C:\\Users\\alexh\\Desktop\\AlexParksCreative\\Library\\HDRIS\\sunset_hdri_01.hdr",
                preview_path="C:\\Users\\alexh\\Desktop\\AlexParksCreative\\Library\\HDRIS\\previews\\sunset_hdri_01.jpg",
                category="hdri",
                tags=["sunset", "warm", "outdoor"]
            ),
            LibraryItem(
                library_id=sample_library.id,
                name="Night City HDRI 01",
                path="C:\\Users\\alexh\\Desktop\\AlexParksCreative\\Library\\HDRIS\\night_city_hdri_01.hdr",
                preview_path="C:\\Users\\alexh\\Desktop\\AlexParksCreative\\Library\\HDRIS\\previews\\night_city_hdri_01.jpg",
                category="hdri",
                tags=["night", "city", "urban", "neon"]
            )
        ]
        
        for item in sample_items:
            db.add(item)
        
        # Create sample tools
        sample_tools = [
            Tool(name="Maya", category="3d", description="3D Animation and Modeling"),
            Tool(name="Nuke", category="compositing", description="Node-based Compositing"),
            Tool(name="Houdini", category="3d", description="Procedural 3D and VFX"),
        ]
        
        for tool in sample_tools:
            db.add(tool)
        
        # Commit all changes
        db.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
        raise
    finally:
        db.close()