import Link from 'next/link';
import { PageShell } from '../../components/page-shell';
import { SearchForm } from '../../components/search-form';
import { SectionCard } from '../../components/section-card';
import { StatusChip } from '../../components/status-chip';
import { getAuditEntitySummaries, getSubjects } from '../../lib/api';
import { getOptionalSession } from '../../lib/auth';

interface SubjectsPageProps {
  searchParams?: Promise<{
    q?: string;
  }>;
}

export default async function SubjectsPage({ searchParams }: SubjectsPageProps) {
  const session = await getOptionalSession();
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? '';
  const response = await getSubjects(query || undefined);
  const auditSummaries = session
    ? await getAuditEntitySummaries(session.accessToken, {
        entityType: 'subject',
        entityIds: response.items.map((subject) => subject.id),
      })
    : { items: [], total: 0 };
  const auditSummaryMap = new Map(auditSummaries.items.map((item) => [item.entityId, item]));

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
              <article
                key={subject.id}
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
                {session ? (
                  <div className="mt-4 grid gap-3 text-sm text-[var(--pcb-muted)] md:grid-cols-3">
                    <div>
                      <span className="font-medium text-[var(--pcb-ink)]">Eventi audit</span>
                      <p>{auditSummaryMap.get(subject.id)?.total ?? 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-[var(--pcb-ink)]">System operator</span>
                      <p>{auditSummaryMap.get(subject.id)?.systemOperatorEvents ?? 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-[var(--pcb-ink)]">Ultimo evento</span>
                      <p>
                        {auditSummaryMap.get(subject.id)?.latestCreatedAt
                          ? new Date(auditSummaryMap.get(subject.id)!.latestCreatedAt!).toLocaleString('it-IT')
                          : 'n/d'}
                      </p>
                    </div>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/subjects/${subject.id}`}
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                  >
                    Apri scheda
                  </Link>
                  <Link
                    href={`/gis?subjectId=${subject.id}&preset=relazioni&layers=pcb_subject_parcel_links`}
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                  >
                    Apri GIS
                  </Link>
                  <Link
                    href={`/audit?entityType=subject&entityId=${subject.id}`}
                    className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-muted)]"
                  >
                    Audit soggetto
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
