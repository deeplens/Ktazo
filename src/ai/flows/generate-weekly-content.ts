'use server';

/**
 * @fileOverview This flow generates weekly content (summaries, devotionals, questions, games) from a sermon.
 *
 * - generateWeeklyContent - A function that handles the weekly content generation process.
 * - GenerateWeeklyContentInput - The input type for the generateWeeklyContent function.
 * - GenerateWeeklyContentOutput - The return type for the generateWeeklyContent function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

const GenerateWeeklyContentInputSchema = z.object({
  sermonId: z.string().describe('The ID of the sermon to generate content for.'),
  tenantId: z.string().describe('The ID of the tenant.'),
  sermonTranscript: z.string().describe('The full transcript of the sermon.'),
});
export type GenerateWeeklyContentInput = z.infer<typeof GenerateWeeklyContentInputSchema>;

const GenerateWeeklyContentOutputSchema = z.object({
  summaryShort: z.string().describe('A short summary of the sermon.'),
  summaryLong: z.string().describe('A longer devotional guide summary of the sermon.'),
  devotionals: z.array(z.string()).describe('An array of five daily devotionals (Mon-Fri).'),
  reflectionQuestionsYouth: z.array(z.string()).describe('Reflection questions for youth.'),
  reflectionQuestionsFamilies: z.array(z.string()).describe('Reflection questions for families.'),
  reflectionQuestionsSmallGroups: z.array(z.string()).describe('Reflection questions for small groups.'),
  reflectionQuestionsIndividuals: z.array(z.string()).describe('Reflection questions for individuals.'),
  gameConfiguration: z.string().describe('Configuration for interactive games (youth: timed quiz, flashcards; adults: word search, matching).'),
  themedImageUrl: z.string().describe('A themed image URL for the week (Google \"Nano Banana\" image gen placeholder).'),
  mondayClipUrl: z.string().describe('URL for the Monday podcast-style TTS clip.'),
});
export type GenerateWeeklyContentOutput = z.infer<typeof GenerateWeeklyContentOutputSchema>;

const PodcastScriptSchema = z.object({
  script: z.string().describe('A 3-5 minute podcast script with two speakers, Speaker1 (male, Alex) and Speaker2 (female, Sarah), bantering about the sermon content. The script should start with Speaker1.'),
});

export async function generateWeeklyContent(input: GenerateWeeklyContentInput): Promise<GenerateWeeklyContentOutput> {
  return generateWeeklyContentFlow(input);
}

const generateWeeklyContentPrompt = ai.definePrompt({
  name: 'generateWeeklyContentPrompt',
  input: {schema: GenerateWeeklyContentInputSchema},
  output: {schema: GenerateWeeklyContentOutputSchema},
  prompt: `You are an AI assistant designed to generate weekly content for a church, based on a given sermon.

  Sermon Transcript: {{{sermonTranscript}}}

  Generate the following content:

  - A short summary (summaryShort).
  - A longer devotional guide summary (summaryLong).
  - Four daily devotionals (Tues-Fri) (devotionals). Monday will be an audio clip.
  - Reflection questions for youth (reflectionQuestionsYouth).
  - Reflection questions for families (reflectionQuestionsFamilies).
  - Reflection questions for small groups (reflectionQuestionsSmallGroups).
  - Reflection questions for individuals (reflectionQuestionsIndividuals).
  - Configuration for interactive games (youth: timed quiz, flashcards; adults: word search, matching) (gameConfiguration).
  - A themed image URL for the week (Google \"Nano Banana\" image gen placeholder) (themedImageUrl).
  - The mondayClipUrl will be generated in a separate step.
  `,
});

const podcastScriptPrompt = ai.definePrompt({
    name: 'podcastScriptPrompt',
    input: {schema: z.object({sermonTranscript: z.string()})},
    output: {schema: PodcastScriptSchema},
    prompt: `You are an AI assistant that writes podcast scripts.
    Based on the following sermon transcript, write a 3-5 minute podcast script with two speakers, Speaker1 (male, "Alex") and Speaker2 (female, "Sarah"), bantering about the sermon content. The script should be engaging, conversational, and reflect on the key themes of the sermon. The script should start with Speaker1.
    
    Sermon Transcript: {{{sermonTranscript}}}
    `,
});

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

const generateWeeklyContentFlow = ai.defineFlow(
  {
    name: 'generateWeeklyContentFlow',
    inputSchema: GenerateWeeklyContentInputSchema,
    outputSchema: GenerateWeeklyContentOutputSchema,
  },
  async input => {
    const [contentResponse, podcastScriptResponse] = await Promise.all([
        generateWeeklyContentPrompt(input),
        podcastScriptPrompt({sermonTranscript: input.sermonTranscript}),
    ]);
    
    const content = contentResponse.output!;
    const podcastScript = podcastScriptResponse.output?.script || '';

    let mondayClipUrl = '';

    if (podcastScript) {
        const {media} = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            {
                                speaker: 'Speaker1',
                                voiceConfig: {
                                    prebuiltVoiceConfig: {voiceName: 'en-US-Standard-C'}, // Male
                                },
                            },
                            {
                                speaker: 'Speaker2',
                                voiceConfig: {
                                    prebuiltVoiceConfig: {voiceName: 'en-US-Standard-E'}, // Female
                                },
                            },
                        ],
                    },
                },
            },
            prompt: podcastScript,
        });

        if (media) {
            const audioBuffer = Buffer.from(
                media.url.substring(media.url.indexOf(',') + 1), 'base64'
            );
            const wavBase64 = await toWav(audioBuffer);
            mondayClipUrl = 'data:audio/wav;base64,' + wavBase64;
        }
    }
    
    // Add a placeholder for Monday devotional text
    content.devotionals.unshift('Listen to the Monday podcast clip for today\'s devotional.');

    return {
        ...content,
        mondayClipUrl,
    };
  }
);
