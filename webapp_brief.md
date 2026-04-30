# Legal Dream Team Webapp Brief (paste into Claude Code)

This file is a self-contained build brief. Open Claude Code in this folder (`C:\Users\rdsol\OneDrive\Documents\Claude\Projects\Legal Dream Team`) and paste the entire contents below the line into Claude Code. It will scaffold the webapp, wire it to the existing markdown war room, init the git repo, push to GitHub, and configure GitHub Pages.

---

## How to use

1. Install Claude Code if needed: `npm install -g @anthropic-ai/claude-code`.
2. From PowerShell or Terminal, `cd` into `C:\Users\rdsol\OneDrive\Documents\Claude\Projects\Legal Dream Team`.
3. Make sure GitHub CLI is installed and authed: `gh auth status` (if not, `winget install GitHub.cli` then `gh auth login`).
4. Run `claude` to start Claude Code.
5. Paste everything from "BEGIN BRIEF" to the end of this file into Claude Code as your first message.
6. Approve the work plan when Claude Code presents it. Approve any tool-use prompts as it scaffolds, commits, and pushes.

---

## BEGIN BRIEF

You are operating in `C:\Users\rdsol\OneDrive\Documents\Claude\Projects\Legal Dream Team`. This is an existing project with 22 markdown seat charters in `00_Panel/` and a war-room folder structure. Read `CLAUDE.md`, `README.md`, `panel_roster.md`, and `master_invocation.md` first for full context. Read at least 3 charter files in `00_Panel/` to understand the tone and structure.

Your job is to build a static React webapp at `webapp/` that turns this panel into a usable interface, then push the whole project (markdown war room + webapp) to a new private GitHub repo and configure GitHub Pages deployment.

### Project hard rules (apply throughout)

- **No em dashes.** Anywhere. Code comments, markdown, UI copy, commit messages, file names. Use a period, comma, colon, parentheses, or rephrase. This is a hard rule from `CLAUDE.md` at the project root.
- **Texas authority discipline.** Any UI copy that references a legal rule must cite the rule by number (TRCP, TRE, CPRC, Tex. Transp. Code, etc.).
- **No fabricated citations.** Every legal authority shown in the UI must already exist in the markdown charters. If you find yourself wanting to add a new authority, leave a TODO and do not invent.
- **Defendant orientation.** UI tone is defense oriented. Plaintiff is opposition.

### Architecture decisions (already made, do not relitigate)

- **Stack:** Vite + React 18 + TypeScript + Tailwind CSS. No backend. Pure SPA.
- **Hosting:** GitHub Pages, free tier. Configured via GitHub Actions workflow.
- **State:** localStorage only, namespaced under `legalDreamTeam.`. No cloud DB. No auth.
- **LLM mode:** Hybrid. Default mode generates a convening prompt and copies to clipboard for paste into Claude. Optional mode: user enters Anthropic API key in Settings, app calls `https://api.anthropic.com/v1/messages` directly from the browser with header `anthropic-dangerous-direct-browser-access: true`. API key persists in localStorage only.
- **Charter source of truth:** the markdown files in `00_Panel/`. The webapp loads charters at build time using Vite `import.meta.glob` from `../00_Panel/*.md` with `query: '?raw', eager: true`. Configure `server.fs.allow` in `vite.config.ts` to permit reading the parent directory.
- **No tracking, no analytics, no third-party scripts.**

### App spec

Routes (use `react-router-dom@6`):

1. `/` Dashboard. Shows: matter snapshot card (caption, court, cause number), next 3 deadlines from the deadline list (color coded by urgency), panel status panel (active vs standby seats), four quick-action buttons (Draft Answer, Convene Panel, Add Evidence, Run Settlement Math).
2. `/case-file` Case File. Editable form bound to `caseFile` localStorage object. Fields match `01_Matter/case_file_TEMPLATE.md`: court, cause number, plaintiff name, plaintiff counsel (name, firm, phone, email, bar #), date of accident, date suit filed, date served, method of service, answer due date (auto-computed from date served per TRCP 502.5 with manual override), trial setting, jury demand status, claims pleaded (repeating), damages claimed (repeating with type column), defendant snapshot of facts (textarea), strongest defense facts (list), worst defense facts (list), insurance status. Save on blur. Export as JSON button. Export as Markdown button (regenerates `01_Matter/case_file.md` content for download).
3. `/deadlines` Deadlines. Editable table. Columns: deadline name, rule citation, date, status (filed / pending / N/A). Pre-seed with the rows from `01_Matter/deadlines_TEMPLATE.md`. Add row, delete row, mark complete. Color rows red when due in less than 7 days and pending, yellow when due in 7 to 21 days, green otherwise.
4. `/panel` Panel. Lists all 22 seats grouped by tier. Each seat is a card with: seat number, name, tier name, authority badge (chair, vote, advisory, hard veto, cite veto, contingent), one line role summary, and a "View charter" button. Clicking opens a side drawer or modal showing the full charter rendered from markdown using `react-markdown` with `remark-gfm`. Tier headers are visually distinct. Hard veto seats have a red badge. Contingent seats have a "STANDBY" badge with hover tooltip explaining activation criteria.
5. `/convene` Convene. Form with: question / topic textarea, seat picker (multiselect with auto-select default that picks Lead + at least one seat per implicated tier based on simple keyword matching), output preview pane, two action buttons: "Copy Convening Prompt" (always available) and "Run Live Convening" (only if API key set in Settings). Live convening calls Claude (model selectable, default `claude-sonnet-4-6`), streams response into the preview pane, formats per the protocol in `master_invocation.md` (ISSUE, SHORT ANSWER, SEAT BY SEAT ANALYSIS, DEVIL'S ADVOCATE RED TEAM, COMPLIANCE SIGN OFF, FINAL RECOMMENDATION, GAP CHECK). Save every convening to localStorage history with timestamp; show last 10 in a sidebar.
6. `/settings` Settings. API key input (password field with show / hide toggle), model selector (`claude-sonnet-4-6`, `claude-opus-4-6`, `claude-haiku-4-5-20251001`), max tokens (default 4096), test connection button. Theme toggle (light / dark, default dark). Export all data as JSON. Import JSON. Clear all data button with double confirm.

Components:

- `<AppShell>` with sticky sidebar nav, active route highlight, responsive collapse below 768px.
- `<SeatCard>` consumed by `/panel`.
- `<CharterDrawer>` for full charter view with markdown rendering.
- `<DeadlineRow>` editable.
- `<KeyValueGrid>` for the case file form sections.
- `<ConveningOutput>` parses and renders the seven-section protocol output.

Data layer:

- `src/lib/storage.ts` exports typed get / set / subscribe helpers around localStorage with namespace `legalDreamTeam.`.
- `src/lib/anthropic.ts` exports `callClaude({ system, user, model, maxTokens, apiKey, onChunk })` for streaming responses. Throws on missing key. Uses `fetch` with `anthropic-dangerous-direct-browser-access: true`.
- `src/lib/prompts.ts` exports `buildConveningPrompt(question, selectedSeats, caseFile)` which produces the prompt body following `master_invocation.md`. Uses charter content for selected seats so the model has context.
- `src/data/seats.ts` exports the 22 seats as structured TypeScript with this shape:

  ```ts
  export interface Seat {
    id: number;
    name: string;
    shortName: string;
    tier: number;
    tierName: string;
    authority: "chair" | "vote" | "advisory" | "hard-veto" | "cite-veto";
    contingent: boolean;
    activationCondition?: string;
    roleSummary: string;
    charterMarkdown: string;
  }
  ```

  Populate `charterMarkdown` for each seat using `import.meta.glob('../../00_Panel/*.md', { eager: true, query: '?raw', import: 'default' })`. Map by filename to seat id.

- `src/data/tiers.ts` exports the 9 tiers with id, name, seat ids, and color token.

Styling:

- Tailwind. Dark mode default with light option. Inter or system font stack.
- Color palette: primary slate for surfaces, indigo for accents, red for hard veto and overdue deadlines, amber for warnings, emerald for confirmations.
- No gradients on primary surfaces. Type heavy, government-doc feel.

Quality gates:

- TypeScript strict mode on.
- No console errors at runtime.
- All routes reachable via sidebar.
- localStorage round trip works (refresh preserves all entered data).
- Build succeeds: `npm run build`.
- `npm run dev` starts cleanly.
- Em-dash check: `git grep -l $'\\xe2\\x80\\x94\\|\\xe2\\x80\\x93'` returns nothing (matches U+2014 em dash and U+2013 en dash without putting the literal characters in this file).

### File scaffolding plan

Create these files at `webapp/`:

- `package.json` with scripts: `dev`, `build`, `preview`, `typecheck`, `lint`.
- Dependencies: `react`, `react-dom`, `react-router-dom@6`, `react-markdown`, `remark-gfm`.
- Dev dependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`.
- `vite.config.ts` with `base: '/legal-dream-team/'` (override via env var for local dev), `server.fs.allow: ['..']`.
- `tsconfig.json` with strict mode, JSX react-jsx.
- `tailwind.config.js` with content scan of `./index.html` and `./src/**/*.{ts,tsx}`.
- `postcss.config.js` with tailwindcss + autoprefixer.
- `index.html` with viewport meta, title "Legal Dream Team", no external scripts.
- `.gitignore` covering `node_modules/`, `dist/`, `.env*`, OS files.
- `.eslintrc.cjs` with TypeScript and react-hooks rules.
- `src/main.tsx`, `src/App.tsx`, `src/index.css` (tailwind directives), `src/routes/*.tsx`, `src/components/*.tsx`, `src/lib/*.ts`, `src/data/*.ts`.

### Deployment workflow

Create `.github/workflows/deploy.yml` at the **project root** (not under webapp), so GitHub Actions runs from repo root:

- Triggers: push to `main`.
- Steps: checkout, setup-node 20, `cd webapp && npm ci && npm run build`, upload `webapp/dist` as Pages artifact, deploy to Pages.
- Permissions: `pages: write`, `id-token: write`.
- Use the official `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`.

After repo is created, run `gh repo edit --visibility private` (it should already be private from creation flag) and `gh api repos/:owner/:repo/pages -f source.branch=main -f source.path=/ -X POST` if needed, or use the workflow-based Pages source which `actions/deploy-pages` handles automatically. Confirm Pages is set to "GitHub Actions" source via `gh` or instruct the user via the README.

### Git and GitHub flow

Run these commands in order. Use `gh` CLI for all GitHub operations.

```powershell
cd "C:\Users\rdsol\OneDrive\Documents\Claude\Projects\Legal Dream Team"

# Initialize repo
git init -b main

# Make sure git config user is set
git config user.name "Richie Solis"
git config user.email "rsolistx@gmail.com"

# Stage everything except node_modules and build artifacts
git add .

# First commit, no em dashes in the message
git commit -m "Initial commit: 22 seat panel and webapp scaffold"

# Create a new private GitHub repo and push
gh repo create legal-dream-team --private --source=. --remote=origin --push

# Enable GitHub Pages from Actions
gh api -X POST "repos/:owner/legal-dream-team/pages" -F "build_type=workflow" || echo "Pages already enabled or will be set by workflow"
```

After push, the deploy workflow runs automatically and the site comes up at `https://<github-username>.github.io/legal-dream-team/`. Verify with `gh run watch`.

### Acceptance checklist (Claude Code: confirm each before declaring done)

1. `webapp/` exists with the full file tree above.
2. `npm install` and `npm run build` both succeed in `webapp/`.
3. `npm run dev` starts on `http://localhost:5173/legal-dream-team/` (or similar) and all 6 routes load without errors.
4. The Panel route renders all 22 seat cards grouped into 9 tiers with correct authority badges (3 always-active hard-veto, 2 contingent hard-veto, 1 chair, 1 cite-veto, rest vote / advisory).
5. The Convene route generates a copy-paste prompt for at least one example question.
6. The Settings route accepts an API key and persists it across reloads.
7. localStorage round trip on the Case File form works on hard reload.
8. Em-dash check: zero hits across all files.
9. `git push` succeeded, the GitHub Actions deploy workflow ran green, and the site loads at `https://<username>.github.io/legal-dream-team/` with all routes working.
10. Print a final summary with: repo URL, Pages URL, and one paragraph "next steps" for the user (fill in `01_Matter/case_file.md`, set API key in Settings, run a sample convening on the answer draft).

### Things to leave as TODO (do not over-build)

- Pleadings drafting screen (link out to `02_Pleadings/` README and provide a "Generate Answer Skeleton" button that produces text in a downloadable file using a template, but no full editor).
- Discovery, Evidence, Settlement, Trial, Appeal pages: stub each with a "Coming soon" placeholder that lists the markdown files currently in that folder and a button to open the folder README. Do not build full editors yet.
- Authentication. This is a personal tool, deployed privately, no auth needed.

### If anything is unclear

Default to the recommended option, document the choice with a short comment in the relevant file, and continue. Do not block on questions. The user prefers progress with clear documentation over delay.

## END BRIEF

---

## What to do after Claude Code finishes

1. Open `https://<your-github-username>.github.io/legal-dream-team/` and verify the Panel route renders all 22 seats.
2. Go to Settings, paste your Anthropic API key (get one at console.anthropic.com under API Keys).
3. Go to Case File, fill in the actual caption, parties, dates, and damages.
4. Go to Convene, type "Draft the defendant's Answer and confirm the master deadline calendar," click "Run Live Convening." The panel will produce a synthesized recommendation with seat-by-seat analysis.
5. The repo is private. To grant view access to a friend or attorney later: `gh api repos/:owner/legal-dream-team/collaborators/<their-github> -X PUT`.

## Notes for future me

- Charter content stays in `00_Panel/*.md`. The webapp loads them at build time. To edit a charter, edit the markdown and rebuild; the change flows through the UI automatically.
- The CLAUDE.md project rules apply equally to webapp source. No em dashes in code comments either.
- If a 23rd seat is added later, drop the new charter file in `00_Panel/`, add a row to `src/data/seats.ts` with the matching id, and rebuild.
- Anthropic API model strings change. Keep the model selector in Settings up to date as new models release.
