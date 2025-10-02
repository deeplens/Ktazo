
'use server';
/**
 * @fileOverview Generates sermon artwork from a text prompt.
 *
 * - generateSermonArtwork - A function that generates an image.
 * - GenerateSermonArtworkInput - The input type for the function.
 * - GenerateSermonArtworkOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateSermonArtworkInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired artwork.'),
});
export type GenerateSermonArtworkInput = z.infer<typeof GenerateSermonArtworkInputSchema>;

const GenerateSermonArtworkOutputSchema = z.object({
  artworkUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateSermonArtworkOutput = z.infer<typeof GenerateSermonArtworkOutputSchema>;

export async function generateSermonArtwork(
  input: GenerateSermonArtworkInput
): Promise<GenerateSermonArtworkOutput> {
  return generateSermonArtworkFlow(input);
}

const generateSermonArtworkFlow = ai.defineFlow(
  {
    name: 'generateSermonArtworkFlow',
    inputSchema: GenerateSermonArtworkInputSchema,
    outputSchema: GenerateSermonArtworkOutputSchema,
  },
  async ({prompt}) => {
    try {
      console.log('[[DEBUG]] Starting generateSermonArtworkFlow');
      const {media} = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: prompt,
      });

      if (!media.url) {
        throw new Error('Image generation failed to produce a URL.');
      }
      
      console.log('[[DEBUG]] Finishing generateSermonArtworkFlow.');
      return {artworkUrl: media.url};
    } catch (error) {
        console.error('[[ERROR]] in generateSermonArtworkFlow:', error);
        throw new Error('Failed to generate sermon artwork due to a server-side AI error.');
    }
  }
);
