
'use server';

/**
 * @fileOverview This flow generates "My Journey" questions from a sermon transcript.
 *
 * - generateJourneyContent - A function that handles the question generation process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateWeeklyContentInputSchema, JourneyQuestionsSchema } from '@/lib/types';


const GenerateJourneyContentInputSchema = GenerateWeeklyContentInputSchema.pick({ sermonTranscript: true, targetLanguage: true });
type GenerateJourneyContentInput = z.infer<typeof GenerateJourneyContentInputSchema>;
type GenerateJourneyContentOutput = z.infer<typeof JourneyQuestionsSchema>;

export async function generateJourneyContent(input: GenerateJourneyContentInput): Promise<GenerateJourneyContentOutput> {
  return generateJourneyContentFlow(input);
}

const languageInstruction = (targetLanguage?: string) => {
    return targetLanguage
      ? `IMPORTANT: All generated text content MUST be in ${targetLanguage}.`
      : 'IMPORTANT: All generated text content MUST be in English.';
};

const generateJourneyContentFlow = ai.defineFlow(
  {
    name: 'generateJourneyContentFlow',
    inputSchema: GenerateJourneyContentInputSchema,
    outputSchema: JourneyQuestionsSchema,
  },
  async (input) => {
    const langInstructionText = languageInstruction(input.targetLanguage);

    const journeyPrompt = ai.definePrompt({
        name: 'journeyPrompt',
        input: { schema: GenerateJourneyContentInputSchema },
        output: { schema: JourneyQuestionsSchema },
        prompt: `${langInstructionText}

        You are an expert in mentoring and spiritual development for Gen Z.
        Based on the sermon transcript provided, generate 3-5 challenging and introspective questions for a private "My Journey" section.

        These questions should not be simple comprehension questions. They must push the user to reflect deeply on their personal mission, vision, and purpose in light of the sermon's message. Frame the questions in a way that is relatable and engaging for a young adult audience (Gen Z).

        For each question, assign it to one of three categories: 'Mission' (about doing/action), 'Vision' (about seeing/direction), or 'Purpose' (about being/identity).

        Sermon Transcript:
        {{{sermonTranscript}}}
        `,
    });
    
    const response = await journeyPrompt(input);
    if (!response.output) throw new Error('Failed to generate My Journey questions.');
    return response.output;
  }
);
