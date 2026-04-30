import { useMemo, useState } from "react";
import { SEATS } from "../data/seats";
import { TIERS } from "../data/tiers";
import { autoSelectSeats, buildConveningPrompt } from "../lib/prompts";
import { getItem, setItem } from "../lib/storage";
import { CaseFile, EMPTY_CASE_FILE } from "../lib/caseFile";
import { ConveningOutput } from "../components/ConveningOutput";
import { callClaude } from "../lib/anthropic";

interface ConveningRecord {
  id: string;
  ts: string;
  question: string;
  selectedSeats: number[];
  output: string;
  mode: "prompt" | "live";
}

interface SettingsShape {
  apiKey: string;
  model: string;
  maxTokens: number;
}

const EMPTY_SETTINGS: SettingsShape = {
  apiKey: "",
  model: "claude-sonnet-4-6",
  maxTokens: 4096,
};

export function ConvenePage() {
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(autoSelectSeats("")),
  );
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConveningRecord[]>(() =>
    getItem<ConveningRecord[]>("conveneHistory", []),
  );
  const settings = getItem<SettingsShape>("settings", EMPTY_SETTINGS);
  const caseFile = getItem<CaseFile>("caseFile", EMPTY_CASE_FILE);

  const selectedSeats = useMemo(
    () => SEATS.filter((s) => selected.has(s.id)),
    [selected],
  );

  function autoPick() {
    setSelected(new Set(autoSelectSeats(question)));
  }
  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function buildPrompt() {
    return buildConveningPrompt({
      question,
      selectedSeats,
      caseFile,
    });
  }

  function fullPromptText(): string {
    const { system, user } = buildPrompt();
    return `# SYSTEM\n\n${system}\n\n# USER\n\n${user}`;
  }

  async function copyPrompt() {
    if (!question.trim()) {
      setError("Enter a question first.");
      return;
    }
    const text = fullPromptText();
    try {
      await navigator.clipboard.writeText(text);
      saveHistory({
        id: genId(),
        ts: new Date().toISOString(),
        question,
        selectedSeats: Array.from(selected),
        output: "[Copied to clipboard. Paste into Claude.]",
        mode: "prompt",
      });
      setOutput("Convening prompt copied to clipboard. Paste into Claude.");
      setError(null);
    } catch (e) {
      setError("Copy failed: " + (e as Error).message);
    }
  }

  async function runLive() {
    if (!settings.apiKey) {
      setError("No API key in Settings. Add one to use live convening.");
      return;
    }
    if (!question.trim()) {
      setError("Enter a question first.");
      return;
    }
    setError(null);
    setRunning(true);
    setOutput("");
    try {
      const { system, user } = buildPrompt();
      let collected = "";
      await callClaude({
        system,
        user,
        model: settings.model,
        maxTokens: settings.maxTokens,
        apiKey: settings.apiKey,
        onChunk: (chunk) => {
          collected += chunk;
          setOutput(collected);
        },
      });
      saveHistory({
        id: genId(),
        ts: new Date().toISOString(),
        question,
        selectedSeats: Array.from(selected),
        output: collected,
        mode: "live",
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  function saveHistory(rec: ConveningRecord) {
    setHistory((prev) => {
      const next = [rec, ...prev].slice(0, 10);
      setItem("conveneHistory", next);
      return next;
    });
  }

  function loadHistory(rec: ConveningRecord) {
    setQuestion(rec.question);
    setSelected(new Set(rec.selectedSeats));
    setOutput(rec.output);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Convene</h1>
        <p className="text-sm text-slate-400">
          Generate a convening prompt for the panel. Paste into Claude, or run
          live if an API key is set in Settings.
        </p>
      </div>

      {error && (
        <div className="panel-card bg-red-950 border border-red-700 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="panel-card lg:col-span-2 space-y-3">
          <label className="label">Question or topic</label>
          <textarea
            rows={4}
            className="input font-mono text-sm"
            placeholder='e.g., "Draft the defendant Answer and confirm the master deadline calendar."'
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={autoPick}>
              Auto select seats
            </button>
            <button className="btn" onClick={copyPrompt}>
              Copy convening prompt
            </button>
            <button
              className="btn btn-primary"
              onClick={runLive}
              disabled={running || !settings.apiKey}
              title={
                settings.apiKey
                  ? "Stream a live convening from the Anthropic API."
                  : "Set an API key in Settings to enable."
              }
            >
              {running ? "Running..." : "Run live convening"}
            </button>
          </div>
          <div className="mt-3">
            <label className="label">
              Selected seats ({selected.size} of 22)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 max-h-72 overflow-y-auto p-2 border border-slate-800 rounded-sm bg-slate-950">
              {TIERS.flatMap((t) => t.seatIds).map((id) => {
                const seat = SEATS.find((s) => s.id === id)!;
                const checked = selected.has(id);
                return (
                  <label
                    key={id}
                    className={`flex items-start gap-2 text-xs px-2 py-1 rounded-sm cursor-pointer ${
                      checked ? "bg-slate-800" : "hover:bg-slate-900"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(id)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="text-slate-500">
                        {String(seat.id).padStart(2, "0")}.
                      </span>{" "}
                      {seat.shortName}
                      {seat.contingent && (
                        <span className="ml-1 text-amber-400">(standby)</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="panel-card">
          <h2 className="font-semibold mb-2">Recent (last 10)</h2>
          {history.length === 0 ? (
            <div className="text-xs text-slate-500">No convenings yet.</div>
          ) : (
            <ul className="space-y-2 text-xs">
              {history.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => loadHistory(r)}
                    className="text-left w-full hover:bg-slate-900 p-2 rounded-sm"
                  >
                    <div className="text-slate-500">
                      {new Date(r.ts).toLocaleString()} . {r.mode}
                    </div>
                    <div className="text-slate-200 line-clamp-2">
                      {r.question.slice(0, 120) || "(no question)"}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-2">Output</h2>
        <ConveningOutput text={output} />
      </section>

      <section className="panel-card">
        <h2 className="text-sm font-semibold mb-2">Prompt preview</h2>
        <PromptPreview text={fullPromptText()} />
      </section>
    </div>
  );
}

function PromptPreview({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="btn"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? "Hide" : "Show"} prompt
      </button>
      {open && (
        <pre className="mt-2 max-h-96 overflow-y-auto text-xs bg-slate-950 border border-slate-800 rounded-sm p-3 whitespace-pre-wrap font-mono text-slate-300">
          {text}
        </pre>
      )}
    </div>
  );
}

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

