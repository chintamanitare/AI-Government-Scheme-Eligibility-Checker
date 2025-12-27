import type { FindScholarshipsResponse } from '@/app/scholarship-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ScholarshipCard from './scholarship-card';
import SchemeCardSkeleton from './scheme-card-skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, FileText, Award, GraduationCap } from 'lucide-react';


interface ScholarshipResultsDisplayProps {
  result: FindScholarshipsResponse | null;
  isLoading: boolean;
  error: string | null;
}

export default function ScholarshipResultsDisplay({ result, isLoading, error }: ScholarshipResultsDisplayProps) {
  if (isLoading) {
    return (
      <Card className="shadow-xl border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Searching for Scholarships...
          </CardTitle>
          <CardDescription>Our AI is finding the best scholarships for you. Please wait a moment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SchemeCardSkeleton />
          <SchemeCardSkeleton />
          <SchemeCardSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="shadow-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return (
        <Card className="shadow-lg bg-background/50 border-2 border-dashed flex items-center justify-center min-h-[500px] bg-background/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">Your Scholarship Results Will Appear Here</h3>
                <p className="mt-1 text-sm text-muted-foreground">Fill out the form to see which scholarships you might be eligible for.</p>
            </CardContent>
        </Card>
    );
  }

  const hasResults = result.scholarships?.length > 0;

  return (
    <div className="space-y-8">
      <Card className="shadow-xl border-2 border-primary/20 bg-background/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row justify-between items-start">
          <div className='space-y-1.5'>
            <CardTitle className="text-2xl text-primary font-headline">AI-Powered Scholarship Report</CardTitle>
            <CardDescription>Here's what our AI found based on your profile.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {result.finalAdvice && (
            <div className="mb-8 p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg">
              <p className="font-semibold text-primary flex items-center gap-2">
                <Award className='h-5 w-5' />
                AI Advisor's Summary
              </p>
              <p className="text-foreground/90 mt-2">{result.finalAdvice}</p>
            </div>
          )}

          {hasResults ? (
            <div className='space-y-4'>
              <h3 className="text-xl font-bold text-green-600">Recommended Scholarships ({result.scholarships.length})</h3>
              {result.scholarships.map((scholarship, index) => (
                <ScholarshipCard key={index} scholarship={scholarship} />
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground p-8">No specific scholarships found based on your criteria. You can try adjusting your search.</p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
