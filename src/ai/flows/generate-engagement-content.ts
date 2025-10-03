
'use server';

/**
 * @fileOverview This flow generates engagement content (Bible plan, spiritual practices, etc.) from a sermon transcript.
 *
 * - generateEngagementContent - A function that handles the engagement content generation process.
 * - GenerateEngagementContentInput - The input type for the function.
 * - GenerateEngagementContentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateWeeklyContentInputSchema, EngagementSchema } from '@/lib/types';


export const GenerateEngagementContentInputSchema = GenerateWeeklyContentInputSchema.pick({ sermonTranscript: true, targetLanguage: true });
export type GenerateEngagementContentInput = z.infer<typeof GenerateEngagementContentInputSchema>;
export type GenerateEngagementContentOutput = z.infer<typeof EngagementSchema>;

export async function generateEngagementContent(input: GenerateEngagementContentInput): Promise<GenerateEngagementContentOutput> {
  return generateEngagementContentFlow(input);
}

const languageInstruction = (targetLanguage?: string) => {
    return targetLanguage
      ? `IMPORTANT: All generated text content MUST be in ${targetLanguage}.`
      : 'IMPORTANT: All generated text content MUST be in English.';
};

const generateEngagementContentFlow = ai.defineFlow(
  {
    name: 'generateEngagementContentFlow',
    inputSchema: GenerateEngagementContentInputSchema,
    outputSchema: EngagementSchema,
  },
  async (input) => {
    const langInstructionText = languageInstruction(input.targetLanguage);

    const engagementPrompt = ai.definePrompt({
        name: 'engagementPrompt',
        input: { schema: GenerateEngagementContentInputSchema },
        output: { schema: EngagementSchema },
        prompt: `${langInstructionText}\n\nSermon Transcript: {{{sermonTranscript}}}\n\nGenerate the Bible Reading Plan, Spiritual Practices, and Outward Focus sections.`,
    });
    
    const engagementResponse = await engagementPrompt(input);
    if (!engagementResponse.output) throw new Error('Failed to generate engagement content.');
    return engagementResponse.output;
  }
);
