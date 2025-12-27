'use client';

import * as React from 'react';
import { getSavedChecks, type EligibilityCheckRecord, type EligibilityResponse } from '@/app/actions';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import ResultsDisplay from '@/components/app/results-display';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const [checks, setChecks] = React.useState<EligibilityCheckRecord[]>([]);
  const [selectedCheck, setSelectedCheck] = React.useState<EligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchChecks = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getSavedChecks();
    if (result.error) {
      setError(result.error);
    } else if (result.checks) {
      setChecks(result.checks);
      if (result.checks.length > 0) {
        handleSelectCheck(result.checks[0]);
      } else {
        setSelectedCheck(null);
      }
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    if (!isUserLoading && user) {
      fetchChecks();
    }
    if (!isUserLoading && !user) {
        setIsLoading(false);
        setError("Please sign in to view your dashboard.");
    }
  }, [user, isUserLoading, fetchChecks]);

  const handleSelectCheck = (check: EligibilityCheckRecord) => {
    try {
      const aiResponse = JSON.parse(check.aiResponse);
      setSelectedCheck(aiResponse);
    } catch (e) {
      setError("Failed to parse AI response for the selected check.");
      setSelectedCheck(null);
    }
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
     return (
        <div className="container mx-auto px-4 py-8 md:py-12 text-center">
            <p className='text-destructive'>{error}</p>
        </div>
     )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="space-y-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
          Your Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          View your previously saved eligibility checks.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
           <Card>
            <CardHeader>
                <CardTitle>Saved Checks</CardTitle>
                <CardDescription>Select a check to view the results.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
                {checks.length === 0 ? (
                    <p className='text-muted-foreground text-sm'>You have no saved checks yet. Go to the homepage to perform a new check.</p>
                ): (
                    checks.map(check => (
                        <Button
                            key={check.id}
                            variant="outline"
                            className="w-full justify-start text-left h-auto"
                            onClick={() => handleSelectCheck(check)}
                        >
                            <div className='flex flex-col'>
                                <span>
                                    {`Age: ${check.age}, Income: ₹${check.income}`}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                    {format(new Date(check.createdAt.seconds * 1000), 'PPP p')}
                                </span>
                            </div>
                        </Button>
                    ))
                )}
            </CardContent>
           </Card>
        </div>
        <div className="lg:col-span-3">
            <ResultsDisplay result={selectedCheck} isLoading={false} error={null} />
        </div>
      </div>
    </div>
  );
}
