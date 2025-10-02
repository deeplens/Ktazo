
'use server';
/**
 * @fileOverview Suggests a sermon title based on a transcript.
 *
 * - suggestSermonTitle - A function that suggests a sermon title.
 * - SuggestSermonTitleInput - The input type for the function.
 * - SuggestSermonTitleOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSermonTitleInputSchema = z.object({
  transcript: z.string().describe('The sermon transcript text.'),
});
export type SuggestSermonTitleInput = z.infer<typeof SuggestSermonTitleInputSchema>;

const SuggestSermonTitleOutputSchema = z.object({
  suggestedTitle: z.string().describe('A suggested title for the sermon.'),
});
export type SuggestSermonTitleOutput = z.infer<typeof SuggestSermonTitleOutputSchema>;

export async function suggestSermonTitle(input: SuggestSermonTitleInput): Promise<SuggestSermonTitleOutput> {
  return suggestSermonTitleFlow(input);
}

const suggestTitlePrompt = ai.definePrompt({
  name: 'suggestSermonTitlePrompt',
  input: {schema: SuggestSermonTitleInputSchema},
  output: {schema: SuggestSermonTitleOutputSchema},
  prompt: `Analyze the following sermon transcript and suggest a concise, compelling title for it. The title should be no more than 5 words.

  Transcript:
  {{{transcript}}}
  `,
});

const suggestSermonTitleFlow = ai.defineFlow(
  {
    name: 'suggestSermonTitleFlow',
    inputSchema: SuggestSermonTitleInputSchema,
    outputSchema: SuggestSermonTitleOutputSchema,
  },
  async input => {
    try {
      console.log('[[SERVER - DEBUG]] Starting suggestSermonTitleFlow');
      const {output} = await suggestTitlePrompt(input);

      if (!output) {
        throw new Error('AI title suggestion failed: No output was returned from the model.');
      }
      
      console.log('[[SERVER - DEBUG]] Finishing suggestSermonTitleFlow.');
      return output;
    } catch (error) {
        console.error('[[SERVER - ERROR]] in suggestSermonTitleFlow:', error);
        throw new Error('Failed to suggest sermon title due to a server-side AI error.');
    }
  }
);
