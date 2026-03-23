interface StatusChipProps {
  label: string;
}

export function StatusChip({ label }: StatusChipProps) {
  const normalized = label.toLowerCase();

  const style =
    normalized === 'critical'
      ? 'bg-[#f6dfda] text-[#9b3d2e]'
      : normalized === 'warning' || normalized === 'review'
      ? 'bg-[#f7eed9] text-[#8b6a19]'
      : normalized === 'unmatched' || normalized === 'rejected'
        ? 'bg-[#f6dfda] text-[#9b3d2e]'
        : normalized === 'accepted' ||
            normalized === 'matched' ||
            normalized === 'completed' ||
            normalized === 'healthy' ||
            normalized === 'ok' ||
            normalized === 'runnable'
          ? 'bg-[#e7efe8] text-[#3e6445]'
          : 'bg-[#e9edf2] text-[#4f5f72]';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${style}`}
    >
      {label}
    </span>
  );
}
