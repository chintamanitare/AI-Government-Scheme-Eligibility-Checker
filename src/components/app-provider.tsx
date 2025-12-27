'use client';

import { FirebaseClientProvider } from '@/firebase/client-provider';
import AppHeader from '@/components/app/header';
import AppFooter from '@/components/app/footer';
import { Toaster } from '@/components/ui/toaster';
import Chatbot from '@/components/app/chatbot';

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <div className="relative flex min-h-dvh flex-col">
        <AppHeader />
        <main className="flex-1">{children}</main>
        <AppFooter />
      </div>
      <Toaster />
      <Chatbot />
    </FirebaseClientProvider>
  );
}
