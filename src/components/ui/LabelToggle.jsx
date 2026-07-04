"use client";

import Toggle from "./Toggle";

export default function LabelToggle({ enabled, onEnabledChange, label, value, onValueChange, placeholder }) {
  return (
    <div className="flex items-center gap-3">
      <Toggle
        checked={enabled}
        onChange={onEnabledChange}
      />
      <input
        type="text"
        disabled={!enabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition disabled:bg-slate-50 disabled:text-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}