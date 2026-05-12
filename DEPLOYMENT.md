# FPL Platform - Deployment Guide

## Local Usage

### Quick Start (Windows)
Simply double-click `start.bat` in the app folder. It will:
1. Start the proxy server (port 3001)
2. Start the dev server (port 5174)
3. Automatically open the app in your browser

### Manual Start
```bash
npm run server        # In one terminal
npm run dev          # In another terminal
# Then visit: http://localhost:5174
```

---

## Deploy Online (Public Website)

### Option 1: Vercel (Easiest - Recommended for Frontend)
1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json` in your app root
3. Run: `vercel`
4. Follow prompts to connect your GitHub repo

**Note:** Vercel is great for the frontend, but the proxy server needs a backend. See Option 3.

### Option 2: Heroku (Full Stack - Free tier ending soon)
1. Install Heroku CLI
2. Create account at heroku.com
3. Login: `heroku login`
4. Create app: `heroku create your-app-name`
5. Set up for both frontend + backend:
   - Build frontend: `npm run build`
   - Deploy: `git push heroku main`

### Option 3: Full Stack Cloud (Recommended) 🌟
Use **Railway.app** or **Render.com** for free hosting:

#### Railway.app (5 min setup):
1. Go to railway.app → Sign up with GitHub
2. Create new project → Select your GitHub repo
3. Add environment variable: `PORT=5174`
4. It auto-deploys! Your URL: `https://your-app-name.up.railway.app`

#### Render.com:
1. Go to render.com → New Web Service
2. Connect GitHub repo
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run server` (or use background workers)
5. Set PORT environment variable

### Option 4: Docker + AWS/Google Cloud/DigitalOcean
Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001 5174
CMD ["npm", "run", "dev:full"]
```

Then deploy to any cloud provider.

---

## Production Build Steps

### 1. Build Frontend
```bash
npm run build
```
Creates optimized `dist/` folder

### 2. Update Server for Production
Edit `server.js` to serve the built frontend:
```javascript
import express from 'express';
import path from 'path';

app.use(express.static('dist'));  // Serve built app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
```

### 3. Create `.env` file (don't commit this!)
```env
PORT=3001
NODE_ENV=production
```

### 4. Update package.json scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Environment Configuration

Create `.env.production` for production settings:
```env
VITE_API_BASE=https://your-domain.com/api
```

Update `src/fpl-platform.jsx`:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";
```

---

## Recommended Deployment: Railway.app

**Why?**
- ✅ Free SSL certificate
- ✅ Auto deploys on GitHub push
- ✅ Supports both frontend + backend
- ✅ Great docs
- ✅ Easy rollbacks

**Steps:**
1. Push code to GitHub
2. Go to railway.app
3. Create new project from GitHub repo
4. Railway auto-detects Node.js
5. Set `PORT=3001` environment variable
6. Deploy!
7. Your app is live on `https://your-app-name.railway.app`

---

## Domain Setup

Once deployed, connect your custom domain:
- Buy domain from GoDaddy, Namecheap, etc.
- Point DNS to your host (they provide instructions)
- Usually done in 5-15 minutes

Example: `https://fpliq.com` instead of `https://your-app-name.railway.app`

---

## Share with Others

Once live, just send them the link:
```
https://your-domain.com
```

No installation needed - they just visit!

---

## Troubleshooting

**Port already in use?**
```bash
netstat -ano | findstr :3001  # Find process
taskkill /PID <pid> /F        # Kill it
```

**Want to use different port?**
Edit `server.js`: `const PORT = process.env.PORT || 5000;`

**CORS still failing?**
Check `server.js` CORS settings are correct:
```javascript
app.use(cors({
  origin: '*',  // Allow all (or specify domain in production)
  methods: ['GET']
}));
```
