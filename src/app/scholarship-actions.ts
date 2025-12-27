'use server';

import { findScholarships as findScholarshipsFlow, type FindScholarshipsInput, type FindScholarshipsOutput } from "@/ai/flows/find-scholarships";

export type Scholarship = FindScholarshipsOutput['scholarships'][0];
export type FindScholarshipsResponse = FindScholarshipsOutput | { error: string };


export async function findScholarships(input: FindScholarshipsInput): Promise<FindScholarshipsResponse> {
  try {
    const result = await findScholarshipsFlow(input);
    return result;
  } catch (e: any) {
    console.error("Error in findScholarships action:", e);
    const errorMessage = e.message || "An unknown error occurred while finding scholarships.";
    return { error: errorMessage };
  }
}
