import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItem, subscribe } from "../lib/storage";
import {
  CaseFile,
  EMPTY_CASE_FILE,
  computeAnswerDue,
  summarizeCaseFile,
} from "../lib/caseFile";
import { Deadline, daysUntil, urgencyClass } from "../lib/deadlines";
import { SEATS } from "../data/seats";

export function Dashboard() {
  const [caseFile, setCaseFile] = useState<CaseFile>(() =>
    getItem("caseFile", EMPTY_CASE_FILE),
  );
  const [deadlines, setDeadlines] = useState<Deadline[]>(() =>
    getItem<Deadline[]>("deadlines", []),
  );

  useEffect(() => {
    const u1 = subscribe<CaseFile>("caseFile", (v) =>
      setCaseFile(v ?? EMPTY_CASE_FILE),
    );
    const u2 = subscribe<Deadline[]>("deadlines", (v) =>
      setDeadlines(v ?? []),
    );
    return () => {
      u1();
      u2();
    };
  }, []);

  const summary = summarizeCaseFile(caseFile);
  const answerDue =
    caseFile.answerDueDateOverride ||
    computeAnswerDue(caseFile.dateServed, caseFile.methodOfService);

  const upcoming = [...deadlines]
    .filter((d) => d.status === "pending" && d.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const standby = SEATS.filter((s) => s.contingent);
  const active = SEATS.filter((s) => !s.contingent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400">
          ATTORNEY WORK PRODUCT (SELF PREPARED). Texas civil defense, J.P. Court
          matter.
        </p>
      </div>

      <section className="panel-card">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Matter snapshot</h2>
          <Link className="text-xs text-indigo-400 hover:underline" to="/case-file">
            Edit case file
          </Link>
        </div>
        {summary ? (
          <div className="text-sm text-slate-300 leading-relaxed">{summary}</div>
        ) : (
          <div className="text-sm text-slate-500">
            Case file not yet filled in. Open Case File to begin.
          </div>
        )}
        {answerDue && (
          <div className="mt-3 text-sm">
            <span className="text-slate-400">Answer due (TRCP 502.5): </span>
            <span className="font-mono text-amber-300">
              {answerDue} by 10:00 a.m.
            </span>
          </div>
        )}
      </section>

      <section className="panel-card">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Next 3 deadlines</h2>
          <Link className="text-xs text-indigo-400 hover:underline" to="/deadlines">
            All deadlines
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-sm text-slate-500">
            No pending deadlines on the calendar. Add some on the Deadlines page.
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((d) => {
              const days = daysUntil(d.date);
              return (
                <li
                  key={d.id}
                  className={`px-3 py-2 rounded-sm ${urgencyClass(d)}`}
                >
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-100">
                      {d.name}
                    </span>
                    <span className="text-xs text-slate-400">{d.rule}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {d.date} . {days !== null ? `${days} day(s) out` : ""}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="panel-card">
        <h2 className="text-lg font-semibold mb-3">Panel status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Active
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {active.length}
            </div>
            <div className="text-xs text-slate-400">seats always on</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Standby
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {standby.length}
            </div>
            <div className="text-xs text-slate-400">contingent seats</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-slate-400">
          Standby seats: {standby.map((s) => s.shortName).join(", ")}
        </div>
      </section>

      <section className="panel-card">
        <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link to="/pleadings" className="btn">
            Draft Answer
          </Link>
          <Link to="/convene" className="btn btn-primary">
            Convene Panel
          </Link>
          <Link to="/evidence" className="btn">
            Add Evidence
          </Link>
          <Link to="/settlement" className="btn">
            Run Settlement Math
          </Link>
        </div>
      </section>
    </div>
  );
}
