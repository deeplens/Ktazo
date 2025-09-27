
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
import { getUrlContent } from '../tools/get-url-content';

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

const transcriptionAgent = ai.definePrompt({
    name: 'transcriptionAgent',
    input: { schema: z.object({ sermonUrl: z.string() }) },
    output: { format: 'text' },
    tools: [getUrlContent],
    prompt: `You are an expert transcription agent. Your goal is to get a transcript from the provided sermonUrl.
    
    1. First, use the getUrlContent tool to inspect the sermonUrl.
    2. If the tool returns a media file (like audio or video), or if the URL is a known video platform like YouTube, you have the direct media URL.
    3. If the tool returns HTML content, you must find the audio download link within the HTML. Look for '<a>' tags with 'href' attributes pointing to '.mp3' files.
    4. Once you have the direct media URL (either from the start or by finding it in the HTML), your final output should be ONLY the following text:
    
    MEDIA_URL::[the direct media url]
    
    Do not add any other text, explanation, or formatting.
    `,
});

const transcribeFinalMediaPrompt = ai.definePrompt({
    name: 'transcribeFinalMediaPrompt',
    input: { schema: z.object({ mediaUrl: z.string() }) },
    output: { format: 'text' },
    prompt: 'Transcribe the following audio: {{media url=mediaUrl}}',
});


const transcribeSermonFlow = ai.defineFlow(
  {
    name: 'transcribeSermonFlow',
    inputSchema: TranscribeSermonInputSchema,
    outputSchema: TranscribeSermonOutputSchema,
  },
  async ({ sermonUrl }) => {
    try {
      console.log('[[DEBUG]] Starting transcribeSermonFlow for URL:', sermonUrl);
      
      const agentResponse = await transcriptionAgent({ sermonUrl });
      const agentText = agentResponse.text.trim();

      let mediaUrl;
      if (agentText.startsWith('MEDIA_URL::')) {
          mediaUrl = agentText.substring('MEDIA_URL::'.length);
      } else {
          // If the agent fails to find the URL, it might be a direct link it didn't use the tool for.
          // We'll try to use the original URL as a fallback.
          console.warn('[[WARN]] Transcription agent did not return a media URL. Falling back to original URL.');
          mediaUrl = sermonUrl;
      }

      console.log('[[DEBUG]] Final media URL for transcription:', mediaUrl);

      const transcriptionResponse = await transcribeFinalMediaPrompt({ mediaUrl });
      const transcript = transcriptionResponse.text;

      if (!transcript) {
        throw new Error('AI transcription failed: No text was returned from the model.');
      }
      
      console.log('[[DEBUG]] Finishing transcribeSermonFlow.');
      return { transcript };
    } catch (error) {
        console.error('[[ERROR]] in transcribeSermonFlow:', error);
        // Re-throwing the original error to provide more specific details to the client.
        throw error;
    }
  }
);
