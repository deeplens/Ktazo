
'use server';

/**
 * @fileOverview This flow generates reflection questions from a sermon transcript.
 *
 * - generateReflectionQuestions - A function that handles the question generation process.
 * - GenerateReflectionQuestionsInput - The input type for the function.
 * - GenerateReflectionQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateWeeklyContentInputSchema, ReflectionQuestionsSchema } from '@/lib/types';


const GenerateReflectionQuestionsInputSchema = GenerateWeeklyContentInputSchema.pick({ sermonTranscript: true, targetLanguage: true });
type GenerateReflectionQuestionsInput = z.infer<typeof GenerateReflectionQuestionsInputSchema>;
type GenerateReflectionQuestionsOutput = z.infer<typeof ReflectionQuestionsSchema>;

export async function generateReflectionQuestions(input: GenerateReflectionQuestionsInput): Promise<GenerateReflectionQuestionsOutput> {
  return generateReflectionQuestionsFlow(input);
}

const languageInstruction = (targetLanguage?: string) => {
    return targetLanguage
      ? `IMPORTANT: All generated text content MUST be in ${targetLanguage}.`
      : 'IMPORTANT: All generated text content MUST be in English.';
};

const generateReflectionQuestionsFlow = ai.defineFlow(
  {
    name: 'generateReflectionQuestionsFlow',
    inputSchema: GenerateReflectionQuestionsInputSchema,
    outputSchema: ReflectionQuestionsSchema,
  },
  async (input) => {
    const langInstructionText = languageInstruction(input.targetLanguage);

    const questionsPrompt = ai.definePrompt({
        name: 'questionsPrompt',
        input: { schema: GenerateReflectionQuestionsInputSchema },
        output: { schema: ReflectionQuestionsSchema },
        prompt: `${langInstructionText}\n\nSermon Transcript: {{{sermonTranscript}}}\n\nGenerate reflection questions for Individuals, Families, Small Groups, and Youth based on the transcript.`,
    });
    
    const questionsResponse = await questionsPrompt(input);
    if (!questionsResponse.output) throw new Error('Failed to generate reflection questions.');
    return questionsResponse.output;
  }
);
