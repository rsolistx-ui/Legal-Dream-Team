import type { Seat } from "../data/seats";
import type { CaseFile } from "./caseFile";
import { summarizeCaseFile } from "./caseFile";
import { SEATS } from "../data/seats";

const PROTOCOL = `Run the standard convening protocol from master_invocation.md:

1. Lead Counsel routes the question and identifies which tiers and seats are implicated.
2. Each implicated seat speaks in tier order with: (a) the issue from their lens, (b) the controlling Texas authority by rule or section, (c) the recommended action, (d) the risk if we do not act.
3. Devil's Advocate (Seat 18) red teams the consensus position.
4. Senior Paralegal (Seat 20) verifies every cited authority and flags unsupported propositions.
5. Hard veto seats (Watchdog 15, SOL Sentinel 16, Ethics Hawk 17, Criminal Parallel Track 21 when active, Post Judgment Collection Defense 22 when active) sign off last.
6. Lead Counsel synthesizes the final recommendation with a written gap check: "What would the best Texas defense firm do that this output does not?"

Apply project rules: no em dashes, no fabricated citations, defendant orientation, Texas authority by rule or section number.

Output format exactly:

ISSUE
[one sentence]

SHORT ANSWER
[the recommendation]

SEAT BY SEAT ANALYSIS
[Seat name]: [analysis with cited Texas authority]
...

DEVIL'S ADVOCATE RED TEAM
[plaintiff's likely counter and weakness]

COMPLIANCE SIGN OFF
Watchdog: [pass / halt + cure]
SOL Sentinel: [pass / halt + cure]
Ethics Hawk: [pass / halt + cure]
Criminal Parallel Track (21): [N/A standby / pass / halt + cure]
Post Judgment Collection Defense (22): [N/A standby / pass / halt + cure]
Paralegal verification: [pass / cite check log]

FINAL RECOMMENDATION
[decision and next action with deadline]

GAP CHECK
[what a top firm would still do that this output does not]`;

const SYSTEM_BRIEF = `You are the Legal Dream Team, a 22 seat Texas civil defense panel chaired by Lead Counsel for an active Justice Court (J.P. Court) auto matter where the user is the defendant. The case is governed by TRCP Part V (Rules 500 to 510), CPRC Chapter 33, CPRC § 16.003, Tex. Transp. Code § 550.065, and the Texas Rules of Evidence as applied in J.P. Court under TRCP 500.3(e).

Hard project rules:
- No em dashes anywhere in output.
- Cite every legal proposition by Texas rule or statute number (TRCP, TRE, CPRC, Tex. Transp. Code, etc.). Federal authority only when no Texas rule controls.
- No fabricated case citations. If you do not have a verified Texas appellate citation, do not invent one. Mark unsupported propositions for the Senior Paralegal to verify.
- Defendant orientation. Plaintiff is opposition.
- Watchdog (Seat 15), SOL Sentinel (16), Ethics Hawk (17), and (when activated) Criminal Parallel Track (21) and Post Judgment Collection Defense (22) hold hard veto in their domain.

You will be given:
1. The seats convened for this question, with each seat's full charter text.
2. The current matter snapshot from the user's case file.
3. The question, draft, or decision to deliberate.

Speak in tier order. Synthesize as Lead Counsel at the end.`;

export interface BuildPromptOptions {
  question: string;
  selectedSeats: Seat[];
  caseFile: CaseFile;
}

export function buildConveningPrompt({
  question,
  selectedSeats,
  caseFile,
}: BuildPromptOptions): { system: string; user: string } {
  const ordered = [...selectedSeats].sort((a, b) => a.id - b.id);
  const seatBlocks = ordered
    .map(
      (s) =>
        `### Seat ${String(s.id).padStart(2, "0")}: ${s.name}\nTier ${s.tier}: ${s.tierName}\nAuthority: ${s.authority}${s.contingent ? " (contingent)" : ""}\n\n${s.charterMarkdown}`,
    )
    .join("\n\n---\n\n");

  const matterSnapshot = summarizeCaseFile(caseFile) || "[Case file not yet filled in. Note this and proceed with general guidance.]";

  const user = `## Matter snapshot

${matterSnapshot}

## Convened seats

${seatBlocks}

## Question

${question}

## Protocol

${PROTOCOL}`;

  return { system: SYSTEM_BRIEF, user };
}

// Auto select seats based on simple keyword matching against the question.
// Always include Lead Counsel (1), Watchdog (15), Ethics Hawk (17), and Senior Paralegal (20).
export function autoSelectSeats(question: string): number[] {
  const q = question.toLowerCase();
  const required = new Set<number>([1, 15, 17, 20]);
  // SOL Sentinel triggers if any limitations / time bar lingo appears.
  if (
    /limitations|time barred|tolling|relation back|sol/i.test(q) ||
    /16\.003/.test(q)
  ) {
    required.add(16);
  } else {
    // Always include SOL Sentinel for defensive matters per master invocation.
    required.add(16);
  }
  SEATS.forEach((s) => {
    if (s.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      required.add(s.id);
    }
  });
  // Activate Devil's Advocate by default for full convenings.
  required.add(18);
  return Array.from(required).sort((a, b) => a - b);
}
