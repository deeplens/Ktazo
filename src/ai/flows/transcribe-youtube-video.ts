
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
import ytdl from 'ytdl-core';
import { PassThrough } from 'stream';

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

// Helper to convert a stream to a base64 data URI
async function streamToDataURI(stream: NodeJS.ReadableStream, mimeType: string): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
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
      // and we'll fall back to AI transcription below.
      throw new Error("No transcript available from YouTube captions.");

    } catch (captionError) {
      console.warn(`[[SERVER - WARN]] Could not fetch YouTube captions: ${(captionError as Error).message}. Falling back to AI audio transcription.`);

      try {
        console.log('[[SERVER - DEBUG]] Starting AI transcription fallback.');
        const videoInfo = await ytdl.getInfo(videoUrl);
        const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio', filter: 'audioonly' });
        
        if (!audioFormat) {
          throw new Error('No suitable audio format found for this YouTube video.');
        }

        const audioStream = ytdl(videoUrl, { format: audioFormat });
        const mimeType = audioFormat.mimeType?.split(';')[0] || 'audio/webm';
        
        // Convert stream to data URI to pass to the transcription flow
        const audioDataUri = await streamToDataURI(audioStream, mimeType);
        
        console.log('[[SERVER - DEBUG]] Audio downloaded, passing to transcribeSermon flow.');
        const { transcript } = await transcribeSermon({ audioDataUri });
        
        console.log('[[SERVER - DEBUG]] Finishing transcribeYoutubeVideoFlow via AI transcription.');
        return { transcript };
        
      } catch (transcriptionError) {
          console.error('[[SERVER - ERROR]] in transcribeYoutubeVideoFlow (fallback):', transcriptionError);
          // Create a more informative final error message
          let finalMessage = 'Failed to process YouTube video. ';
          if ((captionError as Error).message.includes('disabled')) {
              finalMessage += 'The video does not have captions, and the fallback attempt to transcribe the audio also failed. ';
          } else {
              finalMessage += 'An error occurred while fetching video data. ';
          }
          finalMessage += `Details: ${(transcriptionError as Error).message}`;
          
          throw new Error(finalMessage);
      }
    }
  }
);
