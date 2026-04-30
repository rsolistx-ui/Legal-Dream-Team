import { ReactNode } from "react";

interface Field {
  label: string;
  node: ReactNode;
  full?: boolean;
}

export function KeyValueGrid({ fields }: { fields: Field[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {fields.map((f, i) => (
        <div key={i} className={f.full ? "md:col-span-2" : ""}>
          <label className="label">{f.label}</label>
          {f.node}
        </div>
      ))}
    </div>
  );
}
