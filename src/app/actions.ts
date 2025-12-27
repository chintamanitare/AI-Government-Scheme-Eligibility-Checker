'use server';

import { checkEligibility, type CheckEligibilityInput, type CheckEligibilityOutput } from "@/ai/flows/check-eligibility";
import { askChatbot, type AskChatbotInput, type AskChatbotOutput } from "@/ai/flows/ask-chatbot";
import { initializeServerFirebase } from "@/firebase/server-init";
import { collection, serverTimestamp, getDocs, query, orderBy, addDoc, doc } from "firebase/firestore";

const { db } = initializeServerFirebase();

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

export async function saveCheck(userId: string, input: CheckEligibilityInput, aiResponse: CheckEligibilityOutput): Promise<{success?: boolean, error?: string}> {
    if (!userId) {
        return { error: "You must be logged in to save a check." };
    }
    try {
        const userChecksCollection = collection(db, "users", userId, "eligibility_checks");
        
        const docData = {
            ...input,
            userId: userId,
            aiResponse: JSON.stringify(aiResponse),
            createdAt: serverTimestamp(),
        };
        
        await addDoc(userChecksCollection, docData);

        return { success: true };

    } catch(e: any) {
        console.error("Error saving check:", e);
        return { error: e.message || "An unknown error occurred while saving the check." };
    }
}

export async function getSavedChecks(userId: string): Promise<{checks?: EligibilityCheckRecord[], error?: string}> {
    if (!userId) {
         console.warn("Could not get saved checks. User is not authenticated.");
         return { checks: [] };
    }
    try {
        const userChecksCollection = collection(db, "users", userId, "eligibility_checks");
        const q = query(userChecksCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const checks = querySnapshot.docs.map(doc => {
            return { id: doc.id, ...doc.data() } as EligibilityCheckRecord;
        });

        return { checks };

    } catch (e: any) {
        console.error("Error fetching saved checks:", e);
        return { error: e.message || "An unknown error occurred." };
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
