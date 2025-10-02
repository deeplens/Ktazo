
'use server';
/**
 * @fileOverview A YouTube video transcription AI agent.
 *
 * - transcribeYoutubeVideo - A function that handles the video transcription process.
 * - TranscribeYoutubeVideoInput - The input type for the function.
 * - TranscribeYoutubeVideoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {YoutubeTranscript} from 'youtube-transcript';

const TranscribeYoutubeVideoInputSchema = z.object({
  videoUrl: z.string().url().describe('A valid YouTube video URL.'),
});
export type TranscribeYoutubeVideoInput = z.infer<typeof TranscribeYoutubeVideoInputSchema>;

const TranscribeYoutubeVideoOutputSchema = z.object({
  transcript: z.string().describe('The full transcript of the YouTube video.'),
});
export type TranscribeYoutubeVideoOutput = z.infer<typeof TranscribeYoutubeVideoOutputSchema>;

export async function transcribeYoutubeVideo(input: TranscribeYoutubeVideoInput): Promise<TranscribeYoutubeVideoOutput> {
  return transcribeYoutubeVideoFlow(input);
}


const transcribeYoutubeVideoFlow = ai.defineFlow(
  {
    name: 'transcribeYoutubeVideoFlow',
    inputSchema: TranscribeYoutubeVideoInputSchema,
    outputSchema: TranscribeYoutubeVideoOutputSchema,
  },
  async ({videoUrl}) => {
    console.log('[[SERVER - DEBUG]] Starting transcribeYoutubeVideoFlow for:', videoUrl);
    
    try {
      // First, try to get the transcript directly from YouTube captions
      const transcriptParts = await YoutubeTranscript.fetchTranscript(videoUrl);
      
      if (transcriptParts && transcriptParts.length > 0) {
        console.log('[[SERVER - DEBUG]] Found existing YouTube transcript.');
        const fullTranscript = transcriptParts.map(part => part.text).join(' ');
        console.log('[[SERVER - DEBUG]] Finishing transcribeYoutubeVideoFlow via captions.');
        return { transcript: fullTranscript };
      }
      
      // If the above throws an error or returns no transcript, it will be caught
      throw new Error("No transcript available from YouTube captions.");

    } catch (error) {
      console.error('[[SERVER - ERROR]] in transcribeYoutubeVideoFlow:', error);
      
      let finalMessage = `Failed to get transcript from YouTube video. `;
      if ((error as Error).message.includes('disabled on this video')) {
          finalMessage += `The video does not have captions enabled, which is required for transcription. Please try another video.`;
      } else {
          finalMessage += `An unexpected error occurred: ${(error as Error).message}`;
      }
      
      throw new Error(finalMessage);
    }
  }
);
