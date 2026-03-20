import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PCB - Portale Consorzio Bonifica',
  description: 'Portale interno per anagrafe CUUA, catasto, GIS e ingestione dati.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
