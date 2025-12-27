'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, GraduationCap, Building2 } from 'lucide-react';
import Link from 'next/link';

const FeatureCard = ({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}) => (
  <Link href={href} className="block group">
    <Card className="h-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl hover:border-primary/50">
      <CardHeader className="flex flex-row items-center gap-4">
        <Icon className="h-10 w-10 text-primary" />
        <div>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end text-sm font-semibold text-primary transition-transform duration-300 group-hover:translate-x-1">
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl font-headline">
          Welcome to Aadhar Assist AI
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Your personal guide to Indian government benefits and student scholarships. Choose a path below to begin.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        <FeatureCard
          title="Government Schemes"
          description="Check your eligibility for various central and state government welfare schemes."
          href="/schemes"
          icon={Building2}
        />
        <FeatureCard
          title="Student Scholarships"
          description="Find scholarships tailored to your field of study, location, and background."
          href="/scholarships"
          icon={GraduationCap}
        />
      </div>
    </div>
  );
}
