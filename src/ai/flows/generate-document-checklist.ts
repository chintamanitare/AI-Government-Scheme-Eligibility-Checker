'use server';

/**
 * @fileOverview A document checklist generator for government schemes.
 *
 * - generateDocumentChecklist - A function that handles the document checklist generation process.
 * - GenerateDocumentChecklistInput - The input type for the generateDocumentChecklist function.
 * - GenerateDocumentChecklistOutput - The return type for the generateDocumentChecklist function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDocumentChecklistInputSchema = z.object({
  schemeName: z.string().describe('The name of the government scheme.'),
  age: z.number().describe('The age of the applicant.'),
  income: z.string().describe('The annual income of the applicant.'),
  state: z.string().describe('The state of the applicant.'),
  category: z.string().describe('The category of the applicant (General, SC, ST, OBC, EWS).'),
  occupation: z.string().describe('The occupation of the applicant.'),
});
export type GenerateDocumentChecklistInput = z.infer<typeof GenerateDocumentChecklistInputSchema>;

const GenerateDocumentChecklistOutputSchema = z.object({
  documentsRequired: z.array(z.string()).describe('A list of documents required for the scheme.'),
});
export type GenerateDocumentChecklistOutput = z.infer<typeof GenerateDocumentChecklistOutputSchema>;

export async function generateDocumentChecklist(input: GenerateDocumentChecklistInput): Promise<GenerateDocumentChecklistOutput> {
  return generateDocumentChecklistFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDocumentChecklistPrompt',
  input: {schema: GenerateDocumentChecklistInputSchema},
  output: {schema: GenerateDocumentChecklistOutputSchema},
  prompt: `You are an expert Indian government welfare scheme advisor. Your task is to generate a list of documents required for the applicant to apply for the scheme.

Consider the following information about the applicant:

Age: {{{age}}}
Annual Income: {{{income}}}
State: {{{state}}}
Category: {{{category}}}
Occupation: {{{occupation}}}

Scheme Name: {{{schemeName}}}

Based on the above information, generate a list of documents required for the applicant to apply for the scheme. The list should be comprehensive and include all necessary documents.

Example:
["Aadhar Card", "PAN Card", "Income Certificate", "Caste Certificate", "Residence Proof"]

Return the documents in JSON array format. Do not include any additional text. Do not include any explanations.

Documents Required:`, // Changed from documentsRequired to Documents Required
});

const generateDocumentChecklistFlow = ai.defineFlow(
  {
    name: 'generateDocumentChecklistFlow',
    inputSchema: GenerateDocumentChecklistInputSchema,
    outputSchema: GenerateDocumentChecklistOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
