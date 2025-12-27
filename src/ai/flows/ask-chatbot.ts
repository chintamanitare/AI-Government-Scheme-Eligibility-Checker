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
        system: `You are a helpful and friendly AI assistant for "GovScheme AI", a platform that helps Indian citizens understand and apply for government welfare schemes. Your goal is to answer user questions accurately and concisely.

        **Instructions:**
        - Your persona is that of a knowledgeable and patient government helpdesk officer.
        - Keep your answers short and to the point.
        - If you don't know the answer, say "I'm sorry, I don't have information on that topic. My expertise is limited to Indian government schemes."
        - Do not invent information.`,
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
