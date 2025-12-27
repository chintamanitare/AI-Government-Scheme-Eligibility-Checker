'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CheckEligibilityInputSchema = z.object({
  age: z.number().describe('The age of the applicant.'),
  income: z.string().describe('The annual income of the applicant.'),
  state: z.string().describe('The state of the applicant.'),
  category: z.string().describe('The category of the applicant (General, SC, ST, OBC, EWS).'),
  occupation: z.string().describe('The occupation of the applicant.'),
  language: z.string().describe('The preferred language for the response (e.g., English, Hindi, Marathi).'),
});

export type CheckEligibilityInput = z.infer<typeof CheckEligibilityInputSchema>;

const SchemeSchema = z.object({
  schemeName: z.string().describe("The name of the government scheme."),
  eligible: z.boolean().describe("Whether the user is eligible for the scheme."),
  priority: z.enum(["High", "Medium", "Low"]).describe("The relevance and benefit ranking for the user."),
  explanation: z.string().describe("An explanation of the scheme and why the user is eligible. This should be in the user's selected language."),
  rejectionReason: z.string().nullable().describe("If not eligible, a clear reason why, and what can be improved. This should be in the user's selected language."),
  documentsRequired: z.array(z.string()).describe("A checklist of documents required for application."),
  applicationSteps: z.array(z.string()).describe("A step-by-step guide on how to apply for the scheme."),
});

const CheckEligibilityOutputSchema = z.object({
  schemes: z.array(SchemeSchema).describe("A list of relevant government schemes for the user."),
  finalAdvice: z.string().describe("A concluding piece of advice for the user in a friendly, encouraging tone. This should be in the user's selected language."),
});

export type CheckEligibilityOutput = z.infer<typeof CheckEligibilityOutputSchema>;

const eligibilityPrompt = ai.definePrompt({
  name: 'eligibilityPrompt',
  input: { schema: CheckEligibilityInputSchema },
  output: { schema: CheckEligibilityOutputSchema },
  prompt: `
    You are an expert Indian government welfare scheme advisor. Your goal is to provide a complete, accurate, and user-friendly eligibility report for an Indian citizen.

    **User Profile:**
    - Age: {{{age}}}
    - Annual Income: {{{income}}}
    - State: {{{state}}}
    - Caste Category: {{{category}}}
    - Occupation: {{{occupation}}}
    - Preferred Language for Response: {{{language}}}

    **Your Tasks:**

    1.  **Analyze User Details:** Carefully review the user's profile.
    2.  **Identify Schemes:** Identify a list of 3-5 of the most relevant Central and State-specific government schemes. Include schemes they are eligible for and some they are not, if it's relevant (e.g., they are very close to being eligible).
    3.  **Determine Eligibility:** For each scheme, accurately determine if the user is eligible based on their profile.
    4.  **Rank Schemes:** Assign a priority ("High", "Medium", "Low") based on the scheme's relevance and potential benefit to the user. High priority for schemes that are a perfect match and offer significant benefits.
    5.  **Generate Explanations (in {{{language}}}):**
        - If **eligible**: Write a simple, clear explanation of the scheme's benefits and why the user is eligible.
        - If **not eligible**: Clearly explain why. For example, "Your income of {{{income}}} is above the ₹2,50,000 limit for this scheme." Also, suggest what they could do to become eligible if possible (e.g., "This scheme is for individuals over 60 years of age.").
    6.  **Generate Document Checklist:** For each scheme, list the necessary documents for the application (e.g., "Aadhar Card", "PAN Card", "Income Certificate").
    7.  **Generate Application Guide:** For each scheme, provide a simple, step-by-step application process.
    8.  **Provide Final Advice (in {{{language}}}):** Write a short, encouraging summary. For example, "You are eligible for several key schemes! I recommend starting with the Pradhan Mantri Awas Yojana application first as it has high priority. Make sure you have all your documents ready."

    **Crucial Instructions:**
    - **Language:** All text-based output (\`explanation\`, \`rejectionReason\`, \`finalAdvice\`, \`schemeName\`, etc.) MUST be in **{{{language}}}**.
    - **Tone:** Use simple, citizen-friendly language. Avoid jargon. Behave like a helpful government helpdesk officer.
    - **Format:** Strictly adhere to the JSON output format.
  `,
});

export const checkEligibility = ai.defineFlow(
  {
    name: 'checkEligibilityFlow',
    inputSchema: CheckEligibilityInputSchema,
    outputSchema: CheckEligibilityOutputSchema,
  },
  async (input) => {
    const { output } = await eligibilityPrompt(input);
    return output!;
  }
);
