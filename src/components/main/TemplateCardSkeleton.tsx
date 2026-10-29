// src/components/main/TemplateCardSkeleton.tsx
import React from "react";

export const TemplateCardSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card bg-base-100 border border-base-200/80 shadow-xs flex flex-col h-full overflow-hidden animate-pulse rounded-2xl"
        >
          {/* Image placeholder */}
          <div className="h-48 w-full bg-base-300/60" />

          {/* Body content */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-base-300 rounded w-2/3" />
              <div className="h-3 bg-base-300/70 rounded w-full" />
              <div className="h-3 bg-base-300/40 rounded w-4/5" />
            </div>

            {/* Tag badges placeholder */}
            <div className="flex gap-1.5 pt-1">
              <div className="h-4 bg-base-300/60 rounded-md w-12" />
              <div className="h-4 bg-base-300/40 rounded-md w-14" />
            </div>

            {/* Bottom stat & action row placeholder */}
            <div className="flex justify-between items-center pt-2.5 border-t border-base-200/60">
              <div className="flex items-center gap-2">
                <div className="h-4 bg-base-300/80 rounded w-10" />
                <div className="h-4 bg-base-300/60 rounded w-8" />
              </div>
              <div className="h-4 bg-base-300/60 rounded w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateCardSkeleton;

