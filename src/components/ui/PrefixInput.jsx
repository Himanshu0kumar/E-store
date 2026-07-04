"use client";

export default function PrefixInput({ label, prefix, value, onChange, placeholder = "0.00" }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-500">{label}</p>
      <div className="flex items-center rounded-xl border border-slate-200 px-4 py-3 transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
        <span className="mr-2 text-sm text-slate-400">{prefix}</span>
        <input
          type="number"
          step="0.01"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-300"
        />
      </div>
    </div>
  );
}