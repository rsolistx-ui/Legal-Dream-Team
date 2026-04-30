import { TIERS } from "./tiers";

export type Authority =
  | "chair"
  | "vote"
  | "advisory"
  | "hard-veto"
  | "cite-veto";

export interface Seat {
  id: number;
  name: string;
  shortName: string;
  tier: number;
  tierName: string;
  authority: Authority;
  contingent: boolean;
  activationCondition?: string;
  roleSummary: string;
  charterMarkdown: string;
  // Keywords used by the convene auto-selector.
  keywords: string[];
}

// Load all charter markdown files at build time.
// Vite's import.meta.glob supports query: '?raw' to import as raw text.
const charterModules = import.meta.glob("../../../00_Panel/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function charterFor(seatId: number): string {
  const padded = String(seatId).padStart(2, "0");
  const match = Object.entries(charterModules).find(([path]) =>
    path.includes(`/${padded}_`),
  );
  if (!match) {
    return `# Seat ${seatId}\n\nCharter not found. Check 00_Panel/ for the matching file.`;
  }
  return match[1];
}

interface SeatBase {
  id: number;
  name: string;
  shortName: string;
  authority: Authority;
  contingent: boolean;
  activationCondition?: string;
  roleSummary: string;
  keywords: string[];
}

const SEAT_BASE: SeatBase[] = [
  {
    id: 1,
    name: "The Lead Counsel (Chair)",
    shortName: "Lead Counsel",
    authority: "chair",
    contingent: false,
    roleSummary: "Chairs the panel. Owns case theory and final synthesis.",
    keywords: ["theory", "strategy", "synthesis", "lead", "chair"],
  },
  {
    id: 2,
    name: "Texas Tort Defense Attorney",
    shortName: "Tort Defense",
    authority: "vote",
    contingent: false,
    roleSummary:
      "Negligence elements, affirmative defenses, proportionate responsibility under CPRC Ch. 33.",
    keywords: [
      "negligence",
      "tort",
      "duty",
      "breach",
      "proximate",
      "comparative",
      "proportionate",
      "33.001",
      "affirmative defense",
    ],
  },
  {
    id: 3,
    name: "Cross Examination and Trial Tactics Counsel",
    shortName: "Cross Examination",
    authority: "vote",
    contingent: false,
    roleSummary:
      "Impeachment, prior inconsistent statements, attacks on plaintiff credibility.",
    keywords: [
      "cross",
      "impeach",
      "credibility",
      "voir dire",
      "trial",
      "tactics",
      "examination",
    ],
  },
  {
    id: 4,
    name: "Justice Court Procedure Specialist",
    shortName: "JP Procedure",
    authority: "vote",
    contingent: false,
    roleSummary:
      "TRCP 500 to 510 mastery. Deadlines, informal evidence rules, jury fee.",
    keywords: [
      "trcp 500",
      "trcp 502",
      "trcp 504",
      "trcp 506",
      "justice court",
      "j.p.",
      "jp",
      "procedure",
      "rule",
    ],
  },
  {
    id: 5,
    name: "Pleadings and Special Exceptions Counsel",
    shortName: "Pleadings",
    authority: "vote",
    contingent: false,
    roleSummary:
      "Answer, general denial, special denials, plea to jurisdiction, motion to transfer venue.",
    keywords: [
      "answer",
      "denial",
      "plea",
      "jurisdiction",
      "venue",
      "special exception",
      "pleading",
      "continuance",
    ],
  },
  {
    id: 6,
    name: "Discovery Strategist",
    shortName: "Discovery",
    authority: "vote",
    contingent: false,
    roleSummary:
      "TRCP 500.9 leave of court discovery, RFAs that bind, motions to compel and quash.",
    keywords: [
      "discovery",
      "rfa",
      "interrogatory",
      "rfp",
      "request",
      "disclosure",
      "compel",
      "quash",
      "spoliation",
    ],
  },
  {
    id: 7,
    name: "Appeals and De Novo Specialist",
    shortName: "Appeals",
    authority: "vote",
    contingent: false,
    roleSummary:
      "TRCP 506 perfection, appeal bond, full retrial in County Court at Law.",
    keywords: [
      "appeal",
      "de novo",
      "perfection",
      "bond",
      "county court",
      "trcp 506",
      "supersedeas",
    ],
  },
  {
    id: 8,
    name: "Evidence and Objections Specialist",
    shortName: "Evidence",
    authority: "vote",
    contingent: false,
    roleSummary:
      "TRE objections, hearsay, police report bar under Tex. Transp. Code § 550.065, authentication.",
    keywords: [
      "evidence",
      "objection",
      "hearsay",
      "police report",
      "550.065",
      "authentication",
      "tre 401",
      "tre 403",
      "tre 802",
      "tre 901",
      "exhibit",
    ],
  },
  {
    id: 9,
    name: "Texas Auto Damages Specialist",
    shortName: "Auto Damages",
    authority: "vote",
    contingent: false,
    roleSummary:
      "Pasadena State Bank measure of damages, FMV vs cost of repair, diminished value, mitigation.",
    keywords: [
      "damages",
      "fmv",
      "fair market value",
      "diminished value",
      "repair",
      "loss of use",
      "rental",
      "mitigation",
      "exemplary",
      "punitive",
    ],
  },
  {
    id: 10,
    name: "Expert Witness Coordinator",
    shortName: "Experts",
    authority: "vote",
    contingent: false,
    roleSummary:
      "Reconstructionists, ASE appraisers, treating physicians, Daubert and Robinson challenges.",
    keywords: [
      "expert",
      "reconstruction",
      "appraiser",
      "physician",
      "daubert",
      "robinson",
      "qualifications",
    ],
  },
  {
    id: 11,
    name: "Forensic and Records Investigator",
    shortName: "Investigator",
    authority: "vote",
    contingent: false,
    roleSummary:
      "CARFAX, dashcam preservation, EDR data, social media discovery on the plaintiff.",
    keywords: [
      "carfax",
      "dashcam",
      "edr",
      "telematics",
      "social media",
      "preservation",
      "investigator",
      "scene photos",
    ],
  },
  {
    id: 12,
    name: "Settlement and Mediation Counsel",
    shortName: "Settlement",
    authority: "vote",
    contingent: false,
    roleSummary:
      "TRCP 11 agreements, full release language, structured payment, voluntary mediation.",
    keywords: [
      "settle",
      "mediation",
      "release",
      "rule 11",
      "demand",
      "offer",
      "structured",
      "confidential",
    ],
  },
  {
    id: 13,
    name: "Insurance and Subrogation Counsel",
    shortName: "Insurance",
    authority: "vote",
    contingent: false,
    roleSummary:
      "Stowers, real party in interest objections under TRCP 28, made whole doctrine, policy limits.",
    keywords: [
      "insurance",
      "carrier",
      "policy",
      "subrogation",
      "stowers",
      "real party",
      "made whole",
      "limits",
      "adjuster",
    ],
  },
  {
    id: 14,
    name: "Counterclaim and Setoff Counsel",
    shortName: "Counterclaim",
    authority: "vote",
    contingent: false,
    roleSummary:
      "Compulsory counterclaims, third party defendants, responsible third party designations under CPRC § 33.004.",
    keywords: [
      "counterclaim",
      "setoff",
      "third party",
      "33.004",
      "designation",
      "responsible third party",
      "rtp",
    ],
  },
  {
    id: 15,
    name: "Court Deadlines and Default Judgment Watchdog",
    shortName: "Watchdog",
    authority: "hard-veto",
    contingent: false,
    roleSummary:
      "Owns every deadline. Halts the panel on any timing risk. Default judgment defense.",
    keywords: [
      "deadline",
      "answer due",
      "default",
      "calendar",
      "trcp 502",
      "trcp 503",
      "perfection",
      "watchdog",
    ],
  },
  {
    id: 16,
    name: "Statute of Limitations Sentinel",
    shortName: "SOL Sentinel",
    authority: "hard-veto",
    contingent: false,
    roleSummary:
      "CPRC § 16.003 two year limit, discovery rule, tolling, relation back of amendments.",
    keywords: [
      "statute of limitations",
      "limitations",
      "16.003",
      "tolling",
      "relation back",
      "discovery rule",
      "sol",
    ],
  },
  {
    id: 17,
    name: "Ethics and Sanctions Hawk",
    shortName: "Ethics Hawk",
    authority: "hard-veto",
    contingent: false,
    roleSummary:
      "TRCP 13, CPRC Ch. 9 and Ch. 10, candor under Tex. Disc. R. Prof. Cond. 3.03.",
    keywords: [
      "ethics",
      "sanctions",
      "trcp 13",
      "frivolous",
      "candor",
      "rule 3.03",
      "chapter 10",
      "chapter 9",
    ],
  },
  {
    id: 18,
    name: "Devil's Advocate / Plaintiff's POV",
    shortName: "Devil's Advocate",
    authority: "advisory",
    contingent: false,
    roleSummary:
      "Red teams every defense theory by reasoning as plaintiff's counsel would.",
    keywords: ["plaintiff", "red team", "weakness", "counter", "challenge"],
  },
  {
    id: 19,
    name: "Client Counselor and Witness Prep",
    shortName: "Client Counselor",
    authority: "advisory",
    contingent: false,
    roleSummary:
      "Defendant testimony, demeanor, deposition prep, emotional regulation.",
    keywords: [
      "client",
      "deposition prep",
      "testimony",
      "demeanor",
      "witness prep",
      "fear",
      "stress",
    ],
  },
  {
    id: 20,
    name: "Senior Paralegal: Case Law Research and Precedents",
    shortName: "Paralegal",
    authority: "cite-veto",
    contingent: false,
    roleSummary:
      "Precedent engine. Pulls and KeyCites Texas appellate authority on every issue, builds precedent chains (Supreme Court, controlling court of appeals, most recent in district, contrary authority), and blocks any deliverable with an unverified or stale cite.",
    keywords: [
      "research",
      "case law",
      "caselaw",
      "citation",
      "cite",
      "verify",
      "westlaw",
      "lexis",
      "fastcase",
      "casetext",
      "bloomberg",
      "precedent",
      "precedents",
      "binder",
      "keycite",
      "shepardize",
      "stare decisis",
      "court of appeals",
      "supreme court",
      "split",
      "memorandum opinion",
      "trap 47",
      "pattern jury charge",
      "pjc",
      "bluebook",
    ],
  },
  {
    id: 21,
    name: "Criminal Defense Parallel Track Counsel",
    shortName: "Criminal Parallel Track",
    authority: "hard-veto",
    contingent: true,
    activationCondition:
      "Activates when a criminal touchpoint emerges: DWI, leaving the scene, reckless driving, intoxication, citation, DA inquiry, indictment, or grand jury subpoena. On standby otherwise.",
    roleSummary:
      "Screens every civil action for criminal exposure. Hard veto when activated.",
    keywords: [
      "criminal",
      "dwi",
      "intoxication",
      "leaving the scene",
      "reckless",
      "fifth amendment",
      "abate",
      "stay",
      "penal code",
      "citation",
      "indictment",
    ],
  },
  {
    id: 22,
    name: "Post Judgment Collection Defense Counsel",
    shortName: "Collection Defense",
    authority: "hard-veto",
    contingent: true,
    activationCondition:
      "Activates only on entry of an adverse judgment. On standby otherwise. When live, owns Texas exemption law, garnishment defense, supersedeas, and dormancy/revival tracking.",
    roleSummary:
      "Activates on adverse judgment. Texas exemption law, supersedeas, garnishment defense.",
    keywords: [
      "judgment",
      "collection",
      "garnishment",
      "turnover",
      "exemption",
      "homestead",
      "supersedeas",
      "abstract of judgment",
      "dormancy",
      "bankruptcy",
    ],
  },
];

function tierFor(seatId: number) {
  const t = TIERS.find((x) => x.seatIds.includes(seatId));
  if (!t) throw new Error(`No tier for seat ${seatId}`);
  return t;
}

export const SEATS: Seat[] = SEAT_BASE.map((s) => {
  const t = tierFor(s.id);
  return {
    ...s,
    tier: t.id,
    tierName: t.name,
    charterMarkdown: charterFor(s.id),
  };
});

export function getSeat(id: number): Seat | undefined {
  return SEATS.find((s) => s.id === id);
}

export function getSeatsByTier(tierId: number): Seat[] {
  return SEATS.filter((s) => s.tier === tierId);
}
