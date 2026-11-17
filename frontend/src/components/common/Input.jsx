import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  rightElement,
  className = '',
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-300 flex items-center justify-between">
          <span>{label}</span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            w-full 
            bg-[#090d16] 
            border 
            ${error ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/20' : 'border-[#1b253d] focus:border-sky-400 focus:ring-sky-500/20'} 
            rounded-xl 
            py-2.5 
            ${Icon ? 'pl-10' : 'pl-3.5'} 
            ${rightElement ? 'pr-11' : 'pr-3.5'} 
            text-sm 
            text-slate-100 
            placeholder-slate-500 
            transition-all 
            duration-200 
            focus:outline-none 
            focus:ring-2 
            disabled:bg-slate-900/50 
            disabled:text-slate-600 
            disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <span className="text-xs text-rose-400 mt-0.5">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-500 mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
