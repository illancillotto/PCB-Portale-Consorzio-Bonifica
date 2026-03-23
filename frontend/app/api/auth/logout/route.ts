import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { pcbSessionCookieName } from '../../../../lib/auth';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(pcbSessionCookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 0,
  });

  const frontendBaseUrl = process.env.PCB_FRONTEND_BASE_URL ?? 'http://127.0.0.1:3000';

  return NextResponse.redirect(`${frontendBaseUrl}/login`);
}
