
'use server';

/**
 * @fileOverview Translates a sermon transcript to a specified language.
 *
 * - translateTranscript - A function that translates a transcript.
 * - TranslateTranscriptInput - The input type for the function.
 * - TranslateTranscriptOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateTranscriptInputSchema = z.object({
  targetLanguage: z.string().describe('The target language to translate to (e.g., "Spanish").'),
  transcript: z.string().describe('The sermon transcript text.'),
});
export type TranslateTranscriptInput = z.infer<typeof TranslateTranscriptInputSchema>;

const TranslateTranscriptOutputSchema = z.object({
  translatedTranscript: z.string().describe('The translated sermon transcript.'),
});
export type TranslateTranscriptOutput = z.infer<typeof TranslateTranscriptOutputSchema>;

export async function translateTranscript(input: TranslateTranscriptInput): Promise<TranslateTranscriptOutput> {
  return translateTranscriptFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translateTranscriptPrompt',
  input: {schema: TranslateTranscriptInputSchema},
  output: {schema: TranslateTranscriptOutputSchema},
  prompt: `Translate the following sermon transcript into {{targetLanguage}}.

  Transcript:
  {{{transcript}}}
  `,
});

const translateTranscriptFlow = ai.defineFlow(
  {
    name: 'translateTranscriptFlow',
    inputSchema: TranslateTranscriptInputSchema,
    outputSchema: TranslateTranscriptOutputSchema,
  },
  async input => {
    const {output} = await translatePrompt(input);
    return output!;
  }
);
