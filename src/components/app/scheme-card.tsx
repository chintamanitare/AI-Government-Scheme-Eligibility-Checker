import type { Scheme } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, ListOrdered, MessageSquareQuote, XCircle } from 'lucide-react';

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
    <Card className="bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{scheme.schemeName}</CardTitle>
        <div className="flex items-center gap-2">
          {scheme.priority && <PriorityBadge priority={scheme.priority} />}
          {scheme.eligible ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Eligible</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-destructive">
              <XCircle className="h-5 w-5" />
              <span className="font-semibold">Not Eligible</span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="explanation">
            <AccordionTrigger className='font-semibold text-base'>
              <MessageSquareQuote className='mr-2 h-5 w-5 text-primary'/> AI Explanation
            </AccordionTrigger>
            <AccordionContent className="prose prose-sm max-w-none text-muted-foreground pl-4 border-l-2 ml-2">
                {scheme.eligible ? scheme.explanation : scheme.rejectionReason}
            </AccordionContent>
          </AccordionItem>

          {scheme.documentsRequired && scheme.documentsRequired.length > 0 && (
            <AccordionItem value="documents">
              <AccordionTrigger className='font-semibold text-base'>
                <FileText className='mr-2 h-5 w-5 text-primary'/> Documents Required
              </AccordionTrigger>
              <AccordionContent className="pl-4 border-l-2 ml-2">
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {scheme.documentsRequired.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {scheme.applicationSteps && scheme.applicationSteps.length > 0 && (
            <AccordionItem value="steps">
              <AccordionTrigger className='font-semibold text-base'>
                <ListOrdered className='mr-2 h-5 w-5 text-primary'/> Application Steps
              </AccordionTrigger>
              <AccordionContent className="pl-4 border-l-2 ml-2">
                <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
                  {scheme.applicationSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
