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
  mp3Url: z
    .string()
    .describe("The URL of the sermon MP3 file.  Must be a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
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
  output: {schema: TranscribeSermonOutputSchema},
  prompt: `You are an expert transcriptionist specializing in transcribing sermons.

  You will use this information to transcribe the sermon to text.
  Sermon MP3 URL: {{media url=mp3Url}}`,
});

const transcribeSermonFlow = ai.defineFlow(
  {
    name: 'transcribeSermonFlow',
    inputSchema: TranscribeSermonInputSchema,
    outputSchema: TranscribeSermonOutputSchema,
  },
  async input => {
    const {output} = await transcribeSermonPrompt(input);
    return output!;
  }
);
