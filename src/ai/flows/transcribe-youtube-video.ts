
'use server';
/**
 * @fileOverview A YouTube video transcription AI agent.
 *
 * - transcribeYoutubeVideo - A function that handles the video transcription process.
 * - TranscribeYoutubeVideoInput - The input type for the function.
 * - TranscribeYoutubeVideoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import { google } from 'googleapis';
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
    
    // Fallback to youtube-transcript library. It's often faster for public videos.
    try {
      console.log('[[SERVER - DEBUG]] Attempting to fetch transcript directly from YouTube captions.');
      const transcriptParts = await YoutubeTranscript.fetchTranscript(videoUrl);
      
      if (transcriptParts && transcriptParts.length > 0) {
        console.log('[[SERVER - DEBUG]] Successfully downloaded YouTube transcript via library.');
        const fullTranscript = transcriptParts.map(part => part.text).join(' ');
        return { transcript: fullTranscript };
      }
      
      throw new Error("No transcript parts were found even though the library fetch was successful.");

    } catch (error) {
        console.warn("[[SERVER - WARN]] Failed to download YouTube transcript via library, falling back to AI.", error);
        
        let aiTranscriptionError: Error | null = null;
        try {
            console.log('[[SERVER - DEBUG]] Falling back to AI-based transcription for YouTube URL.');
            const { text } = await ai.generate({
                model: 'googleai/gemini-2.5-flash',
                prompt: [
                    { text: 'You are an expert audio transcription service. Your only task is to accurately transcribe the audio from the provided video file. Do not add any commentary, analysis, or any text other than the transcription itself. Return only the transcribed text.' },
                    { media: { url: videoUrl, contentType: 'video/mp4' } }
                ]
            });
            if (!text) {
                throw new Error('AI transcription returned no text.');
            }
            console.log('[[SERVER - DEBUG]] Successfully transcribed via AI fallback.');
            return { transcript: text };

        } catch (err) {
            aiTranscriptionError = err as Error;
        }

        // If we're here, both methods failed. Construct a clear error message.
        let finalMessage = 'Failed to process YouTube video. ';
        if ((error as Error).message.includes('disabled')) {
            finalMessage += 'Captions are disabled for this video, and AI transcription also failed. ';
        } else {
            finalMessage += 'An unexpected error occurred while trying to fetch the video transcript or audio. ';
        }
        
        if (aiTranscriptionError) {
             finalMessage += `Details: ${aiTranscriptionError.message}`;
             
             throw new Error(finalMessage);
        }
        
        throw new Error((error as Error).message || "An unknown error occurred during transcription.");
    }
  }
);
