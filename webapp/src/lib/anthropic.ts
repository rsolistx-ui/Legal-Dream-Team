// Direct browser to Anthropic API client. Streaming.
// API key persists in localStorage only (per project decision).

export interface CallClaudeOptions {
  system: string;
  user: string;
  model: string;
  maxTokens: number;
  apiKey: string;
  onChunk?: (text: string) => void;
  signal?: AbortSignal;
}

export interface CallClaudeResult {
  text: string;
}

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export async function callClaude(
  opts: CallClaudeOptions,
): Promise<CallClaudeResult> {
  if (!opts.apiKey) {
    throw new Error("No Anthropic API key set. Add one in Settings.");
  }

  const body = {
    model: opts.model,
    max_tokens: opts.maxTokens,
    stream: true,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": opts.apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Anthropic API error ${res.status} ${res.statusText}: ${errText.slice(0, 500)}`,
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffered = "";
  let collected = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffered += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buffered.indexOf("\n")) !== -1) {
      const line = buffered.slice(0, nl).trim();
      buffered = buffered.slice(nl + 1);
      if (!line || !line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        if (
          json.type === "content_block_delta" &&
          json.delta &&
          typeof json.delta.text === "string"
        ) {
          collected += json.delta.text;
          opts.onChunk?.(json.delta.text);
        }
      } catch {
        // ignore non JSON lines
      }
    }
  }

  return { text: collected };
}

export async function testConnection(
  apiKey: string,
  model: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: 16,
        messages: [{ role: "user", content: "ping" }],
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return {
        ok: false,
        message: `HTTP ${res.status}: ${t.slice(0, 200)}`,
      };
    }
    return { ok: true, message: "Connection OK." };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
