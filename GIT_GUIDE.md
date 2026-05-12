# GitHub Setup & Push Guide

## What to Push ✅ (DO Include)
```
├── src/
│   ├── fpl-platform.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
├── server.js
├── start.bat
├── package.json
├── DEPLOYMENT.md
├── README.md
└── .gitignore
```

## What NOT to Push ❌ (DO NOT Include)
```
├── node_modules/          ← Too large! (can be 500MB+)
├── dist/                  ← Build files (regenerate on deploy)
├── .env                   ← Secrets (passwords, API keys)
└── .DS_Store              ← Mac system files
```

---

## Step 1: Create `.gitignore` File

This tells Git what files to ignore. I'll create this for you automatically.

---

## Step 2: Initialize Git (First Time Only)

```bash
cd C:\Users\vicky.saraf\Desktop\Personal\app
git init
git add .
git commit -m "Initial commit: FPL Platform with working proxy"
```

---

## Step 3: Create GitHub Repo

1. Go to **github.com** → Sign in
2. Click **+** icon → **New repository**
3. Name it: `fpl-platform` (or whatever)
4. Description: `Fantasy Premier League Analytics Platform with Live Data`
5. Make it **Public** (so others can access)
6. **Do NOT** check "Add .gitignore" or "Add README" (we have our own)
7. Click **Create repository**

---

## Step 4: Push to GitHub

After creating repo, GitHub shows you commands. Use these:

```bash
cd C:\Users\vicky.saraf\Desktop\Personal\app

git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fpl-platform.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## If You Already Have a GitHub Repo

Just run:
```bash
git add .
git commit -m "Update: Remove M avatar, add deployment guide"
git push
```

---

## Command Reference

| Command | What it does |
|---------|-------------|
| `git status` | See what files changed |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save changes with a message |
| `git push` | Upload to GitHub |
| `git pull` | Download latest from GitHub |
| `git log` | See commit history |

---

## Git Workflow (Daily)

```bash
# 1. Make changes to your code
# 2. Check what changed
git status

# 3. Stage changes
git add .

# 4. Commit with meaningful message
git commit -m "Added new feature: X"

# 5. Push to GitHub
git push
```

---

## Good Commit Messages

✅ **Good:**
- `"Fixed CORS proxy error"`
- `"Added Players page filters"`
- `"Updated deployment guide"`

❌ **Bad:**
- `"updates"`
- `"fix bug"`
- `"asdf"`

---

## Troubleshooting

**Error: "fatal: not a git repository"**
```bash
git init
```

**Error: "fatal: destination path already exists"**
```bash
# If repo already initialized, just connect it
git remote add origin https://github.com/USERNAME/fpl-platform.git
git push -u origin main
```

**Want to set a default branch?**
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

---

## After Pushing: Deploy from GitHub

Once on GitHub, Railway.app will auto-detect it:
1. Go to **railway.app**
2. Create new project → Select your GitHub repo
3. Railway builds & deploys automatically
4. Every time you push to GitHub, it auto-deploys!

This means:
- You edit locally
- You `git push` to GitHub
- Railway sees the change
- Your live site updates automatically ✨

No manual deployment needed!
