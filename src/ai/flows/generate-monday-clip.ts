
'use server';

/**
 * @fileOverview This flow generates a podcast-style audio clip for a Monday devotional based on a sermon.
 *
 * - generateMondayClip - A function that handles the audio clip generation process.
 * - GenerateMondayClipInput - The input type for the generateMondayClip function.
 * - GenerateMondayClipOutput - The return type for the generateMondayClip function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

const GenerateMondayClipInputSchema = z.object({
  summaryLong: z.string().describe('The long summary of the sermon devotional.'),
});
export type GenerateMondayClipInput = z.infer<typeof GenerateMondayClipInputSchema>;

const GenerateMondayClipOutputSchema = z.object({
  mondayClipUrl: z.string().describe('URL for the Monday podcast-style TTS clip.'),
});
export type GenerateMondayClipOutput = z.infer<typeof GenerateMondayClipOutputSchema>;

export async function generateMondayClip(input: GenerateMondayClipInput): Promise<GenerateMondayClipOutput> {
  return generateMondayClipFlow(input);
}

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
}
  

const podcastScriptPrompt = ai.definePrompt({
    name: 'podcastScriptPrompt',
    input: { schema: GenerateMondayClipInputSchema },
    output: { schema: z.object({ podcastScript: z.string().describe("A 2 minute podcast script with two speakers.") }) },
    prompt: `You are an expert podcast script writer for a church.
  
    Devotional Summary: {{{summaryLong}}}
  
    Generate a 2-minute, two-speaker podcast-style discussion based on the provided devotional summary. The script should be engaging and insightful for a general audience.
  
    Follow these instructions:
    - The script must be approximately 2 minutes long when spoken.
    - The script must have two distinct speakers, labeled as Speaker1 and Speaker2.
    - The dialogue should be conversational and reflect on the key themes of the devotional.
    - Do not include any introductory or concluding remarks outside of the dialogue itself.
    - Ensure the script is substantial enough to meet the 2 minute length requirement.
    
    Example format:
    Speaker1: Hello and welcome! Today we're discussing the main points from this week's sermon.
    Speaker2: That's right. One of the key takeaways for me was...
    Speaker1: I agree. And that ties into the idea of...
    `,
});

const generateMondayClipFlow = ai.defineFlow(
  {
    name: 'generateMondayClipFlow',
    inputSchema: GenerateMondayClipInputSchema,
    outputSchema: GenerateMondayClipOutputSchema,
  },
  async input => {
    try {
        console.log('[[DEBUG]] Starting generateMondayClipFlow');
        const scriptResponse = await podcastScriptPrompt(input);
        const script = scriptResponse.output?.podcastScript;

        if (!script) {
            throw new Error('Podcast script generation failed.');
        }
        
        const { media } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                      {
                        speaker: 'Speaker1',
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: 'Algenib' },
                        },
                      },
                      {
                        speaker: 'Speaker2',
                        voiceConfig: {
                          prebuiltVoiceConfig: { voiceName: 'Achernar' },
                        },
                      },
                    ],
                  },
                },
            },
            prompt: script,
        });

        if (!media) {
            throw new Error('TTS media generation failed.');
        }

        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );

        const wavBase64 = await toWav(audioBuffer);
        const mondayClipUrl = `data:audio/wav;base64,${wavBase64}`;

        console.log('[[DEBUG]] Finishing generateMondayClipFlow.');
        return { mondayClipUrl };

    } catch (error) {
        console.error('[[ERROR]] in generateMondayClipFlow:', error);
        throw new Error('Failed to generate Monday audio clip due to a server-side AI error.');
    }
  }
);
