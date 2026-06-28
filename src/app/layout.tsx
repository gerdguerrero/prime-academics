import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SiteShell } from '@/components/site-shell';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Prime Academics | Budget School Supplies',
  description: 'Budget-friendly school supplies, school kits, classroom packs, and daily student essentials.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
