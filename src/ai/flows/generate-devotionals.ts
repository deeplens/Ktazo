
'use server';

/**
 * @fileOverview This flow generates daily devotionals from a sermon transcript.
 *
 * - generateDevotionals - A function that handles the devotional generation process.
 * - GenerateDevotionalsInput - The input type for the function.
 * - GenerateDevotionalsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { DevotionalsSchema } from '@/lib/types';

const GenerateDevotionalsInputSchema = z.object({ 
    sermonTranscript: z.string(), 
    summaryLong: z.string(), 
    targetLanguage: z.string().optional() 
});
export type GenerateDevotionalsInput = z.infer<typeof GenerateDevotionalsInputSchema>;
export type GenerateDevotionalsOutput = z.infer<typeof DevotionalsSchema>;

export async function generateDevotionals(input: GenerateDevotionalsInput): Promise<GenerateDevotionalsOutput> {
  return generateDevotionalsFlow(input);
}

const languageInstruction = (targetLanguage?: string) => {
    return targetLanguage
      ? `IMPORTANT: All generated text content MUST be in ${targetLanguage}.`
      : 'IMPORTANT: All generated text content MUST be in English.';
};

const generateDevotionalsFlow = ai.defineFlow(
  {
    name: 'generateDevotionalsFlow',
    inputSchema: GenerateDevotionalsInputSchema,
    outputSchema: DevotionalsSchema,
  },
  async (input) => {
    const langInstructionText = languageInstruction(input.targetLanguage);

    const devotionalPrompt = ai.definePrompt({
        name: 'devotionalPrompt',
        input: { schema: GenerateDevotionalsInputSchema },
        output: { schema: DevotionalsSchema },
        prompt: `${langInstructionText}\n\nSermon Devotional Guide: {{{summaryLong}}}\n\nBased on the provided devotional guide, generate five daily devotionals (Mon-Fri), each approximately 200 words.`,
    });
    
    const devotionalResponse = await devotionalPrompt(input);
    if (!devotionalResponse.output) throw new Error('Failed to generate devotionals.');
    return devotionalResponse.output;
  }
);
