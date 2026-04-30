import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SECTIONS = [
  "ISSUE",
  "SHORT ANSWER",
  "SEAT BY SEAT ANALYSIS",
  "DEVIL'S ADVOCATE RED TEAM",
  "COMPLIANCE SIGN OFF",
  "FINAL RECOMMENDATION",
  "GAP CHECK",
];

interface Parsed {
  heading: string;
  body: string;
}

function parse(text: string): Parsed[] {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const out: Parsed[] = [];
  let current: Parsed | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    const match = SECTIONS.find(
      (s) => trimmed.toUpperCase() === s.toUpperCase(),
    );
    if (match) {
      if (current) out.push(current);
      current = { heading: match, body: "" };
    } else if (current) {
      current.body += line + "\n";
    } else {
      // Pre amble before any section heading.
      if (out.length === 0) {
        out.push({ heading: "", body: "" });
      }
      out[0].body += line + "\n";
    }
  }
  if (current) out.push(current);
  return out;
}

export function ConveningOutput({ text }: { text: string }) {
  const parsed = parse(text);
  if (parsed.length === 0) {
    return (
      <div className="panel-card text-slate-500 text-sm">
        No output yet. Generate or run a convening.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {parsed.map((p, i) => (
        <div key={i} className="panel-card">
          {p.heading && (
            <div className="text-xs uppercase tracking-widest text-indigo-400 mb-2">
              {p.heading}
            </div>
          )}
          <div className="markdown text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {p.body.trim()}
            </ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}
