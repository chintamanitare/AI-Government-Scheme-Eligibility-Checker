import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/app/header';
import AppFooter from '@/components/app/footer';
import { PT_Sans } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'GovScheme AI - Eligibility Checker',
  description: 'Know your government benefits in seconds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ptSans.variable} min-h-screen bg-background font-body antialiased`}>
        <FirebaseClientProvider>
          <div className="relative flex min-h-dvh flex-col">
            <AppHeader />
            <main className="flex-1">{children}</main>
            <AppFooter />
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
