/** Loading placeholders shaped like the content they stand in for. */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`skeleton-shimmer rounded-2xl ${className}`} />;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      aria-hidden
      className={`rounded-3xl border-2 border-on-surface/10 bg-surface-container-lowest p-3 shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}

export function SnapCardSkeleton() {
  return (
    <Card>
      <Skeleton className="aspect-[4/5] w-full" />
      <div className="flex items-center gap-2 px-1 pt-3 pb-1">
        <Skeleton className="h-11 w-24 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="ml-auto h-4 w-16 rounded-full" />
      </div>
    </Card>
  );
}

export function FeedSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading snaps" className="flex flex-col gap-space-md">
      {Array.from({ length: count }).map((_, i) => (
        <SnapCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CampaignCardSkeleton({ featured }: { featured?: boolean }) {
  if (featured) {
    return (
      <Card className="p-4">
        <Skeleton className="h-56 w-full rounded-[18px]" />
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="flex items-center justify-between gap-3 pt-3">
          <Skeleton className="h-4 flex-1 rounded-full" />
          <Skeleton className="h-11 w-24 rounded-full" />
        </div>
      </Card>
    );
  }
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3.5">
        <Skeleton className="h-24 w-24 shrink-0 rounded-[18px]" />
        <div className="flex h-24 flex-1 flex-col justify-between py-0.5">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-4 w-full rounded-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-3 gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-xl" />
      ))}
    </div>
  );
}

export function ListRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-space-sm">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3 rounded-full" />
            <Skeleton className="h-3 w-1/3 rounded-full" />
          </div>
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
        </Card>
      ))}
    </div>
  );
}

export function StoriesSkeleton() {
  return (
    <div aria-hidden className="no-scrollbar flex gap-space-sm overflow-hidden px-4 pt-3 pb-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-32 shrink-0 rounded-full" />
      ))}
    </div>
  );
}
