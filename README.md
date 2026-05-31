
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

  ## Deployment

  ### 1. Deploy the backend to Railway

  1. Create a MongoDB database first. MongoDB Atlas is the easiest hosted option.
  2. In Railway, create a new service from this GitHub repo and set the root directory to `backend`.
  3. Railway will use `backend/Dockerfile`.
  4. Add these Railway variables:
  ```bash
  MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.example.mongodb.net/?retryWrites=true&w=majority
  MONGODB_DB=manga_reader
  CORS_ORIGINS=http://localhost:5173,https://YOUR-VERCEL-APP.vercel.app
  CORS_ORIGIN_REGEX=https://.*\.vercel\.app
  ```
  5. After deploy, open `https://YOUR-RAILWAY-SERVICE.up.railway.app/api/health`. It should return `{"status":"ok"}`.

  ### 2. Deploy the frontend to Vercel

  1. In Vercel, import the same GitHub repo with the project root at the repository root.
  2. Use the default Vite settings:
  ```bash
  Build Command: npm run build
  Output Directory: dist
  ```
  3. Add this Vercel environment variable:
  ```bash
  VITE_API_URL=https://YOUR-RAILWAY-SERVICE.up.railway.app
  ```
  4. Deploy the frontend.
  5. Copy the final Vercel URL back into Railway `CORS_ORIGINS`, then redeploy the Railway backend.

  The included `vercel.json` keeps React Router pages working after refreshes, and `backend/.env.example` / `.env.example` show the production variables to copy.

  
