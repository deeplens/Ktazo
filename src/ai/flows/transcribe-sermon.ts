
'use server';
/**
 * @fileOverview A sermon transcription AI agent.
 *
 * - transcribeSermon - A function that handles the sermon transcription process.
 * - TranscribeSermonInput - The input type for the transcribeSermon function.
 * - TranscribeSermonOutput - The return type for the transcribeSermon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeSermonInputSchema = z.object({
  sermonUrl: z
    .string()
    .describe("The URL of the sermon audio or video file. This can be a public URL (including YouTube videos) or a data URI with Base64 encoding. Expected data URI format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type TranscribeSermonInput = z.infer<typeof TranscribeSermonInputSchema>;

const TranscribeSermonOutputSchema = z.object({
  transcript: z.string().describe('The transcript of the sermon.'),
});
export type TranscribeSermonOutput = z.infer<typeof TranscribeSermonOutputSchema>;

export async function transcribeSermon(input: TranscribeSermonInput): Promise<TranscribeSermonOutput> {
  return transcribeSermonFlow(input);
}

const transcribeSermonPrompt = ai.definePrompt({
  name: 'transcribeSermonPrompt',
  input: {schema: TranscribeSermonInputSchema},
  output: {format: 'text'},
  prompt: `You are an expert transcriptionist specializing in transcribing sermons.

  You will use this information to transcribe the sermon to text.
  Sermon Audio/Video URL: {{media url=sermonUrl}}`,
});

const transcribeSermonFlow = ai.defineFlow(
  {
    name: 'transcribeSermonFlow',
    inputSchema: TranscribeSermonInputSchema,
    outputSchema: TranscribeSermonOutputSchema,
  },
  async input => {
    try {
      console.log('[[DEBUG]] Starting transcribeSermonFlow');
      const response = await transcribeSermonPrompt(input);
      const transcript = response.text;

      if (!transcript) {
        throw new Error('AI transcription failed: No text was returned from the model.');
      }
      
      console.log('[[DEBUG]] Finishing transcribeSermonFlow.');
      return { transcript };
    } catch (error) {
        console.error('[[ERROR]] in transcribeSermonFlow:', error);
        throw new Error('Failed to transcribe sermon due to a server-side AI error.');
    }
  }
);
