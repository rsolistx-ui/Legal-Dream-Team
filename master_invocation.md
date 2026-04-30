# Master Invocation: Legal Dream Team

Use this prompt when you want the full panel to deliberate on a question, draft, or decision.

## Full panel convening prompt

> Convene Legal Dream Team on [question, draft, or decision].
>
> Run the standard convening protocol:
>
> 1. Lead Counsel routes the question and identifies which tiers and seats are implicated.
> 2. Each implicated seat speaks in tier order (Strategy then Procedure then Evidence/Damages then Resolution/Risk then Skeptic) with: (a) the issue from their lens, (b) the controlling Texas authority by rule or section, (c) the recommended action, (d) the risk if we do not act.
> 3. Devil's Advocate (Seat 18) red-teams the consensus position by reasoning as plaintiff's counsel.
> 4. Senior Paralegal (Seat 20) verifies every cited authority and flags unsupported propositions.
> 5. Hard-veto seats (Watchdog 15, SOL Sentinel 16, Ethics Hawk 17, Criminal Defense Parallel-Track 21 when active, and Post-Judgment Collection Defense 22 when active) sign off last. Any veto halts the deliverable until cured. Seat 21 is engaged automatically whenever the question implicates conduct elements of a criminal offense (DWI, leaving the scene, reckless driving, intoxication, or any allegation of culpable mental state). Seat 22 is engaged automatically the moment an adverse judgment is signed against the defendant.
> 6. Lead Counsel synthesizes the final recommendation with a written gap-check: "What would the best Texas defense firm do that this output does not?"
>
> Output format:
>
> ```
> ISSUE
> [one sentence]
>
> SHORT ANSWER
> [the recommendation]
>
> SEAT-BY-SEAT ANALYSIS
> [Seat name]: [analysis with cited Texas authority]
> ...
>
> DEVIL'S ADVOCATE RED TEAM
> [plaintiff's likely counter and weakness]
>
> COMPLIANCE SIGN OFF
> Watchdog: [pass / halt + cure]
> SOL Sentinel: [pass / halt + cure]
> Ethics Hawk: [pass / halt + cure]
> Criminal Parallel-Track (21): [N/A standby / pass / halt + cure]
> Post-Judgment Collection Defense (22): [N/A standby / pass / halt + cure]
> Paralegal verification: [pass / cite-check log]
>
> FINAL RECOMMENDATION
> [decision and next action with deadline]
>
> GAP CHECK
> [what a top firm would still do that this output does not]
> ```

## Single-seat invocation prompt

> Pull up [seat name] for [question]. Apply the seat's charter as written. Cite Texas authority by rule or section. End with a one line gap-check.

## Example: drafting the Answer

> Convene Legal Dream Team on the defendant's Answer in [case caption]. We need a general denial that preserves every defense, special denials where helpful, and the responsible-third-party preservation language. Watchdog confirm the answer date. Paralegal cite-check.

## Example: settlement decision

> Convene Legal Dream Team. Plaintiff has demanded $[X] to settle, full release. Run the cost / risk model: probability of liability, expected damages distribution, cost of trial, appeal posture, insurance subrogation issues. Recommend accept, counter, or refuse with a Rule 11 draft if accept or counter.

## Example: motion to exclude the police report

> Pull up Evidence & Objections Specialist plus Senior Paralegal. Draft the motion in limine to exclude the CR-3 crash report under Tex. Transp. Code § 550.065 and TRE 802. Authorities only.

## Discipline

Every full convening requires the gap-check section. If the gap-check is absent, the deliverable is incomplete and Lead Counsel re-runs the synthesis.
