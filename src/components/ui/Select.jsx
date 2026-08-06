"use client";

import { ChevronDown } from 'lucide-react';

export default function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-slate-500">{label}</p>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-200 px-4 py-3 pr-10 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">{placeholder || "Select option"}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronDown />
        </span>
      </div>
    </div>
  );
}