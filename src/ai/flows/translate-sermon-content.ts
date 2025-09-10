/**
 * @fileOverview Translates sermon content to a specified language.
 *
 * - translateSermonContent - A function that translates sermon content using an AI model.
 * - TranslateSermonContentInput - The input type for the translateSermonContent function.
 * - TranslateSermonContentOutput - The return type for the translateSermonContent function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateSermonContentInputSchema = z.object({
  targetLanguage: z.string().describe('The target language (e.g., Spanish).'),
  title: z.string().describe('The sermon title.'),
  transcript: z.string().describe('The sermon transcript.'),
  summaryShort: z.string().describe('The short summary.'),
  summaryLong: z.string().describe('The long summary.'),
  devotionals: z.array(z.object({
    day: z.string(),
    content: z.string(),
  })).describe('The daily devotionals.'),
});

export type TranslateSermonContentInput = z.infer<typeof TranslateSermonContentInputSchema>;

const TranslateSermonContentOutputSchema = z.object({
  title: z.string().describe('The translated sermon title.'),
  transcript: z.string().describe('The translated sermon transcript.'),
  summaryShort: z.string().describe('The translated short summary.'),
  summaryLong: z.string().describe('The translated long summary.'),
  devotionals: z.array(z.object({
    day: z.string(),
    content: z.string(),
  })).describe('The translated daily devotionals.'),
});

export type TranslateSermonContentOutput = z.infer<typeof TranslateSermonContentOutputSchema>;

export async function translateSermonContent(input: TranslateSermonContentInput): Promise<TranslateSermonContentOutput> {
  return translateSermonContentFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translateSermonContentPrompt',
  input: {schema: TranslateSermonContentInputSchema},
  output: {schema: TranslateSermonContentOutputSchema},
  prompt: `Translate all the following text content to {{targetLanguage}}.
  
  Retain the original JSON structure and field names. The "day" field in the devotionals should not be translated.

  Title: {{{title}}}
  Transcript: {{{transcript}}}
  Short Summary: {{{summaryShort}}}
  Long Summary: {{{summaryLong}}}
  Devotionals: {{#each devotionals}}- Day: {{this.day}}, Content: {{{this.content}}}{{/each}}
  `,
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
