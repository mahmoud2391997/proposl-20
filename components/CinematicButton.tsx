import React from 'react';

interface CinematicButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'ghost';
  disabled?: boolean;
  className?: string;
}

export const CinematicButton: React.FC<CinematicButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  disabled = false,
  className = ''
}) => {
  const baseStyles = "relative group overflow-hidden px-8 py-4 font-display font-bold uppercase tracking-widest text-sm transition-all duration-300 clip-path-polygon";
  
  const variants = {
    primary: "bg-aether-500 hover:bg-aether-accent text-white border-l-4 border-white/50 hover:border-white shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    danger: "bg-red-900/80 hover:bg-red-600 text-white border-l-4 border-red-500 hover:border-white shadow-[0_0_20px_rgba(220,38,38,0.5)]",
    ghost: "bg-transparent border border-white/20 hover:bg-white/10 text-white/80 hover:text-white backdrop-blur-sm"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {/* Glitch effect overlay */}
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
    </button>
  );
};