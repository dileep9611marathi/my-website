// Pure, framework-free rules for the medication system. The store calls these;
// tests exercise them directly.

export type MedStatus = "pending" | "administered" | "missed";

export interface Resident {
  id: string;
  name: string;
  age: number;
  room: string;
  allergies: string;
  notes: string;
}

export interface Medication {
  id: string;
  residentId: string;
  name: string;
  dosage: string;
  /** 24h "HH:mm" */
  time: string;
  instructions: string;
  status: MedStatus;
}

export interface LogEntry {
  id: string;
  /** ISO timestamp of when the action was recorded */
  timestamp: string;
  caregiver: string;
  action: Exclude<MedStatus, "pending">;
  medicationId: string;
  residentId: string;
  residentName: string;
  room: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
}

export interface MedState {
  residents: Resident[];
  medications: Medication[];
  logs: LogEntry[];
  caregiver: string;
  /** local calendar day ("yyyy-mm-dd") the medication statuses belong to */
  day: string;
}

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatTime12(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = Number(hStr);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${mStr} ${suffix}`;
}

export function minutesOf(time: string): number {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

export function sortByTime<T extends { time: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => minutesOf(a.time) - minutesOf(b.time));
}

/** A pending dose is overdue once its scheduled minute has passed. */
export function isOverdue(med: Medication, now: Date): boolean {
  if (med.status !== "pending") return false;
  return minutesOf(med.time) < now.getHours() * 60 + now.getMinutes();
}

// ---------- Dose actions ----------

export function markDose(
  state: MedState,
  medicationId: string,
  action: "administered" | "missed",
  now: Date,
  logId: string = uid("log"),
): { state: MedState; log?: LogEntry; error?: string } {
  const med = state.medications.find((m) => m.id === medicationId);
  if (!med) return { state, error: "Medication not found" };
  if (med.status !== "pending") return { state, error: "This dose has already been recorded" };
  const resident = state.residents.find((r) => r.id === med.residentId);
  if (!resident) return { state, error: "Resident not found" };
  if (!state.caregiver.trim()) return { state, error: "Select the caregiver on duty first" };

  const log: LogEntry = {
    id: logId,
    timestamp: now.toISOString(),
    caregiver: state.caregiver,
    action,
    medicationId: med.id,
    residentId: resident.id,
    residentName: resident.name,
    room: resident.room,
    medicationName: med.name,
    dosage: med.dosage,
    scheduledTime: med.time,
  };

  return {
    state: {
      ...state,
      medications: state.medications.map((m) => (m.id === med.id ? { ...m, status: action } : m)),
      logs: [log, ...state.logs],
    },
    log,
  };
}

export function undoDose(state: MedState, medicationId: string, logId: string): MedState {
  return {
    ...state,
    medications: state.medications.map((m) =>
      m.id === medicationId ? { ...m, status: "pending" } : m,
    ),
    logs: state.logs.filter((l) => l.id !== logId),
  };
}

/** On a new calendar day every daily dose goes back to pending; history is kept. */
export function rolloverDay(state: MedState, today: string): MedState {
  if (state.day === today) return state;
  return {
    ...state,
    day: today,
    medications: state.medications.map((m) => ({ ...m, status: "pending" })),
  };
}

// ---------- Residents ----------

export interface ResidentInput {
  name: string;
  age: string;
  room: string;
  allergies: string;
  notes: string;
}

export function validateResident(
  input: ResidentInput,
): FieldErrors<"name" | "age" | "room"> {
  const errors: FieldErrors<"name" | "age" | "room"> = {};
  if (!input.name.trim()) errors.name = "Name is required";
  else if (input.name.trim().length < 2) errors.name = "Name is too short";

  const ageStr = input.age.trim();
  const age = Number(ageStr);
  if (!ageStr) errors.age = "Age is required";
  else if (!Number.isInteger(age) || age < 1 || age > 120)
    errors.age = "Enter a whole number between 1 and 120";

  if (!input.room.trim()) errors.room = "Room number is required";
  return errors;
}

export function addResident(
  state: MedState,
  input: ResidentInput,
  id: string = uid("res"),
): { state: MedState; resident?: Resident; errors: ReturnType<typeof validateResident> } {
  const errors = validateResident(input);
  if (Object.keys(errors).length) return { state, errors };
  const resident: Resident = {
    id,
    name: input.name.trim(),
    age: Number(input.age.trim()),
    room: input.room.trim(),
    allergies: input.allergies.trim(),
    notes: input.notes.trim(),
  };
  return { state: { ...state, residents: [...state.residents, resident] }, resident, errors };
}

// ---------- Medications ----------

export interface MedicationInput {
  residentId: string;
  name: string;
  dosage: string;
  time: string;
  instructions: string;
}

export function validateMedication(
  input: MedicationInput,
  residents: Resident[],
): FieldErrors<"residentId" | "name" | "dosage" | "time"> {
  const errors: FieldErrors<"residentId" | "name" | "dosage" | "time"> = {};
  if (!input.residentId) errors.residentId = "Choose a resident";
  else if (!residents.some((r) => r.id === input.residentId))
    errors.residentId = "Resident no longer exists";
  if (!input.name.trim()) errors.name = "Medication name is required";
  if (!input.dosage.trim()) errors.dosage = "Dosage is required";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) errors.time = "Pick a scheduled time";
  return errors;
}

export function assignMedication(
  state: MedState,
  input: MedicationInput,
  id: string = uid("med"),
): {
  state: MedState;
  medication?: Medication;
  errors: ReturnType<typeof validateMedication>;
} {
  const errors = validateMedication(input, state.residents);
  if (Object.keys(errors).length) return { state, errors };
  const medication: Medication = {
    id,
    residentId: input.residentId,
    name: input.name.trim(),
    dosage: input.dosage.trim(),
    time: input.time,
    instructions: input.instructions.trim(),
    status: "pending",
  };
  return {
    state: { ...state, medications: [...state.medications, medication] },
    medication,
    errors,
  };
}

export function removeMedication(state: MedState, medicationId: string): MedState {
  return { ...state, medications: state.medications.filter((m) => m.id !== medicationId) };
}
