
'use server';
/**
 * @fileOverview Checks if a YouTube video has captions.
 * 
 * - checkYoutubeCaptions - A function that returns whether captions are enabled.
 * - CheckYoutubeCaptionsInput - The input type for the function.
 * - CheckYoutubeCaptionsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';

const CheckYoutubeCaptionsInputSchema = z.object({
  videoUrl: z.string().url().describe('A valid YouTube video URL.'),
});
export type CheckYoutubeCaptionsInput = z.infer<typeof CheckYoutubeCaptionsInputSchema>;

const CheckYoutubeCaptionsOutputSchema = z.object({
  captionsEnabled: z.boolean(),
});
export type CheckYoutubeCaptionsOutput = z.infer<typeof CheckYoutubeCaptionsOutputSchema>;

export async function checkYoutubeCaptions(input: CheckYoutubeCaptionsInput): Promise<CheckYoutubeCaptionsOutput> {
  return checkYoutubeCaptionsFlow(input);
}

const checkYoutubeCaptionsFlow = ai.defineFlow(
  {
    name: 'checkYoutubeCaptionsFlow',
    inputSchema: CheckYoutubeCaptionsInputSchema,
    outputSchema: CheckYoutubeCaptionsOutputSchema,
  },
  async ({ videoUrl }) => {
    try {
        const videoIdMatch = videoUrl.match(/(?:v=)([\w-]{11})/);
        if (!videoIdMatch) {
            throw new Error('Invalid YouTube URL. Could not extract video ID.');
        }
        const videoId = videoIdMatch[1];
        
        const youtube = google.youtube('v3');
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
          console.warn('[[SERVER - WARN]] YouTube API key is missing. Cannot check for captions.');
          return { captionsEnabled: false };
        }
        
        const response = await youtube.captions.list({
            key: apiKey,
            part: ['id'],
            videoId: videoId,
        });

        const hasCaptions = response.data.items && response.data.items.length > 0;
        return { captionsEnabled: hasCaptions };

    } catch (error: any) {
      // If the API call fails (e.g., video not found, API error), assume no captions.
      console.error("[[SERVER - ERROR]] Unexpected error in checkYoutubeCaptionsFlow:", error.response?.data?.error || error.message);
      // Specifically check for 'captionsNotAvailable' error from YouTube API
      if (error.response?.data?.error?.errors?.[0]?.reason === 'captionsNotAvailable') {
        return { captionsEnabled: false };
      }
      // For other errors, we can be pessimistic or optimistic. Let's be pessimistic.
      return { captionsEnabled: false };
    }
  }
);
