"use client";

export default function LoadingSkeletons() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-44 bg-slate-200 rounded-3xl w-full"></div>

      {/* Tabs & filters skeleton */}
      <div className="h-10 bg-slate-200 rounded-full w-2/3"></div>
      <div className="h-12 bg-slate-200 rounded-2xl w-full"></div>

      {/* Grid items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-slate-200 rounded-3xl w-full"></div>
        ))}
      </div>
    </div>
  );
}
