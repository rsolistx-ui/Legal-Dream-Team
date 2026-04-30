// Deadline tracking, mirroring 01_Matter/deadlines_TEMPLATE.md.

export type DeadlineStatus = "pending" | "filed" | "N/A" | "answered";

export interface Deadline {
  id: string;
  name: string;
  rule: string;
  date: string;
  status: DeadlineStatus;
  notes?: string;
}

export const DEFAULT_DEADLINES: Omit<Deadline, "id">[] = [
  {
    name: "Answer due",
    rule: "TRCP 502.5",
    date: "",
    status: "pending",
    notes: "By 10:00 a.m. of Monday following 14 days after service.",
  },
  {
    name: "Jury demand and fee",
    rule: "TRCP 504.1",
    date: "",
    status: "pending",
    notes: "Reasonable time before trial. Calendar 30 days pre trial as soft target.",
  },
  {
    name: "Section 18.001 counter affidavit",
    rule: "CPRC § 18.001(e)",
    date: "",
    status: "N/A",
    notes: "30 days from service of plaintiff's affidavit.",
  },
  {
    name: "Section 33.004 designation of responsible third party",
    rule: "CPRC § 33.004(a)",
    date: "",
    status: "N/A",
    notes: "60 days before trial unless leave granted.",
  },
  {
    name: "Discovery responses",
    rule: "TRCP 196 / 197 / 198 + leave order",
    date: "",
    status: "pending",
    notes: "30 days from service unless court orders otherwise.",
  },
  {
    name: "RFA deemed admitted date",
    rule: "TRCP 198.2",
    date: "",
    status: "pending",
    notes: "30 days from service.",
  },
  {
    name: "Trial date",
    rule: "Court setting",
    date: "",
    status: "pending",
  },
  {
    name: "Appeal perfection",
    rule: "TRCP 506.1",
    date: "",
    status: "N/A",
    notes: "21 days from judgment signed.",
  },
  {
    name: "Statute of limitations",
    rule: "CPRC § 16.003",
    date: "",
    status: "pending",
    notes: "Accident date plus two years.",
  },
];

export function urgencyClass(d: Deadline, today = new Date()): string {
  if (d.status !== "pending") return "bg-slate-900";
  if (!d.date) return "bg-slate-900";
  const target = new Date(d.date + "T00:00:00");
  if (isNaN(target.getTime())) return "bg-slate-900";
  const days = Math.floor(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 7) return "bg-red-950 border-l-4 border-red-500";
  if (days <= 21) return "bg-amber-950 border-l-4 border-amber-500";
  return "bg-emerald-950 border-l-4 border-emerald-700";
}

export function daysUntil(date: string): number | null {
  if (!date) return null;
  const target = new Date(date + "T00:00:00");
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}
