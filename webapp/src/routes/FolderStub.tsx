interface Props {
  title: string;
  folder: string;
  description: string;
}

// Static list of files known at build time, loaded from the war room README markdown.
// Vite import.meta.glob picks up everything in the parent folder.
const folderModules = import.meta.glob("../../../*/README.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function readmeFor(folder: string): string | null {
  const match = Object.entries(folderModules).find(([path]) =>
    path.includes(`/${folder}/README.md`),
  );
  return match ? match[1] : null;
}

export function FolderStub({ title, folder, description }: Props) {
  const readme = readmeFor(folder);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <section className="panel-card">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
          Coming soon
        </div>
        <p className="text-sm text-slate-300">
          The full editor for this section is not built yet. Open the markdown
          files in <code className="text-amber-300">{folder}/</code> directly,
          or use Convene to ask the panel for a draft.
        </p>
      </section>
      {readme && (
        <section className="panel-card">
          <h2 className="text-sm font-semibold mb-2">{folder}/README.md</h2>
          <pre className="text-xs whitespace-pre-wrap font-mono text-slate-300 max-h-[60vh] overflow-y-auto">
            {readme}
          </pre>
        </section>
      )}
    </div>
  );
}
