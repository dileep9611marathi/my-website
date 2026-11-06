import { describe, expect, it } from "vitest";

import {
  addResident,
  assignMedication,
  formatTime12,
  isOverdue,
  markDose,
  rolloverDay,
  sortByTime,
  undoDose,
  validateResident,
} from "@/lib/med-logic";
import { buildSeed } from "@/lib/med-seed";

const now = new Date(2026, 10, 6, 9, 30);
const seed = () => buildSeed(now);

describe("medication rules", () => {
  it("marking a dose administered updates status and logs caregiver", () => {
    const s = seed();
    const { state, log } = markDose(s, "m3", "administered", now);
    expect(state.medications.find((m) => m.id === "m3")?.status).toBe("administered");
    expect(log?.caregiver).toBe("Priya Sharma");
    expect(state.logs[0]?.action).toBe("administered");
    expect(state.logs.length).toBe(s.logs.length + 1);
  });

  it("marking a dose missed sets status to missed", () => {
    const { state } = markDose(seed(), "m3", "missed", now);
    expect(state.medications.find((m) => m.id === "m3")?.status).toBe("missed");
  });

  it("a dose cannot be recorded twice", () => {
    const first = markDose(seed(), "m3", "administered", now).state;
    const second = markDose(first, "m3", "missed", now);
    expect(second.error).toBeDefined();
    expect(second.state.medications.find((m) => m.id === "m3")?.status).toBe("administered");
  });

  it("undo returns the dose to pending and removes the log", () => {
    const s = seed();
    const { state, log } = markDose(s, "m3", "administered", now);
    const undone = undoDose(state, "m3", log!.id);
    expect(undone.medications.find((m) => m.id === "m3")?.status).toBe("pending");
    expect(undone.logs.length).toBe(s.logs.length);
  });

  it("a blank resident name is rejected", () => {
    const r = addResident(seed(), { name: "  ", age: "80", room: "101", allergies: "", notes: "" });
    expect(r.resident).toBeUndefined();
    expect(r.errors.name).toBeDefined();
  });

  it("resident age must be between 1 and 120", () => {
    expect(validateResident({ name: "A B", age: "121", room: "1", allergies: "", notes: "" }).age).toBeDefined();
    expect(validateResident({ name: "A B", age: "85", room: "1", allergies: "", notes: "" }).age).toBeUndefined();
  });

  it("a valid resident is added", () => {
    const s = seed();
    const r = addResident(s, { name: "Sushila Ghosh", age: "80", room: "207", allergies: "", notes: "" });
    expect(r.state.residents.length).toBe(s.residents.length + 1);
  });

  it("assigning a medication requires an existing resident", () => {
    const r = assignMedication(seed(), { residentId: "nope", name: "X", dosage: "1", time: "08:00", instructions: "" });
    expect(r.medication).toBeUndefined();
    expect(r.errors.residentId).toBeDefined();
  });

  it("assigned medication joins the schedule as pending", () => {
    const r = assignMedication(seed(), { residentId: "r1", name: "Aspirin", dosage: "75 mg", time: "15:00", instructions: "" });
    expect(r.medication?.status).toBe("pending");
    expect(r.state.medications.some((m) => m.id === r.medication!.id)).toBe(true);
  });

  it("a new day resets all doses to pending but keeps history", () => {
    const marked = markDose(seed(), "m3", "administered", now).state;
    const next = rolloverDay(marked, "2026-11-07");
    expect(next.medications.every((m) => m.status === "pending")).toBe(true);
    expect(next.logs.length).toBe(marked.logs.length);
  });

  it("schedule sorts chronologically and shows 12-hour times", () => {
    const sorted = sortByTime([{ time: "13:00" }, { time: "07:00" }, { time: "08:30" }]);
    expect(sorted.map((x) => x.time)).toEqual(["07:00", "08:30", "13:00"]);
    expect(formatTime12("13:00")).toBe("01:00 PM");
    expect(formatTime12("08:00")).toBe("08:00 AM");
  });

  it("pending doses past their time are overdue", () => {
    const s = seed();
    expect(isOverdue(s.medications.find((m) => m.id === "m3")!, now)).toBe(true); // 08:00
    expect(isOverdue(s.medications.find((m) => m.id === "m7")!, now)).toBe(false); // 10:00
  });
});
