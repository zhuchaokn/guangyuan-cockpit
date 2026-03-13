import { useEffect, useRef, useState } from 'react';

export default function DataCard({ title, value, unit, trend, trendLabel, color = 'var(--accent)', mini, children, className = '' }) {
  const [displayVal, setDisplayVal] = useState(0);
  const numVal = typeof value === 'number' ? value : parseInt(String(value).replace(/,/g, ''), 10);

  useEffect(() => {
    if (isNaN(numVal)) { setDisplayVal(value); return; }
    let start = 0;
    const duration = 1200;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.floor(eased * numVal));
      if (progress < 1) requestAnimationFrame(step);
    };
    let startTime = null;
    requestAnimationFrame(step);
  }, [numVal]);

  const formatted = typeof displayVal === 'number' ? displayVal.toLocaleString() : displayVal;

  return (
    <div className={`data-card ${mini ? 'data-card--mini' : ''} ${className}`} style={{ '--card-color': color }}>
      <div className="data-card__header">
        <span className="data-card__title">{title}</span>
        {trend !== undefined && (
          <span className={`data-card__trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            {trendLabel && <small> {trendLabel}</small>}
          </span>
        )}
      </div>
      <div className="data-card__value">
        <span style={{ color }}>{formatted}</span>
        {unit && <span className="data-card__unit">{unit}</span>}
      </div>
      {children && <div className="data-card__content">{children}</div>}

      <style>{`
        .data-card {
          background: var(--bg-card);
          border: 1px solid var(--border-dim);
          border-radius: var(--radius);
          padding: ${mini ? '10px 14px' : '14px 18px'};
          position: relative;
          overflow: hidden;
          transition: border-color .25s, box-shadow .25s;
          animation: slideInUp .4s ease both;
        }
        .data-card::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 3px; height: 100%;
          background: var(--card-color);
          opacity: .6;
        }
        .data-card:hover {
          border-color: var(--border-glow);
          box-shadow: 0 0 20px rgba(0,212,255,.08);
        }
        .data-card__header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: ${mini ? '4px' : '8px'};
        }
        .data-card__title {
          font-size: ${mini ? '.75rem' : '.82rem'};
          color: var(--text-secondary);
          font-weight: 500;
        }
        .data-card__trend {
          font-size: .72rem; font-weight: 600;
          padding: 2px 6px; border-radius: 4px;
          font-family: 'JetBrains Mono', monospace;
        }
        .data-card__trend.up { color: var(--green); background: var(--green-dim); }
        .data-card__trend.down { color: var(--red); background: var(--red-dim); }
        .data-card__trend small { font-weight: 400; opacity: .7; }
        .data-card__value {
          font-family: 'Orbitron', 'JetBrains Mono', monospace;
          font-size: ${mini ? '1.2rem' : '1.6rem'};
          font-weight: 700;
          letter-spacing: 1px;
        }
        .data-card__unit {
          font-size: .7rem; color: var(--text-dim);
          margin-left: 4px; font-family: 'Noto Sans SC', sans-serif;
          font-weight: 400;
        }
        .data-card--mini .data-card__value { font-size: 1.1rem; }
        .data-card__content { margin-top: 8px; }
      `}</style>
    </div>
  );
}
