
'use server';
/**
 * @fileOverview A sermon transcription AI agent.
 *
 * - transcribeSermon - A function that handles the sermon transcription process.
 * - TranscribeSermonInput - The input type for the transcribeSermon function.
 * - TranscribeSermonOutput - The return type for the transcribeSermon function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const TranscribeSermonInputSchema = z.object({
  mediaUri: z
    .string()
    .describe(
      "A data URI or public URL of an audio/video file. For data URIs, expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeSermonInput = z.infer<typeof TranscribeSermonInputSchema>;

const TranscribeSermonOutputSchema = z.object({
  transcript: z.string().describe('The transcript of the sermon.'),
});
export type TranscribeSermonOutput = z.infer<typeof TranscribeSermonOutputSchema>;

export async function transcribeSermon(
  input: TranscribeSermonInput
): Promise<TranscribeSermonOutput> {
  return transcribeSermonFlow(input);
}

/* ------------------------------ Flow ------------------------------- */

const transcribeSermonFlow = ai.defineFlow(
  {
    name: 'transcribeSermonFlow',
    inputSchema: TranscribeSermonInputSchema,
    outputSchema: TranscribeSermonOutputSchema,
  },
  async ({ mediaUri }) => {
    try {
      console.log('[[SERVER - DEBUG]] Starting transcribeSermonFlow for:', mediaUri.substring(0, 100) + '...');
      
      const { text } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: [
            { text: 'You are an expert audio transcription service. Your only task is to accurately transcribe the audio from the provided file. Do not add any commentary, analysis, or any text other than the transcription itself. Return only the transcribed text.' },
            { media: { url: mediaUri } }
        ]
      });

      if (!text) {
        throw new Error(
          'AI transcription failed: No text was returned from the model.'
        );
      }

      console.log('[[SERVER - DEBUG]] Finishing transcribeSermonFlow.');
      return { transcript: text };
      
    } catch (error) {
      console.error('[[SERVER - ERROR]] in transcribeSermonFlow:', error);
      // Re-throw the original error or a new one to be caught by the calling function.
      throw new Error(`Failed to transcribe media: ${(error as Error).message}`);
    }
  }
);
