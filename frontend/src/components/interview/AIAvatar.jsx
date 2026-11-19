import React from 'react';
import { Bot, Volume2, Sparkles, Loader2 } from 'lucide-react';
import aryaPortrait from '../../assets/arya-interviewer.png';

export const AIAvatar = ({ speaking = false, thinking = false, size = 'default' }) => {
  const isLarge = size === 'large';
  const avatarSize = isLarge
    ? 'w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-56 lg:h-56'
    : 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40';

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Dynamic ambient halo background */}
      <div
        className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
          speaking
            ? 'w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-sky-500/25 blur-3xl animate-pulse scale-110'
            : thinking
            ? 'w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-violet-500/20 blur-3xl animate-pulse'
            : 'w-36 h-36 sm:w-52 sm:h-52 bg-blue-600/10 blur-2xl'
        }`}
      />

      {/* Outer audio ring when speaking */}
      {speaking && (
        <div className="absolute inset-0 -m-3 rounded-full border-2 border-sky-400/40 animate-ping opacity-30 pointer-events-none" />
      )}

      {/* Main Avatar Circle */}
      <div
        className={`relative ${avatarSize} overflow-hidden rounded-full border-4 transition-all duration-500 ${
          speaking
            ? 'border-sky-300 shadow-[0_0_40px_rgba(56,189,248,0.45)] ring-4 ring-sky-400/20'
            : thinking
            ? 'border-violet-400 shadow-[0_0_35px_rgba(167,139,250,0.35)] ring-4 ring-violet-500/20'
            : 'border-[#1e2d4d] shadow-xl'
        }`}
      >
        <img
          src={aryaPortrait}
          alt="Arya, Senior AI Interviewer"
          className={`h-full w-full object-cover transition-transform duration-700 ${
            speaking ? 'scale-105' : 'scale-100'
          }`}
        />

        {/* Bottom subtle gradient on image */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#070b14]/80 to-transparent" />
      </div>

      {/* Speaker audio indicator wave */}
      {speaking && (
        <div className="mt-4 flex items-center justify-center gap-1 h-5 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/30 shadow-sm">
          {[0.4, 0.9, 0.6, 1, 0.7, 0.4].map((v, i) => (
            <div
              key={i}
              className="w-1 bg-sky-400 rounded-full animate-waveform"
              style={{
                height: `${v * 16}px`,
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
          <span className="text-[10px] font-semibold text-sky-300 ml-1.5">Speaking</span>
        </div>
      )}

      {/* Thinking indicator */}
      {thinking && (
        <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-[10px] font-semibold text-violet-300 shadow-sm">
          <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
          <span>Analyzing response...</span>
        </div>
      )}

      {/* Idle status */}
      {!speaking && !thinking && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0d1629] border border-[#1c2b4d] text-[11px] font-medium text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Arya · AI Lead</span>
          </div>
        </div>
      )}
    </div>
  );
};
