import { useState, useEffect } from 'react';

const MODULES = [
  { key: 'map', label: '地图总览', icon: '🗺' },
  { key: 'traffic', label: '运行态势', icon: '📊' },
  { key: 'safety', label: '交通安全', icon: '🛡' },
  { key: 'warning', label: '四色预警', icon: '⚠' },
  { key: 'flow', label: '道路流量', icon: '🚦' },
  { key: 'vehicle', label: '车辆数据', icon: '🚗' },
  { key: 'alert', label: '布控预警', icon: '🔔' },
];

export default function Header({ activeModule, onModuleChange }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fmt = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} 星期${weekdays[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return (
    <header className="cockpit-header">
      <div className="header-left">
        <div className="header-logo">GY</div>
        <div className="header-title-group">
          <h1 className="header-title">广元市综合管控驾驶舱</h1>
          <span className="header-sub">GUANGYUAN INTEGRATED MANAGEMENT COCKPIT</span>
        </div>
      </div>

      <nav className="header-nav">
        {MODULES.map(m => (
          <button key={m.key}
            className={`nav-btn ${activeModule === m.key ? 'active' : ''}`}
            onClick={() => onModuleChange(m.key)}>
            <span className="nav-icon">{m.icon}</span>
            <span className="nav-label">{m.label}</span>
          </button>
        ))}
      </nav>

      <div className="header-right">
        <div className="header-weather">☀ 18°C 晴</div>
        <div className="header-time">{fmt(time)}</div>
      </div>

      <style>{`
        .cockpit-header {
          height: var(--header-height);
          display: flex; align-items: center;
          padding: 0 20px;
          background: linear-gradient(180deg, rgba(5,11,26,.95) 0%, rgba(5,11,26,.85) 100%);
          border-bottom: 1px solid var(--border-glow);
          backdrop-filter: blur(12px);
          position: relative; z-index: 100;
        }
        .cockpit-header::after {
          content: '';
          position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: .5;
        }
        .header-left {
          display: flex; align-items: center; gap: 12px;
          min-width: 280px;
        }
        .header-logo {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #00d4ff, #818cf8);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', monospace;
          font-weight: 900; font-size: 14px; color: #fff;
          box-shadow: 0 0 16px rgba(0,212,255,.3);
        }
        .header-title {
          font-size: 1.1rem; font-weight: 700;
          background: linear-gradient(90deg, #fff, var(--accent));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          letter-spacing: 2px;
        }
        .header-sub {
          font-size: .6rem; color: var(--text-dim);
          letter-spacing: 1.5px; display: block; margin-top: 1px;
        }
        .header-nav {
          flex: 1;
          display: flex; justify-content: center; gap: 4px;
        }
        .nav-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 14px; border-radius: 6px;
          border: 1px solid transparent;
          background: transparent; color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
          font-size: .78rem; font-weight: 500;
          transition: all .2s;
          white-space: nowrap;
        }
        .nav-btn:hover {
          background: rgba(0,212,255,.06);
          color: var(--text-primary);
          border-color: var(--border-dim);
        }
        .nav-btn.active {
          background: rgba(0,212,255,.12);
          color: var(--accent);
          border-color: var(--border-glow);
          box-shadow: 0 0 12px rgba(0,212,255,.1);
        }
        .nav-icon { font-size: .9rem; }
        .header-right {
          min-width: 280px;
          display: flex; flex-direction: column; align-items: flex-end;
          gap: 2px;
        }
        .header-weather {
          font-size: .72rem; color: var(--text-dim);
        }
        .header-time {
          font-family: 'JetBrains Mono', monospace;
          font-size: .78rem; color: var(--accent);
          font-weight: 500; letter-spacing: .5px;
        }
      `}</style>
    </header>
  );
}
