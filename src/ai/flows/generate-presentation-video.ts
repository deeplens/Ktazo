
'use server';
/**
 * @fileOverview Generates a full presentation video (images + audio) from a sermon transcript.
 *
 * - generatePresentationVideo - Orchestrates the entire video generation process.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import wav from 'wav';
import { VideoSlide } from '@/lib/types';

// Define Input Schema
const GeneratePresentationVideoInputSchema = z.object({
  sermonTranscript: z.string().describe('The full transcript of the sermon.'),
});
type GeneratePresentationVideoInput = z.infer<typeof GeneratePresentationVideoInputSchema>;

// Define Output Schema for the entire flow
const GeneratePresentationVideoOutputSchema = z.object({
    slides: z.array(z.object({
        slide_title: z.string(),
        narration_script: z.string(),
        image_prompt: z.string(),
        imageUrl: z.string().url(),
        audioUrl: z.string(),
    })),
});
type GeneratePresentationVideoOutput = z.infer<typeof GeneratePresentationVideoOutputSchema>;

// Define schema for the intermediate outline generation step
const PresentationOutlineSchema = z.object({
    slides: z.array(z.object({
        slide_title: z.string().describe('A concise title for the slide.'),
        narration_script: z.string().describe('A detailed, engaging script to be read aloud for that slide.'),
        image_prompt: z.string().describe('A detailed, descriptive prompt suitable for an image generation model to create a unique visual for the slide.'),
    })).describe('An array of 3 to 5 slides representing the presentation outline.')
});

// Main exported function
export async function generatePresentationVideo(input: GeneratePresentationVideoInput): Promise<GeneratePresentationVideoOutput> {
  return generatePresentationVideoFlow(input);
}

// Helper function to convert PCM audio to WAV data URI
async function toWav(pcmData: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({ channels: 1, sampleRate: 24000, bitDepth: 16 });
        const chunks: Buffer[] = [];
        writer.on('data', chunk => chunks.push(chunk));
        writer.on('end', () => resolve(`data:audio/wav;base64,${Buffer.concat(chunks).toString('base64')}`));
        writer.on('error', reject);
        writer.write(pcmData);
        writer.end();
    });
}


// Step 1: Define the prompt for generating the presentation outline
const outlinePrompt = ai.definePrompt({
    name: 'generatePresentationOutlinePrompt',
    input: { schema: GeneratePresentationVideoInputSchema },
    output: { schema: PresentationOutlineSchema },
    prompt: `You are an expert at creating compelling presentations from long-form text. Analyze the following sermon transcript and create a presentation outline with 3 to 5 slides. For each slide, provide a concise title, a detailed narration script, and a highly descriptive image prompt for an AI image generator.

    Sermon Transcript:
    {{{sermonTranscript}}}
    `,
    model: 'googleai/gemini-2.5-pro',
});

// The main flow that orchestrates the entire process
const generatePresentationVideoFlow = ai.defineFlow(
  {
    name: 'generatePresentationVideoFlow',
    inputSchema: GeneratePresentationVideoInputSchema,
    outputSchema: GeneratePresentationVideoOutputSchema,
  },
  async ({ sermonTranscript }) => {
    console.log('[[SERVER - DEBUG]] Starting presentation video generation...');

    // 1. Generate the presentation outline
    console.log('[[SERVER - DEBUG]] Generating presentation outline...');
    const outlineResponse = await outlinePrompt({ sermonTranscript });
    const outline = outlineResponse.output;

    if (!outline || !outline.slides || outline.slides.length === 0) {
      throw new Error('Failed to generate presentation outline.');
    }
    console.log(`[[SERVER - DEBUG]] Outline generated with ${outline.slides.length} slides.`);

    // 2. Generate image and audio for each slide in parallel
    console.log('[[SERVER - DEBUG]] Generating images and audio for each slide...');
    const processedSlides = await Promise.all(
      outline.slides.map(async (slide, index) => {
        console.log(`[[SERVER - DEBUG]] Processing slide ${index + 1}...`);
        
        // Generate Image and Audio concurrently for each slide
        const [imageResult, audioResult] = await Promise.all([
          // Generate Image
          ai.generate({
            model: 'googleai/imagen-3.0-generate-002',
            prompt: slide.image_prompt,
          }),
          // Generate Audio
          ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            prompt: slide.narration_script,
            config: { 
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Alnilam' } // Male voice
                    }
                }
            },
          })
        ]);

        const imageUrl = imageResult.media.url;
        if (!imageUrl) {
          console.error(`[[SERVER - ERROR]] Image generation failed for slide ${index + 1}`);
          // Use a placeholder or throw an error
        }

        const audioPcmBase64 = audioResult.media.url.substring(audioResult.media.url.indexOf(',') + 1);
        const audioBuffer = Buffer.from(audioPcmBase64, 'base64');
        const audioUrl = await toWav(audioBuffer);
        if (!audioUrl) {
            console.error(`[[SERVER - ERROR]] Audio generation failed for slide ${index + 1}`);
        }

        console.log(`[[SERVER - DEBUG]] Finished processing slide ${index + 1}.`);
        return {
          ...slide,
          imageUrl: imageUrl || '',
          audioUrl: audioUrl || '',
        };
      })
    );

    console.log('[[SERVER - DEBUG]] Finished all slide processing.');
    return { slides: processedSlides };
  }
);
