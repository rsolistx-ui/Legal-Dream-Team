import type { Deadline, DeadlineStatus } from "../lib/deadlines";
import { daysUntil, urgencyClass } from "../lib/deadlines";

interface Props {
  deadline: Deadline;
  onChange: (d: Deadline) => void;
  onDelete: (id: string) => void;
}

const STATUSES: DeadlineStatus[] = ["pending", "filed", "answered", "N/A"];

export function DeadlineRow({ deadline, onChange, onDelete }: Props) {
  const days = daysUntil(deadline.date);
  return (
    <tr className={urgencyClass(deadline)}>
      <td className="px-2 py-2 align-top">
        <input
          className="input"
          value={deadline.name}
          onChange={(e) => onChange({ ...deadline, name: e.target.value })}
        />
      </td>
      <td className="px-2 py-2 align-top">
        <input
          className="input"
          value={deadline.rule}
          onChange={(e) => onChange({ ...deadline, rule: e.target.value })}
        />
      </td>
      <td className="px-2 py-2 align-top">
        <input
          type="date"
          className="input"
          value={deadline.date}
          onChange={(e) => onChange({ ...deadline, date: e.target.value })}
        />
        {days !== null && deadline.status === "pending" && (
          <div className="text-xs text-slate-400 mt-1">
            {days < 0
              ? `Overdue by ${Math.abs(days)} day(s)`
              : `${days} day(s) out`}
          </div>
        )}
      </td>
      <td className="px-2 py-2 align-top">
        <select
          className="input"
          value={deadline.status}
          onChange={(e) =>
            onChange({ ...deadline, status: e.target.value as DeadlineStatus })
          }
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2 align-top">
        <input
          className="input"
          placeholder="Notes"
          value={deadline.notes ?? ""}
          onChange={(e) => onChange({ ...deadline, notes: e.target.value })}
        />
      </td>
      <td className="px-2 py-2 align-top">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDelete(deadline.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
