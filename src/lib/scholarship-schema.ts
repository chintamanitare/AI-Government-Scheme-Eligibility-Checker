import { z } from 'zod';

export const scholarshipSchema = z.object({
  age: z.coerce.number().min(1, 'Age is required').max(120, 'Please enter a valid age'),
  income: z.string().min(1, 'Annual income is required').regex(/^\d+$/, 'Please enter a valid income amount.'),
  state: z.string().min(1, 'State is required'),
  category: z.string().min(1, 'Category is required'),
  degree: z.string().min(1, 'Degree/Course is required'),
  language: z.string().min(1, 'Language is required'),
});

export type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;
