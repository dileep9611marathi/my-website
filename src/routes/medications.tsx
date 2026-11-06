import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Clock, Pill, PillBottle, Plus, Trash2, Users } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState, Field, PageHeader, ReadyGate, ResidentAvatar, StatusBadge } from "@/components/app/shared";
import { formatTime12, sortByTime, validateMedication, type MedicationInput } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";

export const Route = createFileRoute("/medications")({
  head: () => ({
    meta: [
      { title: "Prescriptions — CareNest Medication Manager" },
      {
        name: "description",
        content: "Assign medicines, doses and times to each resident's daily schedule.",
      },
      { property: "og:title", content: "Prescriptions — CareNest" },
      {
        property: "og:description",
        content: "Set up each resident's daily medication schedule.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MedicationsPage,
});

function MedicationsPage() {
  return (
    <ReadyGate>
      <Medications />
    </ReadyGate>
  );
}

const ALL = "all";

function Medications() {
  const { state } = useMed();
  const [filter, setFilter] = useState<string>(ALL);

  const grouped = useMemo(() => {
    return state.residents
      .filter((r) => filter === ALL || r.id === filter)
      .map((r) => ({
        resident: r,
        meds: sortByTime(state.medications.filter((m) => m.residentId === r.id)),
      }))
      .sort((a, b) => a.resident.room.localeCompare(b.resident.room, undefined, { numeric: true }));
  }, [state.residents, state.medications, filter]);

  return (
    <div>
      <PageHeader
        icon={Pill}
        title="Prescriptions"
        description="Set up what each resident takes and when. New medications join today's schedule right away."
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <AssignForm onAssigned={(residentId) => setFilter((f) => (f === ALL ? f : residentId))} />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Daily schedules</h2>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-11 bg-card sm:w-64" aria-label="Filter by resident">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All residents</SelectItem>
                {state.residents.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} · Room {r.room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.residents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No residents yet"
              description="Add a resident first, then come back to assign their medications."
              action={
                <Button asChild>
                  <Link to="/residents">Go to Residents</Link>
                </Button>
              }
            />
          ) : (
            grouped.map(({ resident, meds }) => (
              <article key={resident.id} className="rounded-2xl border bg-card p-4 shadow-soft md:p-5">
                <header className="flex flex-wrap items-center gap-3">
                  <ResidentAvatar name={resident.name} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{resident.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Room {resident.room} · Age {resident.age}
                    </p>
                  </div>
                  {resident.allergies && (
                    <Badge variant="allergy" className="gap-1 rounded-full">
                      <AlertTriangle className="size-3" />
                      {resident.allergies}
                    </Badge>
                  )}
                </header>
                {meds.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                    No medications assigned yet.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y rounded-xl border">
                    {meds.map((m) => (
                      <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                        <span className="inline-flex w-24 items-center gap-1.5 font-display text-sm font-semibold text-primary">
                          <Clock className="size-3.5" />
                          {formatTime12(m.time)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {m.name} <span className="font-normal text-muted-foreground">· {m.dosage}</span>
                          </p>
                          {m.instructions && (
                            <p className="text-xs text-muted-foreground">{m.instructions}</p>
                          )}
                        </div>
                        <StatusBadge status={m.status} />
                        <RemoveButton id={m.id} label={`${m.name} for ${resident.name}`} />
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

function RemoveButton({ id, label }: { id: string; label: string }) {
  const { removeMedication } = useMed();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Remove ${label}`} className="text-muted-foreground hover:text-destructive">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this medication?</AlertDialogTitle>
          <AlertDialogDescription>
            {label} will no longer appear on the daily schedule. Past records in the audit log are kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              removeMedication(id);
              toast.success("Medication removed", { description: label });
            }}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const BLANK: MedicationInput = { residentId: "", name: "", dosage: "", time: "08:00", instructions: "" };

function AssignForm({ onAssigned }: { onAssigned: (residentId: string) => void }) {
  const { state, assignMedication } = useMed();
  const [form, setForm] = useState<MedicationInput>(BLANK);
  const [errors, setErrors] = useState<ReturnType<typeof validateMedication>>({});
  const [submitted, setSubmitted] = useState(false);

  const selected = state.residents.find((r) => r.id === form.residentId);

  const update = (key: keyof MedicationInput, value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validateMedication(next, state.residents));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const result = assignMedication(form);
    setErrors(result.errors);
    if (!result.medication) return;
    const r = state.residents.find((x) => x.id === result.medication!.residentId);
    toast.success(`${result.medication.name} assigned to ${r?.name}`, {
      description: `Daily at ${formatTime12(result.medication.time)} · added to today's schedule`,
    });
    onAssigned(result.medication.residentId);
    // Keep the resident selected so several medicines can be added in a row.
    setForm({ ...BLANK, residentId: form.residentId });
    setSubmitted(false);
  };

  return (
    <section className="h-fit rounded-2xl border bg-card p-5 shadow-soft lg:sticky lg:top-24">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <PillBottle className="size-4" />
        </span>
        <h2 className="text-lg font-semibold">Assign new medication</h2>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Resident *" htmlFor="med-resident" error={errors.residentId}>
          <Select value={form.residentId} onValueChange={(v) => update("residentId", v)}>
            <SelectTrigger id="med-resident" className="h-11" aria-invalid={!!errors.residentId}>
              <SelectValue placeholder="Choose a resident" />
            </SelectTrigger>
            <SelectContent>
              {state.residents.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name} · Room {r.room}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {selected?.allergies && (
          <p className="flex items-start gap-2 rounded-xl bg-destructive-soft px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              <strong>Allergy alert:</strong> {selected.allergies}. Check before prescribing.
            </span>
          </p>
        )}

        <Field label="Medication name *" htmlFor="med-name" error={errors.name}>
          <Input
            id="med-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Metformin"
            className="h-11"
            aria-invalid={!!errors.name}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dosage *" htmlFor="med-dosage" error={errors.dosage}>
            <Input
              id="med-dosage"
              value={form.dosage}
              onChange={(e) => update("dosage", e.target.value)}
              placeholder="e.g. 500 mg"
              className="h-11"
              aria-invalid={!!errors.dosage}
            />
          </Field>
          <Field label="Scheduled time *" htmlFor="med-time" error={errors.time}>
            <Input
              id="med-time"
              type="time"
              value={form.time}
              onChange={(e) => update("time", e.target.value)}
              className="h-11"
              aria-invalid={!!errors.time}
            />
          </Field>
        </div>
        <Field label="Instructions" htmlFor="med-instructions" hint="Optional — e.g. with food, at bedtime">
          <Textarea
            id="med-instructions"
            value={form.instructions}
            onChange={(e) => update("instructions", e.target.value)}
            rows={2}
          />
        </Field>
        <Button type="submit" size="xl" className="w-full">
          <Plus />
          Assign medication
        </Button>
      </form>
    </section>
  );
}
