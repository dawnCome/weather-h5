'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 rounded-xl ${className}`}
      aria-busy="true"
      aria-label="加载中"
    />
  );
}

export function WeatherCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}

export function TrendChartSkeleton() {
  return (
    <div className="w-full h-[25vh] mt-4">
      <Skeleton className="w-full h-full" />
    </div>
  );
}