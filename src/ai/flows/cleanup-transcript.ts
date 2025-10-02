
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
  output: {format: 'text'},
  prompt: `You are an expert editor. Your task is to take the following raw sermon transcript and clean it up for readability.

  Your tasks are:
  - Add appropriate punctuation (periods, commas, question marks).
  - Correct capitalization.
  - Add paragraph breaks where appropriate to break up large blocks of text and improve structure.
  - Ensure consistent spacing.
  - Fix any obvious formatting errors.
  - Do not change the words or the meaning of the content.
  - Return ONLY the cleaned transcript text, with no other formatting, preamble, or explanation.

  Raw Transcript:
  \`\`\`
  {{{transcript}}}
  \`\`\`
  `,
});

const cleanupTranscriptFlow = ai.defineFlow(
  {
    name: 'cleanupTranscriptFlow',
    inputSchema: CleanupTranscriptInputSchema,
    outputSchema: CleanupTranscriptOutputSchema,
  },
  async input => {
    try {
        console.log('[[SERVER - DEBUG]] Starting cleanupTranscriptFlow');
        
        const response = await cleanupPrompt(input);
        const cleanedText = response.text;

        if (!cleanedText) {
            throw new Error('AI cleanup failed: No text was returned from the model.');
        }

        console.log('[[SERVER - DEBUG]] Finishing cleanupTranscriptFlow.');
        return { cleanedTranscript: cleanedText };
    } catch (error) {
        console.error('[[SERVER - ERROR]] in cleanupTranscriptFlow:', error);
        throw new Error('Failed to clean up transcript due to a server-side AI error.');
    }
  }
);
