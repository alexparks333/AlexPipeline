# backend/test_db.py - Test database functionality
import sys
import os
sys.path.append(os.path.dirname(__file__))

from database import SessionLocal, init_db
from models import Settings, Library, LibraryItem, Tool

def test_database():
    """Test database functionality"""
    print("Testing database functionality...")
    
    # Initialize database
    init_db()
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Test settings
        print("\n1. Testing Settings...")
        settings = db.query(Settings).first()
        if settings:
            print(f"✓ Settings found: root_path='{settings.root_path}'")
        else:
            print("✗ No settings found")
        
        # Test libraries
        print("\n2. Testing Libraries...")
        libraries = db.query(Library).all()
        print(f"✓ Found {len(libraries)} libraries")
        for lib in libraries:
            print(f"  - {lib.name}: {len(lib.items)} items")
        
        # Test library items
        print("\n3. Testing Library Items...")
        items = db.query(LibraryItem).all()
        print(f"✓ Found {len(items)} library items")
        for item in items:
            print(f"  - {item.name} (tags: {item.tags})")
        
        # Test tools
        print("\n4. Testing Tools...")
        tools = db.query(Tool).all()
        print(f"✓ Found {len(tools)} tools")
        for tool in tools:
            print(f"  - {tool.name} ({tool.category})")
        
        print("\n✅ Database test completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_database() 