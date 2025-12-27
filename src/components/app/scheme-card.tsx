import type { Scheme } from '@/app/actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, ListOrdered, XCircle, ArrowUpRight, Info } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface SchemeCardProps {
  scheme: Scheme;
}

const PriorityBadge = ({ priority }: { priority: 'High' | 'Medium' | 'Low' }) => {
  const variant = {
    High: 'default',
    Medium: 'secondary',
    Low: 'outline',
  }[priority] as 'default' | 'secondary' | 'outline';

  return <Badge variant={variant}>{priority} Priority</Badge>;
};

export default function SchemeCard({ scheme }: SchemeCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg hover:border-primary/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 bg-muted/30 p-4">
        <div className="space-y-1.5">
          <CardTitle className="text-lg font-semibold">{scheme.schemeName}</CardTitle>
          <div className="flex items-center gap-2">
            {scheme.priority && <PriorityBadge priority={scheme.priority} />}
          </div>
        </div>
        
        {scheme.eligible ? (
          <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm py-1 px-3 rounded-full bg-green-100">
            <CheckCircle2 className="h-5 w-5" />
            Eligible
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-red-600 font-semibold text-sm py-1 px-3 rounded-full bg-red-100">
            <XCircle className="h-5 w-5" />
            Not Eligible
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-6">
        <div>
            <h4 className='font-semibold text-base flex items-center mb-2'>
              <Info className='h-5 w-5 mr-2 text-primary'/>
              AI Explanation
            </h4>
            <p className="text-sm text-muted-foreground pl-7">
              {scheme.eligible ? scheme.explanation : scheme.rejectionReason}
            </p>
        </div>

        <Accordion type="single" collapsible className="w-full" defaultValue='documents'>
          {scheme.documentsRequired && scheme.documentsRequired.length > 0 && (
            <AccordionItem value="documents">
              <AccordionTrigger className='font-semibold text-base no-underline hover:no-underline'>
                <div className='flex items-center'>
                    <FileText className='mr-2 h-5 w-5 text-primary'/> Documents Required
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <ul className="list-disc space-y-2 pl-12 text-muted-foreground text-sm">
                  {scheme.documentsRequired.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {scheme.applicationSteps && scheme.applicationSteps.length > 0 && (
            <AccordionItem value="steps">
              <AccordionTrigger className='font-semibold text-base no-underline hover:no-underline'>
                 <div className='flex items-center'>
                    <ListOrdered className='mr-2 h-5 w-5 text-primary'/> Application Steps
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <ol className="list-decimal space-y-2 pl-12 text-muted-foreground text-sm">
                  {scheme.applicationSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
      {scheme.applicationLink && (
        <CardFooter className="bg-muted/30 py-3 px-4 md:px-6 border-t">
          <Button asChild className='w-full' size="sm">
            <Link href={scheme.applicationLink} target="_blank" rel="noopener noreferrer">
              Go to Official Website
              <ArrowUpRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
