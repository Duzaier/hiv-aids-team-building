import React from 'react';

interface BadgeProps {
  variant?: 'available' | 'registered' | 'my-team' | 'admin' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'available', children, className = '' }) => {
  const variantStyles = {
    available: 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 shadow-xs shadow-emerald-500/10',
    registered: 'bg-red-950/70 text-red-300 border border-red-500/30 shadow-xs shadow-red-500/10',
    'my-team': 'bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-xs shadow-amber-500/20 font-semibold',
    admin: 'bg-purple-950/70 text-purple-300 border border-purple-500/30',
    warning: 'bg-orange-950/70 text-orange-300 border border-orange-500/30'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase ${variantStyles[variant]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  );
};
