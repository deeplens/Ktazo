
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
    const {media} = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: `Generate a sermon artwork image with a spiritual and abstract theme. The style should be sophisticated and modern, suitable for a church. The primary colors should be deep purple (#673AB7), soft lavender (#D1C4E9), and light gray (#F5F5F5). Do not include any text in the image. Prompt: ${prompt}`,
    });

    if (!media.url) {
      throw new Error('Image generation failed to produce a URL.');
    }

    return {artworkUrl: media.url};
  }
);
