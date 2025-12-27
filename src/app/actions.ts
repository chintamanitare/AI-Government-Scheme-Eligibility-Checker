'use server';

import { checkEligibility, type CheckEligibilityInput, type CheckEligibilityOutput } from "@/ai/flows/check-eligibility";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getApp } from "firebase/app";

export type Scheme = CheckEligibilityOutput['schemes'][0];
export type EligibilityResponse = CheckEligibilityOutput | { error: string };

export async function getEligibility(input: CheckEligibilityInput): Promise<EligibilityResponse> {
  try {
    console.log("Checking eligibility for:", input);
    const result = await checkEligibility(input);

    const auth = getAuth(getApp());
    const user = auth.currentUser;

    if (user) {
        // Save to user's subcollection if logged in
        const userChecksCollection = collection(doc(db, "users", user.uid), "eligibility_checks");
        addDoc(userChecksCollection, {
            ...input,
            userId: user.uid,
            aiResponse: JSON.stringify(result),
            createdAt: serverTimestamp(),
        }).catch(firestoreError => {
            console.error("Firestore user save error:", firestoreError);
        });
    } else {
        // Save to top-level collection for anonymous users
        addDoc(collection(db, "eligibility_checks"), {
            ...input,
            aiResponse: JSON.stringify(result),
            createdAt: serverTimestamp(),
        }).catch(firestoreError => {
            console.error("Firestore anonymous save error:", firestoreError);
        });
    }


    console.log("AI response received:", result);
    return result;
  } catch (e: any) {
    console.error("Error in getEligibility action:", e);
    const errorMessage = e.message || "An unknown error occurred while checking eligibility.";
    return { error: errorMessage };
  }
}
