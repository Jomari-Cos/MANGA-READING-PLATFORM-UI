
  # Manga Reading Platform UI

  Code bundle for the Manga Reading Platform UI (Figma: https://www.figma.com/design/pXPwQIouDqChyqZJGsnH5b/Manga-Reading-Platform-UI).

  ## Prerequisites

  - Node.js (>=16) and npm or pnpm
  - Python 3.10+ for the backend (optional if you only run the frontend)

  ## Install

  Install frontend dependencies:

  ```bash
  npm install
  # or pnpm install
  ```

  Install backend dependencies (optional):

  ```bash
  python -m venv .venv
  .venv\Scripts\activate   # Windows
  pip install -r backend/requirements.txt
  ```

  ## Run

  - Start frontend (Vite):
  ```bash
  npm run dev
  ```

  - Start backend (uvicorn) from the root via the provided script:
  ```bash
  npm run dev:backend
  ```

  ## Pushing to GitHub

  1. Create a repository on GitHub (for example `manga-reading-platform-ui`).
  2. Add the remote and push:
  ```bash
  git remote add origin https://github.com/YOUR_GITHUB_USERNAME/manga-reading-platform-ui.git
  git push -u origin main
  ```

  Or use SSH:
  ```bash
  git remote add origin git@github.com:YOUR_GITHUB_USERNAME/manga-reading-platform-ui.git
  git push -u origin main
  ```

  ## Notes

  - The repository contains both frontend (`src/`) and a simple Python backend (`backend/`).
  - If you want me to create the remote repo and push it for you, install and authenticate the GitHub CLI (`gh`) or provide the remote URL.

  