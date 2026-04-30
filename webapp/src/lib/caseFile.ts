// Case file shape and helpers, mirroring 01_Matter/case_file_TEMPLATE.md.

export interface PlaintiffCounsel {
  name: string;
  firm: string;
  phone: string;
  email: string;
  barNumber: string;
}

export interface ClaimRow {
  id: string;
  claim: string;
  elements: string;
  authority: string;
}

export type DamageType =
  | "property"
  | "diminished value"
  | "loss of use"
  | "medical"
  | "other";

export interface DamageRow {
  id: string;
  element: string;
  amount: string;
  type: DamageType;
  status: string;
}

export interface CaseFile {
  court: string;
  causeNumber: string;
  plaintiff: string;
  defendant: string;
  plaintiffCounsel: PlaintiffCounsel;
  dateOfAccident: string;
  dateSuitFiled: string;
  dateServed: string;
  methodOfService: "personal" | "substituted" | "by mail" | "";
  answerDueDateOverride: string;
  trialSetting: string;
  juryDemand: {
    filed: boolean;
    date: string;
    feePaid: boolean;
  };
  claims: ClaimRow[];
  damages: DamageRow[];
  factsSnapshot: string;
  strongestFacts: string[];
  worstFacts: string[];
  insurance: {
    defendantCarrier: string;
    defendantPolicy: string;
    defendantLimits: string;
    defendantClaim: string;
    defendantAdjuster: string;
    plaintiffCarrierKnown: string;
    subrogationPosture: string;
  };
  lastUpdated: string;
}

export const EMPTY_CASE_FILE: CaseFile = {
  court: "",
  causeNumber: "",
  plaintiff: "",
  defendant: "",
  plaintiffCounsel: { name: "", firm: "", phone: "", email: "", barNumber: "" },
  dateOfAccident: "",
  dateSuitFiled: "",
  dateServed: "",
  methodOfService: "",
  answerDueDateOverride: "",
  trialSetting: "",
  juryDemand: { filed: false, date: "", feePaid: false },
  claims: [],
  damages: [],
  factsSnapshot: "",
  strongestFacts: [],
  worstFacts: [],
  insurance: {
    defendantCarrier: "",
    defendantPolicy: "",
    defendantLimits: "",
    defendantClaim: "",
    defendantAdjuster: "",
    plaintiffCarrierKnown: "",
    subrogationPosture: "",
  },
  lastUpdated: "",
};

// Compute the J.P. Court answer due date per TRCP 502.5:
// "by 10:00 a.m. of the Monday following the expiration of 14 days after service"
// for personal service. Treat substituted and by mail as personal for first pass;
// the user can override.
export function computeAnswerDue(
  dateServed: string,
  method: string,
): string {
  if (!dateServed) return "";
  const d = new Date(dateServed + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  // 14 days after service
  d.setDate(d.getDate() + 14);
  // Following Monday
  const day = d.getDay(); // 0 Sun, 1 Mon, ...
  let add: number;
  if (day === 0) add = 1;
  else if (day === 1) add = 7;
  else add = 8 - day;
  d.setDate(d.getDate() + add);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  void method;
  return `${yyyy}-${mm}-${dd}`;
}

export function caseFileToMarkdown(cf: CaseFile): string {
  const lines: string[] = [];
  lines.push("# Case File", "");
  lines.push("**ATTORNEY WORK PRODUCT (SELF PREPARED) / NOT FOR DISCLOSURE**", "");
  if (cf.lastUpdated) lines.push(`Last updated: ${cf.lastUpdated}`, "");
  lines.push("Owner: Seat 01 Lead Counsel", "");
  lines.push("## Caption", "");
  lines.push("| Field | Value |", "| ----- | ----- |");
  lines.push(`| Court | ${cf.court} |`);
  lines.push(`| Cause number | ${cf.causeNumber} |`);
  lines.push(`| Plaintiff | ${cf.plaintiff} |`);
  lines.push(`| Defendant | ${cf.defendant} |`);
  const pc = cf.plaintiffCounsel;
  lines.push(
    `| Plaintiff's counsel | ${pc.name}, ${pc.firm}, ${pc.phone}, ${pc.email}, bar # ${pc.barNumber} |`,
  );
  lines.push(`| Date of accident | ${cf.dateOfAccident} |`);
  lines.push(`| Date suit filed | ${cf.dateSuitFiled} |`);
  lines.push(`| Date served on defendant | ${cf.dateServed} |`);
  lines.push(`| Method of service | ${cf.methodOfService} |`);
  const due =
    cf.answerDueDateOverride ||
    computeAnswerDue(cf.dateServed, cf.methodOfService);
  lines.push(`| Answer due date | ${due ? due + " by 10:00 a.m." : ""} |`);
  lines.push(`| Trial setting | ${cf.trialSetting} |`);
  lines.push(
    `| Jury demand filed by defendant? | ${cf.juryDemand.filed ? "Y" : "N"}, ${cf.juryDemand.date}, fee paid: ${cf.juryDemand.feePaid ? "Y" : "N"} |`,
  );
  lines.push("", "## Claims pleaded", "");
  if (cf.claims.length === 0) {
    lines.push("[None recorded]");
  } else {
    cf.claims.forEach((c) => {
      lines.push(`- **${c.claim}.** Elements: ${c.elements}. Authority: ${c.authority}.`);
    });
  }
  lines.push("", "## Damages claimed", "");
  lines.push(
    "| Element | Amount claimed | Type | Status |",
    "| ------- | -------------- | ---- | ------ |",
  );
  cf.damages.forEach((d) => {
    lines.push(`| ${d.element} | ${d.amount} | ${d.type} | ${d.status} |`);
  });
  lines.push("", "## Defendant's snapshot of facts", "", cf.factsSnapshot || "");
  lines.push("", "## Strongest defense facts", "");
  cf.strongestFacts.forEach((f) => lines.push(`- ${f}`));
  lines.push("", "## Worst defense facts", "");
  cf.worstFacts.forEach((f) => lines.push(`- ${f}`));
  lines.push("", "## Insurance status", "");
  const ins = cf.insurance;
  lines.push(
    `- Defendant carrier: ${ins.defendantCarrier}, policy ${ins.defendantPolicy}, limits ${ins.defendantLimits}, claim ${ins.defendantClaim}, adjuster ${ins.defendantAdjuster}`,
  );
  lines.push(
    `- Plaintiff carrier known: ${ins.plaintiffCarrierKnown}; subrogation posture: ${ins.subrogationPosture}`,
  );
  return lines.join("\n");
}

export function summarizeCaseFile(cf: CaseFile): string {
  const parts: string[] = [];
  if (cf.court) parts.push(`Court: ${cf.court}`);
  if (cf.causeNumber) parts.push(`Cause No. ${cf.causeNumber}`);
  if (cf.plaintiff) parts.push(`Plaintiff: ${cf.plaintiff}`);
  if (cf.defendant) parts.push(`Defendant: ${cf.defendant}`);
  if (cf.dateOfAccident) parts.push(`Accident: ${cf.dateOfAccident}`);
  if (cf.dateServed) parts.push(`Served: ${cf.dateServed}`);
  const due =
    cf.answerDueDateOverride ||
    computeAnswerDue(cf.dateServed, cf.methodOfService);
  if (due) parts.push(`Answer due: ${due}`);
  if (cf.trialSetting) parts.push(`Trial: ${cf.trialSetting}`);
  return parts.join(" | ");
}
