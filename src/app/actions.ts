'use server';

import { checkEligibility, type CheckEligibilityInput, type CheckEligibilityOutput } from "@/ai/flows/check-eligibility";
import { askChatbot, type AskChatbotInput, type AskChatbotOutput } from "@/ai/flows/ask-chatbot";
import { auth, db } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { headers } from 'next/headers';
import { Auth, getAuth, User } from "firebase/auth";

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

// This is a temporary helper function to get the current user on the server.
// In a production app, this would be handled by a more robust authentication solution.
async function getCurrentUser(): Promise<User | null> {
    // This is not a reliable way to get the user on the server.
    // It's a workaround for the hackathon context.
    // A proper implementation would use session management or server-side Firebase Auth.
    return auth.currentUser;
}


export async function getEligibility(input: CheckEligibilityInput): Promise<EligibilityResponse> {
  try {
    console.log("Checking eligibility for:", input);
    const result = await checkEligibility(input);
    console.log("AI response received:", result);
    return result;
  } catch (e: any) {
    console.error("Error in getEligibility action:", e);
    const errorMessage = e.message || "An unknown error occurred while checking eligibility.";
    return { error: errorMessage };
  }
}

export async function saveCheck(input: CheckEligibilityInput, aiResponse: CheckEligibilityOutput): Promise<{success?: boolean, error?: string}> {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return { error: "You must be logged in to save a check." };
        }

        const userDocRef = doc(db, "users", user.uid);
        const userChecksCollection = collection(userDocRef, "eligibility_checks");
        
        const docData = {
            ...input,
            userId: user.uid,
            aiResponse: JSON.stringify(aiResponse),
            createdAt: serverTimestamp(),
        };
        await addDoc(userChecksCollection, docData);
        console.log("Saved eligibility check for user:", user.uid);
        return { success: true };

    } catch(e: any) {
        console.error("Error saving check:", e);
        return { error: e.message || "An unknown error occurred while saving the check." };
    }
}


export async function getSavedChecks(): Promise<{checks?: EligibilityCheckRecord[], error?: string}> {
    try {
        const user = await getCurrentUser();

        if (!user) {
             console.warn("Could not get saved checks. User is not authenticated.");
             // Return empty array instead of error to not break the UI for anonymous users.
            return { checks: [] };
        }

        const userDocRef = doc(db, "users", user.uid);
        const userChecksCollection = collection(userDocRef, "eligibility_checks");
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
