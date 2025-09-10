
'use server';
/**
 * @fileOverview A transcript cleanup AI agent.
 *
 * - cleanupTranscript - A function that enhances a raw transcript for readability.
 * - CleanupTranscriptInput - The input type for the cleanupTranscript function.
 * - CleanupTranscriptOutput - The return type for the cleanupTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CleanupTranscriptInputSchema = z.object({
  transcript: z.string().describe('The raw sermon transcript text.'),
});
export type CleanupTranscriptInput = z.infer<typeof CleanupTranscriptInputSchema>;

const CleanupTranscriptOutputSchema = z.object({
  cleanedTranscript: z.string().describe('The cleaned and formatted transcript.'),
});
export type CleanupTranscriptOutput = z.infer<typeof CleanupTranscriptOutputSchema>;

export async function cleanupTranscript(input: CleanupTranscriptInput): Promise<CleanupTranscriptOutput> {
  return cleanupTranscriptFlow(input);
}

const cleanupPrompt = ai.definePrompt({
  name: 'cleanupTranscriptPrompt',
  input: {schema: CleanupTranscriptInputSchema},
  output: {schema: CleanupTranscriptOutputSchema},
  prompt: `You are an expert editor. Your task is to take the following raw sermon transcript and clean it up for readability.

  Do not change the words or the meaning of the content.
  
  Your tasks are:
  - Add appropriate punctuation (periods, commas, question marks).
  - Correct capitalization.
  - Add paragraph breaks where appropriate to break up large blocks of text and improve structure.
  - Ensure consistent spacing.
  - Fix any obvious formatting errors.

  Raw Transcript:
  {{{transcript}}}
  `,
});

const cleanupTranscriptFlow = ai.defineFlow(
  {
    name: 'cleanupTranscriptFlow',
    inputSchema: CleanupTranscriptInputSchema,
    outputSchema: CleanupTranscriptOutputSchema,
  },
  async input => {
    const {output} = await cleanupPrompt(input);
    return output!;
  }
);
