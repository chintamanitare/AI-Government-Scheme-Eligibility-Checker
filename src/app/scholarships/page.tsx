'use client';

import * as React from 'react';
import { findScholarships, type FindScholarshipsResponse } from '@/app/scholarship-actions';
import ScholarshipForm from '@/components/app/scholarship-form';
import ScholarshipResultsDisplay from '@/components/app/scholarship-results-display';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import type { ScholarshipFormValues } from '@/lib/scholarship-schema';

export default function ScholarshipsPage() {
  const [result, setResult] = React.useState<FindScholarshipsResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { toast } = useToast();

  const handleFindScholarships = async (data: ScholarshipFormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await findScholarships(data);

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
              Student Scholarships
            </h1>
            <p className="text-lg text-muted-foreground">
              Find scholarships tailored to your degree and profile.
            </p>
          </div>
          <Card className="shadow-lg border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <ScholarshipForm
                onSubmit={handleFindScholarships}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 space-y-4">
          <ScholarshipResultsDisplay
            result={result}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
