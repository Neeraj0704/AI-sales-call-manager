import { cn } from "@/lib/utils";

const statusConfig: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  idle: {
    label: "Idle",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "in-progress": {
    label: "In Call",
    className: "bg-success/15 text-success",
    dot: "bg-success animate-pulse",
  },
  queued: {
    label: "Queued",
    className: "bg-warning/15 text-warning",
    dot: "bg-warning",
  },
  ringing: {
    label: "Ringing",
    className: "bg-warning/15 text-warning",
    dot: "bg-warning animate-pulse",
  },
  ended: {
    label: "Ended",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  forwarding: {
    label: "Forwarding",
    className: "bg-chart-2/15 text-chart-2",
    dot: "bg-chart-2 animate-pulse",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
