import { config } from 'dotenv';
config();

import '@/ai/flows/generate-application-guide.ts';
import '@/ai/flows/generate-document-checklist.ts';
import '@/ai/flows/check-eligibility.ts';
import '@/ai/flows/ask-chatbot.ts';
import '@/ai/flows/find-scholarships.ts';
