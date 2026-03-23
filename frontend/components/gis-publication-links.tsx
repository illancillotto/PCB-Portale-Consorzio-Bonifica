import { StatusChip } from './status-chip';
import type { GisPublicationStatus } from '../lib/api';

interface GisPublicationLinksProps {
  publicationStatus: GisPublicationStatus;
}

export function GisPublicationLinks({ publicationStatus }: GisPublicationLinksProps) {
  return (
    <div className="rounded-2xl border border-[var(--pcb-line)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--pcb-ink)]">QGIS publication target</p>
          <p className="mt-1 break-all text-xs text-[var(--pcb-muted)]">
            {publicationStatus.serviceUrl || 'non configurato'}
          </p>
          {publicationStatus.projectFile ? (
            <p className="mt-1 break-all text-[11px] text-[var(--pcb-muted)]">
              Progetto {publicationStatus.projectFile}
            </p>
          ) : null}
        </div>
        <StatusChip label={publicationStatus.statusLabel} />
      </div>

      <p className="mt-3 text-xs text-[var(--pcb-muted)]">
        {publicationStatus.available
          ? `QGIS Server raggiungibile · HTTP ${publicationStatus.statusCode ?? 'n/d'}`
          : publicationStatus.configured
            ? 'QGIS Server non ancora raggiungibile o non pronto'
            : 'QGIS Server non configurato'}
      </p>

      {publicationStatus.statusDetail ? (
        <p className="mt-2 text-xs text-[var(--pcb-muted)]">{publicationStatus.statusDetail}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {publicationStatus.serviceUrl ? (
          <a
            href={publicationStatus.serviceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[var(--pcb-line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--pcb-ink)]"
          >
            Apri endpoint OWS
          </a>
        ) : null}
        {publicationStatus.capabilitiesUrl ? (
          <a
            href={publicationStatus.capabilitiesUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[var(--pcb-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
          >
            Apri GetCapabilities
          </a>
        ) : null}
      </div>
    </div>
  );
}
