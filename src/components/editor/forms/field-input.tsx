"use client";

export function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-tertiary">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-secondary bg-primary px-3 text-sm text-primary outline-none transition-colors focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/30 placeholder:text-quaternary"
      />
    </div>
  );
}
