import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

const NAV: { to: string; label: string }[] = [
  { to: "/", label: "Dashboard" },
  { to: "/case-file", label: "Case File" },
  { to: "/deadlines", label: "Deadlines" },
  { to: "/panel", label: "Panel" },
  { to: "/convene", label: "Convene" },
  { to: "/pleadings", label: "Pleadings" },
  { to: "/discovery", label: "Discovery" },
  { to: "/evidence", label: "Evidence" },
  { to: "/settlement", label: "Settlement" },
  { to: "/trial", label: "Trial" },
  { to: "/appeal", label: "Appeal" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <aside
        className={`${open ? "block" : "hidden"} md:block fixed md:static z-30 w-64 shrink-0 border-r border-slate-800 bg-slate-950 h-screen md:sticky md:top-0 overflow-y-auto`}
      >
        <div className="px-4 py-5 border-b border-slate-800">
          <div className="text-sm uppercase tracking-widest text-slate-500">
            Texas civil defense
          </div>
          <div className="text-lg font-bold text-slate-100">
            Legal Dream Team
          </div>
          <div className="text-xs text-slate-500 mt-1">
            22 seat panel. J.P. Court matter.
          </div>
        </div>
        <nav className="py-2">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm border-l-2 ${
                  isActive
                    ? "border-indigo-500 bg-slate-900 text-white"
                    : "border-transparent text-slate-300 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 text-xs text-slate-600 border-t border-slate-800">
          ATTORNEY WORK PRODUCT (SELF PREPARED). Not for disclosure.
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-20 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn"
            aria-label="Toggle navigation"
          >
            Menu
          </button>
          <span className="font-semibold">Legal Dream Team</span>
          <span className="w-12" />
        </header>
        <main className="p-6 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
