'use client';

import * as React from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
          Your Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome, {user?.displayName || user?.email || 'User'}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Checks</CardTitle>
          <CardDescription>This feature is no longer available.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='text-center text-muted-foreground p-4'>
            <p>You can perform a new eligibility check on the home page.</p>
            <Button asChild variant="link" className='px-1'>
              <Link href="/">Perform a new check</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
