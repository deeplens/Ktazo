
'use server';
/**
 * @fileOverview Generates a sermon video from a summary.
 *
 * - generateSermonVideo - A function that generates a video.
 * - GenerateSermonVideoInput - The input type for the function.
 * - GenerateSermonVideoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import {MediaPart} from 'genkit/media';
import {Readable} from 'stream';

const GenerateSermonVideoInputSchema = z.object({
  summary: z.string().describe('A summary of the sermon to generate a video for.'),
});
export type GenerateSermonVideoInput = z.infer<typeof GenerateSermonVideoInputSchema>;

const GenerateSermonVideoOutputSchema = z.object({
  videoUrl: z.string().describe('The data URI of the generated video.'),
});
export type GenerateSermonVideoOutput = z.infer<typeof GenerateSermonVideoOutputSchema>;

export async function generateSermonVideo(
  input: GenerateSermonVideoInput
): Promise<GenerateSermonVideoOutput> {
  return generateSermonVideoFlow(input);
}

async function downloadVideo(video: MediaPart): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    
    if (!video.media?.url) {
        throw new Error('Video media URL is missing.');
    }

    const videoDownloadResponse = await fetch(
      `${video.media.url}&key=${apiKey}`
    );
  
    if (
      !videoDownloadResponse ||
      videoDownloadResponse.status !== 200 ||
      !videoDownloadResponse.body
    ) {
      throw new Error(`Failed to fetch video: ${videoDownloadResponse.statusText}`);
    }
  
    const videoBuffer = await videoDownloadResponse.arrayBuffer();
    const base64Video = Buffer.from(videoBuffer).toString('base64');
    
    return `data:video/mp4;base64,${base64Video}`;
}

const generateSermonVideoFlow = ai.defineFlow(
  {
    name: 'generateSermonVideoFlow',
    inputSchema: GenerateSermonVideoInputSchema,
    outputSchema: GenerateSermonVideoOutputSchema,
  },
  async ({summary}) => {
    try {
      console.log('[[SERVER - DEBUG]] Starting generateSermonVideoFlow');
      
      let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: `Create a compelling 1-minute video overview based on this sermon summary: ${summary}. Use cinematic shots, inspiring music, and abstract visuals related to themes like hope, community, and faith.`,
        config: {
          durationSeconds: 8, // Veo can generate longer, but let's keep it short.
          aspectRatio: '16:9',
        },
      });

      if (!operation) {
        throw new Error('Expected the model to return an operation for video generation.');
      }
    
      // Poll the operation until it's complete
      console.log('[[SERVER - DEBUG]] Polling video generation operation...');
      while (!operation.done) {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
        operation = await ai.checkOperation(operation);
        console.log('[[SERVER - DEBUG]] Operation status:', operation.done);
      }
    
      if (operation.error) {
        throw new Error('Video generation failed: ' + operation.error.message);
      }
    
      const video = operation.output?.message?.content.find((p) => !!p.media);
      if (!video) {
        throw new Error('Failed to find the generated video in the operation output.');
      }
      
      const videoDataUri = await downloadVideo(video);

      console.log('[[SERVER - DEBUG]] Finishing generateSermonVideoFlow.');
      return {videoUrl: videoDataUri};

    } catch (error) {
        console.error('[[SERVER - ERROR]] in generateSermonVideoFlow:', error);
        throw new Error('Failed to generate sermon video due to a server-side AI error.');
    }
  }
);
