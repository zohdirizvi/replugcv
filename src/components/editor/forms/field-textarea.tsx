"use client";

export function FieldTextarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-tertiary">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary outline-none transition-colors focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 resize-y placeholder:text-quaternary"
      />
    </div>
  );
}
