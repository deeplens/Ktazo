
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
  targetLanguage: z.string().optional().describe('The target language for the content (e.g., "Spanish"). Defaults to English if not provided.'),
});
export type GenerateWeeklyContentInput = z.infer<typeof GenerateWeeklyContentInputSchema>;

const ReflectionQuestionGroupSchema = z.object({
    audience: z.enum(['Individuals', 'Families', 'Small Groups', 'Youth']),
    questions: z.array(z.string()).describe('An array of 3-4 reflection questions for the specified audience.'),
});

const GenerateWeeklyContentOutputSchema = z.object({
  summaryShort: z.string().describe('A short summary of the sermon.'),
  summaryLong: z.string().describe('A longer devotional guide summary of the sermon.'),
  devotionals: z.array(z.string()).describe('An array of five daily devotionals (Mon-Fri).'),
  reflectionQuestions: z.array(ReflectionQuestionGroupSchema).describe('An array of reflection question groups for different audiences.'),
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
  
  {{#if targetLanguage}}
  IMPORTANT: All generated text content MUST be in {{targetLanguage}}.
  {{else}}
  IMPORTANT: All generated text content MUST be in English.
  {{/if}}

  Sermon Transcript: {{{sermonTranscript}}}

  Generate the following content in {{targetLanguage}}:

  - A short summary (summaryShort).
  - A longer devotional guide summary (summaryLong).
  - Five daily devotionals for Monday, Tuesday, Wednesday, Thursday, and Friday (devotionals).
  - Reflection questions for four audiences: Individuals, Families, Small Groups, and Youth. Each audience should have its own group with 3-4 questions.
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
