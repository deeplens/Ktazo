
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
import { YoutubeTranscript } from 'youtube-transcript';

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
      // Attempt to download the transcript directly from YouTube captions.
      console.log('[[SERVER - DEBUG]] Attempting to fetch transcript from YouTube captions.');
      const transcriptParts = await YoutubeTranscript.fetchTranscript(videoUrl);
      
      if (transcriptParts && transcriptParts.length > 0) {
        console.log('[[SERVER - DEBUG]] Successfully downloaded YouTube transcript.');
        const fullTranscript = transcriptParts.map(part => part.text).join(' ');
        return { transcript: fullTranscript };
      }
      
      // This part should ideally not be reached if fetchTranscript throws an error on failure.
      throw new Error("No transcript parts were found even though the fetch was successful.");

    } catch (error) {
        console.error("[[SERVER - ERROR]] Failed to download YouTube transcript:", error);
        
        let errorMessage = 'Failed to download transcript from YouTube.';
        if ((error as Error).message.includes('disabled on this video')) {
            errorMessage = 'Transcription failed because captions are disabled for this YouTube video. Please try a different video or upload a transcript file directly.';
        } else if ((error as Error).message.includes('No transcript found')) {
            errorMessage = 'No English transcript could be found for this YouTube video. Please try a different video or upload a transcript file directly.';
        }
        
        throw new Error(errorMessage);
    }
  }
);
