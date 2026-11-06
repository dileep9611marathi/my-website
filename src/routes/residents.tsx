import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Search, UserPlus, Users } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, Field, PageHeader, ReadyGate, ResidentAvatar } from "@/components/app/shared";
import { validateResident, type ResidentInput } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";

export const Route = createFileRoute("/residents")({
  head: () => ({
    meta: [
      { title: "Residents — CareNest Medication Manager" },
      {
        name: "description",
        content: "Every resident's room, age, allergies and care notes in one place.",
      },
      { property: "og:title", content: "Residents — CareNest" },
      {
        property: "og:description",
        content: "Manage residents of the old-age home and their medical notes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResidentsPage,
});

function ResidentsPage() {
  return (
    <ReadyGate>
      <Residents />
    </ReadyGate>
  );
}

function Residents() {
  const { state } = useMed();
  const [query, setQuery] = useState("");

  const medCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of state.medications) map.set(m.residentId, (map.get(m.residentId) ?? 0) + 1);
    return map;
  }, [state.medications]);

  const q = query.trim().toLowerCase();
  const rows = state.residents
    .filter(
      (r) =>
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        r.allergies.toLowerCase().includes(q),
    )
    .sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true }));

  return (
    <div>
      <PageHeader
        icon={Users}
        title="Residents"
        description={`${state.residents.length} residents currently in care`}
        action={<AddResidentDialog />}
      />

      <div className="relative mb-4 sm:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, room or allergy"
          className="h-11 bg-card pl-9"
          aria-label="Search residents"
        />
      </div>

      {state.residents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No residents yet"
          description="Add your first resident to start building their medication schedule."
          action={<AddResidentDialog />}
        />
      ) : rows.length === 0 ? (
        <EmptyState icon={Search} title="No matches" description={`No resident matches “${query}”.`} />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="pl-5">Resident</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Allergies</TableHead>
                <TableHead className="min-w-[240px]">Medical notes</TableHead>
                <TableHead className="pr-5 text-right">Daily meds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="animate-in fade-in">
                  <TableCell className="py-3 pl-5">
                    <div className="flex items-center gap-3">
                      <ResidentAvatar name={r.name} className="size-9" />
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{r.age}</TableCell>
                  <TableCell>
                    <Badge variant="info" className="rounded-full">
                      {r.room}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.allergies ? (
                      <Badge variant="allergy" className="gap-1 rounded-full">
                        <AlertTriangle className="size-3" />
                        {r.allergies}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">None known</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.notes || "—"}</TableCell>
                  <TableCell className="pr-5 text-right font-medium">{medCount.get(r.id) ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

const BLANK: ResidentInput = { name: "", age: "", room: "", allergies: "", notes: "" };

function AddResidentDialog() {
  const { addResident } = useMed();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ResidentInput>(BLANK);
  const [errors, setErrors] = useState<ReturnType<typeof validateResident>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof ResidentInput, value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validateResident(next));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const result = addResident(form);
    setErrors(result.errors);
    if (!result.resident) return;
    toast.success(`${result.resident.name} added`, {
      description: `Room ${result.resident.room} · you can now assign medications.`,
    });
    setForm(BLANK);
    setSubmitted(false);
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setErrors({});
          setSubmitted(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="xl">
          <UserPlus />
          Add New Resident
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add new resident</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Field label="Full name *" error={errors.name} htmlFor="res-name">
            <Input
              id="res-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Sushila Ghosh"
              aria-invalid={!!errors.name}
              className="h-11"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age *" error={errors.age} htmlFor="res-age">
              <Input
                id="res-age"
                inputMode="numeric"
                value={form.age}
                onChange={(e) => update("age", e.target.value.replace(/[^\d]/g, ""))}
                placeholder="e.g. 80"
                aria-invalid={!!errors.age}
                className="h-11"
              />
            </Field>
            <Field label="Room number *" error={errors.room} htmlFor="res-room">
              <Input
                id="res-room"
                value={form.room}
                onChange={(e) => update("room", e.target.value)}
                placeholder="e.g. 207"
                aria-invalid={!!errors.room}
                className="h-11"
              />
            </Field>
          </div>
          <Field label="Allergies" htmlFor="res-allergies">
            <Input
              id="res-allergies"
              value={form.allergies}
              onChange={(e) => update("allergies", e.target.value)}
              placeholder="e.g. Penicillin, peanuts — leave blank if none"
              className="h-11"
            />
          </Field>
          <Field label="Medical notes" htmlFor="res-notes">
            <Textarea
              id="res-notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Conditions, mobility, preferences…"
              rows={3}
            />
          </Field>
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" size="xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="xl">
              <UserPlus />
              Add resident
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
