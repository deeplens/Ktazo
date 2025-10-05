
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
import { YoutubeTranscript } from 'youtube-transcript';

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
      // The library throws an error if captions are disabled.
      // We can fetch just the metadata which is faster than the full transcript.
      await YoutubeTranscript.fetchTranscript(videoUrl, { lang: 'en' });
      return { captionsEnabled: true };
    } catch (error) {
      if ((error as Error).message.includes('disabled on this video')) {
        return { captionsEnabled: false };
      }
      // If the error is anything else (e.g. 'No transcript found for language'), 
      // it means captions exist, just not in the default language we checked.
      // For the purpose of this check, we'll consider that as captions being enabled.
      if ((error as Error).message.includes('No transcript found')) {
        return { captionsEnabled: true };
      }
      
      // Re-throw other unexpected errors
      console.error("[[SERVER - ERROR]] Unexpected error in checkYoutubeCaptionsFlow:", error);
      throw new Error(`An unexpected error occurred while checking captions for ${videoUrl}.`);
    }
  }
);
