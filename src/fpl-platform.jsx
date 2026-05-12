import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SAFFRON = "#F4A100";
const SAFFRON_DARK = "#C47D00";
const SAFFRON_GLOW = "rgba(244,161,0,0.35)";
const WHITE = "#FFFFFF";
const DARK_BG = "#0A0A0B";
const CARD_BG = "rgba(255,255,255,0.04)";
const CARD_BORDER = "rgba(244,161,0,0.18)";
const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "http://localhost:3001/api" : "/api");

const TEAM_COLOR_MAP = {
  ARS: "#EF0107", AVL: "#95BFE5", BOU: "#DA291C", BRE: "#E30613", BHA: "#0057B8",
  CHE: "#034694", CRY: "#1B458F", EVE: "#003399", FUL: "#000000", IPS: "#0057B8",
  LEI: "#003090", LIV: "#C8102E", MCI: "#6CABDD", MUN: "#DA291C", NEW: "#241F20",
  NFO: "#DD0000", SOU: "#D71920", TOT: "#132257", WHU: "#7A263A", WOL: "#FDB913",
};

function teamStripeColor(team) {
  if (!team) return SAFFRON;
  return TEAM_COLOR_MAP[team.short_name] || SAFFRON;
}

const NAV_ITEMS = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "live", icon: "◉", label: "Live GW" },
  { id: "players", icon: "◈", label: "Players" },
  { id: "teams", icon: "◫", label: "Teams" },
  { id: "transfers", icon: "⇌", label: "Transfers" },
  { id: "fixtures", icon: "▦", label: "Fixtures" },
  { id: "captaincy", icon: "★", label: "Captaincy" },
  { id: "manager", icon: "M", label: "Manager" },
  { id: "ai", icon: "◎", label: "AI Engine" },
  { id: "differentials", icon: "◬", label: "Differentials" },
  { id: "watchlist", icon: "◉", label: "Watchlist" },
];

// ── HOOKS ──────────────────────────────────────────────────────
function useFPLBootstrap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetchData = useCallback(() => {
    fetch(API_BASE + "/bootstrap-static/")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); setLastUpdated(new Date()); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [fetchData]);
  return { data, loading, lastUpdated, refetch: fetchData };
}

function useFPLFixtures() {
  const [fixtures, setFixtures] = useState([]);
  useEffect(() => {
    fetch(API_BASE + "/fixtures/")
      .then(r => r.json())
      .then(d => setFixtures(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);
  return fixtures;
}

// Live GW hook — 30s polling during active GW, 5min otherwise
function useLiveGW(gwId, isActive) {
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [lastPoll, setLastPoll] = useState(null);
  const timerRef = useRef(null);

  const fetchLive = useCallback(() => {
    if (!gwId) return;
    setLiveLoading(true);
    fetch(API_BASE + `/event/${gwId}/live/`)
      .then(r => r.json())
      .then(d => {
        setLiveData(d);
        setLiveLoading(false);
        setLastPoll(new Date());
        setPollCount(c => c + 1);
      })
      .catch(() => setLiveLoading(false));
  }, [gwId]);

  useEffect(() => {
    if (!gwId) return;
    fetchLive();
    const ms = isActive ? 30000 : 300000;
    timerRef.current = setInterval(fetchLive, ms);
    return () => clearInterval(timerRef.current);
  }, [gwId, isActive, fetchLive]);

  return { liveData, liveLoading, pollCount, lastPoll, refetch: fetchLive };
}

function useManagerData(entryId) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!entryId) {
      setHistory(null);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    fetch(API_BASE + `/entry/${entryId}/history/`)
      .then(r => {
        if (!r.ok) throw new Error("Manager not found");
        return r.json();
      })
      .then(d => setHistory(d))
      .catch((e) => {
        setHistory(null);
        setError(e.message || "Failed to fetch manager data");
      })
      .finally(() => setLoading(false));
  }, [entryId]);

  return { history, loading, error };
}

// ── ANIMATED NUMBER ────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value && value !== 0) return;
    const target = parseFloat(value);
    const start = performance.now();
    const from = display;
    const tick = (now) => {
      const p = Math.min((now - start) / 1200, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (target - from) * ease);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display.toFixed(decimals)}</span>;
}

// ── LOGO ───────────────────────────────────────────────────────
function Logo({ collapsed }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img src="/fplwala-logo.png" alt="FPLwala logo" style={{ width: 48, height: 48, objectFit: "contain", padding: 2, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${CARD_BORDER}` }} />
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.3 }}>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: WHITE, letterSpacing: "0.04em", fontFamily: "'Georgia', serif" }}>
                FPL<span style={{ color: SAFFRON }}>wala</span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(244,161,0,0.55)", letterSpacing: "0.22em", textTransform: "uppercase" }}>Analytics</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── PULSE DOT ─────────────────────────────────────────────────
function PulseDot({ color = SAFFRON }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: 10, height: 10 }}>
      <span style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: color, opacity: 0.4, animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }}/>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }}/>
    </span>
  );
}

// ── SPARKLINE ─────────────────────────────────────────────────
function Sparkline({ data = [], color = SAFFRON, width = 80, height = 30 }) {
  if (!data.length) return null;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── METRIC CARD ───────────────────────────────────────────────
function MetricCard({ title, value, sub, icon, trend, sparkData, delay = 0, live = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(244,161,0,0.07)" : CARD_BG,
        border: `1px solid ${hovered ? "rgba(244,161,0,0.4)" : CARD_BORDER}`,
        borderRadius: 16, padding: "18px 20px", cursor: "default",
        transition: "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
        boxShadow: hovered ? `0 0 30px ${SAFFRON_GLOW}` : "none",
        backdropFilter: "blur(10px)", position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            {live && <PulseDot color="#4ADE80" />}
            {title}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: WHITE, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {typeof value === "number" ? <AnimatedNumber value={value} decimals={value % 1 !== 0 ? 1 : 0} /> : value}
          </div>
          {sub && <div style={{ fontSize: 11, color: SAFFRON, marginTop: 5, opacity: 0.8 }}>{sub}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ fontSize: 20, opacity: 0.7 }}>{icon}</div>
          {sparkData && <Sparkline data={sparkData} />}
        </div>
      </div>
      {trend !== undefined && (
        <div style={{ marginTop: 10, fontSize: 11, color: trend >= 0 ? "#4ADE80" : "#F87171", display: "flex", alignItems: "center", gap: 3 }}>
          <span>{trend >= 0 ? "▲" : "▼"}</span>
          <span>{Math.abs(trend)}% vs last GW</span>
        </div>
      )}
    </motion.div>
  );
}

// ── PLAYER ROW ────────────────────────────────────────────────
function PlayerRow({ player, teams, index, livePoints }) {
  const [expanded, setExpanded] = useState(false);
  const team = teams?.find(t => t.id === player.team);
  const stripe = teamStripeColor(team);
  const pos = ["GKP", "DEF", "MID", "FWD"][player.element_type - 1];
  const posColor = { GKP: "#FBBF24", DEF: "#60A5FA", MID: "#4ADE80", FWD: SAFFRON }[pos];
  const form = parseFloat(player.form || 0);
  const price = (player.now_cost / 10).toFixed(1);
  const own = parseFloat(player.selected_by_percent || 0).toFixed(1);
  const pts = player.total_points;
  const sparkData = [pts * 0.2, pts * 0.35, pts * 0.5, pts * 0.4, pts * 0.7, pts * 0.6, pts * 0.9, pts].map(v => Math.round(v));
  const isLiveScoring = livePoints !== undefined && livePoints > 0;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.03, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ marginBottom: 4 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "grid", gridTemplateColumns: "32px 1fr 60px 55px 55px 50px 80px",
          alignItems: "center", gap: 10, padding: "12px 16px",
          background: expanded ? "rgba(244,161,0,0.07)" : isLiveScoring ? "rgba(74,222,128,0.04)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${expanded ? "rgba(244,161,0,0.3)" : isLiveScoring ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.05)"}`,
          borderRadius: 10, cursor: "pointer", transition: "all 0.25s ease",
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${posColor}22`, border: `1.5px solid ${posColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: posColor }}>{pos}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: WHITE, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 3, height: 14, borderRadius: 3, background: stripe, boxShadow: `0 0 10px ${stripe}66` }} />
            {player.web_name}
            {isLiveScoring && <PulseDot color="#4ADE80" />}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{team?.short_name || "—"}</div>
        </div>
        <div style={{ fontSize: 13, color: SAFFRON, fontWeight: 700 }}>£{price}m</div>
        <div style={{ fontSize: 13, color: isLiveScoring ? "#4ADE80" : WHITE, fontWeight: isLiveScoring ? 700 : 400 }}>
          {isLiveScoring ? livePoints : pts}
          {isLiveScoring && <span style={{ fontSize: 9, marginLeft: 3, color: "#4ADE80" }}>LIVE</span>}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: form > 6 ? "rgba(74,222,128,0.15)" : form > 4 ? "rgba(244,161,0,0.15)" : "rgba(248,113,113,0.15)", color: form > 6 ? "#4ADE80" : form > 4 ? SAFFRON : "#F87171", textAlign: "center" }}>{form}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{own}%</div>
        <Sparkline data={sparkData} width={70} height={24} />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", background: "rgba(244,161,0,0.04)", borderLeft: `2px solid ${SAFFRON}`, marginLeft: 8, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
              {[
                { l: "ICT Index", v: player.ict_index || "—" },
                { l: "Influence", v: player.influence || "—" },
                { l: "Creativity", v: player.creativity || "—" },
                { l: "Threat", v: player.threat || "—" },
                { l: "Bonus", v: player.bonus || 0 },
                { l: "Goals", v: player.goals_scored || 0 },
                { l: "Assists", v: player.assists || 0 },
                { l: "Clean Sheets", v: player.clean_sheets || 0 },
              ].map(({ l, v }) => (
                <div key={l}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: SAFFRON, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── FIXTURE TICKER ────────────────────────────────────────────
function FixtureTicker({ fixtures, teams }) {
  const upcoming = fixtures.filter(f => !f.finished && f.event).slice(0, 20);
  const getDiff = (d) => d <= 2 ? { color: "#4ADE80", label: "Easy" } : d <= 3 ? { color: SAFFRON, label: "Med" } : { color: "#F87171", label: "Hard" };
  const getTeam = (id) => teams?.find(t => t.id === id)?.short_name || "?";
  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ display: "flex", gap: 8, minWidth: "max-content" }}>
        {upcoming.map((f, i) => {
          const diff = getDiff(f.team_h_difficulty);
          return (
            <motion.div key={f.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04, duration: 0.3 }}
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${diff.color}33`, borderRadius: 10, padding: "10px 14px", minWidth: 110, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>GW{f.event}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: WHITE }}>{getTeam(f.team_h)}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", margin: "2px 0" }}>vs</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: WHITE }}>{getTeam(f.team_a)}</div>
              <div style={{ marginTop: 6, fontSize: 9, color: diff.color, fontWeight: 700 }}>{diff.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── RADAR CHART ───────────────────────────────────────────────
function RadarChart({ stats }) {
  const cx = 100, cy = 100, r = 70, n = stats.length;
  const pts = stats.map((s, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    const v = (s.value / s.max) * r;
    return { x: cx + v * Math.cos(a), y: cy + v * Math.sin(a), lx: cx + (r + 18) * Math.cos(a), ly: cy + (r + 18) * Math.sin(a), label: s.label };
  });
  const grid = (s) => stats.map((_, i) => { const a = (i / n) * 2 * Math.PI - Math.PI / 2; return `${cx + s * r * Math.cos(a)},${cy + s * r * Math.sin(a)}`; }).join(" ");
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <defs><radialGradient id="rg" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={SAFFRON} stopOpacity="0.3"/><stop offset="100%" stopColor={SAFFRON} stopOpacity="0.05"/></radialGradient></defs>
      {[0.25, 0.5, 0.75, 1].map((s, i) => <polygon key={i} points={grid(s)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>)}
      {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos((i/n)*2*Math.PI - Math.PI/2)} y2={cy + r * Math.sin((i/n)*2*Math.PI - Math.PI/2)} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>)}
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="url(#rg)" stroke={SAFFRON} strokeWidth="2" strokeLinejoin="round"/>
      {pts.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="3" fill={SAFFRON}/><text x={p.lx} y={p.ly} fill="rgba(255,255,255,0.6)" fontSize="7.5" textAnchor="middle" dominantBaseline="middle">{p.label}</text></g>)}
    </svg>
  );
}

// ── LIVE GW PAGE ──────────────────────────────────────────────
function LiveGWPage({ fplData }) {
  const { events, elements, teams } = fplData || {};
  const currentGW = events?.find(e => e.is_current) || events?.find(e => e.is_next);
  const isActive = !!currentGW?.is_current;
  const { liveData, liveLoading, pollCount, lastPoll, refetch } = useLiveGW(currentGW?.id, isActive);

  // Build a map of element_id -> live stats
  const liveMap = {};
  if (liveData?.elements) {
    liveData.elements.forEach(el => { liveMap[el.id] = el.stats; });
  }

  const topLive = (elements || [])
    .map(p => ({ ...p, liveTotal: (liveMap[p.id]?.total_points || 0) }))
    .sort((a, b) => b.liveTotal - a.liveTotal)
    .slice(0, 20);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <PulseDot color={isActive ? "#4ADE80" : SAFFRON} />
          <span style={{ fontSize: 11, color: isActive ? "#4ADE80" : SAFFRON, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            {isActive ? "LIVE — Polling every 30s" : "Not Active — Polling every 5min"}
          </span>
          {liveLoading && (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(244,161,0,0.2)", borderTop: `2px solid ${SAFFRON}` }}/>
          )}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: WHITE, fontFamily: "'Georgia', serif", margin: "0 0 6px" }}>
          Live <span style={{ color: SAFFRON }}>{currentGW?.name || "Gameweek"}</span>
        </h1>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Last poll: {lastPoll ? lastPoll.toLocaleTimeString() : "—"}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Polls: <span style={{ color: SAFFRON }}>{pollCount}</span>
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            Players with data: <span style={{ color: SAFFRON }}>{Object.keys(liveMap).length}</span>
          </span>
        </div>
      </motion.div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "GW Avg", value: currentGW?.average_entry_score || "—", icon: "◎" },
          { label: "Top Score", value: currentGW?.highest_score || "—", icon: "★" },
          { label: "GW Number", value: currentGW?.id || "—", icon: "⬡" },
          { label: "Live Players", value: Object.keys(liveMap).length, icon: "◉" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: WHITE }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Live leaderboard */}
      <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>Live Points Leaderboard</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Top scorers this gameweek</div>
          </div>
          <motion.button onClick={refetch} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ padding: "6px 14px", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, color: "#4ADE80", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            ⟳ Poll Now
          </motion.button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 80px 70px 70px 50px", gap: 8, padding: "6px 12px", marginBottom: 6 }}>
          {["#", "Player", "GW Pts", "Season", "Form", "Own%"].map((h, i) => (
            <div key={i} style={{ fontSize: 9, color: "rgba(244,161,0,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{h}</div>
          ))}
        </div>

        {topLive.map((p, i) => {
          const team = teams?.find(t => t.id === p.team);
          const stripe = teamStripeColor(team);
          const live = liveMap[p.id];
          const gwPts = live?.total_points || 0;
          const mins = live?.minutes || 0;
          const goals = live?.goals_scored || 0;
          const assists = live?.assists || 0;
          const cs = live?.clean_sheets || 0;
          const isPlaying = mins > 0;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              style={{
                display: "grid", gridTemplateColumns: "30px 1fr 80px 70px 70px 50px", gap: 8,
                padding: "10px 12px", marginBottom: 3, borderRadius: 8,
                background: isPlaying ? "rgba(74,222,128,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isPlaying ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)"}`,
                alignItems: "center",
              }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: i < 3 ? SAFFRON : "rgba(255,255,255,0.4)" }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: WHITE, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 3, height: 13, borderRadius: 3, background: stripe, boxShadow: `0 0 10px ${stripe}66` }} />
                  {p.web_name}
                  {isPlaying && <PulseDot color="#4ADE80" />}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  {team?.short_name}
                  {goals > 0 && <span style={{ color: "#4ADE80", marginLeft: 6 }}>⚽ {goals}</span>}
                  {assists > 0 && <span style={{ color: "#60A5FA", marginLeft: 4 }}>🅰 {assists}</span>}
                  {cs > 0 && <span style={{ color: SAFFRON, marginLeft: 4 }}>🛡 CS</span>}
                  {mins > 0 && <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>{mins}'</span>}
                </div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: gwPts > 8 ? "#4ADE80" : gwPts > 4 ? SAFFRON : WHITE }}>
                {gwPts > 0 ? gwPts : "—"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{p.total_points}</div>
              <div style={{ fontSize: 12, color: parseFloat(p.form) > 6 ? "#4ADE80" : SAFFRON }}>{p.form}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{parseFloat(p.selected_by_percent).toFixed(1)}%</div>
            </motion.div>
          );
        })}

        {!liveData && (
          <div style={{ textAlign: "center", padding: "30px 20px", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            {liveLoading ? "Fetching live data..." : "No live data yet — click Poll Now"}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────
function Dashboard({ fplData, fixtures }) {
  if (!fplData) return <LoadingSkeleton />;
  const { events, elements, teams } = fplData;
  const currentGW = events?.find(e => e.is_current) || events?.find(e => e.is_next) || events?.[0];
  const topPlayer = [...(elements || [])].sort((a, b) => b.total_points - a.total_points)[0];
  const topForm = [...(elements || [])].sort((a, b) => parseFloat(b.form) - parseFloat(a.form))[0];
  const mostIn = [...(elements || [])].sort((a, b) => b.transfers_in_event - a.transfers_in_event)[0];
  const mostOut = [...(elements || [])].sort((a, b) => b.transfers_out_event - a.transfers_out_event)[0];
  const avgPts = currentGW?.average_entry_score || 0;
  const topScore = currentGW?.highest_score || 0;

  const metrics = [
    { title: "Gameweek", value: currentGW?.id || "—", sub: currentGW?.name, icon: "⬡", sparkData: [30,35,28,42,38,45,41,avgPts], delay: 0.05 },
    { title: "Avg GW Score", value: avgPts, sub: "Community avg", icon: "◎", trend: 3, delay: 0.1, live: true },
    { title: "Top Score", value: topScore, sub: "This gameweek", icon: "★", trend: 8, delay: 0.15, live: true },
    { title: "Top Player Pts", value: topPlayer?.total_points || 0, sub: topPlayer?.web_name, icon: "◈", delay: 0.2 },
    { title: "Top Form", value: topForm?.form || 0, sub: topForm?.web_name, icon: "◉", sparkData: [3,4,5,4,6,5,7,parseFloat(topForm?.form||0)], delay: 0.25 },
    { title: "Most Transfer In", value: mostIn?.transfers_in_event || 0, sub: mostIn?.web_name, icon: "⇌", delay: 0.3, live: true },
    { title: "Most Transfer Out", value: mostOut?.transfers_out_event || 0, sub: mostOut?.web_name, icon: "⇌", delay: 0.35, live: true },
    { title: "Total Players", value: elements?.length || 0, sub: "In FPL pool", icon: "▦", delay: 0.4 },
  ];

  const topPlayers = [...(elements || [])].sort((a, b) => b.total_points - a.total_points).slice(0, 15);
  const topRadar = topPlayer ? [
    { label: "Influence", value: parseFloat(topPlayer.influence || 0), max: 1500 },
    { label: "Creativity", value: parseFloat(topPlayer.creativity || 0), max: 1500 },
    { label: "Threat", value: parseFloat(topPlayer.threat || 0), max: 1500 },
    { label: "ICT", value: parseFloat(topPlayer.ict_index || 0), max: 400 },
    { label: "Form", value: parseFloat(topPlayer.form || 0), max: 15 },
    { label: "Bonus", value: topPlayer.bonus || 0, max: 50 },
  ] : [];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <PulseDot />
          <span style={{ fontSize: 11, color: SAFFRON, textTransform: "uppercase", letterSpacing: "0.2em" }}>Live Data • Auto-refresh every 5min</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: WHITE, fontFamily: "'Georgia', serif", margin: 0 }}>
          Intelligence <span style={{ color: SAFFRON }}>Dashboard</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", margin: "6px 0 0", fontSize: 13 }}>Real-time FPL analytics • {currentGW?.name || "Season overview"}</p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
        {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 16, marginBottom: 24 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>Top Performers</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Season total points</div>
            </div>
            <div style={{ padding: "5px 12px", background: "rgba(244,161,0,0.12)", borderRadius: 20, fontSize: 11, color: SAFFRON, border: `1px solid rgba(244,161,0,0.25)` }}>Top 15</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 60px 55px 55px 50px 80px", gap: 10, padding: "6px 16px", marginBottom: 4 }}>
            {["", "Player", "Price", "Pts", "Form", "Own%", "Trend"].map((h, i) => (
              <div key={i} style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</div>
            ))}
          </div>
          {topPlayers.map((p, i) => <PlayerRow key={p.id} player={p} teams={teams} index={i} />)}
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
          style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: WHITE, marginBottom: 4, textAlign: "center" }}>Player Radar</div>
          <div style={{ fontSize: 9, color: SAFFRON, marginBottom: 8, textAlign: "center" }}>{topPlayer?.web_name}</div>
          {topRadar.length > 0 && <RadarChart stats={topRadar} />}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}
        style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <PulseDot />
          <div style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>Upcoming Fixtures</div>
        </div>
        <FixtureTicker fixtures={fixtures} teams={teams} />
      </motion.div>
    </div>
  );
}

// ── PLAYERS PAGE ──────────────────────────────────────────────
function PlayersPage({ fplData }) {
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("total_points");
  if (!fplData) return <LoadingSkeleton />;
  const { elements, teams } = fplData;
  const posMap = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };
  const filtered = (elements || [])
    .filter(p => {
      const ms = p.web_name.toLowerCase().includes(search.toLowerCase()) || p.first_name.toLowerCase().includes(search.toLowerCase());
      const mp = posFilter === "ALL" || posMap[p.element_type] === posFilter;
      return ms && mp;
    })
    .sort((a, b) => sortBy === "total_points" ? b.total_points - a.total_points : sortBy === "form" ? parseFloat(b.form) - parseFloat(a.form) : sortBy === "price" ? b.now_cost - a.now_cost : parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent))
    .slice(0, 50);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: WHITE, fontFamily: "'Georgia', serif", margin: "0 0 6px" }}>Player <span style={{ color: SAFFRON }}>Analytics</span></h1>
        <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: 13 }}>Deep performance intelligence on all {elements?.length || 0} FPL players</p>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..."
          style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(244,161,0,0.2)`, borderRadius: 10, padding: "10px 16px", color: WHITE, fontSize: 13, outline: "none" }}/>
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL","GKP","DEF","MID","FWD"].map(p => (
            <button key={p} onClick={() => setPosFilter(p)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${posFilter === p ? SAFFRON : "rgba(255,255,255,0.1)"}`, background: posFilter === p ? "rgba(244,161,0,0.15)" : "transparent", color: posFilter === p ? SAFFRON : "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", transition: "all 0.2s ease" }}>{p}</button>
          ))}
        </div>
        <select onChange={e => setSortBy(e.target.value)} value={sortBy} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(244,161,0,0.2)`, borderRadius: 10, padding: "10px 14px", color: WHITE, fontSize: 12, cursor: "pointer" }}>
          <option value="total_points">Sort: Total Pts</option>
          <option value="form">Sort: Form</option>
          <option value="price">Sort: Price</option>
          <option value="ownership">Sort: Ownership</option>
        </select>
      </motion.div>
      <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 60px 55px 55px 50px 80px", gap: 10, padding: "8px 16px", marginBottom: 6, background: "rgba(244,161,0,0.05)", borderRadius: 8 }}>
        {["", "Player", "Price", "Pts", "Form", "Own%", "Trend"].map((h, i) => (
          <div key={i} style={{ fontSize: 9, color: "rgba(244,161,0,0.7)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{h}</div>
        ))}
      </div>
      {filtered.map((p, i) => <PlayerRow key={p.id} player={p} teams={teams} index={i} />)}
    </div>
  );
}

// ── TEAMS PAGE ────────────────────────────────────────────────
function TeamsPage({ fplData }) {
  if (!fplData) return <LoadingSkeleton />;
  const { teams, elements } = fplData;
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: WHITE, fontFamily: "'Georgia', serif", margin: "0 0 6px" }}>Club <span style={{ color: SAFFRON }}>Intelligence</span></h1>
      </motion.div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {(teams || []).map((team, i) => {
          const tp = (elements || []).filter(e => e.team === team.id);
          const avgForm = tp.length ? (tp.reduce((s, p) => s + parseFloat(p.form || 0), 0) / tp.length).toFixed(1) : 0;
          const topScorer = [...tp].sort((a, b) => b.total_points - a.total_points)[0];
          return (
            <motion.div key={team.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4 }}
              whileHover={{ borderColor: "rgba(244,161,0,0.4)", boxShadow: `0 0 25px ${SAFFRON_GLOW}` }}
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 18, transition: "all 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: WHITE }}>{team.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{team.short_name}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: SAFFRON, background: "rgba(244,161,0,0.1)", padding: "4px 10px", borderRadius: 8 }}>#{team.position || "—"}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[{ l: "Avg Form", v: avgForm, c: SAFFRON }, { l: "Players", v: tp.length, c: WHITE }].map(({ l, v, c }) => (
                  <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>
              {topScorer && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 }}>★ <span style={{ color: SAFFRON }}>{topScorer.web_name}</span> — {topScorer.total_points} pts</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── TRANSFERS PAGE ────────────────────────────────────────────
function TransfersPage({ fplData }) {
  if (!fplData) return <LoadingSkeleton />;
  const { elements, teams } = fplData;
  const topIn = [...(elements || [])].sort((a, b) => b.transfers_in_event - a.transfers_in_event).slice(0, 10);
  const topOut = [...(elements || [])].sort((a, b) => b.transfers_out_event - a.transfers_out_event).slice(0, 10);

  const TransferList = ({ data, label, color }) => (
    <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: WHITE, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><PulseDot color={color} /> Live this gameweek</div>
      {data.map((p, i) => {
        const team = teams?.find(t => t.id === p.team);
        const val = label.includes("In") ? p.transfers_in_event : p.transfers_out_event;
        const maxVal = data[0] ? (label.includes("In") ? data[0].transfers_in_event : data[0].transfers_out_event) : 1;
        return (
          <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: WHITE }}>{p.web_name}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>{team?.short_name}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{val?.toLocaleString()}</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(val / maxVal) * 100}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ height: "100%", background: color, borderRadius: 2 }}/>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: WHITE, fontFamily: "'Georgia', serif", margin: "0 0 6px" }}>Transfer <span style={{ color: SAFFRON }}>Market</span></h1>
        <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: 13 }}>Gameweek ownership movement intelligence</p>
      </motion.div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <TransferList data={topIn} label="Most Transferred In" color="#4ADE80" />
        <TransferList data={topOut} label="Most Transferred Out" color="#F87171" />
      </div>
    </div>
  );
}

// ── AI ENGINE PAGE ────────────────────────────────────────────
function AIPage({ fplData }) {
  if (!fplData) return <LoadingSkeleton />;
  const { elements, teams } = fplData;
  const picks = [...(elements || [])].filter(p => parseFloat(p.form) > 5 && parseFloat(p.selected_by_percent) < 20).sort((a, b) => parseFloat(b.form) - parseFloat(a.form)).slice(0, 8);
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <PulseDot color="#A78BFA" />
          <span style={{ fontSize: 11, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.2em" }}>AI Intelligence Active</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: WHITE, fontFamily: "'Georgia', serif", margin: "0 0 6px" }}>AI <span style={{ color: SAFFRON }}>Prediction Engine</span></h1>
        <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: 13 }}>Quant-grade differential & value pick analysis</p>
      </motion.div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {picks.map((p, i) => {
          const team = teams?.find(t => t.id === p.team);
          const form = parseFloat(p.form || 0);
          const own = parseFloat(p.selected_by_percent || 0);
          const diffScore = Math.round(form * 10 + (20 - own) * 2);
          const confidence = Math.min(99, Math.round(form * 8 + 40));
          return (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${SAFFRON_GLOW}` }}
              style={{ background: "linear-gradient(135deg, rgba(244,161,0,0.06), rgba(167,139,250,0.04))", border: `1px solid rgba(244,161,0,0.2)`, borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: WHITE }}>{p.web_name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{team?.name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: SAFFRON }}>{diffScore}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>AI Score</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Confidence</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: SAFFRON }}>{confidence}%</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ height: "100%", background: `linear-gradient(90deg, ${SAFFRON}, #A78BFA)`, borderRadius: 2 }}/>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { l: "Form", v: form.toFixed(1), c: form > 6 ? "#4ADE80" : SAFFRON },
                  { l: "Ownership", v: `${own.toFixed(1)}%`, c: own < 10 ? "#4ADE80" : SAFFRON },
                  { l: "Price", v: `£${(p.now_cost / 10).toFixed(1)}m`, c: WHITE },
                ].map(({ l, v, c }) => (
                  <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(244,161,0,0.06)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>🎯</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}><span style={{ color: SAFFRON, fontWeight: 700 }}>Strong buy</span> — High form, low ownership differential</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function CaptaincyPage({ fplData }) {
  if (!fplData) return <LoadingSkeleton />;
  const { elements, teams } = fplData;
  const sorted = [...(elements || [])]
    .sort((a, b) => b.ep_next - a.ep_next)
    .slice(0, 12);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: WHITE, fontFamily: "'Georgia', serif", margin: "0 0 6px" }}>Captaincy <span style={{ color: SAFFRON }}>Model</span></h1>
        <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: 13 }}>Simple expected-points shortlist from official FPL data</p>
      </motion.div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {sorted.map((p, i) => (
          (() => {
            const team = teams?.find(t => t.id === p.team);
            const stripe = teamStripeColor(team);
            return (
          <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 14, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: WHITE, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 3, height: 14, borderRadius: 3, background: stripe, boxShadow: `0 0 10px ${stripe}66` }} />
                {p.web_name}
              </div>
              <div style={{ fontSize: 10, color: SAFFRON }}>Rank #{i + 1}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>EP Next</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: SAFFRON }}>{Number(p.ep_next || 0).toFixed(1)}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Form</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: WHITE }}>{Number(p.form || 0).toFixed(1)}</div>
              </div>
            </div>
          </motion.div>
            );
          })()
        ))}
      </div>
    </div>
  );
}

function ManagerPerformancePage({ fplData }) {
  const [inputId, setInputId] = useState("");
  const [entryId, setEntryId] = useState("");
  const { history, loading, error } = useManagerData(entryId);

  const eventsById = new Map((fplData?.events || []).map(e => [e.id, e]));
  const monthly = {};
  (history?.current || []).forEach((gw) => {
    const dt = eventsById.get(gw.event)?.deadline_time;
    if (!dt) return;
    const d = new Date(dt);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + (gw.points || 0);
  });
  const rows = Object.entries(monthly).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 36);

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: WHITE, fontFamily: "'Georgia', serif", margin: "0 0 6px" }}>Manager <span style={{ color: SAFFRON }}>Performance</span></h1>
        <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: 13 }}>Monthly points for last 3 years where FPL exposes gameweek history</p>
      </motion.div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input value={inputId} onChange={(e) => setInputId(e.target.value)} placeholder="Enter Manager Entry ID"
          style={{ width: 280, background: "rgba(255,255,255,0.04)", border: `1px solid rgba(244,161,0,0.2)`, borderRadius: 10, padding: "10px 14px", color: WHITE, fontSize: 13, outline: "none" }} />
        <button onClick={() => setEntryId(inputId.trim())}
          style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${SAFFRON}, ${SAFFRON_DARK})`, color: "#0A0A0B", fontWeight: 700, cursor: "pointer" }}>
          Load
        </button>
      </div>

      {loading && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Loading manager data...</div>}
      {error && <div style={{ color: "#F87171", fontSize: 13 }}>{error}</div>}

      {!loading && !error && entryId && (
        <div style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: 14, padding: 16 }}>
          {rows.length === 0 && (
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              Monthly historical data is not fully available for prior seasons via public API. Showing current-season monthly totals when present.
            </div>
          )}
          {rows.length > 0 && rows.map(([month, points]) => (
            <div key={month} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ color: WHITE, fontSize: 13 }}>{month}</span>
              <span style={{ color: SAFFRON, fontWeight: 700 }}>{points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LOADING ───────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div>
      {[...Array(3)].map((_, i) => (
        <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{ height: 80, background: CARD_BG, borderRadius: 16, marginBottom: 12, border: `1px solid ${CARD_BORDER}` }}/>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
            style={{ height: 120, background: CARD_BG, borderRadius: 16, border: `1px solid ${CARD_BORDER}` }}/>
        ))}
      </div>
    </div>
  );
}

function ComingSoon({ label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 400, gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid ${SAFFRON}44`, borderTop: `2px solid ${SAFFRON}` }}/>
      <div style={{ fontSize: 20, fontWeight: 700, color: WHITE }}>{label}</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Module loading live FPL data<br/><span style={{ color: SAFFRON }}>Coming soon</span></div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function FPLPlatform() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { data: fplData, loading, lastUpdated, refetch } = useFPLBootstrap();
  const fixtures = useFPLFixtures();

  const renderPage = () => {
    if (loading) return <LoadingSkeleton />;
    switch (activeNav) {
      case "dashboard": return <Dashboard fplData={fplData} fixtures={fixtures} />;
      case "live": return <LiveGWPage fplData={fplData} />;
      case "players": return <PlayersPage fplData={fplData} />;
      case "teams": return <TeamsPage fplData={fplData} />;
      case "transfers": return <TransfersPage fplData={fplData} />;
      case "captaincy": return <CaptaincyPage fplData={fplData} />;
      case "manager": return <ManagerPerformancePage fplData={fplData} />;
      case "ai": return <AIPage fplData={fplData} />;
      default: return <ComingSoon label={NAV_ITEMS.find(n => n.id === activeNav)?.label || activeNav} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: DARK_BG, fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: WHITE }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(244,161,0,0.3); border-radius: 2px; }
        input, select, button { font-family: inherit; }
        select { appearance: none; }
        @keyframes ping { 75%, 100% { transform: scale(1.8); opacity: 0; } }
      `}</style>

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 60% 50% at 15% 20%, rgba(244,161,0,0.06) 0%, transparent 60%)" }}/>

      {/* SIDEBAR */}
      <motion.aside animate={{ width: sidebarCollapsed ? 68 : 220 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: "sticky", top: 0, height: "100vh", background: "rgba(10,10,11,0.95)", borderRight: `1px solid rgba(244,161,0,0.12)`, backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", zIndex: 100, flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid rgba(244,161,0,0.08)` }}>
          <Logo collapsed={sidebarCollapsed} />
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <motion.button key={item.id} onClick={() => setActiveNav(item.id)} whileTap={{ scale: 0.97 }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: sidebarCollapsed ? 0 : 10, justifyContent: sidebarCollapsed ? "center" : "flex-start", padding: sidebarCollapsed ? "10px 0" : "10px 12px", borderRadius: 10, marginBottom: 2, border: "none", background: isActive ? "rgba(244,161,0,0.12)" : "transparent", color: isActive ? SAFFRON : "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: isActive ? 700 : 500, transition: "all 0.2s ease", cursor: "pointer", position: "relative", overflow: "hidden" }}>
                {isActive && <motion.div layoutId="navActive" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: SAFFRON, borderRadius: "0 2px 2px 0" }} transition={{ duration: 0.25 }}/>}
                <span style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }} style={{ letterSpacing: "0.02em", fontSize: 12 }}>{item.label}</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: `1px solid rgba(244,161,0,0.08)` }}>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>
      </motion.aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: "auto", position: "relative", zIndex: 1 }}>
        <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,11,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid rgba(244,161,0,0.08)`, padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PulseDot />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"} · Auto-refresh active
            </span>
            {loading && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(244,161,0,0.2)", borderTop: `2px solid ${SAFFRON}` }}/>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <motion.button onClick={refetch} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ padding: "8px 16px", background: `linear-gradient(135deg, ${SAFFRON}, ${SAFFRON_DARK})`, border: "none", borderRadius: 8, color: "#0A0A0B", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: `0 0 16px ${SAFFRON_GLOW}` }}>
              ⟳ Refresh
            </motion.button>
          </div>
        </div>
        <div style={{ padding: "28px 28px 48px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeNav} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
        <div style={{ position: "fixed", right: 14, bottom: 8, fontSize: 9, fontStyle: "italic", color: "rgba(255,255,255,0.65)", textShadow: "0 0 4px rgba(0,0,0,0.7)", pointerEvents: "none", zIndex: 120 }}>
          by VS
        </div>
      </main>
    </div>
  );
}



