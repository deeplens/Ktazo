
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
import {transcribeSermon} from './transcribe-sermon';

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
      
      throw new Error("No transcript available from YouTube captions.");

    } catch (error) {
        console.warn('[[SERVER - WARN]] Could not fetch YouTube captions, attempting AI transcription fallback.', (error as Error).message);
        
        try {
            console.log('[[SERVER - DEBUG]] Calling AI transcription for the YouTube video URL.');
            
            const transcriptionResult = await transcribeSermon({ mediaUri: videoUrl });
            
            if (!transcriptionResult.transcript) {
                throw new Error('AI transcription returned an empty result.');
            }

            console.log('[[SERVER - DEBUG]] Finishing transcribeYoutubeVideoFlow via AI fallback.');
            return { transcript: transcriptionResult.transcript };

        } catch (transcriptionError) {
             console.error('[[SERVER - ERROR]] Both YouTube captions and AI transcription failed:', transcriptionError);
             let finalMessage = `Failed to process YouTube video. `;
             
             if ((error as Error).message.includes('disabled on this video')) {
                 finalMessage += `YouTube captions are disabled, and the AI transcription fallback also failed. `;
             } else {
                 finalMessage += `An unexpected error occurred while trying to fetch the video transcript or audio. `;
             }

             finalMessage += `Details: ${(transcriptionError as Error).message}`;
             
             throw new Error(finalMessage);
        }
    }
  }
);
