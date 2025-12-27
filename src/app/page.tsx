'use client';

import * as React from 'react';
import Image from 'next/image';
import { getEligibility, type EligibilityResponse } from '@/app/actions';
import EligibilityForm from '@/components/app/eligibility-form';
import ResultsDisplay from '@/components/app/results-display';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [result, setResult] = React.useState<EligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  const handleCheckEligibility = async (data: any) => {
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
      <div className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
              Aadhar Assist AI
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover the government schemes you're eligible for. Your personal guide to India's welfare programs, powered by AI.
            </p>
          </div>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <EligibilityForm
                onSubmit={handleCheckEligibility}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <ResultsDisplay
            result={result}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
