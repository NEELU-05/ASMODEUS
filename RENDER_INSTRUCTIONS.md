# Deploying Asmodeus to Render.com

This project is configured as a Monorepo (Node.js Backend + React Frontend served statically).

## 1. Connect GitHub
Push this code to a GitHub repository.

## 2. Create Web Service on Render
- Go to [dashboard.render.com](https://dashboard.render.com).
- Click **New +** -> **Web Service**.
- Connect your GitHub repository.

## 3. Configure Settings
Render should auto-detect most settings, but verify:

- **Name**: `asmodeus-platform` (or your choice)
- **Region**: Any
- **Branch**: `main` (or your branch)
- **Root Directory**: `.` (Leave empty)
- **Runtime**: **Node**
- **Build Command**: `npm run build`
  - *This runs `npm install` for both, builds the Vite client, and builds the TS server.*
- **Start Command**: `npm start`
  - *This runs `node server/dist/index.js`.*

## 4. Environment Variables
Add these under the **Environment** tab:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Optimization |
| `DB_HOST` | `...` | Your MySQL Host (e.g., Aiven, PlanetScale, RDS) |
| `DB_USER` | `...` | DB User |
| `DB_PASSWORD` | `...` | DB Password |
| `DB_NAME` | `asmodeus` | DB Name |
| `INIT_DB` | `true` | Set to `true` for first run to create tables/seed data |

## 5. Deploy
Click **Create Web Service**. 
Render will build the client, compile the server, and start the app on port 10000 (default) or whatever `PORT` Render assigns.

## Local Testing
To test how Render will run it locally:
```bash
npm run build
npm start
```
Go to `http://localhost:3000`.
