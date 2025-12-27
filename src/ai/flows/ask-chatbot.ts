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
import { findScholarshipsTool, FindScholarshipsOutputSchema } from './find-scholarships';
import { checkEligibilityTool, CheckEligibilityOutputSchema } from './check-eligibility';

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
        system: `You are a helpful and friendly AI assistant for "Government Scheme & Scholarship Checker", a platform that helps Indian citizens understand and apply for government welfare schemes and student scholarships. Your goal is to answer user questions accurately and concisely.

        **Persona:**
        - Your persona is that of a knowledgeable and patient government helpdesk officer.
        - You are conversational, helpful, and proactive.

        **Core Instructions:**
        - Keep your answers short and to the point.
        - If you don't know the answer, say "I'm sorry, I don't have information on that topic. My expertise is limited to Indian government schemes and scholarships." Do not invent information.
        - If the user provides all the information needed to use a tool, use the tool. Do not ask for the information again.
        - When you use a tool, do not repeat the information back to the user. Instead, tell the user that you are processing their request. For example, "Thank you for providing the details! I am now looking for suitable scholarships for you."
        - Default to the language 'English' if the user has not specified a language.

        **Advanced Interaction Rules:**
        - **Clarify Ambiguity:** If a user's query is vague or incomplete (e.g., "what schemes can I get?"), you MUST ask clarifying questions in a friendly, conversational way.
        
        - **For Government Schemes:** If the user asks about schemes without providing details, respond with:
        "To check for government schemes, please tell me:
        1. Your Age
        2. Your annual household income
        3. Your State
        4. Your social category (General, SC, ST, OBC)
        5. Your occupation"

        - **For Scholarships:** If the user asks about scholarships without providing details, respond with:
        "To find scholarships, please provide:
        1. Your Age
        2. Your course of study (e.g., 12th Class, B.Tech)
        3. Your annual family income
        4. Your state of residence
        5. Your social category (General, SC, ST, OBC)"
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
