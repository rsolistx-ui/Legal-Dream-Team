import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Seat } from "../data/seats";
import { AuthorityBadge, StandbyBadge } from "./AuthorityBadge";

interface Props {
  seat: Seat | null;
  onClose: () => void;
}

export function CharterDrawer({ seat, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (seat) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    return;
  }, [seat, onClose]);

  if (!seat) return null;
  return (
    <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
      <button
        type="button"
        className="flex-1 bg-black/60"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full overflow-y-auto">
        <div className="sticky top-0 bg-slate-950 border-b border-slate-800 px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">
              Seat {String(seat.id).padStart(2, "0")} . Tier {seat.tier}: {seat.tierName}
            </div>
            <div className="text-lg font-semibold text-slate-100">{seat.name}</div>
            <div className="flex gap-1 mt-1">
              <AuthorityBadge authority={seat.authority} />
              {seat.contingent && (
                <StandbyBadge tooltip={seat.activationCondition ?? ""} />
              )}
            </div>
          </div>
          <button onClick={onClose} className="btn" aria-label="Close">
            Close
          </button>
        </div>
        <div className="px-5 py-4 markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {seat.charterMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
