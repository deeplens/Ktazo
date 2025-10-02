
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
    try {
      console.log('[[SERVER - DEBUG]] Starting transcribeYoutubeVideoFlow for:', videoUrl);
      
      const transcriptParts = await YoutubeTranscript.fetchTranscript(videoUrl);
      
      if (!transcriptParts || transcriptParts.length === 0) {
        throw new Error('Could not retrieve transcript for this YouTube video. Please ensure captions are available.');
      }
      
      const fullTranscript = transcriptParts.map(part => part.text).join(' ');
      
      console.log('[[SERVER - DEBUG]] Finishing transcribeYoutubeVideoFlow.');
      return { transcript: fullTranscript };

    } catch (error) {
      console.error('[[SERVER - ERROR]] in transcribeYoutubeVideoFlow:', error);
      throw new Error(`Failed to transcribe YouTube video. Please check the URL and ensure the video has captions. Error: ${(error as Error).message}`);
    }
  }
);
