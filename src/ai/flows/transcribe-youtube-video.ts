
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

// Helper to parse SRT format
function parseSrt(srt: string): string {
    return srt
        .replace(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g, '') // Remove timestamps
        .replace(/\d+\r?\n/g, '') // Remove line numbers
        .replace(/<[^>]*>/g, '')   // Remove HTML tags
        .replace(/\r?\n/g, ' ')     // Replace newlines with spaces
        .trim();
}

const transcribeYoutubeVideoFlow = ai.defineFlow(
  {
    name: 'transcribeYoutubeVideoFlow',
    inputSchema: TranscribeYoutubeVideoInputSchema,
    outputSchema: TranscribeYoutubeVideoOutputSchema,
  },
  async ({videoUrl}) => {
    console.log('[[SERVER - DEBUG]] Starting transcribeYoutubeVideoFlow for:', videoUrl);
    
    const videoIdMatch = videoUrl.match(/(?:v=)([\w-]{11})/);
    if (!videoIdMatch) {
        throw new Error('Invalid YouTube URL. Could not extract video ID.');
    }
    const videoId = videoIdMatch[1];
    const youtube = google.youtube('v3');
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error('YouTube API key is missing. Cannot transcribe video.');
    }
    
    try {
      // 1. Check for available caption tracks
      console.log('[[SERVER - DEBUG]] Listing caption tracks for video:', videoId);
      const captionListResponse = await youtube.captions.list({
        key: apiKey,
        part: ['id', 'snippet'],
        videoId: videoId,
      });

      const tracks = captionListResponse.data.items || [];
      // Prefer manual English captions, then ASR English, then any caption track
      const enTrack = tracks.find(t => t.snippet?.language === 'en');
      const asrTrack = tracks.find(t => t.snippet?.trackKind === 'ASR' && t.snippet?.language?.startsWith('en'));
      const anyTrack = tracks[0];

      const chosenTrack = enTrack || asrTrack || anyTrack;

      if (chosenTrack && chosenTrack.id) {
        // 2. Download the chosen caption track
        console.log(`[[SERVER - DEBUG]] Found caption track: ${chosenTrack.id}. Downloading...`);
        const captionDownloadResponse = await youtube.captions.download({
          key: apiKey,
          id: chosenTrack.id,
          tfmt: 'srt' // Request SubRip format
        });

        if (typeof captionDownloadResponse.data === 'string') {
          const transcript = parseSrt(captionDownloadResponse.data);
          console.log('[[SERVER - DEBUG]] Successfully downloaded and parsed YouTube transcript.');
          return { transcript };
        }
      }

      // If we reach here, no suitable caption track was found or download failed unexpectedly
      throw new Error("No suitable caption track found for direct download.");

    } catch (error: any) {
        console.warn(`[[SERVER - WARN]] Failed to download YouTube transcript directly: ${error.message}. Falling back to AI transcription.`);
        
        try {
            console.log('[[SERVER - DEBUG]] Falling back to AI-based transcription for YouTube URL.');
            const { text } = await ai.generate({
                model: 'googleai/gemini-2.5-flash',
                prompt: [
                    { text: 'You are an expert audio transcription service. Your only task is to accurately transcribe the audio from the provided video file. Do not add any commentary, analysis, or any text other than the transcription itself. Return only the transcribed text.' },
                    { media: { url: videoUrl } }
                ]
            });
            if (!text) {
                throw new Error('AI transcription returned no text.');
            }
            console.log('[[SERVER - DEBUG]] Successfully transcribed via AI fallback.');
            return { transcript: text };

        } catch (aiError: any) {
             const finalMessage = `Failed to process YouTube video. Direct download failed, and AI transcription also failed. Details: ${aiError.message}`;
             console.error("[[SERVER - ERROR]] " + finalMessage, aiError);
             throw new Error(finalMessage);
        }
    }
  }
);
