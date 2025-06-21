#!/usr/bin/env python3
import requests
import json

# Test API endpoints
BASE_URL = "http://localhost:8000"

def test_settings():
    print("=== Testing Settings ===")
    
    # Get current settings
    response = requests.get(f"{BASE_URL}/settings")
    print(f"GET /settings: {response.status_code}")
    if response.status_code == 200:
        settings = response.json()
        print(f"Current settings: {json.dumps(settings, indent=2)}")
    else:
        print(f"Error: {response.text}")
    
    # Test workspace
    response = requests.get(f"{BASE_URL}/test/workspace")
    print(f"\nGET /test/workspace: {response.status_code}")
    if response.status_code == 200:
        workspace = response.json()
        print(f"Workspace info: {json.dumps(workspace, indent=2)}")
    else:
        print(f"Error: {response.text}")

def test_projects():
    print("\n=== Testing Projects ===")
    
    # Get projects
    response = requests.get(f"{BASE_URL}/projects")
    print(f"GET /projects: {response.status_code}")
    if response.status_code == 200:
        projects = response.json()
        print(f"Found {len(projects)} projects:")
        for project in projects:
            print(f"  - {project['name']} ({project['folder_name']})")
    else:
        print(f"Error: {response.text}")
    
    # Manual scan
    response = requests.get(f"{BASE_URL}/projects/scan")
    print(f"\nGET /projects/scan: {response.status_code}")
    if response.status_code == 200:
        scan_result = response.json()
        print(f"Scan result: {json.dumps(scan_result, indent=2)}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    try:
        test_settings()
        test_projects()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API. Make sure the backend is running.")
    except Exception as e:
        print(f"Error: {e}") 