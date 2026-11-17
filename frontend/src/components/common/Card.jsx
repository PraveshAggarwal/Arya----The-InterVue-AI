import React from 'react';

export const Card = ({
  children,
  className = '',
  glow = false,
  interactive = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[#0c101c]/90 
        backdrop-blur-md 
        rounded-2xl 
        border 
        transition-all 
        duration-300
        ${glow ? 'border-sky-500/40 shadow-[0_0_25px_rgba(56,189,248,0.12)]' : 'border-[#172138]'}
        ${interactive ? 'hover:border-sky-500/40 hover:bg-[#101728] hover:-translate-y-0.5 cursor-pointer hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
