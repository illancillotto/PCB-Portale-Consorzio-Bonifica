import Link from 'next/link';
import { PageShell } from '../../components/page-shell';
import { SearchForm } from '../../components/search-form';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { getSubjects } from '../../lib/api';

interface SubjectsPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function SubjectsPage({ searchParams }: SubjectsPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? '';
  const response = await getSubjects(query || undefined);

  return (
    <PageShell
      title="Soggetti master"
      description="Anagrafe unica centrata sul CUUA. La lista usa dati reali e consente accesso diretto alla scheda soggetto."
      actions={<SearchForm defaultValue={query} />}
    >
      <SectionCard title={query ? `Risultati per "${query}"` : 'Elenco soggetti'} eyebrow="Anagrafiche">
        {response.items.length === 0 ? (
          <p className="text-sm text-[var(--pcb-muted)]">Nessun soggetto trovato con i filtri correnti.</p>
        ) : (
          <div className="grid gap-4">
            {response.items.map((subject) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.id}`}
                className="rounded-[20px] border border-[var(--pcb-line)] bg-white p-5 transition hover:-translate-y-0.5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--pcb-ink)]">
                      {subject.currentDisplayName}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--pcb-muted)]">CUUA {subject.cuua}</p>
                  </div>
                  <StatusChip label={subject.status} />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--pcb-muted)] md:grid-cols-2">
                  <div>
                    <span className="font-medium text-[var(--pcb-ink)]">Confidence</span>
                    <p>{subject.confidenceScore.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-[var(--pcb-ink)]">Identificativi</span>
                    <p>{subject.identifiers.map((item) => item.value).join(' · ')}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
