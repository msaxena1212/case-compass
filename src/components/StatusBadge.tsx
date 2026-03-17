import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success",
  filed: "bg-info/15 text-info",
  hearing: "bg-warning/15 text-warning",
  closed: "bg-muted text-muted-foreground",
  pending: "bg-accent/15 text-accent",
  urgent: "bg-destructive/15 text-destructive",
  paid: "bg-success/15 text-success",
  unpaid: "bg-destructive/15 text-destructive",
  overdue: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
