'use server';

import { checkEligibility, type CheckEligibilityInput, type CheckEligibilityOutput } from "@/ai/flows/check-eligibility";
import { askChatbot, type AskChatbotInput, type AskChatbotOutput } from "@/ai/flows/ask-chatbot";
import { auth, db } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp, getDoc, query, orderBy, getDocs } from "firebase/firestore";
import { headers } from 'next/headers';
import {Auth, getAuth} from 'firebase-admin/auth'
import {initializeApp, getApp, getApps} from 'firebase-admin/app'
import {ServiceAccount, getServiceAccount} from 'firebase-admin/app'

async function getAuthenticatedUserOnServer() {
  // This function needs to be implemented correctly based on your auth setup.
  // For now, it will use a temporary method to try and get the user.
  try {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1]
    if (!idToken) {
      return null;
    }
    // This is not the ideal way to do this, but it's a temporary fix.
    // A better solution would involve a more robust server-side auth check.
    const adminAuth = getAuth(getApp());
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return null;
  }
}

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
    console.log("Checking eligibility for:", input);
    const result = await checkEligibility(input);

    try {
        const user = await getAuthenticatedUserOnServer();

        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userChecksCollection = collection(userDocRef, "eligibility_checks");
            
            const docData = {
                ...input,
                userId: user.uid,
                aiResponse: JSON.stringify(result),
                createdAt: serverTimestamp(),
            };
            await addDoc(userChecksCollection, docData);
            console.log("Saved eligibility check for user:", user.uid);
        }
    } catch(authError) {
        console.warn("Could not save eligibility check for unauthenticated user.");
    }

    console.log("AI response received:", result);
    return result;
  } catch (e: any) {
    console.error("Error in getEligibility action:", e);
    const errorMessage = e.message || "An unknown error occurred while checking eligibility.";
    return { error: errorMessage };
  }
}

export async function getSavedChecks(): Promise<{checks?: EligibilityCheckRecord[], error?: string}> {
    try {
        const user = await getAuthenticatedUserOnServer();

        if (!user) {
            return { error: "You must be logged in to view saved checks." };
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
        console.error("Chatbot flow returned an error:", result.error);
        return { response: '', error: result.error };
    }
    return result;
  } catch (e: any) {
    console.error("Error in getChatbotResponse action:", e);
    return { response: '', error: "An error occurred while processing your request." };
  }
}
