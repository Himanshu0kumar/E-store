"use client";

export default function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border border-slate-300 accent-emerald-500"
      />
      <span className="text-sm text-slate-600">{label}</span>
    </label>
  );
}