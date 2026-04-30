import { useEffect, useState } from "react";
import { getItem, setItem } from "../lib/storage";
import {
  DEFAULT_DEADLINES,
  Deadline,
  genId,
} from "../lib/deadlines";
import { DeadlineRow } from "../components/DeadlineRow";

function seedDefaults(): Deadline[] {
  return DEFAULT_DEADLINES.map((d) => ({ ...d, id: genId() }));
}

export function DeadlinesPage() {
  const [items, setItems] = useState<Deadline[]>(() => {
    const stored = getItem<Deadline[] | null>("deadlines", null);
    if (!stored || stored.length === 0) {
      const seeded = seedDefaults();
      setItem("deadlines", seeded);
      return seeded;
    }
    return stored;
  });

  // Keep storage in sync with local state.
  useEffect(() => {
    setItem("deadlines", items);
  }, [items]);

  function update(d: Deadline) {
    setItems((prev) => prev.map((x) => (x.id === d.id ? d : x)));
  }
  function add() {
    setItems((prev) => [
      ...prev,
      { id: genId(), name: "", rule: "", date: "", status: "pending" },
    ]);
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }
  function reseed() {
    if (
      !confirm(
        "Reset to the default Watchdog seed list? This replaces all current deadline rows.",
      )
    )
      return;
    setItems(seedDefaults());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Deadlines</h1>
          <p className="text-sm text-slate-400">
            Owner: Seat 15 Watchdog. Pre seeded from
            01_Matter/deadlines_TEMPLATE.md. Color codes: red under 7 days,
            amber 7 to 21, green beyond.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={reseed}>
            Reseed defaults
          </button>
          <button className="btn btn-primary" onClick={add}>
            Add row
          </button>
        </div>
      </div>
      <div className="overflow-x-auto panel-card">
        <table className="w-full text-sm">
          <thead className="text-left text-slate-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-2 py-2">Deadline</th>
              <th className="px-2 py-2">Rule</th>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Notes</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((d) => (
              <DeadlineRow
                key={d.id}
                deadline={d}
                onChange={update}
                onDelete={remove}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
