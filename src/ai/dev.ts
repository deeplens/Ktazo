import { config } from 'dotenv';
config();

import '@/ai/flows/generate-weekly-content.ts';
import '@/ai/flows/rag-chatbot-companion.ts';
import '@/ai/flows/transcribe-sermon.ts';
import '@/ai/flows/translate-sermon-content.ts';