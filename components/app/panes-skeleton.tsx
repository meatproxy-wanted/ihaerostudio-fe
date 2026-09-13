import { Skeleton } from "@/components/ui/skeleton";

export function PanesSkeleton({ panes = 2 }: { panes?: number }) {
  return (
    <div className="flex h-full gap-px bg-hairline" aria-busy="true">
      {Array.from({ length: panes }, (_, index) => (
        <div
          key={index}
          className="flex flex-1 flex-col gap-3 bg-background p-5"
        >
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
