import type { Scholarship } from '@/app/scholarship-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowUpRight, Award, Info } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface ScholarshipCardProps {
  scholarship: Scholarship;
}

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg hover:border-primary/30">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 bg-muted/30 p-4">
        <div className="space-y-1.5">
            <CardTitle className="text-lg font-medium">{scholarship.scholarshipName}</CardTitle>
            {scholarship.provider && <Badge variant="secondary">{scholarship.provider}</Badge>}
        </div>
        
        {scholarship.eligible ? (
            <span className="flex items-center gap-1.5 text-green-600 font-semibold text-sm py-1 px-3 rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5" />
                Likely Eligible
            </span>
            ) : (
            <span className="flex items-center gap-1.5 text-amber-600 font-semibold text-sm py-1 px-3 rounded-full bg-amber-100">
                <Info className="h-5 w-5" />
                Check Eligibility
            </span>
        )}
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        <p className="text-sm text-muted-foreground">{scholarship.description}</p>
        
        {scholarship.benefits.length > 0 && (
            <div>
                <h4 className="font-semibold text-sm mb-2">Benefits:</h4>
                <div className='flex flex-wrap gap-2'>
                    {scholarship.benefits.map((benefit, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-normal">
                            <Award className="mr-1 h-3 w-3" />
                            {benefit}
                        </Badge>
                    ))}
                </div>
            </div>
        )}
      </CardContent>
      {scholarship.applicationLink && (
        <CardFooter className="bg-muted/30 py-3 px-4 md:px-6 border-t">
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
