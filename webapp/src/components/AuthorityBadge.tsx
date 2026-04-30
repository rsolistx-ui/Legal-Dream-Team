import type { Authority } from "../data/seats";

const LABELS: Record<Authority, string> = {
  chair: "Chair",
  vote: "Vote",
  advisory: "Advisory",
  "hard-veto": "Hard Veto",
  "cite-veto": "Cite Veto",
};

const CLASSES: Record<Authority, string> = {
  chair: "badge badge-chair",
  vote: "badge badge-vote",
  advisory: "badge badge-advisory",
  "hard-veto": "badge badge-hard-veto",
  "cite-veto": "badge badge-cite-veto",
};

export function AuthorityBadge({ authority }: { authority: Authority }) {
  return <span className={CLASSES[authority]}>{LABELS[authority]}</span>;
}

export function StandbyBadge({ tooltip }: { tooltip: string }) {
  return (
    <span className="badge badge-standby" title={tooltip}>
      Standby
    </span>
  );
}
