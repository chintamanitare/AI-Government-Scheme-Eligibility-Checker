import type { EligibilityResponse } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SchemeCard from './scheme-card';
import SchemeCardSkeleton from './scheme-card-skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, FileText, Download, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generatePdf, generateCsv } from '@/lib/report-generator';

interface ResultsDisplayProps {
  result: EligibilityResponse | null;
  isLoading: boolean;
  error: string | null;
}

export default function ResultsDisplay({ result, isLoading, error }: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Analyzing Your Profile...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Our AI is finding the best schemes for you. Please wait a moment.</p>
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
        <Card className="shadow-lg bg-transparent border-2 border-dashed">
            <CardContent className="p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-foreground">Your Results Will Appear Here</h3>
                <p className="mt-1 text-sm text-muted-foreground">Fill out the form to see which government schemes you might be eligible for.</p>
            </CardContent>
        </Card>
    );
  }

  const eligibleSchemes = result.schemes?.filter(s => s.eligible) || [];
  const notEligibleSchemes = result.schemes?.filter(s => !s.eligible) || [];
  const hasResults = eligibleSchemes.length > 0 || notEligibleSchemes.length > 0;


  const handleDownload = (format: 'pdf' | 'csv') => {
    if (!result || 'error' in result) return;
    if (format === 'pdf') {
      generatePdf(result);
    } else {
      generateCsv(result);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-start">
          <div className='space-y-1.5'>
            <CardTitle className="text-2xl text-primary font-headline">AI-Powered Eligibility Report</CardTitle>
          </div>
          {hasResults && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('csv')}>
                  Download as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent>
          {result.finalAdvice && (
            <div className="mb-6 p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg">
              <p className="font-semibold text-primary-dark">Final Advice from AI Advisor:</p>
              <p className="text-foreground">{result.finalAdvice}</p>
            </div>
          )}

          {eligibleSchemes.length > 0 && (
            <div className='space-y-4'>
              <h3 className="text-xl font-bold text-accent-dark">Eligible Schemes ({eligibleSchemes.length})</h3>
              {eligibleSchemes.map((scheme, index) => (
                <SchemeCard key={index} scheme={scheme} />
              ))}
            </div>
          )}

          {notEligibleSchemes.length > 0 && (
            <div className='mt-8 space-y-4'>
              <h3 className="text-xl font-bold">Potentially Relevant Schemes ({notEligibleSchemes.length})</h3>
              {notEligibleSchemes.map((scheme, index) => (
                <SchemeCard key={index} scheme={scheme} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
