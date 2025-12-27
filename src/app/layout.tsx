import type { Metadata } from 'next';
import './globals.css';

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
        <div id="__next">{children}</div>
      </body>
    </html>
  );
}
