import { useEffect, useRef, useState } from "react";
import {
  clearAll,
  exportAll,
  getItem,
  importAll,
  setItem,
} from "../lib/storage";
import { testConnection } from "../lib/anthropic";
import { Theme, getStoredTheme, setTheme } from "../lib/theme";

const MODELS = [
  "claude-sonnet-4-6",
  "claude-opus-4-6",
  "claude-haiku-4-5-20251001",
] as const;

interface SettingsShape {
  apiKey: string;
  model: string;
  maxTokens: number;
}

const EMPTY: SettingsShape = {
  apiKey: "",
  model: "claude-sonnet-4-6",
  maxTokens: 4096,
};

export function SettingsPage() {
  const [s, setS] = useState<SettingsShape>(() => getItem("settings", EMPTY));
  const [show, setShow] = useState(false);
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItem("settings", s);
  }, [s]);

  function applyTheme(next: Theme) {
    setTheme(next);
    setThemeState(next);
  }

  async function runTest() {
    setTestMsg("Testing...");
    const r = await testConnection(s.apiKey, s.model);
    setTestMsg(r.message);
  }

  function exportData() {
    const data = exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "legal-dream-team-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importData(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        importAll(parsed);
        alert("Import complete. Reload the page to see updated data.");
      } catch (e) {
        alert("Import failed: " + (e as Error).message);
      }
    };
    reader.readAsText(file);
  }

  function clearData() {
    if (!confirm("Clear all local data? This cannot be undone.")) return;
    if (!confirm("Really clear ALL data? Type Cancel to abort.")) return;
    clearAll();
    alert("All data cleared. Reload the page.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-400">
          API key persists in localStorage only. No tracking, no analytics, no
          third party scripts.
        </p>
      </div>

      <section className="panel-card space-y-3">
        <h2 className="text-lg font-semibold">Anthropic API</h2>
        <label className="label">API key</label>
        <div className="flex gap-2">
          <input
            type={show ? "text" : "password"}
            className="input"
            value={s.apiKey}
            onChange={(e) => setS({ ...s, apiKey: e.target.value })}
            placeholder="sk-ant-..."
            autoComplete="off"
          />
          <button className="btn" onClick={() => setShow((v) => !v)}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="label">Model</label>
            <select
              className="input"
              value={s.model}
              onChange={(e) => setS({ ...s, model: e.target.value })}
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Max tokens</label>
            <input
              type="number"
              className="input"
              value={s.maxTokens}
              onChange={(e) =>
                setS({ ...s, maxTokens: Number(e.target.value) || 4096 })
              }
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button className="btn" onClick={runTest}>
            Test connection
          </button>
          {testMsg && <span className="text-xs text-slate-300">{testMsg}</span>}
        </div>
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-lg font-semibold">Theme</h2>
        <div className="flex gap-2">
          <button
            className={`btn ${theme === "dark" ? "btn-primary" : ""}`}
            onClick={() => applyTheme("dark")}
          >
            Dark
          </button>
          <button
            className={`btn ${theme === "light" ? "btn-primary" : ""}`}
            onClick={() => applyTheme("light")}
          >
            Light
          </button>
        </div>
      </section>

      <section className="panel-card space-y-3">
        <h2 className="text-lg font-semibold">Data</h2>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={exportData}>
            Export all (JSON)
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Import JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = "";
            }}
          />
          <button className="btn btn-danger" onClick={clearData}>
            Clear all data
          </button>
        </div>
      </section>
    </div>
  );
}
