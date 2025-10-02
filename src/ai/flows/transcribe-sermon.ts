
'use server';
/**
 * @fileOverview A sermon transcription AI agent.
 *
 * - transcribeSermon - A function that handles the sermon transcription process.
 * - TranscribeSermonInput - The input type for the transcribeSermon function.
 * - TranscribeSermonOutput - The return type for the transcribeSermon function.
 */

import { ai } from '@/ai/genkit';
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

/* ------------------------- Agents / Prompts ------------------------- */

const transcribeMediaPrompt = ai.definePrompt({
  name: 'transcribeMediaPrompt',
  input: { schema: z.object({ mediaUri: z.string(), contentType: z.string().optional() }) },
  output: { format: 'text' },
  prompt: 'Transcribe the following audio: {{media url=mediaUri contentType=contentType}}',
});

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
      let contentType: string | undefined = undefined;

      if (mediaUri.startsWith('data:')) {
        console.log('[[SERVER - DEBUG]] Data URI detected.');
        contentType = mediaUri.slice(5, mediaUri.indexOf(';'));
      } else {
        console.log('[[SERVER - DEBUG]] Public URL detected. Setting content type to video.');
        contentType = 'video/*';
      }
      
      const { text } = await transcribeMediaPrompt({
        mediaUri: mediaUri,
        contentType: contentType,
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
