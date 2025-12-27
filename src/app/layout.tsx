import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/app/header';
import AppFooter from '@/components/app/footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Government Scheme & Scholarship Checker',
  description: 'Check your eligibility for government schemes and scholarships in seconds.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className={cn('min-h-screen bg-background font-body antialiased')}>
          <FirebaseClientProvider>
            <div className="relative flex min-h-dvh flex-col">
              <AppHeader />
              <main className="flex-1">{children}</main>
              <AppFooter />
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </div>
      </body>
    </html>
  );
}
