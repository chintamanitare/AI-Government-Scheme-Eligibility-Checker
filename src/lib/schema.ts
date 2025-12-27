import { z } from 'zod';

export const eligibilitySchema = z.object({
  age: z.coerce.number().min(1, 'Age is required').max(120, 'Please enter a valid age'),
  income: z.string().min(1, 'Annual income is required'),
  state: z.string().min(1, 'State is required'),
  category: z.string().min(1, 'Category is required'),
  occupation: z.string().min(1, 'Occupation is required'),
  language: z.string().min(1, 'Language is required'),
});

export type EligibilityFormValues = z.infer<typeof eligibilitySchema>;
