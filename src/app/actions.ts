'use server';

import { checkEligibility, type CheckEligibilityInput, type CheckEligibilityOutput } from "@/ai/flows/check-eligibility";
import { db } from "@/firebase";
import { addDoc, collection, doc, serverTimestamp, getDoc, query, orderBy, getDocs } from "firebase/firestore";
import { getAuthenticatedUser } from 'genkit/next/auth';

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
        const user = await getAuthenticatedUser();

        if (user) {
            // Save to user's subcollection if logged in
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
        console.error("Error saving eligibility check (auth related):", authError);
        // We can choose to not fail the whole operation if saving fails
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
        const user = await getAuthenticatedUser();

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
