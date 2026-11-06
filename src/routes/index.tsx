import { createFileRoute, Link } from "@tanstack/react-router";
import { AlarmClock, CheckCircle2, Clock, PartyPopper, Pill, Search, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoseCard } from "@/components/app/DoseCard";
import { EmptyState, ReadyGate } from "@/components/app/shared";
import { formatTime12, isOverdue, sortByTime, type Medication } from "@/lib/med-logic";
import { useMed, useNow } from "@/lib/med-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today's Schedule — CareNest Medication Manager" },
      {
        name: "description",
        content: "See every medication due today, in time order, and record each dose in one tap.",
      },
      { property: "og:title", content: "Today's Schedule — CareNest" },
      {
        property: "og:description",
        content: "A real-time medication round for caregivers at the old-age home.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <ReadyGate>
      <Dashboard />
    </ReadyGate>
  );
}

function greeting(h: number) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

type View = "todo" | "done";

function Dashboard() {
  const { state } = useMed();
  const now = useNow();
  const [view, setView] = useState<View>("todo");
  const [query, setQuery] = useState("");

  const residentsById = useMemo(
    () => new Map(state.residents.map((r) => [r.id, r])),
    [state.residents],
  );

  const meds = useMemo(
    () => sortByTime(state.medications.filter((m) => residentsById.has(m.residentId))),
    [state.medications, residentsById],
  );

  const pending = meds.filter((m) => m.status === "pending");
  const given = meds.filter((m) => m.status === "administered").length;
  const missed = meds.filter((m) => m.status === "missed").length;
  const overdue = pending.filter((m) => isOverdue(m, now)).length;
  const done = given + missed;
  const pct = meds.length ? Math.round((done / meds.length) * 100) : 0;
  const nextDose = pending.find((m) => !isOverdue(m, now));

  const q = query.trim().toLowerCase();
  const visible = (view === "todo" ? pending : meds.filter((m) => m.status !== "pending")).filter(
    (m) => {
      if (!q) return true;
      const r = residentsById.get(m.residentId)!;
      return (
        r.name.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q)
      );
    },
  );

  const groups = useMemo(() => {
    const map = new Map<string, Medication[]>();
    for (const m of visible) map.set(m.time, [...(map.get(m.time) ?? []), m]);
    return [...map.entries()];
  }, [visible]);

  const nameParts = state.caregiver.split(" ");
  const firstName = nameParts[0] === "Sister" ? nameParts.slice(0, 2).join(" ") : nameParts[0];

  return (
    <div className="space-y-6">
      {/* Greeting + progress */}
      <section className="relative overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-lift md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary-foreground/10" />
        <div className="pointer-events-none absolute -bottom-24 right-24 size-56 rounded-full bg-primary-foreground/5" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-foreground/80">
              {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-1 text-3xl font-semibold md:text-4xl">
              {greeting(now.getHours())}, {firstName || "there"}
            </h1>
            <p className="mt-2 max-w-md text-primary-foreground/85">
              {pending.length === 0
                ? "Every dose for today has been recorded. Great work!"
                : nextDose
                  ? `Next round at ${formatTime12(nextDose.time)} — ${pending.length} dose${pending.length === 1 ? "" : "s"} still to give today.`
                  : `${pending.length} overdue dose${pending.length === 1 ? "" : "s"} need attention.`}
            </p>
          </div>
          <div className="w-full max-w-xs rounded-2xl bg-primary-foreground/12 p-4 backdrop-blur">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-primary-foreground/85">Today's progress</span>
              <span className="font-display text-2xl font-semibold">{pct}%</span>
            </div>
            <Progress value={pct} className="mt-2 h-2.5 bg-primary-foreground/20 [&>div]:bg-primary-foreground" />
            <p className="mt-2 text-xs text-primary-foreground/80">
              {done} of {meds.length} doses recorded
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Clock} label="Pending" value={pending.length} tone="warning" />
        <Stat icon={AlarmClock} label="Overdue" value={overdue} tone="danger" />
        <Stat icon={CheckCircle2} label="Administered" value={given} tone="success" />
        <Stat icon={XCircle} label="Missed" value={missed} tone="danger-muted" />
      </section>

      {/* Controls */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList className="h-11 bg-secondary p-1">
            <TabsTrigger value="todo" className="h-9 px-4 text-sm">
              To give ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="done" className="h-9 px-4 text-sm">
              Completed ({done})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resident, room or medicine"
            className="h-11 bg-card pl-9"
            aria-label="Search today's schedule"
          />
        </div>
      </section>

      {/* Timeline */}
      {meds.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No medications scheduled"
          description="Assign medications to residents and they'll appear here on today's round."
          action={
            <Button asChild>
              <Link to="/medications">Assign a medication</Link>
            </Button>
          }
        />
      ) : groups.length === 0 ? (
        q ? (
          <EmptyState
            icon={Search}
            title="No matches"
            description={`Nothing on today's ${view === "todo" ? "to-give list" : "completed list"} matches “${query}”.`}
          />
        ) : view === "todo" ? (
          <EmptyState
            icon={PartyPopper}
            title="No medications due right now"
            description="All of today's doses have been recorded. Check the Completed tab or the audit log for details."
          />
        ) : (
          <EmptyState
            icon={Clock}
            title="Nothing recorded yet"
            description="Doses you mark as administered or missed will show up here."
          />
        )
      ) : (
        <ol className="relative space-y-6">
          {groups.map(([time, items]) => {
            const slotOverdue = items.some((m) => isOverdue(m, now));
            return (
              <li key={time} className="relative grid gap-3 md:grid-cols-[7.5rem_1fr] md:gap-6">
                <div className="flex items-center gap-2 md:flex-col md:items-start md:pt-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-sm font-semibold",
                      slotOverdue && view === "todo"
                        ? "bg-destructive-soft text-destructive"
                        : "bg-primary-soft text-primary",
                    )}
                  >
                    <Clock className="size-3.5" />
                    {formatTime12(time)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {items.length} dose{items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((m) => (
                    <DoseCard
                      key={m.id}
                      med={m}
                      resident={residentsById.get(m.residentId)!}
                      overdue={isOverdue(m, now)}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  tone: "warning" | "danger" | "success" | "danger-muted";
}) {
  const toneClass = {
    warning: "bg-warning-soft text-warning-foreground",
    danger: "bg-destructive-soft text-destructive",
    success: "bg-success-soft text-success",
    "danger-muted": "bg-muted text-destructive",
  }[tone];
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
      <span className={cn("flex size-11 items-center justify-center rounded-xl", toneClass)}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-display text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
