'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { normalizeNextPath } from '../lib/auth-redirect';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('pcb.operator');
  const [password, setPassword] = useState('pcb.operator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reason = searchParams.get('reason');
  const next = normalizeNextPath(searchParams.get('next'));
  const reasonMessage =
    reason === 'unauthorized'
      ? 'L’accesso alla vista richiesta richiede un ruolo operativo PCB valido.'
      : reason === 'authentication_required'
        ? 'Per aprire la vista richiesta devi autenticarti con una sessione operatore.'
        : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      setErrorMessage(payload?.message ?? 'Autenticazione non riuscita.');
      setIsSubmitting(false);
      return;
    }

    router.push(next || '/ingestion');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {reasonMessage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {reasonMessage}
        </div>
      ) : null}
      {next ? (
        <div className="rounded-2xl border border-[var(--pcb-line)] bg-white px-4 py-3 text-sm text-[var(--pcb-muted)]">
          Dopo il login verrai reindirizzato a <strong className="text-[var(--pcb-ink)]">{next}</strong>.
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}
      <label className="grid gap-2 text-sm text-[var(--pcb-muted)]">
        Username
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="rounded-2xl border border-[var(--pcb-line)] bg-white px-4 py-3 text-[var(--pcb-ink)] outline-none"
          autoComplete="username"
          required
        />
      </label>
      <label className="grid gap-2 text-sm text-[var(--pcb-muted)]">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-2xl border border-[var(--pcb-line)] bg-white px-4 py-3 text-[var(--pcb-ink)] outline-none"
          autoComplete="current-password"
          required
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-[var(--pcb-accent)] px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
      >
        {isSubmitting ? 'Accesso in corso...' : 'Accedi con Keycloak'}
      </button>
    </form>
  );
}
