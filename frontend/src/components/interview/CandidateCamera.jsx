import React, { useEffect, useRef } from 'react';
import { VideoOff, Mic, Video } from 'lucide-react';

export const CandidateCamera = ({ stream, isListening = false, className = '' }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream || null;
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-[#070b14] border border-[#1a253d] shadow-lg ${className}`}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover scale-x-[-1]"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <VideoOff className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-xs text-slate-400">Camera preview unavailable</span>
        </div>
      )}

      {/* Top badges */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-semibold text-slate-200 border border-white/10">
          <Video className="w-3 h-3 text-sky-400" />
          HD 720p
        </span>
      </div>

      {/* Mic status */}
      <div className="absolute top-2.5 right-2.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-md border ${
          isListening
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
            : 'bg-black/60 text-slate-400 border-white/10'
        }`}>
          <Mic className={`w-3 h-3 ${isListening ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
          {isListening ? 'Mic Active' : 'Mic Idle'}
        </span>
      </div>

      {/* Bottom candidate name tag */}
      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>You (Candidate)</span>
        </div>
      </div>
    </div>
  );
};
