import React, { useEffect, useRef } from 'react';
import { VideoOff } from 'lucide-react';

export const CandidateCamera = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream || null;
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [stream]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#080c16] border border-[#1b2640]">
      {stream ? (
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
          <VideoOff className="w-8 h-8" />
          <span className="text-xs">Camera and microphone are required</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-slate-300">You</div>
    </div>
  );
};
