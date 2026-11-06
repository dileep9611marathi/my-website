import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  addResident as addResidentRule,
  assignMedication as assignMedicationRule,
  dayKey,
  markDose as markDoseRule,
  removeMedication as removeMedicationRule,
  rolloverDay,
  undoDose as undoDoseRule,
  type MedState,
  type MedicationInput,
  type ResidentInput,
} from "./med-logic";
import { buildSeed } from "./med-seed";

const STORAGE_KEY = "carenest-med-state-v1";

interface MedStore {
  ready: boolean;
  state: MedState;
  setCaregiver: (name: string) => void;
  markDose: (medicationId: string, action: "administered" | "missed") => ReturnType<typeof markDoseRule>;
  undoDose: (medicationId: string, logId: string) => void;
  addResident: (input: ResidentInput) => ReturnType<typeof addResidentRule>;
  assignMedication: (input: MedicationInput) => ReturnType<typeof assignMedicationRule>;
  removeMedication: (medicationId: string) => void;
  resetDemo: () => void;
}

const EMPTY: MedState = { residents: [], medications: [], logs: [], caregiver: "", day: "" };

const MedContext = createContext<MedStore | null>(null);

export function MedProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MedState>(EMPTY);
  const [ready, setReady] = useState(false);

  // Load after mount: data and clock are browser-local, so nothing renders on the server.
  useEffect(() => {
    const now = new Date();
    let loaded: MedState | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) loaded = JSON.parse(raw) as MedState;
    } catch {
      loaded = null;
    }
    setState(rolloverDay(loaded ?? buildSeed(now), dayKey(now)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — state still lives in memory */
    }
  }, [state, ready]);

  // Roll statuses over at midnight while the screen stays open.
  useEffect(() => {
    if (!ready) return;
    const t = window.setInterval(() => {
      setState((s) => rolloverDay(s, dayKey(new Date())));
    }, 60_000);
    return () => window.clearInterval(t);
  }, [ready]);

  const setCaregiver = useCallback((name: string) => setState((s) => ({ ...s, caregiver: name })), []);

  const markDose = useCallback<MedStore["markDose"]>(
    (id, action) => {
      const result = markDoseRule(state, id, action, new Date());
      if (!result.error) setState(result.state);
      return result;
    },
    [state],
  );

  const undoDose = useCallback((id: string, logId: string) => {
    setState((s) => undoDoseRule(s, id, logId));
  }, []);

  const addResident = useCallback<MedStore["addResident"]>(
    (input) => {
      const result = addResidentRule(state, input);
      if (result.resident) setState(result.state);
      return result;
    },
    [state],
  );

  const assignMedication = useCallback<MedStore["assignMedication"]>(
    (input) => {
      const result = assignMedicationRule(state, input);
      if (result.medication) setState(result.state);
      return result;
    },
    [state],
  );

  const removeMedication = useCallback((id: string) => {
    setState((s) => removeMedicationRule(s, id));
  }, []);

  const resetDemo = useCallback(() => setState(buildSeed(new Date())), []);

  const value = useMemo(
    () => ({ ready, state, setCaregiver, markDose, undoDose, addResident, assignMedication, removeMedication, resetDemo }),
    [ready, state, setCaregiver, markDose, undoDose, addResident, assignMedication, removeMedication, resetDemo],
  );

  return <MedContext.Provider value={value}>{children}</MedContext.Provider>;
}

export function useMed() {
  const ctx = useContext(MedContext);
  if (!ctx) throw new Error("useMed must be used inside MedProvider");
  return ctx;
}

/** Current time that re-renders every 30s so "overdue" badges stay live. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}
