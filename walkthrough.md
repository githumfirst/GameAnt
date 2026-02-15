# GameAnt's PlayGround - Walkthrough & Deployment Guide

I have successfully created the "GameAnt's PlayGround" website structure.

## 1. Project Overview
- **Name**: GameAnt's PlayGround
- **Tech Stack**: React, Vite, Tailwind CSS
- **Features**:
  - Stylish Dark Mode UI
  - Game Cards with hover effects
  - Support for HTML5 Games (Direct Play)
  - Support for Android Games (Link to Store)
  - Responsive Design

## 2. How to Run Locally
To test the site on your computer:

```bash
cd c:/100_nolgaemi_online_project/40_site/site_game
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## 3. How to Add New Games
1.  **HTML Games**:
    -   Create a folder in `public/games/` (e.g., `public/games/my-new-game/`).
    -   Put your `index.html` and game files there.
2.  **Update Config**:
    -   Open `public/data/games.json`.
    -   Add a new entry:
        ```json
        {
          "id": "new-game",
          "title": "My New Game",
          "thumbnail": "/path/to/image.jpg",
          "type": "html", // or "android"
          "url": "/games/my-new-game/index.html", // or Play Store URL
          "description": "Short description..."
        }
        ```

## 4. Cloudflare Deployment Guide

To publish this site to the world using Cloudflare Pages:

### Step 1: Push to GitHub
1.  Initialize a Git repository (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Push your code to GitHub.

### Step 2: Deploy on Cloudflare Pages
1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Go to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
3.  Select your GitHub repository.
4.  **Configure Builds**:
    -   **Framework Preset**: Select `Vite` or `React`.
    -   **Build Command**: `npm run build`
    -   **Build Output Directory**: `dist`
5.  Click **Save and Deploy**.

Cloudflare will verify the build and give you a URL (e.g., `gameant-playground.pages.dev`).

### Step 3: Updates
Whenever you add a new game and push to GitHub, Cloudflare will automatically rebuild and update your site!
