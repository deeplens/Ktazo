/**
 * @fileOverview Translates sermon content to a specified language.
 *
 * - translateSermonContent - A function that translates sermon content using the Google Translate API.
 * - TranslateSermonContentInput - The input type for the translateSermonContent function.
 * - TranslateSermonContentOutput - The return type for the translateSermonContent function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSermonContentInputSchema = z.object({
  text: z.string().describe('The text content to translate.'),
  targetLanguage: z.string().describe('The target language code (e.g., es for Spanish).'),
});

export type TranslateSermonContentInput = z.infer<typeof TranslateSermonContentInputSchema>;

const TranslateSermonContentOutputSchema = z.object({
  translatedText: z.string().describe('The translated text content.'),
});

export type TranslateSermonContentOutput = z.infer<typeof TranslateSermonContentOutputSchema>;

export async function translateSermonContent(input: TranslateSermonContentInput): Promise<TranslateSermonContentOutput> {
  return translateSermonContentFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translateSermonContentPrompt',
  input: {schema: TranslateSermonContentInputSchema},
  output: {schema: TranslateSermonContentOutputSchema},
  prompt: `Translate the following text to {{targetLanguage}}:\n\n{{{text}}}`,
  config: {
        safetySettings: [
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          // ... other safety settings as needed
        ],
  }
});

const translateSermonContentFlow = ai.defineFlow(
  {
    name: 'translateSermonContentFlow',
    inputSchema: TranslateSermonContentInputSchema,
    outputSchema: TranslateSermonContentOutputSchema,
  },
  async input => {
    const {output} = await translatePrompt(input);
    return output!;
  }
);

