import type { Seat } from "../data/seats";
import { AuthorityBadge, StandbyBadge } from "./AuthorityBadge";

interface Props {
  seat: Seat;
  onView: (seat: Seat) => void;
}

export function SeatCard({ seat, onView }: Props) {
  return (
    <div className="panel-card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500">
            Seat {String(seat.id).padStart(2, "0")} . Tier {seat.tier}
          </div>
          <div className="text-base font-semibold text-slate-100 leading-tight">
            {seat.name}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{seat.tierName}</div>
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          <AuthorityBadge authority={seat.authority} />
          {seat.contingent && (
            <StandbyBadge tooltip={seat.activationCondition ?? "Contingent seat."} />
          )}
        </div>
      </div>
      <p className="text-sm text-slate-300 leading-snug">{seat.roleSummary}</p>
      <button
        type="button"
        className="btn self-start"
        onClick={() => onView(seat)}
      >
        View charter
      </button>
    </div>
  );
}
