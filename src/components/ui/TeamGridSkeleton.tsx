'use client';

import React from 'react';
import { Skeleton } from './Skeleton';

export const TeamGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {[1, 2, 3, 4, 5, 6].map((slot) => (
        <div
          key={slot}
          className="relative rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 flex flex-col justify-between overflow-hidden shadow-sm"
        >
          {/* Top Line Shimmer */}
          <div className="h-1.5 w-full bg-slate-800/60 rounded-full mb-4 animate-pulse" />

          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-7 h-7 rounded-lg" />
              <div>
                <Skeleton className="w-14 h-3 mb-1" />
                <Skeleton className="w-24 h-2.5" />
              </div>
            </div>
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>

          {/* Body */}
          <div className="space-y-3 mb-6">
            <Skeleton className="w-3/4 h-5 rounded-lg" />
            <Skeleton className="w-1/2 h-3.5 rounded" />

            {/* Member Pills Box Shimmer */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/40 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-12 h-2.5" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Skeleton className="w-24 h-5 rounded-md" />
                <Skeleton className="w-20 h-5 rounded-md" />
                <Skeleton className="w-28 h-5 rounded-md" />
              </div>
            </div>
          </div>

          {/* Footer Button Shimmer */}
          <Skeleton className="w-full h-9 rounded-xl" />
        </div>
      ))}
    </div>
  );
};
