'use client';

import * as React from 'react';
import { getEligibility, saveCheck, type EligibilityResponse } from '@/app/actions';
import EligibilityForm from '@/components/app/eligibility-form';
import ResultsDisplay from '@/components/app/results-display';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import Chatbot from '@/components/app/chatbot';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Save } from 'lucide-react';
import type { EligibilityFormValues } from '@/lib/schema';
import type { CheckEligibilityOutput } from '@/ai/flows/check-eligibility';

export default function Home() {
  const [result, setResult] = React.useState<EligibilityResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<EligibilityFormValues | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasBeenSaved, setHasBeenSaved] = React.useState(false);

  const { toast } = useToast();
  const { user } = useUser();

  const handleCheckEligibility = async (data: EligibilityFormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setFormData(data); // Save form data
    setHasBeenSaved(false); // Reset save state for new check

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

  const handleSaveCheck = async () => {
    if (!formData || !result || 'error' in result) return;

    setIsSaving(true);
    const response = await saveCheck(formData, result as CheckEligibilityOutput);
    setIsSaving(false);

    if (response.error) {
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: response.error,
      });
    } else {
      setHasBeenSaved(true);
      toast({
        title: 'Check saved!',
        description: 'You can view it on your dashboard.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl font-headline">
              AI Government Scheme Eligibility Checker
            </h1>
            <p className="text-lg text-muted-foreground">
              Know your government benefits in seconds.
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
        <div className="lg:col-span-3 space-y-4">
          {result && !('error' in result) && user && (
            <Card>
              <CardContent className='p-4 flex items-center justify-between'>
                  <p className='text-sm text-muted-foreground'>Happy with the results? Save them to your dashboard.</p>
                  <Button onClick={handleSaveCheck} disabled={isSaving || hasBeenSaved}>
                    {isSaving && <Loader2 className='animate-spin' />}
                    {hasBeenSaved && <Check />}
                    {!isSaving && !hasBeenSaved && <Save />}
                    <span className='ml-2'>
                        {isSaving ? 'Saving...' : hasBeenSaved ? 'Saved' : 'Save Check'}
                    </span>
                  </Button>
              </CardContent>
            </Card>
          )}
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
