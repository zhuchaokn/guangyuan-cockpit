export default function PanelCard({ title, subtitle, extra, children, className = '', noPad }) {
  return (
    <div className={`panel-card ${className}`}>
      {title && (
        <div className="panel-card__header">
          <div className="panel-card__deco" />
          <div style={{ flex: 1 }}>
            <h3 className="panel-card__title">{title}</h3>
            {subtitle && <div className="panel-card__subtitle">{subtitle}</div>}
          </div>
          {extra && <div className="panel-card__extra">{extra}</div>}
        </div>
      )}
      <div className={`panel-card__body ${noPad ? 'no-pad' : ''}`}>
        {children}
      </div>

      <style>{`
        .panel-card {
          background: var(--bg-card);
          border: 1px solid var(--border-dim);
          border-radius: var(--radius);
          overflow: hidden;
          margin-bottom: 12px;
          animation: slideInUp .45s ease both;
        }
        .panel-card:hover {
          border-color: rgba(0,212,255,.15);
        }
        .panel-card__header {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-dim);
          background: rgba(0,212,255,.03);
        }
        .panel-card__deco {
          width: 3px; height: 14px;
          background: var(--accent);
          border-radius: 2px;
          box-shadow: 0 0 6px rgba(0,212,255,.4);
        }
        .panel-card__title {
          font-size: .88rem; font-weight: 600;
          color: var(--text-primary);
        }
        .panel-card__subtitle {
          font-size: .72rem; color: var(--text-dim);
          margin-top: 2px;
        }
        .panel-card__extra {
          font-size: .75rem; color: var(--text-dim);
        }
        .panel-card__body {
          padding: 14px 16px;
        }
        .panel-card__body.no-pad { padding: 0; }
      `}</style>
    </div>
  );
}
