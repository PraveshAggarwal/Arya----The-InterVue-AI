import React, { useEffect, useRef, useState } from 'react';

// Mouth shapes: closed, slightly open, open, wide open
const MOUTH_SHAPES = [
  // closed
  'M 60 80 Q 80 82 100 80',
  // slight
  'M 60 80 Q 80 88 100 80',
  // open
  'M 58 78 Q 80 96 102 78 Q 80 86 58 78',
  // wide
  'M 56 76 Q 80 100 104 76 Q 80 90 56 76',
];

export const AIAvatar = ({ speaking = false, thinking = false }) => {
  const [mouthIndex, setMouthIndex] = useState(0);
  const [blink, setBlink] = useState(false);
  const intervalRef = useRef(null);
  const blinkRef = useRef(null);

  // Lip sync animation
  useEffect(() => {
    if (speaking) {
      intervalRef.current = setInterval(() => {
        setMouthIndex(Math.floor(Math.random() * MOUTH_SHAPES.length));
      }, 120);
    } else {
      clearInterval(intervalRef.current);
      setMouthIndex(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [speaking]);

  // Blink animation
  useEffect(() => {
    const scheduleBlink = () => {
      blinkRef.current = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, 150);
      }, 2500 + Math.random() * 2000);
    };
    scheduleBlink();
    return () => clearTimeout(blinkRef.current);
  }, []);

  const eyeScaleY = blink ? 0.1 : 1;

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow ring */}
      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
        speaking
          ? 'shadow-[0_0_40px_12px_rgba(56,189,248,0.45)] animate-pulse'
          : thinking
          ? 'shadow-[0_0_30px_8px_rgba(139,92,246,0.35)] animate-pulse'
          : 'shadow-[0_0_20px_4px_rgba(56,189,248,0.15)]'
      }`} />

      <svg
        viewBox="0 0 160 160"
        width="220"
        height="220"
        className="relative z-10"
      >
        {/* Head */}
        <defs>
          <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0a1628" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer glow circle */}
        <circle cx="80" cy="80" r="75" fill="url(#glowGrad)" />

        {/* Head shape */}
        <ellipse cx="80" cy="82" rx="52" ry="58" fill="url(#faceGrad)" stroke="#1e4a7a" strokeWidth="1.5" />

        {/* Neck */}
        <rect x="68" y="132" width="24" height="18" rx="4" fill="#0d1f3c" />

        {/* Shoulders */}
        <ellipse cx="80" cy="155" rx="48" ry="14" fill="#0d1f3c" />

        {/* Circuit lines on face (AI aesthetic) */}
        <line x1="30" y1="75" x2="44" y2="75" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.4" />
        <line x1="116" y1="75" x2="130" y2="75" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="30" cy="75" r="2" fill="#38bdf8" fillOpacity="0.5" />
        <circle cx="130" cy="75" r="2" fill="#38bdf8" fillOpacity="0.5" />

        {/* Eyebrows */}
        <path d="M 52 58 Q 62 54 72 57" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
        <path d="M 88 57 Q 98 54 108 58" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />

        {/* Eyes */}
        <g transform={`translate(62, 68) scale(1, ${eyeScaleY})`} style={{ transformOrigin: '62px 68px' }}>
          <ellipse cx="0" cy="0" rx="9" ry="9" fill="#0a1628" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5" fill="#38bdf8" opacity="0.9" filter="url(#glow)" />
          <circle cx="0" cy="0" r="2.5" fill="#ffffff" opacity="0.95" />
          <circle cx="2" cy="-2" r="1.2" fill="#ffffff" opacity="0.6" />
        </g>
        <g transform={`translate(98, 68) scale(1, ${eyeScaleY})`} style={{ transformOrigin: '98px 68px' }}>
          <ellipse cx="0" cy="0" rx="9" ry="9" fill="#0a1628" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5" fill="#38bdf8" opacity="0.9" filter="url(#glow)" />
          <circle cx="0" cy="0" r="2.5" fill="#ffffff" opacity="0.95" />
          <circle cx="2" cy="-2" r="1.2" fill="#ffffff" opacity="0.6" />
        </g>

        {/* Nose */}
        <path d="M 80 72 L 76 84 Q 80 87 84 84" stroke="#38bdf8" strokeWidth="1.2" fill="none" strokeOpacity="0.5" strokeLinecap="round" />

        {/* Mouth with lip sync */}
        <path
          d={MOUTH_SHAPES[mouthIndex]}
          stroke="#38bdf8"
          strokeWidth="2"
          fill={mouthIndex >= 2 ? '#051020' : 'none'}
          strokeLinecap="round"
          style={{ transition: 'd 0.08s ease' }}
          filter={speaking ? 'url(#glow)' : undefined}
        />

        {/* Thinking dots */}
        {thinking && (
          <g>
            <circle cx="68" cy="110" r="3" fill="#a78bfa">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0s" repeatCount="indefinite" />
            </circle>
            <circle cx="80" cy="110" r="3" fill="#a78bfa">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="92" cy="110" r="3" fill="#a78bfa">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* Status indicator */}
        <circle cx="118" cy="42" r="6" fill={speaking ? '#22c55e' : thinking ? '#a78bfa' : '#64748b'}>
          {(speaking || thinking) && (
            <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
          )}
        </circle>
      </svg>

      {/* Label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-sky-400 whitespace-nowrap">
        {speaking ? '🎙 Speaking...' : thinking ? '💭 Thinking...' : 'AI Interviewer'}
      </div>
    </div>
  );
};
