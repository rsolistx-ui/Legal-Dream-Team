import { useState } from "react";
import { TIERS } from "../data/tiers";
import { SEATS, Seat } from "../data/seats";
import { SeatCard } from "../components/SeatCard";
import { CharterDrawer } from "../components/CharterDrawer";

const ACCENT_RING: Record<string, string> = {
  indigo: "border-indigo-500",
  sky: "border-sky-500",
  emerald: "border-emerald-500",
  teal: "border-teal-500",
  red: "border-red-600",
  amber: "border-amber-500",
  violet: "border-violet-500",
  rose: "border-rose-500",
};

export function PanelPage() {
  const [active, setActive] = useState<Seat | null>(null);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel</h1>
        <p className="text-sm text-slate-400">
          22 seats grouped into 9 tiers. Hard veto seats halt the panel in their
          domain. Contingent seats stay on standby until activated.
        </p>
      </div>
      {TIERS.map((tier) => {
        const seats = tier.seatIds
          .map((id) => SEATS.find((s) => s.id === id))
          .filter((s): s is Seat => Boolean(s));
        return (
          <section key={tier.id} className="space-y-3">
            <div
              className={`border-l-4 pl-3 ${ACCENT_RING[tier.accent] ?? "border-slate-500"}`}
            >
              <div className="text-xs uppercase tracking-widest text-slate-500">
                Tier {tier.id}
              </div>
              <div className="text-lg font-semibold">{tier.name}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {seats.map((s) => (
                <SeatCard key={s.id} seat={s} onView={setActive} />
              ))}
            </div>
          </section>
        );
      })}
      <CharterDrawer seat={active} onClose={() => setActive(null)} />
    </div>
  );
}
