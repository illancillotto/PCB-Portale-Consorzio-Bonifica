interface StatusChipProps {
  label: string;
}

export function StatusChip({ label }: StatusChipProps) {
  return (
    <span className="inline-flex rounded-full bg-[#e7efe8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#3e6445]">
      {label}
    </span>
  );
}
