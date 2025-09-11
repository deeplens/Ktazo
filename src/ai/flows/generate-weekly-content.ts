
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

const GameQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
});

const MatchingGameItemSchema = z.object({
    id: z.number(),
    term: z.string().describe('A key term or concept from the sermon.'),
    definition: z.string().describe('The definition or a related concept to the term.'),
});

const FillInTheBlankItemSchema = z.object({
    sentence: z.string().describe('A sentence from the sermon with a word missing. Use underscores to represent the blank, e.g., "For God so loved the ___..."'),
    blank: z.string().describe('The word that correctly fills the blank.'),
});

const WordGuessItemSchema = z.object({
    word: z.string().describe('A single, important word from the sermon.'),
    hint: z.string().describe('A short clue or definition for the word.'),
});

const WordleItemSchema = z.object({
    word: z.string().length(5).describe('A single, important 5-letter word from the sermon.'),
});


const GameSchema = z.object({
    type: z.enum(['Quiz', 'Word Search', 'Fill in the Blank', 'Matching', 'Word Guess', 'Wordle']),
    title: z.string(),
    audience: z.enum(['Youth', 'Adults']),
    data: z.union([
        z.array(GameQuestionSchema),
        z.object({ words: z.array(z.string()) }),
        FillInTheBlankItemSchema,
        z.array(MatchingGameItemSchema).describe('An array of 4-6 pairs for a matching game.'),
        WordGuessItemSchema,
        WordleItemSchema,
    ]),
});

const GenerateWeeklyContentOutputSchema = z.object({
  summaryShort: z.string().describe('A short summary of the sermon.'),
  summaryLong: z.string().describe('A longer devotional guide summary of the sermon.'),
  devotionals: z.array(z.string()).describe('An array of five daily devotionals (Mon-Fri).'),
  reflectionQuestions: z.array(ReflectionQuestionGroupSchema).describe('An array of reflection question groups for different audiences.'),
  games: z.array(GameSchema).describe('An array of 3-5 interactive games based on the sermon. Include a mix of types like Quiz, Word Search, Fill in the Blank, Matching, Word Guess, or Wordle. For Quizzes, provide 3-4 questions with 4 multiple-choice options each. For Matching games, provide 4-6 pairs of terms and definitions. For Fill in the Blank, provide one key sentence with an important word missing. For Word Guess, provide a single key word and a hint for it. For Wordle, provide a single, relevant 5-letter word from the sermon.'),
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
  - An array of 3-5 interactive games based on the sermon's content. Include a mix of game types like 'Quiz', 'Word Search', 'Fill in the Blank', 'Matching', 'Word Guess', or 'Wordle'. For Quizzes, provide 3-4 questions with 4 multiple-choice options each. For Matching games, provide 4-6 pairs of terms and definitions. For Fill in the Blank, provide one key sentence with an important word missing. For Word Guess, provide a single key word from the sermon and a hint for it. For Wordle, provide one significant 5-letter word from the sermon.
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
