import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItem, subscribe } from "../lib/storage";
import {
  CaseFile,
  EMPTY_CASE_FILE,
  computeAnswerDue,
  summarizeCaseFile,
} from "../lib/caseFile";
import { Deadline, daysUntil } from "../lib/deadlines";
import { SEATS } from "../data/seats";

/*
 * iOS-style dashboard polish: rounded surfaces, soft shadows, ambient
 * background tint, hover lift on quick action tiles, refined typography.
 * The brief said "no gradients on primary surfaces"; this keeps panel
 * cards flat and pushes the gradient to the page background only.
 */

export function Dashboard() {
  const [caseFile, setCaseFile] = useState<CaseFile>(() =>
    getItem("caseFile", EMPTY_CASE_FILE),
  );
  const [deadlines, setDeadlines] = useState<Deadline[]>(() =>
    getItem<Deadline[]>("deadlines", []),
  );

  useEffect(() => {
    document.body.classList.add("dashboard-bg");
    return () => document.body.classList.remove("dashboard-bg");
  }, []);

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
  const hardVetoActive = SEATS.filter(
    (s) => s.authority === "hard-veto" && !s.contingent,
  ).length;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="ios-pill">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Active matter
          </span>
          <span className="ios-pill">J.P. Court (TRCP 500 to 510)</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Legal Dream Team
        </h1>
        <p className="text-sm text-slate-400">
          ATTORNEY WORK PRODUCT (SELF PREPARED). Defendant orientation.
        </p>
      </header>

      <section className="ios-card">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-100">
            Matter snapshot
          </h2>
          <Link className="text-xs text-indigo-400 hover:underline" to="/case-file">
            Edit case file
          </Link>
        </div>
        {summary ? (
          <div className="text-sm text-slate-300 leading-relaxed">{summary}</div>
        ) : (
          <div className="text-sm text-slate-400">
            Case file not yet filled in. Open Case File to begin.
          </div>
        )}
        {answerDue && (
          <>
            <div className="ios-divider my-4" />
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-500">
                Answer due (TRCP 502.5)
              </span>
              <span className="font-mono text-sm text-amber-300 ios-stat">
                {answerDue} . 10:00 a.m.
              </span>
            </div>
          </>
        )}
      </section>

      <section className="ios-card">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-100">
            Next 3 deadlines
          </h2>
          <Link className="text-xs text-indigo-400 hover:underline" to="/deadlines">
            All deadlines
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-sm text-slate-400">
            No pending deadlines on the calendar. Add some on the Deadlines
            page.
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((d) => {
              const days = daysUntil(d.date);
              const tone = pillTone(days);
              return (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/40 ring-1 ring-inset ring-white/5 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-100 truncate">
                      {d.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {d.rule} . {d.date}
                    </div>
                  </div>
                  <span className={`ios-pill ${tone}`}>
                    {days === null
                      ? "no date"
                      : days < 0
                      ? `${Math.abs(days)}d overdue`
                      : `${days}d out`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="ios-card">
        <h2 className="text-base font-semibold text-slate-100 mb-3">
          Panel status
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            label="Active"
            value={active.length}
            sub="seats always on"
            tone="emerald"
          />
          <StatTile
            label="Hard veto"
            value={hardVetoActive}
            sub="always on"
            tone="red"
          />
          <StatTile
            label="Standby"
            value={standby.length}
            sub="contingent"
            tone="amber"
          />
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Standby: {standby.map((s) => s.shortName).join(" . ")}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-100 mb-3 px-1">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <ActionTile
            to="/pleadings"
            title="Draft Answer"
            sub="TRCP 92 general denial"
            accent="indigo"
          />
          <ActionTile
            to="/convene"
            title="Convene Panel"
            sub="22 seats, full protocol"
            accent="violet"
          />
          <ActionTile
            to="/evidence"
            title="Add Evidence"
            sub="Photos, EDR, dashcam"
            accent="emerald"
          />
          <ActionTile
            to="/settlement"
            title="Settlement Math"
            sub="Cost / risk model"
            accent="amber"
          />
        </div>
      </section>
    </div>
  );
}

function pillTone(days: number | null): string {
  if (days === null) return "";
  if (days < 7) return "bg-red-500/15 text-red-300 ring-red-500/30";
  if (days <= 21) return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
  return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";
}

function StatTile({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub: string;
  tone: "emerald" | "red" | "amber";
}) {
  const ring = {
    emerald: "ring-emerald-500/20",
    red: "ring-red-500/25",
    amber: "ring-amber-500/25",
  }[tone];
  const dot = {
    emerald: "bg-emerald-400",
    red: "bg-red-400",
    amber: "bg-amber-400",
  }[tone];
  const num = {
    emerald: "text-emerald-300",
    red: "text-red-300",
    amber: "text-amber-300",
  }[tone];
  return (
    <div
      className={`rounded-xl bg-slate-800/40 px-3 py-3 ring-1 ring-inset ${ring}`}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </div>
      <div className={`text-3xl ios-stat ${num}`}>{value}</div>
      <div className="text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

function ActionTile({
  to,
  title,
  sub,
  accent,
}: {
  to: string;
  title: string;
  sub: string;
  accent: "indigo" | "violet" | "emerald" | "amber";
}) {
  const accentBg = {
    indigo: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/30",
    violet: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
    emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  }[accent];
  return (
    <Link to={to} className="ios-tile group block">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
        </div>
        <span
          className={`ios-pill ring-1 ring-inset ${accentBg} group-hover:scale-105 transition-transform`}
        >
          Open
        </span>
      </div>
    </Link>
  );
}
