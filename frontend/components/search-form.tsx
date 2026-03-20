import Link from 'next/link';

interface SearchFormProps {
  defaultValue?: string;
}

export function SearchForm({ defaultValue }: SearchFormProps) {
  return (
    <form action="/search" className="flex flex-col gap-3 md:flex-row">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Cerca per CUUA, nominativo, identificativo o riferimento catastale"
        className="min-h-12 flex-1 rounded-2xl border border-[var(--pcb-line)] bg-white px-4 text-sm text-[var(--pcb-ink)] outline-none transition focus:border-[var(--pcb-accent)]"
      />
      <div className="flex gap-3">
        <button
          type="submit"
          className="min-h-12 rounded-2xl bg-[var(--pcb-accent)] px-5 text-sm font-semibold text-white"
        >
          Cerca
        </button>
        <Link
          href="/subjects"
          className="flex min-h-12 items-center rounded-2xl border border-[var(--pcb-line)] px-5 text-sm font-medium text-[var(--pcb-ink)]"
        >
          Soggetti
        </Link>
      </div>
    </form>
  );
}
