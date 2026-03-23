'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('pcb.operator');
  const [password, setPassword] = useState('pcb.operator');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reason = searchParams.get('reason');

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

    router.push('/ingestion');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {reason === 'unauthorized' ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          L&apos;accesso alla vista richiesta richiede un ruolo operativo valido.
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
