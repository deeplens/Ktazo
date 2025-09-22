
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
    try {
        console.log('[[DEBUG]] Starting translateTranscriptFlow');
        const {output} = await translatePrompt(input);
        if (!output) {
            throw new Error('AI translation failed: No output was returned from the model.');
        }
        console.log('[[DEBUG]] Finishing translateTranscriptFlow.');
        return output;
    } catch (error) {
        console.error('[[ERROR]] in translateTranscriptFlow:', error);
        throw new Error('Failed to translate transcript due to a server-side AI error.');
    }
  }
);
