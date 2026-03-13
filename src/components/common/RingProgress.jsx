import { useEffect, useState } from 'react';

export default function RingProgress({ value, size = 56, stroke = 5, color = 'var(--accent)', label }) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 4px ${color})` }} />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          fill="var(--text-primary)" fontSize={size * 0.22} fontWeight="700"
          fontFamily="'JetBrains Mono', monospace"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
          {animated.toFixed(1)}%
        </text>
      </svg>
      {label && <span style={{ fontSize: '.68rem', color: 'var(--text-dim)' }}>{label}</span>}
    </div>
  );
}
