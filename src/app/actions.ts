'use server';

import { checkEligibility, type CheckEligibilityInput, type CheckEligibilityOutput } from "@/ai/flows/check-eligibility";
import { askChatbot, type AskChatbotInput, type AskChatbotOutput } from "@/ai/flows/ask-chatbot";
import { initializeServerFirebase } from "@/firebase/server-init";

initializeServerFirebase();

export type Scheme = CheckEligibilityOutput['schemes'][0];
export type EligibilityResponse = CheckEligibilityOutput | { error: string };

export type EligibilityCheckRecord = CheckEligibilityInput & {
    id: string;
    userId: string;
    aiResponse: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};

export async function getEligibility(input: CheckEligibilityInput): Promise<EligibilityResponse> {
  try {
    const result = await checkEligibility(input);
    return result;
  } catch (e: any) {
    console.error("Error in getEligibility action:", e);
    const errorMessage = e.message || "An unknown error occurred while checking eligibility.";
    return { error: errorMessage };
  }
}

export async function getChatbotResponse(input: AskChatbotInput): Promise<AskChatbotOutput> {
    try {
        const result = await askChatbot(input);
        if (result.error) {
          console.error('Chatbot flow returned an error:', result.error);
          return { response: '', error: result.error };
        }
        return result;
      } catch (e: any) {
        console.error('Error in getChatbotResponse action:', e);
        return { response: '', error: 'An error occurred while processing your request.' };
      }
}
