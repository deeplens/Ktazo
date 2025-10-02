
'use server';
/**
 * @fileOverview A YouTube video transcription AI agent.
 *
 * - transcribeYoutubeVideo - A function that handles the video transcription process.
 * - TranscribeYoutubeVideoInput - The input type for the function.
 * - TranscribeYoutubeVideoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
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
      // First, try to get the transcript directly from YouTube captions
      console.log('[[SERVER - DEBUG]] Attempting to fetch transcript from YouTube captions.');
      const transcriptParts = await YoutubeTranscript.fetchTranscript(videoUrl);
      
      if (transcriptParts && transcriptParts.length > 0) {
        console.log('[[SERVER - DEBUG]] Found existing YouTube transcript.');
        const fullTranscript = transcriptParts.map(part => part.text).join(' ');
        console.log('[[SERVER - DEBUG]] Finishing transcribeYoutubeVideoFlow via captions.');
        return { transcript: fullTranscript };
      }
      
      throw new Error("No transcript available from YouTube captions.");

    } catch (captionError) {
        console.warn('[[SERVER - WARN]] Could not fetch YouTube captions. Falling back to AI transcription.', (captionError as Error).message);
        
        try {
            console.log('[[SERVER - DEBUG]] Starting AI transcription fallback using gemini-1.5-flash.');
            const { text } = await ai.generate({
                model: 'googleai/gemini-1.5-flash',
                prompt: [
                    { text: 'You are an expert audio transcription service. Your only task is to accurately transcribe the audio from the provided video file. Do not add any commentary, analysis, or any text other than the transcription itself. Return only the transcribed text.' },
                    { media: { url: videoUrl, contentType: 'video/*' } }
                ]
            });

            if (!text) {
                throw new Error('AI transcription failed: No text was returned from the model.');
            }
            
            console.log('[[SERVER - DEBUG]] Finishing transcribeYoutubeVideoFlow via AI fallback.');
            return { transcript: text };

        } catch (transcriptionError) {
             let finalMessage = `Failed to process YouTube video. An unexpected error occurred while trying to fetch the video transcript or audio. `;
             console.error('[[SERVER - ERROR]] AI Transcription fallback failed.', transcriptionError);
             finalMessage += `Details: ${(transcriptionError as Error).message}`;
             
             throw new Error(finalMessage);
        }
    }
  }
);
