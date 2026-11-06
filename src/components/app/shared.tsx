import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { MedStatus } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-7" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const STATUS_META: Record<MedStatus, { label: string; icon: LucideIcon }> = {
  pending: { label: "Pending", icon: Clock },
  administered: { label: "Administered", icon: CheckCircle2 },
  missed: { label: "Missed", icon: XCircle },
};

export function StatusBadge({ status, className }: { status: MedStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={status} className={cn("gap-1 rounded-full py-1 font-medium", className)}>
      <meta.icon className="size-3.5" />
      {meta.label}
    </Badge>
  );
}

export function ResidentAvatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm font-semibold text-accent-foreground",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/** Data lives in the browser; show a calm skeleton until it has loaded. */
export function ReadyGate({ children }: { children: ReactNode }) {
  const { ready } = useMed();
  if (!ready)
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  return <>{children}</>;
}

export function Field({
  label,
  error,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  error?: string | undefined;
  htmlFor: string;
  hint?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
