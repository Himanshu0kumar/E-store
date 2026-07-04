"use client";

import { useState } from "react";

export default function CollapsibleSection({ title, description, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between border-b border-slate-100 px-6 py-5 text-left"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ⌄
        </span>
      </button>

      {/* COLLAPSIBLE BODY */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          open ? "max-h-[3000px] opacity-100" : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="space-y-5 p-6">{children}</div>
      </div>
    </div>
  );
}