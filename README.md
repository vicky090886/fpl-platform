# FPLwala 🎯

**Fantasy Premier League (FPL) Real-Time Analytics Dashboard**

A modern, high-performance web application for comprehensive FPL player analytics, live gameweek data, and AI-powered insights.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18+-green)

---

## ✨ Features

- 📊 **Real-time Dashboard** - Live FPL metrics and gameweek analytics
- 👥 **Player Analytics** - Deep dive into 838+ FPL players with search & filters
- 🏆 **Team Intelligence** - Club performance stats and top scorers
- ⚡ **Live Gameweek** - Real-time point updates during active gameweek
- 📈 **Transfer Market** - Track player transfers in and out
- 🤖 **AI Engine** - Intelligent player recommendations
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Setup

**Option 1: One-Click Launch (Windows)**
```bash
# Just double-click this file:
start.bat
```

**Option 2: Manual Start**
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/fpl-platform.git
cd fpl-platform

# Install dependencies
npm install

# Start proxy server (Terminal 1)
npm run server

# Start dev server (Terminal 2)
npm run dev

# Visit: http://localhost:5174
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Framer Motion |
| **Backend** | Node.js + Express |
| **Styling** | Modern CSS + Gradients |
| **State** | React Hooks |
| **API** | Fantasy Premier League Official API |

---

## 📁 Project Structure

```
fpl-platform/
├── src/
│   ├── fpl-platform.jsx      # Main app component
│   ├── App.jsx               # App wrapper
│   ├── main.jsx              # React entry point
│   └── index.css             # Styles
├── server.js                 # Express proxy server
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies
├── start.bat                 # Windows launcher
├── DEPLOYMENT.md             # Deployment guide
├── GIT_GUIDE.md              # GitHub setup
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

---

## 🌐 Deployment

### Recommended: Railway.app (5 min)

1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project → Select this repo
4. Set `PORT=3001` environment variable
5. Deploy!

Your app goes live automatically. **Every `git push` auto-deploys!**

See [DEPLOYMENT.md](./DEPLOYMENT.md) for other options (Vercel, Heroku, Docker, etc.)

---

## 📖 Usage

### Dashboard
- View current gameweek metrics
- See player rankings
- Check upcoming fixtures
- Monitor transfer trends

### Players Page
- Search for any player
- Filter by position (GKP, DEF, MID, FWD)
- Sort by points, form, price, or ownership
- Click player row to expand details

### Teams Page
- View all Premier League clubs
- Check average form per team
- See top scorer for each club
- Track team rankings

### Live Gameweek
- Real-time point updates (30s refresh during active GW)
- See who's currently scoring
- Track live leaderboard
- Manual refresh available

---

## 🔧 Available Commands

```bash
npm run dev          # Start dev server on port 5174
npm run server       # Start proxy server on port 3001
npm run dev:full     # Run both servers together
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## 🛠️ Development

### Adding Features

1. Edit files in `src/`
2. Changes auto-reload (HMR)
3. Test in browser
4. Commit: `git add . && git commit -m "feature: X"`
5. Push: `git push`

### Environment Variables

Create `.env.local` for local development (Git-ignored):
```env
VITE_API_BASE=http://localhost:3001/api
```

For production, set via hosting provider dashboard.

---

## 📊 Data Source

All data comes from the official **Fantasy Premier League API**:
- Real-time player stats
- Gameweek events
- Team information
- Transfer data
- Fixture schedules

**Note:** API access is publicly available - no authentication required.

---

## ⚠️ Troubleshooting

**Port 3001 already in use?**
```bash
# Find and kill the process using port 3001
netstat -ano | findstr :3001
taskkill /PID <pid> /F
```

**Dependencies issues?**
```bash
# Clean reinstall
rm -r node_modules package-lock.json
npm install
```

**Data not loading?**
1. Check proxy server is running: `npm run server`
2. Verify: http://localhost:3001/api/bootstrap-static/ returns data
3. Check browser console for CORS errors

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

This project is open source under the MIT License - see LICENSE file for details.

---

## 🎯 Future Features

- [ ] User accounts & favorites
- [ ] Custom team builder
- [ ] Historical data analysis
- [ ] Price trend charts
- [ ] Injury alerts
- [ ] Team comparison tool
- [ ] Mobile app

---

## 📧 Support

Got questions? Open an issue on GitHub or check:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment help
- [GIT_GUIDE.md](./GIT_GUIDE.md) - Git/GitHub help
- [FPL Official API Docs](https://fantasy.premierleague.com/api/docs/)

---

## 🏆 Credits

- Data from [Fantasy Premier League Official API](https://fantasy.premierleague.com)
- Built with React & Vite
- Animated with Framer Motion

---

## 📈 Stats

- **Players Tracked:** 838+
- **Teams:** 20 Premier League clubs
- **Gameweeks:** 38 per season
- **API Calls:** Real-time updates every 5 minutes (dashboard) or 30 seconds (live GW)

---

**Happy analyzing! ⚽📊**
