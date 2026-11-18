import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Public_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-public-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RuangKampus — Sistem Tempahan Ruang & Peralatan',
  description:
    'Portal pengurusan tempahan bilik perbincangan, makmal komputer, serta pinjaman peralatan studio dan sukan kampus.',
  openGraph: {
    title: 'RuangKampus — Sistem Tempahan Ruang & Peralatan',
    description:
      'Portal pengurusan tempahan bilik perbincangan, makmal komputer, serta pinjaman peralatan studio dan sukan kampus.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RuangKampus — Sistem Tempahan Ruang & Peralatan',
    description:
      'Portal pengurusan tempahan bilik perbincangan, makmal komputer, serta pinjaman peralatan studio dan sukan kampus.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ms"
      className={`${jakarta.variable} ${publicSans.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
