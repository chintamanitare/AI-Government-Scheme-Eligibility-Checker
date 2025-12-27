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

const AskChatbotInputSchema = z.object({
  query: z.string().describe("The user's question."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .describe('The conversation history.'),
});
export type AskChatbotInput = z.infer<typeof AskChatbotInputSchema>;

const AskChatbotOutputSchema = z.object({
  response: z.string().describe("The AI's response to the user's query."),
  error: z.string().optional().describe('An error message if the query failed.'),
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
      const response = await ai.generate({
        prompt: query,
        history: history,
        system: `You are a helpful and friendly AI assistant for "Government Scheme & Scholarship Checker", a platform that helps Indian citizens understand and apply for government welfare schemes and student scholarships. Your goal is to answer user questions accurately and concisely.

        **Persona:**
        - Your persona is that of a knowledgeable and patient government helpdesk officer.
        - You are conversational, helpful, and proactive.

        **Core Instructions:**
        - Keep your answers short and to the point.
        - If you don't know the answer, say "I'm sorry, I don't have information on that topic. My expertise is limited to Indian government schemes and scholarships." Do not invent information.

        **Advanced Interaction Rules:**
        - **Clarify Ambiguity:** If a user's query is vague or incomplete, you MUST ask clarifying questions to get the information you need.
        - **Eligibility Questions:** If a user asks about their eligibility for schemes without providing enough detail, you should ask for the missing information. The key details needed are: **age, annual income, state, category (e.g., General, SC, ST, OBC), and occupation.**
        
        **Example Interaction:**
        *User:* "What schemes can I get?"
        *Your Response:* "I can help with that! To check your eligibility for government schemes, I need a little more information. Could you please tell me your age, annual income, state of residence, social category (like General, SC, ST, or OBC), and your occupation?"

        *User:* "Can you tell me about farming schemes?"
        *Your Response:* "Certainly. There are many schemes for farmers. To give you the most relevant information, could you please tell me which state you live in?"
        `,
      });
      const textResponse = response.text;

      if (!textResponse) {
        return {
          response: "I'm sorry, I wasn't able to generate a response. Please try again.",
        };
      }
      return { response: textResponse };
    } catch (e: any) {
      console.error('Error in askChatbotFlow:', e);
      return {
        response: '',
        error: 'An error occurred while processing your request.',
      };
    }
  }
);
