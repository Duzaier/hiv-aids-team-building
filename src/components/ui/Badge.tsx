'use client';

import React from 'react';

interface BadgeProps {
  variant?: 'available' | 'registered' | 'my-team' | 'admin' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'available', children, className = '' }) => {
  const variantStyles = {
    available: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30',
    registered: 'bg-slate-800 text-slate-300 border border-slate-700',
    'my-team': 'bg-amber-950/70 text-amber-300 border border-amber-500/40 font-semibold',
    admin: 'bg-purple-950/70 text-purple-300 border border-purple-500/30',
    warning: 'bg-orange-950/70 text-orange-300 border border-orange-500/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
