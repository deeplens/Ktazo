
'use server';

/**
 * @fileOverview This flow generates summaries and one-liners from a sermon transcript.
 *
 * - generateSummaries - A function that handles the summary generation process.
 * - GenerateSummariesInput - The input type for the function.
 * - GenerateSummariesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateWeeklyContentInputSchema, SummariesAndOneLinersSchema } from '@/lib/types';

const GenerateSummariesInputSchema = GenerateWeeklyContentInputSchema.pick({ sermonTranscript: true, targetLanguage: true });
type GenerateSummariesInput = z.infer<typeof GenerateSummariesInputSchema>;
type GenerateSummariesOutput = z.infer<typeof SummariesAndOneLinersSchema>;

export async function generateSummaries(input: GenerateSummariesInput): Promise<GenerateSummariesOutput> {
  return generateSummariesFlow(input);
}

const languageInstruction = (targetLanguage?: string) => {
    return targetLanguage
      ? `IMPORTANT: All generated text content MUST be in ${targetLanguage}.`
      : 'IMPORTANT: All generated text content MUST be in English.';
};

const generateSummariesFlow = ai.defineFlow(
  {
    name: 'generateSummariesFlow',
    inputSchema: GenerateSummariesInputSchema,
    outputSchema: SummariesAndOneLinersSchema,
  },
  async (input) => {
    const langInstructionText = languageInstruction(input.targetLanguage);

    const summaryPrompt = ai.definePrompt({
        name: 'summaryPrompt',
        input: { schema: GenerateSummariesInputSchema },
        output: { schema: SummariesAndOneLinersSchema },
        prompt: `${langInstructionText}\n\nSermon Transcript: {{{sermonTranscript}}}\n\nGenerate the short summary, long summary, and mid-week one-liners based on the transcript.`,
    });
    
    const summaryResponse = await summaryPrompt(input);
    if (!summaryResponse.output) throw new Error('Failed to generate summaries.');
    return summaryResponse.output;
  }
);
