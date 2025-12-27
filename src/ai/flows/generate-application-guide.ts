'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a step-by-step application guide for a given government scheme.
 *
 * - generateApplicationGuide - A function that generates a step-by-step application guide for a given government scheme.
 * - GenerateApplicationGuideInput - The input type for the generateApplicationGuide function.
 * - GenerateApplicationGuideOutput - The return type for the generateApplicationGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateApplicationGuideInputSchema = z.object({
  schemeName: z.string().describe('The name of the government scheme.'),
  userDetails: z.string().describe('Details about the user applying for the scheme, including age, income, state, category, and occupation.'),
});
export type GenerateApplicationGuideInput = z.infer<typeof GenerateApplicationGuideInputSchema>;

const GenerateApplicationGuideOutputSchema = z.object({
  applicationSteps: z.array(z.string()).describe('A list of step-by-step instructions for applying to the scheme.'),
});
export type GenerateApplicationGuideOutput = z.infer<typeof GenerateApplicationGuideOutputSchema>;

export async function generateApplicationGuide(input: GenerateApplicationGuideInput): Promise<GenerateApplicationGuideOutput> {
  return generateApplicationGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateApplicationGuidePrompt',
  input: {schema: GenerateApplicationGuideInputSchema},
  output: {schema: GenerateApplicationGuideOutputSchema},
  prompt: `You are an expert Indian government welfare scheme advisor. Your task is to generate a step-by-step application guide for the given scheme, tailored to the user's details.

Scheme Name: {{{schemeName}}}
User Details: {{{userDetails}}}

Provide a clear and concise step-by-step guide that includes all necessary steps, required documents (if possible), and relevant links. Use simple, citizen-friendly language and avoid legal jargon. Think like a government helpdesk officer.

Format the application steps as a numbered list.
`,
});

const generateApplicationGuideFlow = ai.defineFlow(
  {
    name: 'generateApplicationGuideFlow',
    inputSchema: GenerateApplicationGuideInputSchema,
    outputSchema: GenerateApplicationGuideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
