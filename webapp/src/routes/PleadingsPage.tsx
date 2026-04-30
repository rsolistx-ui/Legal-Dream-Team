import { getItem } from "../lib/storage";
import { CaseFile, EMPTY_CASE_FILE, computeAnswerDue } from "../lib/caseFile";

const folderModules = import.meta.glob("../../../*/README.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function pleadingsReadme(): string | null {
  const match = Object.entries(folderModules).find(([path]) =>
    path.includes("/02_Pleadings/README.md"),
  );
  return match ? match[1] : null;
}

function answerSkeleton(cf: CaseFile): string {
  const answerDue =
    cf.answerDueDateOverride ||
    computeAnswerDue(cf.dateServed, cf.methodOfService);
  const heading = cf.causeNumber || "[Cause No. _____________]";
  const court = cf.court || "[Justice Court, Precinct __, _____ County, Texas]";
  const plaintiff = cf.plaintiff || "[Plaintiff name]";
  const defendant = cf.defendant || "[Defendant name]";
  return `FOR PRODUCTION

CAUSE NO. ${heading}

${plaintiff.toUpperCase()},
    Plaintiff,

v.

${defendant.toUpperCase()},
    Defendant.

IN THE ${court.toUpperCase()}

DEFENDANT'S ORIGINAL ANSWER

TO THE HONORABLE COURT:

Defendant ${defendant} files this Original Answer to Plaintiff's Petition under Texas Rules of Civil Procedure 500 to 510, and respectfully shows:

I. GENERAL DENIAL

Defendant generally denies each and every material allegation contained in Plaintiff's Petition and demands strict proof thereof by a preponderance of the evidence at trial, as permitted by Texas Rule of Civil Procedure 92.

II. AFFIRMATIVE DEFENSES (preserved)

1. Proportionate responsibility under Texas Civil Practice and Remedies Code Chapter 33, including the bar to recovery under § 33.001 if Plaintiff's percentage of responsibility is greater than 50 percent.
2. Failure to mitigate damages.
3. Sudden emergency / unavoidable accident.
4. Statute of limitations under Texas Civil Practice and Remedies Code § 16.003 (preserved if amendment alleges new claims).
5. Designation of responsible third party under Texas Civil Practice and Remedies Code § 33.004 is reserved.
6. The police report (if any) is not admissible as evidence at trial under Texas Transportation Code § 550.065.
7. All defenses and objections under the Texas Rules of Civil Procedure and Texas Rules of Evidence are reserved.

III. JURY DEMAND (if applicable)

[If jury trial is desired, request and pay the jury fee under Texas Rule of Civil Procedure 504.1.]

IV. PRAYER

Defendant prays that Plaintiff take nothing, that all costs be assessed against Plaintiff, and for such other and further relief at law or in equity to which Defendant may be justly entitled.

Respectfully submitted,

____________________________________
${defendant}, Defendant pro se
[Address]
[Phone]
[Email]

CERTIFICATE OF SERVICE

I certify that on [date] a true and correct copy of the foregoing was served on counsel for Plaintiff at the address of record by [method of service].

____________________________________
${defendant}

Filed by: ${defendant}
Answer due (TRCP 502.5): ${answerDue || "[set service date in Case File]"}
`;
}

export function PleadingsPage() {
  const cf = getItem<CaseFile>("caseFile", EMPTY_CASE_FILE);
  const readme = pleadingsReadme();

  function downloadAnswer() {
    const text = answerSkeleton(cf);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "answer_skeleton.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Pleadings</h1>
        <p className="text-sm text-slate-400">
          Owner: Seat 05 Pleadings and Special Exceptions Counsel. Full editor
          not built yet. Use the skeleton button to generate a starting point,
          then iterate in your editor.
        </p>
      </div>

      <section className="panel-card space-y-3">
        <h2 className="text-lg font-semibold">Generate Answer skeleton</h2>
        <p className="text-sm text-slate-300">
          Produces a TRCP 92 general denial with affirmative defenses preserved
          (CPRC Ch. 33 proportionate responsibility, mitigation, sudden
          emergency, CPRC § 16.003 limitations, CPRC § 33.004 RTP designation
          reserved, Tex. Transp. Code § 550.065 police report bar).
        </p>
        <button className="btn btn-primary" onClick={downloadAnswer}>
          Download answer_skeleton.txt
        </button>
      </section>

      {readme && (
        <section className="panel-card">
          <h2 className="text-sm font-semibold mb-2">02_Pleadings/README.md</h2>
          <pre className="text-xs whitespace-pre-wrap font-mono text-slate-300 max-h-[60vh] overflow-y-auto">
            {readme}
          </pre>
        </section>
      )}
    </div>
  );
}
