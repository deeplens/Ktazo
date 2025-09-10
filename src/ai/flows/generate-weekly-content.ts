
'use server';

/**
 * @fileOverview This flow generates weekly content (summaries, devotionals, questions, games) from a sermon.
 *
 * - generateWeeklyContent - A function that handles the weekly content generation process.
 * - GenerateWeeklyContentInput - The input type for the generateWeeklyContent function.
 * - GenerateWeeklyContentOutput - The return type for the generateWeeklyContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
});
export type GenerateWeeklyContentOutput = z.infer<typeof GenerateWeeklyContentOutputSchema>;


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
  - Five daily devotionals for Monday, Tuesday, Wednesday, Thursday, and Friday (devotionals).
  - Reflection questions for youth (reflectionQuestionsYouth).
  - Reflection questions for families (reflectionQuestionsFamilies).
  - Reflection questions for small groups (reflectionQuestionsSmallGroups).
  - Reflection questions for individuals (reflectionQuestionsIndividuals).
  - Configuration for interactive games (youth: timed quiz, flashcards; adults: word search, matching) (gameConfiguration).
  - A themed image URL for the week (Google \"Nano Banana\" image gen placeholder) (themedImageUrl).
  `,
});


const generateWeeklyContentFlow = ai.defineFlow(
  {
    name: 'generateWeeklyContentFlow',
    inputSchema: GenerateWeeklyContentInputSchema,
    outputSchema: GenerateWeeklyContentOutputSchema,
  },
  async input => {
    console.log('[[DEBUG]] Starting generateWeeklyContentFlow');
    
    const { output } = await generateWeeklyContentPrompt(input);
    const content = output!;
    
    console.log('[[DEBUG]] Finishing generateWeeklyContentFlow.');
    return content;
  }
);
