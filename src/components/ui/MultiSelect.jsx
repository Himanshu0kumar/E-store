"use client";

export default function MultiSelect({ label, value = [], onChange, options }) {
  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-500">{label}</p>
      <div className="space-y-2">
        {options?.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => toggleOption(opt.value)}
              className="h-4 w-4 rounded border border-slate-300 accent-emerald-500"
            />
            <span className="text-sm text-slate-600">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}