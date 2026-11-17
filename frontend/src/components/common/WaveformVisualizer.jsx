import React, { useEffect, useState } from 'react';

export const WaveformVisualizer = ({ active = true, barCount = 48, className = "" }) => {
  const [bars, setBars] = useState(() =>
    Array.from({ length: barCount }, (_, i) => {
      // Bell-like curve distribution for realistic sound wave appearance
      const center = barCount / 2;
      const dist = Math.abs(i - center);
      const base = Math.max(0.15, 1 - (dist / center) * 0.7);
      return Math.sin(i * 0.3) * 0.3 + base * 0.7;
    })
  );

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map((val, i) => {
          const center = barCount / 2;
          const dist = Math.abs(i - center);
          const weight = Math.max(0.2, 1 - (dist / center) * 0.65);
          const randomFactor = Math.random() * 0.6 + 0.4;
          return Math.min(1, Math.max(0.12, weight * randomFactor));
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [active, barCount]);

  return (
    <div className={`flex items-center justify-center gap-[2.5px] h-12 w-full max-w-xl mx-auto py-1 px-4 ${className}`}>
      {bars.map((height, idx) => (
        <div
          key={idx}
          className="w-1 bg-gradient-to-t from-blue-600 via-sky-400 to-cyan-300 rounded-full transition-all duration-100 ease-in-out shadow-[0_0_8px_rgba(56,189,248,0.4)]"
          style={{
            height: active ? `${Math.round(height * 44)}px` : '4px',
            opacity: active ? 0.85 + (height * 0.15) : 0.3
          }}
        />
      ))}
    </div>
  );
};
