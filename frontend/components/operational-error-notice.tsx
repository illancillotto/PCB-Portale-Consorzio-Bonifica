import { OperationalActionFailure } from '../lib/operational-action';

interface OperationalErrorNoticeProps {
  failure: OperationalActionFailure | null;
}

const toneByKind: Record<
  OperationalActionFailure['kind'],
  {
    container: string;
    eyebrow: string;
    title: string;
  }
> = {
  authentication: {
    container: 'border-amber-200 bg-amber-50 text-amber-900',
    eyebrow: 'Sessione',
    title: 'Autenticazione richiesta',
  },
  authorization: {
    container: 'border-orange-200 bg-orange-50 text-orange-900',
    eyebrow: 'Permessi',
    title: 'Permessi insufficienti',
  },
  domain: {
    container: 'border-rose-200 bg-rose-50 text-rose-900',
    eyebrow: 'Dominio',
    title: 'Operazione non applicabile',
  },
  runtime: {
    container: 'border-[#d8b7ae] bg-[#f6dfda] text-[#9b3d2e]',
    eyebrow: 'Runtime',
    title: 'Errore infrastrutturale o applicativo',
  },
};

export function OperationalErrorNotice({ failure }: OperationalErrorNoticeProps) {
  if (!failure || failure.redirected) {
    return null;
  }

  const tone = toneByKind[failure.kind];

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tone.container}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em]">{tone.eyebrow}</p>
      <p className="mt-2 font-semibold">{tone.title}</p>
      <p className="mt-2">{failure.message}</p>
      {failure.code ? (
        <p className="mt-2 text-xs uppercase tracking-[0.12em] opacity-80">Codice {failure.code}</p>
      ) : null}
      {failure.requestId ? (
        <p className="mt-1 break-all text-xs opacity-80">Request ID {failure.requestId}</p>
      ) : null}
    </div>
  );
}
