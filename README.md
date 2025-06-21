// README.md (updated with proper instructions)
# VFX Pipeline Companion

VFX Pipeline Companion is a desktop application designed to help freelance VFX artists manage their projects, tools, and pipeline tasks efficiently.

## Features

- **Project Management**: Create, organize, and track your VFX projects.
- **Tool Launcher**: Quickly launch your VFX software and project-specific tools.
- **Task Management**: Keep track of tasks and deadlines for each project.
- **Cross-Platform**: Runs on Windows, macOS, and Linux.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- [Python](https://www.python.org/)

### Setup

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Run the setup script:**

    This will install all the necessary npm packages and set up the Python virtual environment with the required dependencies.

    ```sh
    npm run setup
    ```

    If you are on macOS or Linux, the `setup:backend` script might need adjustment. The setup script is configured for Windows. You may need to run the backend setup manually:
    ```sh
    # create virtual environment
    python3 -m venv .venv

    # activate it
    # On Windows (Git Bash or Powershell)
    source .venv/Scripts/activate
    # On macOS/Linux
    source .venv/bin/activate

    # install python packages
    pip install -r backend/requirements.txt
    ```


## Usage

To start the application for development, simply run:

```sh
npm start
```

This will:
- Start the Python backend server.
- Start the React frontend development server.
- Launch the Electron application.

Alternatively, you can run the `start-dev.bat` script on Windows.

## Available Scripts

- `npm start`: Starts the application in development mode.
- `npm run kill`: Stops all the running processes (backend, frontend, electron).
- `npm run restart`: Restarts the application.
- `npm run setup`: Installs all dependencies for the project.
- `npm run build`: Builds the frontend and backend for production.
- `npm run package`: Packages the application for distribution.
- `npm run clean`: Removes generated files and folders.

Enjoy using VFX Pipeline Companion!

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Desktop Shell**: Electron
- **Backend**: Python FastAPI
- **Database**: SQLite
- **Development**: Concurrently for running all services

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or later)
- Python (v3.8 or later)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd vfx-pipeline-companion
```

2. **Run the setup script:**

**Windows:**
```batch
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Or manually install dependencies:**
```bash
npm install
npm run setup:frontend
npm run setup:backend
```

### Development

**Start the full development environment:**
```bash
npm run dev
```

This will:
- Start the React frontend on `http://localhost:3000`
- Start the Python FastAPI backend on `http://localhost:8000`
- Launch the Electron app automatically

**Individual services:**
```bash
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend only  
npm run electron:dev    # Electron only
```

### Building for Production

```bash
npm run build           # Build everything
npm run package         # Create distributable app

# Platform-specific builds
npm run package:win     # Windows
npm run package:mac     # macOS
npm run package:linux   # Linux
```

## 📁 Project Structure

```
vfx_pipeline_app/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   └── App.jsx          # Main app component
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Python FastAPI backend
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # Database configuration
│   └── requirements.txt
├── electron/                 # Electron main process
│   ├── main.js              # Main Electron process
│   └── preload.js           # Preload script
├── package.json             # Root package.json
└── README.md
```

## 🎯 Project Types & Folder Structures

The app supports several predefined project types:

### Motion Tracking
- `01_footage` - Source video files
- `02_reference` - Reference materials  
- `03_tracking` - Tracking project files
- `04_export` - Exported tracking data
- `05_render` - Rendered outputs
- `06_delivery` - Final deliverables

### Houdini FX
- `01_assets` - 3D assets and models
- `02_cache` - Simulation cache files
- `03_hip` - Houdini project files
- `04_render` - Rendered sequences
- `05_comp` - Compositing files
- `06_delivery` - Final deliverables

### Compositing
- `01_plates` - Background plates
- `02_elements` - VFX elements
- `03_scripts` - Nuke/AE scripts
- `04_render` - Rendered comps
- `05_delivery` - Final deliverables

### General VFX
- `01_assets` - Project assets
- `02_footage` - Source footage
- `03_work` - Work files
- `04_render` - Rendered outputs
- `05_comp` - Compositing
- `06_delivery` - Final deliverables

## 🔧 Configuration

### Default Paths
- **Projects**: `~/VFX_Projects`
- **Database**: `backend/data/vfx_pipeline.db`
- **Tools**: Configurable in app settings

### Environment Variables
Create a `.env` file in the root directory:
```env
NODE_ENV=development
BACKEND_HOST=localhost
BACKEND_PORT=8000
DEFAULT_WORKSPACE_PATH=~/VFX_Projects
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit: `git commit -am 'Add new feature'`
5. Push: `git push origin feature-name`
6. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.