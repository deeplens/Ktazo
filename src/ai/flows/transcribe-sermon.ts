
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
  sermonUrl: z
    .string()
    .describe(
      "A data URI of an audio file. Expected data URI format: 'data:<mimetype>;base64,<encoded_data>'."
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
  input: { schema: z.object({ mediaUri: z.string(), contentType: z.string() }) },
  output: { format: 'text' },
  // NOTE: for data URIs, Gemini requires an explicit contentType
  prompt: 'Transcribe the following audio: {{media uri=mediaUri contentType=contentType}}',
});

/* ------------------------------ Flow ------------------------------- */

const transcribeSermonFlow = ai.defineFlow(
  {
    name: 'transcribeSermonFlow',
    inputSchema: TranscribeSermonInputSchema,
    outputSchema: TranscribeSermonOutputSchema,
  },
  async ({ sermonUrl }) => {
    try {
      console.log('[[DEBUG]] Starting transcribeSermonFlow for:', sermonUrl.substring(0, 50) + '...');

      // Data URI: MIME is embedded; extract and pass through
      if (sermonUrl.startsWith('data:')) {
        console.log('[[DEBUG]] Data URI detected. Transcribing directly.');
        const ct = sermonUrl.slice(5, sermonUrl.indexOf(';'));
        const { text } = await transcribeMediaPrompt({
          mediaUri: sermonUrl,
          contentType: ct,
        });
        if (!text) {
          throw new Error(
            'AI transcription failed: No text was returned from the model for the data URI.'
          );
        }
        console.log('[[DEBUG]] Finishing transcribeSermonFlow for data URI.');
        return { transcript: text };
      }
      
      throw new Error(`Unsupported source for transcription. Please provide a direct file upload.`);

    } catch (error) {
      console.error('[[ERROR]] in transcribeSermonFlow:', error);
      // Re-throw the original error or a new one to be caught by the calling function.
      throw new Error(`Failed to transcribe sermon: ${(error as Error).message}`);
    }
  }
);
