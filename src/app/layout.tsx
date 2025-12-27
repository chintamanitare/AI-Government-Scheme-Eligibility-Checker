import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/app/header';
import AppFooter from '@/components/app/footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Aadhar Assist AI',
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
