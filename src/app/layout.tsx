import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppHeader from '@/components/app/header';
import AppFooter from '@/components/app/footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import Chatbot from '@/components/app/chatbot';
import ClientOnly from '@/components/client-only';

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
        <ClientOnly>
          <FirebaseClientProvider>
            <div className="relative flex min-h-dvh flex-col">
              <AppHeader />
              <main className="flex-1">{children}</main>
              <AppFooter />
            </div>
            <Toaster />
            <Chatbot />
          </FirebaseClientProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
