import type { Scholarship } from '@/app/scholarship-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ArrowUpRight, Award, Info } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  return (
    <Card className="bg-card/80 transition-shadow hover:shadow-md hover:border-primary/30 border-border">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-2">
            <CardTitle className="text-lg font-medium">{scholarship.scholarshipName}</CardTitle>
            {scholarship.provider && <Badge variant="secondary">{scholarship.provider}</Badge>}
        </div>
        
        {scholarship.eligible ? (
            <span className="flex items-center gap-1.5 text-green-500 font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                Likely Eligible
            </span>
            ) : (
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold text-sm">
                <Info className="h-5 w-5" />
                Check Eligibility
            </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{scholarship.description}</p>
        
        <div className='flex flex-wrap gap-2 mt-4'>
            {scholarship.benefits.map((benefit, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                    <Award className="mr-1 h-3 w-3" />
                    {benefit}
                </Badge>
            ))}
        </div>
      </CardContent>
      {scholarship.applicationLink && (
        <CardFooter className="bg-muted/30 py-3 px-6">
            <Button asChild className='w-full' size="sm">
                <Link href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer">
                    Visit & Apply
                    <ArrowUpRight className='ml-2 h-4 w-4' />
                </Link>
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
