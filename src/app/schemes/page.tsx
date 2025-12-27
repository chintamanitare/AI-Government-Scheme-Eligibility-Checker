'use client';

import * as React from 'react';
import { getEligibility, type EligibilityResponse } from '@/app/actions';
import EligibilityForm from '@/components/app/eligibility-form';
import ResultsDisplay from '@/components/app/results-display';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import Chatbot from '@/components/app/chatbot';
import type { EligibilityFormValues } from '@/lib/schema';

export default function SchemesPage() {
  const [result, setResult] = React.useState<EligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { toast } = useToast();

  const handleCheckEligibility = async (data: EligibilityFormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await getEligibility(data);

    if (response.error) {
      setError(response.error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: response.error,
      });
    } else {
      setResult(response);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid gap-12 lg:grid-cols-5 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
              Government Schemes
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill out the form to find central and state government schemes you may be eligible for.
            </p>
          </div>
          <Card className="shadow-lg border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <EligibilityForm
                onSubmit={handleCheckEligibility}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 space-y-4">
          <ResultsDisplay
            result={result}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
      <Chatbot />
    </div>
  );
}
