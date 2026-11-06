import { dayKey, type LogEntry, type MedState, type Medication, type Resident } from "./med-logic";

export const STAFF = ["Priya Sharma", "Arjun Das", "Sister Mary Thomas", "Rahul Verma"];

const residents: Resident[] = [
  { id: "r1", name: "Kamala Devi", age: 82, room: "101", allergies: "Penicillin", notes: "Type 2 diabetes. Needs help swallowing large tablets." },
  { id: "r2", name: "Ramesh Chandra Bose", age: 79, room: "102", allergies: "", notes: "Hypertension. Walks with a cane." },
  { id: "r3", name: "Anita Mukherjee", age: 85, room: "104", allergies: "Latex", notes: "Hypothyroidism. Give thyroid tablet on an empty stomach." },
  { id: "r4", name: "Joseph D'Souza", age: 88, room: "105", allergies: "Sulfa drugs", notes: "Early-stage Alzheimer's. Prefers medicine with warm water." },
  { id: "r5", name: "Lakshmi Iyer", age: 76, room: "201", allergies: "", notes: "Osteoporosis. Vegetarian diet." },
  { id: "r6", name: "Harbhajan Singh", age: 81, room: "203", allergies: "Aspirin", notes: "Heart failure. Monitor weight daily." },
  { id: "r7", name: "Meera Banerjee", age: 90, room: "204", allergies: "", notes: "On blood thinner — watch for bruising." },
  { id: "r8", name: "Prakash Rao", age: 74, room: "206", allergies: "Shellfish", notes: "Mild depression. Enjoys morning walks." },
];

const med = (
  id: string,
  residentId: string,
  name: string,
  dosage: string,
  time: string,
  instructions = "",
): Medication => ({ id, residentId, name, dosage, time, instructions, status: "pending" });

const medications: Medication[] = [
  med("m1", "r3", "Levothyroxine", "50 mcg tablet", "07:00", "Empty stomach, 30 min before breakfast"),
  med("m2", "r7", "Omeprazole", "20 mg capsule", "07:30", "Before breakfast"),
  med("m3", "r1", "Metformin", "500 mg tablet", "08:00", "With breakfast"),
  med("m4", "r2", "Amlodipine", "5 mg tablet", "08:00"),
  med("m5", "r6", "Furosemide", "40 mg tablet", "08:30", "Check weight first"),
  med("m6", "r5", "Vitamin D3", "1000 IU capsule", "09:00"),
  med("m7", "r8", "Sertraline", "50 mg tablet", "10:00"),
  med("m8", "r4", "Memantine", "10 mg tablet", "12:00"),
  med("m9", "r2", "Losartan", "50 mg tablet", "13:00"),
  med("m10", "r5", "Calcium Carbonate", "500 mg tablet", "13:00", "With lunch"),
  med("m11", "r1", "Paracetamol", "500 mg tablet", "14:00", "For knee pain"),
  med("m12", "r7", "Warfarin", "5 mg tablet", "18:00", "Same time every day"),
  med("m13", "r6", "Metoprolol", "25 mg tablet", "20:00"),
  med("m14", "r4", "Donepezil", "10 mg tablet", "21:00", "At bedtime"),
  med("m15", "r2", "Atorvastatin", "20 mg tablet", "21:00"),
  med("m16", "r1", "Insulin Glargine", "10 units injection", "22:00", "Check blood sugar first"),
];

/** Builds a realistic two-day history so the audit log is not empty on first open. */
function seedLogs(now: Date): LogEntry[] {
  const logs: LogEntry[] = [];
  const missedPlan: Record<number, string[]> = { 1: ["m11"], 2: ["m7", "m16"] };
  for (const daysAgo of [2, 1]) {
    medications.forEach((m, i) => {
      const r = residents.find((x) => x.id === m.residentId)!;
      const [h = 0, min = 0] = m.time.split(":").map(Number);
      const at = new Date(now);
      at.setDate(at.getDate() - daysAgo);
      at.setHours(h, min + ((i * 7) % 15), 0, 0);
      const missed = missedPlan[daysAgo]?.includes(m.id);
      logs.push({
        id: `seed_${daysAgo}_${m.id}`,
        timestamp: at.toISOString(),
        caregiver: STAFF[(i + daysAgo) % STAFF.length] ?? "Staff",
        action: missed ? "missed" : "administered",
        medicationId: m.id,
        residentId: r.id,
        residentName: r.name,
        room: r.room,
        medicationName: m.name,
        dosage: m.dosage,
        scheduledTime: m.time,
      });
    });
  }
  return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function buildSeed(now: Date): MedState {
  return {
    residents,
    medications,
    logs: seedLogs(now),
    caregiver: STAFF[0] ?? "",
    day: dayKey(now),
  };
}
