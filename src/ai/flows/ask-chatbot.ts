
'use server';

/**
 * @fileOverview This file defines a Genkit flow for an interactive chatbot.
 *
 * - askChatbot - A function that handles a user's conversational query.
 * - AskChatbotInput - The input type for the askChatbot function.
 * - AskChatbotOutput - The return type for the askChatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findScholarships } from './find-scholarships';
import { checkEligibility } from './check-eligibility';

const FindScholarshipsInputSchema = z.object({
  age: z.number().describe('The age of the applicant.'),
  income: z.string().describe('The annual family income of the applicant in Indian Rupees (₹).'),
  state: z.string().describe('The state of domicile for the applicant.'),
  category: z.string().describe('The caste/community category of the applicant (General, SC, ST, OBC, EWS, Minority).'),
  degree: z.string().describe('The current degree or course the student is enrolled in (e.g., 12th Pass, Undergraduate B.Tech, Postgraduate M.A.).'),
  language: z.string().describe('The preferred language for the response (e.g., English, Hindi, Marathi).'),
});

const ScholarshipSchema = z.object({
  scholarshipName: z.string().describe("The name of the scholarship."),
  provider: z.string().describe("The organization or platform providing the scholarship (e.g., Buddy4Study, MahaDBT, National Scholarship Portal)."),
  eligible: z.boolean().describe("Whether the user is likely eligible based on the provided details."),
  description: z.string().describe("A brief, clear description of the scholarship. This should be in the user's selected language."),
  benefits: z.array(z.string()).describe("A list of key benefits, like 'Up to ₹50,000', 'Tuition Fee Waiver', etc."),
  applicationLink: z.string().url().nullable().describe("The direct official URL to the scholarship's application page or portal."),
});

const FindScholarshipsOutputSchema = z.object({
  scholarships: z.array(ScholarshipSchema).describe("A list of 3-5 relevant scholarships for the student."),
  finalAdvice: z.string().describe("A concluding piece of advice for the student in a friendly, encouraging tone. This should be in the user's selected language."),
});

const findScholarshipsTool = ai.defineTool(
  {
    name: 'findScholarships',
    description: 'Finds relevant scholarships for a student based on their profile. Use this when the user asks for scholarships and has provided all the necessary details.',
    inputSchema: FindScholarshipsInputSchema,
    outputSchema: FindScholarshipsOutputSchema,
  },
  async (input) => {
    console.log('findScholarshipsTool input', input);
    // Directly call the underlying prompt/flow logic for scholarships
    const output = await findScholarships(input);
    console.log('findScholarshipsTool output', output);
    if (!output) {
      throw new Error('Failed to find scholarships');
    }
    return output;
  }
);


const CheckEligibilityInputSchema = z.object({
  age: z.number().describe('The age of the applicant.'),
  income: z.string().describe('The annual income of the applicant in Indian Rupees (₹).'),
  state: z.string().describe('The state of the applicant.'),
  category: z.string().describe('The category of the applicant (General, SC, ST, OBC, EWS).'),
  occupation: z.string().describe('The occupation of the applicant.'),
  language: z.string().describe('The preferred language for the response (e.g., English, Hindi, Marathi).'),
});

const SchemeSchema = z.object({
  schemeName: z.string().describe("The name of the government scheme."),
  eligible: z.boolean().describe("Whether the user is eligible for the scheme."),
  priority: z.enum(["High", "Medium", "Low"]).describe("The relevance and benefit ranking for the user."),
  explanation: z.string().describe("An explanation of the scheme and why the user is eligible. This should be in the user's selected language."),
  rejectionReason: z.string().nullable().describe("If not eligible, a clear reason why, and what can be improved. This should be in the user's selected language."),
  documentsRequired: z.array(z.string()).describe("A checklist of documents required for application."),
  applicationSteps: z.array(z.string()).describe("A step-by-step guide on how to apply for the scheme."),
  applicationLink: z.string().url().nullable().describe("The official URL to the scheme's application page or portal."),
});

const CheckEligibilityOutputSchema = z.object({
  schemes: z.array(SchemeSchema).describe("A list of relevant government schemes for the user."),
  finalAdvice: z.string().describe("A concluding piece of advice for the user in a friendly, encouraging tone. This should be in the user's selected language."),
});


const checkEligibilityTool = ai.defineTool(
    {
      name: 'checkEligibility',
      description: 'Checks a user\'s eligibility for government schemes. Use this when the user asks for schemes and has provided all the necessary details.',
      inputSchema: CheckEligibilityInputSchema,
      outputSchema: CheckEligibilityOutputSchema,
    },
    async (input) => {
        console.log('checkEligibilityTool input', input);
      const output = await checkEligibility(input);
      console.log('checkEligibilityTool output', output);
      if (!output) {
        throw new Error('Failed to check eligibility');
      }
      return output;
    }
);


const AskChatbotInputSchema = z.object({
  query: z.string().describe("The user's question."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'tool']),
        content: z.union([
          z.string(),
          z.array(z.object({
            toolRequest: z.any(),
            toolResponse: z.any(),
          }))
        ]),
      })
    )
    .describe('The conversation history.'),
});
export type AskChatbotInput = z.infer<typeof AskChatbotInputSchema>;

const AskChatbotOutputSchema = z.object({
  response: z.string().describe("The AI's response to the user's query."),
  error: z.string().optional().describe('An error message if the query failed.'),
  toolResponse: z.union([FindScholarshipsOutputSchema, CheckEligibilityOutputSchema]).optional().describe('The response from a tool call.'),
});
export type AskChatbotOutput = z.infer<typeof AskChatbotOutputSchema>;

export async function askChatbot(input: AskChatbotInput): Promise<AskChatbotOutput> {
  return askChatbotFlow(input);
}

const askChatbotFlow = ai.defineFlow(
  {
    name: 'askChatbotFlow',
    inputSchema: AskChatbotInputSchema,
    outputSchema: AskChatbotOutputSchema,
  },
  async ({ query, history }) => {
    try {
      const llmResponse = await ai.generate({
        prompt: query,
        history: history,
        tools: [findScholarshipsTool, checkEligibilityTool],
        system: `You are a helpful and friendly AI assistant for "Aadhar Assist AI", a platform that helps Indian citizens understand and apply for government welfare schemes and student scholarships. Your goal is to answer user questions accurately and concisely.

        **Persona:**
        - Your persona is that of a knowledgeable and patient government helpdesk officer.
        - You are conversational, helpful, and proactive.

        **Core Instructions:**
        - Keep your answers short and to the point.
        - If you don't know the answer, say "I'm sorry, I don't have information on that topic. My expertise is limited to Indian government schemes and scholarships." Do not invent information.
        - If the user provides all the information needed to use a tool, use the tool. Do not ask for the information again.
        - When you use a tool, do not repeat the information back to the user. Instead, tell the user that you are processing their request. For example: "Thank you for providing the details! I am now looking for suitable scholarships for you."
        - Default to the language 'English' if the user has not specified a language.

        **Advanced Interaction Rules:**
        - **Clarify Ambiguity:** If a user's query is vague or incomplete (e.g., "what schemes can I get?"), you MUST ask clarifying questions.
        
        - **For Government Schemes:** If the user asks about schemes without providing details, respond with a simple numbered list:
        "To check for schemes, I need a few details:
        1. Your Age
        2. Your annual income
        3. Your State
        4. Your category (General, SC, ST, OBC, etc.)
        5. Your occupation"

        - **For Scholarships:** If the user asks about scholarships without providing details, respond with a simple numbered list:
        "To find scholarships, I need a few details:
        1. Your Age
        2. Your course/degree
        3. Your annual family income
        4. Your state
        5. Your category (General, SC, ST, OBC, etc.)"
        `,
      });

      const textResponse = llmResponse.text;
      
      const toolResponsePart = llmResponse.output?.message.content.find(p => p.toolResponse);
      const toolResponse = toolResponsePart ? toolResponsePart.toolResponse : undefined;

      if (!textResponse) {
        return {
          response: "I'm sorry, I wasn't able to generate a response. Please try again.",
          toolResponse: toolResponse,
        };
      }
      return { response: textResponse, toolResponse: toolResponse };
    } catch (e: any) {
      console.error('Error in askChatbotFlow:', e);
      return {
        response: '',
        error: 'An error occurred while processing your request.',
      };
    }
  }
);
