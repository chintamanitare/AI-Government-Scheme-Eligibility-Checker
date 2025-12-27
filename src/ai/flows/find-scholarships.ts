'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const FindScholarshipsInputSchema = z.object({
  age: z.number().describe('The age of the applicant.'),
  income: z.string().describe('The annual family income of the applicant in Indian Rupees (₹).'),
  state: z.string().describe('The state of domicile for the applicant.'),
  category: z.string().describe('The caste/community category of the applicant (General, SC, ST, OBC, EWS, Minority).'),
  degree: z.string().describe('The current degree or course the student is enrolled in (e.g., 12th Pass, Undergraduate B.Tech, Postgraduate M.A.).'),
  language: z.string().describe('The preferred language for the response (e.g., English, Hindi, Marathi).'),
});

export type FindScholarshipsInput = z.infer<typeof FindScholarshipsInputSchema>;

export const ScholarshipSchema = z.object({
  scholarshipName: z.string().describe("The name of the scholarship."),
  provider: z.string().describe("The organization or platform providing the scholarship (e.g., Buddy4Study, MahaDBT, National Scholarship Portal)."),
  eligible: z.boolean().describe("Whether the user is likely eligible based on the provided details."),
  description: z.string().describe("A brief, clear description of the scholarship. This should be in the user's selected language."),
  benefits: z.array(z.string()).describe("A list of key benefits, like 'Up to ₹50,000', 'Tuition Fee Waiver', etc."),
  applicationLink: z.string().url().nullable().describe("The direct official URL to the scholarship's application page or portal."),
});

export const FindScholarshipsOutputSchema = z.object({
  scholarships: z.array(ScholarshipSchema).describe("A list of 3-5 relevant scholarships for the student."),
  finalAdvice: z.string().describe("A concluding piece of advice for the student in a friendly, encouraging tone. This should be in the user's selected language."),
});

export type FindScholarshipsOutput = z.infer<typeof FindScholarshipsOutputSchema>;

const scholarshipPrompt = ai.definePrompt({
  name: 'scholarshipPrompt',
  input: { schema: FindScholarshipsInputSchema },
  output: { schema: FindScholarshipsOutputSchema },
  prompt: `
    You are an expert Indian scholarship advisor. Your goal is to find relevant scholarships for a student based on their profile. You must use your knowledge of major scholarship portals.

    **Key Scholarship Platforms to Consider:**
    - National Scholarship Portal (NSP)
    - Buddy4Study
    - MahaDBT (for Maharashtra)
    - State-specific government scholarship portals
    - Major private foundations (e.g., HDFC, Reliance Foundation, Tata Trusts)

    **User Profile:**
    - Age: {{{age}}}
    - Annual Family Income: ₹{{{income}}}
    - State of Domicile: {{{state}}}
    - Category: {{{category}}}
    - Current Degree/Course: {{{degree}}}
    - Preferred Language for Response: {{{language}}}

    **Your Tasks:**

    1.  **Analyze User Profile:** Carefully review the student's details.
    2.  **Identify Scholarships:** Find 3-5 of the most relevant scholarships from the platforms listed above (or others you know). Focus on scholarships that match the user's degree, state, and category.
    3.  **Determine Eligibility:** For each scholarship, make a reasonable assessment of whether the user is **likely eligible**. It's okay if you're not 100% certain, but base it on the core criteria. Set the 'eligible' flag to true or false.
    4.  **Describe the Scholarship:** Write a brief, easy-to-understand description of each scholarship in **{{{language}}}**.
    5.  **List Benefits:** For each scholarship, list 2-3 key benefits (e.g., "Financial aid of ₹20,000", "Covers college tuition fees").
    6.  **Find Application Link:** This is the most important step. For each scholarship, find the **official application link**. Prioritize direct links from platforms like Buddy4Study, NSP, or the official state portal. If a direct link isn't available, link to the main information page.
    7.  **Provide Final Advice (in {{{language}}}):** Write a short, encouraging summary. For example, "Based on your profile, you have a good chance for these scholarships. I recommend starting with the 'XYZ Scholarship' on Buddy4Study as the deadline is approaching. Good luck!"

    **Crucial Instructions:**
    - **Language:** All text-based output (description, benefits, finalAdvice, etc.) MUST be in **{{{language}}}**.
    - **Tone:** Use simple, encouraging language. Behave like a helpful college guidance counselor.
    - **Format:** Strictly adhere to the JSON output format. Ensure every scholarship has an 'applicationLink'.
  `,
});

export const findScholarshipsTool = ai.defineTool(
    {
      name: 'findScholarships',
      description: 'Finds relevant scholarships for a student based on their profile. Use this when the user asks for scholarships and has provided all the necessary details.',
      inputSchema: FindScholarshipsInputSchema,
      outputSchema: FindScholarshipsOutputSchema,
    },
    async (input) => {
      console.log('findScholarshipsTool input', input);
      const { output } = await scholarshipPrompt(input);
      console.log('findScholarshipsTool output', output);
      if (!output) {
        throw new Error('Failed to find scholarships');
      }
      return output;
    }
);


const findScholarshipsFlow = ai.defineFlow(
  {
    name: 'findScholarshipsFlow',
    inputSchema: FindScholarshipsInputSchema,
    outputSchema: FindScholarshipsOutputSchema,
  },
  async (input) => {
    return findScholarshipsTool(input);
  }
);

export async function findScholarships(input: FindScholarshipsInput): Promise<FindScholarshipsOutput> {
  return findScholarshipsFlow(input);
}
