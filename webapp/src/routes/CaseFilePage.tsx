import { useState } from "react";
import { getItem, setItem } from "../lib/storage";
import {
  CaseFile,
  ClaimRow,
  DamageRow,
  DamageType,
  EMPTY_CASE_FILE,
  caseFileToMarkdown,
  computeAnswerDue,
} from "../lib/caseFile";
import { KeyValueGrid } from "../components/KeyValueGrid";
import { genId } from "../lib/deadlines";

const DAMAGE_TYPES: DamageType[] = [
  "property",
  "diminished value",
  "loss of use",
  "medical",
  "other",
];

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function CaseFilePage() {
  const [cf, setCf] = useState<CaseFile>(() =>
    getItem("caseFile", EMPTY_CASE_FILE),
  );

  function commit(next: CaseFile) {
    next.lastUpdated = todayISO();
    setCf(next);
    setItem("caseFile", next);
  }

  function update<K extends keyof CaseFile>(key: K, value: CaseFile[K]) {
    setCf((prev) => ({ ...prev, [key]: value }));
  }
  function commitAll() {
    // Use functional setState to capture the latest state, avoiding stale closures.
    setCf((prev) => {
      const next = { ...prev, lastUpdated: todayISO() };
      setItem("caseFile", next);
      return next;
    });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(cf, null, 2)], {
      type: "application/json",
    });
    download(blob, "case_file.json");
  }
  function exportMarkdown() {
    const md = caseFileToMarkdown(cf);
    const blob = new Blob([md], { type: "text/markdown" });
    download(blob, "case_file.md");
  }

  function addClaim() {
    const next: ClaimRow = {
      id: genId(),
      claim: "",
      elements: "",
      authority: "",
    };
    commit({ ...cf, claims: [...cf.claims, next] });
  }
  function updateClaim(id: string, patch: Partial<ClaimRow>) {
    setCf((prev) => ({
      ...prev,
      claims: prev.claims.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }
  function removeClaim(id: string) {
    commit({ ...cf, claims: cf.claims.filter((c) => c.id !== id) });
  }

  function addDamage() {
    const next: DamageRow = {
      id: genId(),
      element: "",
      amount: "",
      type: "property",
      status: "",
    };
    commit({ ...cf, damages: [...cf.damages, next] });
  }
  function updateDamage(id: string, patch: Partial<DamageRow>) {
    setCf((prev) => ({
      ...prev,
      damages: prev.damages.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  }
  function removeDamage(id: string) {
    commit({ ...cf, damages: cf.damages.filter((d) => d.id !== id) });
  }

  const computedAnswerDue = computeAnswerDue(cf.dateServed, cf.methodOfService);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Case File</h1>
          <p className="text-sm text-slate-400">
            Mirrors 01_Matter/case_file_TEMPLATE.md. Saved on blur.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={exportJson}>
            Export JSON
          </button>
          <button className="btn" onClick={exportMarkdown}>
            Export Markdown
          </button>
        </div>
      </div>

      <section className="panel-card space-y-3">
        <h2 className="text-lg font-semibold">Caption</h2>
        <KeyValueGrid
          fields={[
            {
              label: "Court",
              node: (
                <input
                  className="input"
                  value={cf.court}
                  onChange={(e) => update("court", e.target.value)}
                  onBlur={commitAll}
                  placeholder="Justice Court, Precinct __, _____ County, Texas"
                />
              ),
            },
            {
              label: "Cause number",
              node: (
                <input
                  className="input"
                  value={cf.causeNumber}
                  onChange={(e) => update("causeNumber", e.target.value)}
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Plaintiff",
              node: (
                <input
                  className="input"
                  value={cf.plaintiff}
                  onChange={(e) => update("plaintiff", e.target.value)}
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Defendant (you)",
              node: (
                <input
                  className="input"
                  value={cf.defendant}
                  onChange={(e) => update("defendant", e.target.value)}
                  onBlur={commitAll}
                />
              ),
            },
          ]}
        />
        <h3 className="text-sm font-semibold mt-4">Plaintiff's counsel</h3>
        <KeyValueGrid
          fields={[
            {
              label: "Name",
              node: (
                <input
                  className="input"
                  value={cf.plaintiffCounsel.name}
                  onChange={(e) =>
                    update("plaintiffCounsel", {
                      ...cf.plaintiffCounsel,
                      name: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Firm",
              node: (
                <input
                  className="input"
                  value={cf.plaintiffCounsel.firm}
                  onChange={(e) =>
                    update("plaintiffCounsel", {
                      ...cf.plaintiffCounsel,
                      firm: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Phone",
              node: (
                <input
                  className="input"
                  value={cf.plaintiffCounsel.phone}
                  onChange={(e) =>
                    update("plaintiffCounsel", {
                      ...cf.plaintiffCounsel,
                      phone: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Email",
              node: (
                <input
                  className="input"
                  value={cf.plaintiffCounsel.email}
                  onChange={(e) =>
                    update("plaintiffCounsel", {
                      ...cf.plaintiffCounsel,
                      email: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Bar number",
              node: (
                <input
                  className="input"
                  value={cf.plaintiffCounsel.barNumber}
                  onChange={(e) =>
                    update("plaintiffCounsel", {
                      ...cf.plaintiffCounsel,
                      barNumber: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
          ]}
        />
        <h3 className="text-sm font-semibold mt-4">Timeline</h3>
        <KeyValueGrid
          fields={[
            {
              label: "Date of accident",
              node: (
                <input
                  type="date"
                  className="input"
                  value={cf.dateOfAccident}
                  onChange={(e) => update("dateOfAccident", e.target.value)}
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Date suit filed",
              node: (
                <input
                  type="date"
                  className="input"
                  value={cf.dateSuitFiled}
                  onChange={(e) => update("dateSuitFiled", e.target.value)}
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Date served on defendant",
              node: (
                <input
                  type="date"
                  className="input"
                  value={cf.dateServed}
                  onChange={(e) => update("dateServed", e.target.value)}
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Method of service",
              node: (
                <select
                  className="input"
                  value={cf.methodOfService}
                  onChange={(e) =>
                    update(
                      "methodOfService",
                      e.target.value as CaseFile["methodOfService"],
                    )
                  }
                  onBlur={commitAll}
                >
                  <option value="">[select]</option>
                  <option value="personal">personal</option>
                  <option value="substituted">substituted</option>
                  <option value="by mail">by mail</option>
                </select>
              ),
            },
            {
              label: `Answer due (auto, TRCP 502.5): ${computedAnswerDue || "(set service date)"}`,
              node: (
                <input
                  type="date"
                  className="input"
                  value={cf.answerDueDateOverride}
                  onChange={(e) =>
                    update("answerDueDateOverride", e.target.value)
                  }
                  onBlur={commitAll}
                  placeholder="manual override"
                />
              ),
            },
            {
              label: "Trial setting",
              node: (
                <input
                  className="input"
                  value={cf.trialSetting}
                  onChange={(e) => update("trialSetting", e.target.value)}
                  onBlur={commitAll}
                />
              ),
            },
          ]}
        />
        <h3 className="text-sm font-semibold mt-4">Jury demand (TRCP 504.1)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cf.juryDemand.filed}
              onChange={(e) => {
                const next = {
                  ...cf,
                  juryDemand: { ...cf.juryDemand, filed: e.target.checked },
                };
                commit(next);
              }}
            />
            Jury demand filed
          </label>
          <label>
            <span className="label">Date filed</span>
            <input
              type="date"
              className="input"
              value={cf.juryDemand.date}
              onChange={(e) =>
                update("juryDemand", { ...cf.juryDemand, date: e.target.value })
              }
              onBlur={commitAll}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cf.juryDemand.feePaid}
              onChange={(e) => {
                const next = {
                  ...cf,
                  juryDemand: { ...cf.juryDemand, feePaid: e.target.checked },
                };
                commit(next);
              }}
            />
            Jury fee ($22) paid
          </label>
        </div>
      </section>

      <section className="panel-card space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Claims pleaded</h2>
          <button className="btn" onClick={addClaim}>
            Add claim
          </button>
        </div>
        {cf.claims.length === 0 && (
          <div className="text-sm text-slate-500">No claims recorded.</div>
        )}
        {cf.claims.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start"
          >
            <input
              className="input md:col-span-3"
              placeholder="Claim name"
              value={c.claim}
              onChange={(e) => updateClaim(c.id, { claim: e.target.value })}
              onBlur={commitAll}
            />
            <input
              className="input md:col-span-5"
              placeholder="Elements plaintiff must prove"
              value={c.elements}
              onChange={(e) => updateClaim(c.id, { elements: e.target.value })}
              onBlur={commitAll}
            />
            <input
              className="input md:col-span-3"
              placeholder="Texas authority"
              value={c.authority}
              onChange={(e) => updateClaim(c.id, { authority: e.target.value })}
              onBlur={commitAll}
            />
            <button
              className="btn btn-danger md:col-span-1"
              onClick={() => removeClaim(c.id)}
            >
              X
            </button>
          </div>
        ))}
      </section>

      <section className="panel-card space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Damages claimed</h2>
          <button className="btn" onClick={addDamage}>
            Add damage row
          </button>
        </div>
        {cf.damages.length === 0 && (
          <div className="text-sm text-slate-500">No damages recorded.</div>
        )}
        {cf.damages.map((d) => (
          <div
            key={d.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start"
          >
            <input
              className="input md:col-span-4"
              placeholder="Element"
              value={d.element}
              onChange={(e) => updateDamage(d.id, { element: e.target.value })}
              onBlur={commitAll}
            />
            <input
              className="input md:col-span-2"
              placeholder="$"
              value={d.amount}
              onChange={(e) => updateDamage(d.id, { amount: e.target.value })}
              onBlur={commitAll}
            />
            <select
              className="input md:col-span-2"
              value={d.type}
              onChange={(e) =>
                updateDamage(d.id, { type: e.target.value as DamageType })
              }
              onBlur={commitAll}
            >
              {DAMAGE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="input md:col-span-3"
              placeholder="Status"
              value={d.status}
              onChange={(e) => updateDamage(d.id, { status: e.target.value })}
              onBlur={commitAll}
            />
            <button
              className="btn btn-danger md:col-span-1"
              onClick={() => removeDamage(d.id)}
            >
              X
            </button>
          </div>
        ))}
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-lg font-semibold">Snapshot of facts</h2>
        <textarea
          rows={6}
          className="input font-mono text-sm"
          placeholder="3 to 7 sentences. Defendant's version of what happened."
          value={cf.factsSnapshot}
          onChange={(e) => update("factsSnapshot", e.target.value)}
          onBlur={commitAll}
        />
        <FactList
          label="Strongest defense facts"
          items={cf.strongestFacts}
          onChange={(items) => commit({ ...cf, strongestFacts: items })}
        />
        <FactList
          label="Worst defense facts"
          items={cf.worstFacts}
          onChange={(items) => commit({ ...cf, worstFacts: items })}
        />
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-lg font-semibold">Insurance status</h2>
        <KeyValueGrid
          fields={[
            {
              label: "Defendant carrier",
              node: (
                <input
                  className="input"
                  value={cf.insurance.defendantCarrier}
                  onChange={(e) =>
                    update("insurance", {
                      ...cf.insurance,
                      defendantCarrier: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Policy number",
              node: (
                <input
                  className="input"
                  value={cf.insurance.defendantPolicy}
                  onChange={(e) =>
                    update("insurance", {
                      ...cf.insurance,
                      defendantPolicy: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Policy limits",
              node: (
                <input
                  className="input"
                  value={cf.insurance.defendantLimits}
                  onChange={(e) =>
                    update("insurance", {
                      ...cf.insurance,
                      defendantLimits: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Claim number",
              node: (
                <input
                  className="input"
                  value={cf.insurance.defendantClaim}
                  onChange={(e) =>
                    update("insurance", {
                      ...cf.insurance,
                      defendantClaim: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Adjuster",
              node: (
                <input
                  className="input"
                  value={cf.insurance.defendantAdjuster}
                  onChange={(e) =>
                    update("insurance", {
                      ...cf.insurance,
                      defendantAdjuster: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Plaintiff carrier known?",
              node: (
                <input
                  className="input"
                  value={cf.insurance.plaintiffCarrierKnown}
                  onChange={(e) =>
                    update("insurance", {
                      ...cf.insurance,
                      plaintiffCarrierKnown: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
            },
            {
              label: "Subrogation posture",
              node: (
                <input
                  className="input"
                  value={cf.insurance.subrogationPosture}
                  onChange={(e) =>
                    update("insurance", {
                      ...cf.insurance,
                      subrogationPosture: e.target.value,
                    })
                  }
                  onBlur={commitAll}
                />
              ),
              full: true,
            },
          ]}
        />
      </section>
    </div>
  );
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function FactList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div>
      <h3 className="label">{label}</h3>
      <ul className="space-y-1 mb-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="flex-1 text-sm text-slate-200">{item}</span>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Add a fact and press Enter"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
        />
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (draft.trim()) {
              onChange([...items, draft.trim()]);
              setDraft("");
            }
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

