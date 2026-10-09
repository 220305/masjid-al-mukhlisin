import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Masjid Al-Mukhlisin - Portal Resmi & Pusat Komando',
  description:
    'Sistem Informasi dan Manajemen Masjid Al-Mukhlisin. Transparansi kas umat, jadwal kajian & khutbah, serta manajemen inventaris terpadu.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-emerald-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
