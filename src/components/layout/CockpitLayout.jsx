import Header from './Header';

export default function CockpitLayout({ activeModule, onModuleChange, children }) {
  return (
    <div className="cockpit">
      <Header activeModule={activeModule} onModuleChange={onModuleChange} />
      <div className="cockpit-body">
        {children}
      </div>
      <footer className="cockpit-footer">
        <span>系统运行正常</span>
        <span className="footer-dot" />
        <span>数据更新时间: {new Date().toLocaleTimeString()}</span>
        <span style={{ flex: 1 }} />
        <span>广元市公安局交通警察支队</span>
      </footer>

      <style>{`
        .cockpit {
          width: 100vw; height: 100vh;
          display: flex; flex-direction: column;
          overflow: hidden;
          background: var(--bg-deep);
        }
        .cockpit-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        .cockpit-left, .cockpit-right {
          width: var(--panel-width);
          flex-shrink: 0;
          position: relative;
          z-index: 10;
          background: var(--bg-panel);
          border-right: 1px solid var(--border-dim);
        }
        .cockpit-right {
          border-right: none;
          border-left: 1px solid var(--border-dim);
        }
        .cockpit-left::after, .cockpit-right::before {
          content: '';
          position: absolute; top: 0; bottom: 0; width: 30px;
          pointer-events: none;
        }
        .cockpit-left::after {
          right: -30px;
          background: linear-gradient(90deg, rgba(5,11,26,.6), transparent);
        }
        .cockpit-right::before {
          left: -30px;
          background: linear-gradient(-90deg, rgba(5,11,26,.6), transparent);
        }
        .panel-scroll {
          height: 100%;
          overflow-y: auto;
          padding: 12px;
        }
        .cockpit-center {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .map-container {
          flex: 1;
          position: relative;
          background: var(--bg-deep);
        }
        .cockpit-bottom-bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 5;
          padding: 12px;
        }
        .cockpit-footer {
          height: var(--footer-height);
          display: flex; align-items: center;
          padding: 0 20px; gap: 8px;
          background: rgba(5,11,26,.9);
          border-top: 1px solid var(--border-dim);
          font-size: .7rem; color: var(--text-dim);
        }
        .footer-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 6px var(--green);
        }
      `}</style>
    </div>
  );
}
