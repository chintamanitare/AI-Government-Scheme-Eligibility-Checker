'use client';

import * as React from 'react';
import { getSavedChecks, type EligibilityCheckRecord, type EligibilityResponse } from '@/app/actions';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import ResultsDisplay from '@/components/app/results-display';
import { format } from 'date-fns';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [checks, setChecks] = React.useState<EligibilityCheckRecord[]>([]);
  const [selectedCheck, setSelectedCheck] = React.useState<EligibilityCheckRecord | null>(null);
  const [selectedCheckResponse, setSelectedCheckResponse] = React.useState<EligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchChecks = React.useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSavedChecks(userId);
      if (result.error) {
        setError(result.error);
        toast({
            variant: "destructive",
            title: "Could not fetch saved checks",
            description: result.error,
        });
      } else if (result.checks) {
        setChecks(result.checks);
        if (result.checks.length > 0) {
          handleSelectCheck(result.checks[0]);
        } else {
          setSelectedCheck(null);
          setSelectedCheckResponse(null);
        }
      }
    } catch (e: any) {
        setError("An unexpected error occurred while fetching your checks.");
        toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred while fetching your checks.",
        });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    // Wait until the user loading state is resolved.
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }
    
    // Once loading is done, check if we have a user.
    if (user) {
      fetchChecks(user.uid);
    } else {
      // If no user, stop loading and show appropriate message.
      setIsLoading(false);
      setError("Please sign in to view your dashboard.");
      setChecks([]);
      setSelectedCheck(null);
      setSelectedCheckResponse(null);
    }
  }, [user, isUserLoading, fetchChecks]);

  const handleSelectCheck = (check: EligibilityCheckRecord) => {
    setSelectedCheck(check);
    try {
      const aiResponse = JSON.parse(check.aiResponse);
      setSelectedCheckResponse(aiResponse);
    } catch (e) {
      setError("Failed to parse AI response for the selected check.");
      setSelectedCheckResponse(null);
    }
  };
  
  const handleRefresh = () => {
    if (user) {
        fetchChecks(user.uid);
    }
  };

  const renderTimestamp = (check: EligibilityCheckRecord) => {
    if (check.createdAt?.seconds) {
      return format(new Date(check.createdAt.seconds * 1000), 'PPP p');
    }
    if (typeof check.createdAt === 'string') {
        return format(new Date(check.createdAt), 'PPP p');
    }
    if (check.createdAt && !check.createdAt.seconds) {
      return 'Saving...'
    }
    return 'Date not available';
  }

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
     return (
        <div className="container mx-auto px-4 py-8 md:py-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline mb-4">
              Your Dashboard
            </h1>
            <Card>
              <CardContent className='p-8'>
                <p className='text-destructive'>{error || "Please sign in to view your dashboard."}</p>
                <Button asChild variant="link"><Link href="/">Sign in</Link></Button>
              </CardContent>
            </Card>
        </div>
     )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
            Your Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
            View your previously saved eligibility checks.
            </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}/>
            <span className='ml-2'>Refresh</span>
        </Button>
      </div>

      {(isLoading && checks.length === 0) ? (
         <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
      ) : error && !checks.length ? (
         <Card>
            <CardContent className='p-8 text-center'>
                <p className='text-destructive'>{error}</p>
            </CardContent>
         </Card>
      ) : (
        <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Saved Checks</CardTitle>
                    <CardDescription>Select a check to view the results.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                    {checks.length === 0 && !isLoading ? (
                        <div className='text-center text-muted-foreground p-4'>
                            <p>You have no saved checks yet.</p>
                            <Button asChild variant="link" className='px-1'>
                                <Link href="/">Perform a new check</Link>
                            </Button>
                        </div>
                    ): (
                        checks.map(check => (
                            <Button
                                key={check.id}
                                variant={selectedCheck?.id === check.id ? 'secondary' : 'outline'}
                                className="w-full justify-start text-left h-auto"
                                onClick={() => handleSelectCheck(check)}
                            >
                                <div className='flex flex-col'>
                                    <span>
                                        {`Age: ${check.age}, Income: ₹${check.income}`}
                                    </span>
                                    <span className='text-xs text-muted-foreground'>
                                        {renderTimestamp(check)}
                                    </span>
                                </div>
                            </Button>
                        ))
                    )}
                </CardContent>
            </Card>
            </div>
            <div className="lg:col-span-3">
                <ResultsDisplay result={selectedCheckResponse} isLoading={isLoading && !!selectedCheck} error={error && !!selectedCheck ? "Failed to load selected check." : null} />
            </div>
        </div>
      )}
    </div>
  );
}
