import React, { useEffect, useState } from 'react';
import aryaPortrait from '../../assets/arya-interviewer.png';

export const AIAvatar = ({ speaking = false, thinking = false }) => {
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (!speaking) {
      setMouthOpen(false);
      return undefined;
    }
    const timer = setInterval(() => setMouthOpen((open) => !open), 170);
    return () => clearInterval(timer);
  }, [speaking]);

  return (
  <div className={`relative flex flex-col items-center justify-center ${speaking ? 'animate-[pulse_1.8s_ease-in-out_infinite]' : ''}`}>
    <div className={`absolute h-52 w-52 rounded-full transition-all duration-500 ${speaking ? 'bg-sky-400/25 blur-2xl animate-pulse scale-110' : thinking ? 'bg-violet-400/20 blur-2xl animate-pulse' : 'bg-sky-400/10 blur-xl'}`} />
    <div className={`relative h-52 w-52 overflow-hidden rounded-full border-4 transition-all duration-300 ${speaking ? 'border-sky-300 shadow-[0_0_35px_rgba(56,189,248,0.5)]' : 'border-sky-500/50'}`}>
      <img src={aryaPortrait} alt="Arya, your AI interviewer" className={`h-full w-full object-cover transition-transform duration-500 ${speaking ? 'scale-[1.035] translate-y-0.5' : ''}`} />
      {speaking && <div className={`absolute left-1/2 top-[56%] h-1.5 -translate-x-1/2 rounded-full bg-[#a24c60]/70 transition-all duration-100 ${mouthOpen ? 'w-7 scale-y-[1.8]' : 'w-5 scale-y-[.75]'}`} />}
      {speaking && <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-sky-950/35 to-transparent" />}
    </div>
    <div className="relative mt-4 text-center">
      <p className="text-sm font-bold text-white">Arya</p>
      <p className="text-xs text-sky-300">{speaking ? 'Speaking…' : thinking ? 'Thinking…' : 'AI Interviewer'}</p>
    </div>
  </div>
  );
};
