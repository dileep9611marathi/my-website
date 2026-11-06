import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader, ReadyGate, StatusBadge } from "@/components/app/shared";
import { formatTime12 } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Audit Log — CareNest Medication Manager" },
      {
        name: "description",
        content: "A read-only record of every dose given or missed, with time and caregiver.",
      },
      { property: "og:title", content: "Audit Log — CareNest" },
      {
        property: "og:description",
        content: "Accountability history of administered and missed medications.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <ReadyGate>
      <History />
    </ReadyGate>
  );
}

type Filter = "all" | "administered" | "missed";

function History() {
  const { state } = useMed();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const logs = [...state.logs]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .filter((l) => filter === "all" || l.action === filter)
    .filter(
      (l) =>
        !q ||
        l.residentName.toLowerCase().includes(q) ||
        l.medicationName.toLowerCase().includes(q) ||
        l.caregiver.toLowerCase().includes(q) ||
        l.room.toLowerCase().includes(q),
    );

  const counts = {
    all: state.logs.length,
    administered: state.logs.filter((l) => l.action === "administered").length,
    missed: state.logs.filter((l) => l.action === "missed").length,
  };

  return (
    <div>
      <PageHeader
        icon={ClipboardList}
        title="Audit Log"
        description="Every dose given or missed, with who recorded it and when. Records can't be edited."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="h-11 bg-secondary p-1">
            <TabsTrigger value="all" className="h-9 px-3">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="administered" className="h-9 px-3">
              Administered ({counts.administered})
            </TabsTrigger>
            <TabsTrigger value="missed" className="h-9 px-3">
              Missed ({counts.missed})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resident, medicine, staff"
            className="h-11 bg-card pl-9"
            aria-label="Search audit log"
          />
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={state.logs.length === 0 ? "No records yet" : "No matching records"}
          description={
            state.logs.length === 0
              ? "Doses marked on Today's Schedule will be recorded here automatically."
              : "Try a different filter or search term."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="pl-5">Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5">Recorded by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => {
                const d = new Date(l.timestamp);
                return (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap py-3 pl-5">
                      {d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium">{l.residentName}</span>
                      <span className="block text-xs text-muted-foreground">Room {l.room}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {l.medicationName}
                      <span className="block text-xs text-muted-foreground">{l.dosage}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatTime12(l.scheduledTime)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={l.action} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap pr-5">{l.caregiver}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
