import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  subValue,
  className,
}: {
  label: string;
  value: string;
  subValue?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border border-border bg-card p-5",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground">{subValue}</p>
      )}
    </div>
  );
}
