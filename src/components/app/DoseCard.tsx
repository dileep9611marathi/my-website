import { AlertTriangle, Check, DoorOpen, Info, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResidentAvatar, StatusBadge } from "@/components/app/shared";
import type { Medication, Resident } from "@/lib/med-logic";
import { useMed } from "@/lib/med-store";
import { cn } from "@/lib/utils";

export function DoseCard({
  med,
  resident,
  overdue,
}: {
  med: Medication;
  resident: Resident;
  overdue: boolean;
}) {
  const { markDose, undoDose } = useMed();

  const act = (action: "administered" | "missed") => {
    const result = markDose(med.id, action);
    if (result.error || !result.log) {
      toast.error(result.error ?? "Could not record this dose");
      return;
    }
    const logId = result.log.id;
    toast.success(
      action === "administered"
        ? `${med.name} given to ${resident.name}`
        : `${med.name} marked missed for ${resident.name}`,
      {
        description: `Recorded by ${result.log.caregiver} · saved to the audit log`,
        action: { label: "Undo", onClick: () => undoDose(med.id, logId) },
      },
    );
  };

  const pending = med.status === "pending";

  return (
    <article
      className={cn(
        "rounded-2xl border bg-card p-4 shadow-soft transition-all animate-in fade-in slide-in-from-bottom-1 md:p-5",
        pending && overdue && "border-destructive/30",
        !pending && "bg-card/70",
      )}
    >
      <div className="flex items-start gap-3">
        <ResidentAvatar name={resident.name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-base font-semibold">{resident.name}</h3>
            <Badge variant="info" className="gap-1 rounded-full font-medium">
              <DoorOpen className="size-3" />
              Room {resident.room}
            </Badge>
            {pending && overdue && (
              <Badge variant="missed" className="rounded-full font-medium">
                Overdue
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-lg font-semibold leading-snug text-foreground">
            {med.name} <span className="font-normal text-muted-foreground">· {med.dosage}</span>
          </p>
          {med.instructions && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Info className="size-3.5 shrink-0" />
              {med.instructions}
            </p>
          )}
          {resident.allergies && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-destructive-soft px-2 py-1 text-xs font-medium text-destructive">
              <AlertTriangle className="size-3.5" />
              Allergy: {resident.allergies}
            </p>
          )}
        </div>
        {!pending && <StatusBadge status={med.status} className="shrink-0" />}
      </div>

      {pending && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <Button variant="danger-soft" size="xl" onClick={() => act("missed")}>
            <X />
            Mark Missed
          </Button>
          <Button variant="success" size="xl" onClick={() => act("administered")}>
            <Check />
            Mark Administered
          </Button>
        </div>
      )}
    </article>
  );
}
