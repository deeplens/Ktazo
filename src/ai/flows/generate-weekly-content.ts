
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

const JeopardyQuestionSchema = z.object({
    question: z.string().describe('The clue or question.'),
    answer: z.string().describe('The correct response.'),
    points: z.number().describe('The point value of the question (e.g., 100, 200, 300).'),
});

const JeopardyCategorySchema = z.object({
    title: z.string().describe('The title of the category.'),
    questions: z.array(JeopardyQuestionSchema).describe('An array of 3 questions for this category, in increasing order of difficulty/points.'),
});

const VerseScrambleItemSchema = z.object({
    verse: z.string().describe('The full text of a key bible verse from the sermon.'),
    reference: z.string().describe('The bible reference for the verse (e.g., "John 3:16").'),
});

const GameSchema = z.object({
    type: z.enum(['Quiz', 'Word Search', 'Fill in the Blank', 'Matching', 'Word Guess', 'Wordle', 'Jeopardy', 'Verse Scramble']),
    title: z.string(),
    audience: z.enum(['Youth', 'Adults']),
    data: z.union([
        z.array(GameQuestionSchema),
        z.object({ words: z.array(z.string()) }),
        z.array(FillInTheBlankItemSchema).describe('An array of 4 key sentences with an important word missing.'),
        z.array(MatchingGameItemSchema).describe('An array of 4-6 pairs for a matching game.'),
        z.array(WordGuessItemSchema).describe('An array of 4 key words from the sermon, each with a hint.'),
        WordleItemSchema,
        z.array(JeopardyCategorySchema).describe('An array of 2-3 categories for a Jeopardy game. Each category should have 3 questions.'),
        VerseScrambleItemSchema.describe('A key bible verse from the sermon to be used in a word scramble game.'),
    ]),
});

const GenerateWeeklyContentOutputSchema = z.object({
  summaryShort: z.string().describe('A short summary of the sermon.'),
  summaryLong: z.string().describe('A longer devotional guide summary of the sermon.'),
  devotionals: z.array(z.string()).describe('An array of five daily devotionals (Mon-Fri). Each devotional should be approximately 200 words.'),
  reflectionQuestions: z.array(ReflectionQuestionGroupSchema).describe('An array of reflection question groups for different audiences.'),
  games: z.array(GameSchema).describe('An array of 3-5 interactive games based on the sermon. Include a mix of types like Quiz, Word Search, Fill in the Blank, Matching, Word Guess, Wordle, or Jeopardy. For Quizzes, provide 3-4 questions with 4 multiple-choice options each. For Matching games, provide 4-6 pairs of terms and definitions. For Fill in the Blank, provide four key sentences with an important word missing. For Word Guess, provide four key words from the sermon, each with its own hint. For Wordle, provide a single, relevant 5-letter word from the sermon. For Jeopardy, create 2-3 categories with 3 questions each, with point values of 100, 200, and 300. For Verse Scramble, select one key Bible verse from the sermon.'),
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
  - Five daily devotionals for Monday, Tuesday, Wednesday, Thursday, and Friday (devotionals). Each devotional should be substantial, around 200 words long.
  - Reflection questions for four audiences: Individuals, Families, Small Groups, and Youth. Each audience should have its own group with 3-4 questions.
  - An array of 3-5 interactive games based on the sermon's content. Include a mix of game types like 'Quiz', 'Word Search', 'Fill in the Blank', 'Matching', 'Word Guess', 'Wordle', 'Jeopardy', or 'Verse Scramble'. For Quizzes, provide 3-4 questions with 4 multiple-choice options each. For Matching games, provide 4-6 pairs of terms and definitions. For Fill in the Blank, provide four key sentences with an important word missing. For Word Guess, provide four key words from the sermon, each with a hint for it. For Wordle, provide one significant 5-letter word from the sermon. For Jeopardy, create 2-3 categories, each with 3 questions having point values of 100, 200, and 300. For Verse Scramble, select one key Bible verse from the sermon and provide its text and reference.
  `,
});


const generateWeeklyContentFlow = ai.defineFlow(
  {
    name: 'generateWeeklyContentFlow',
    inputSchema: GenerateWeeklyContentInputSchema,
    outputSchema: GenerateWeeklyContentOutputSchema,
  },
  async input => {
    try {
        console.log('[[DEBUG]] Starting generateWeeklyContentFlow');
        
        const { output } = await generateWeeklyContentPrompt(input);

        if (!output) {
            throw new Error('AI content generation failed: No output was returned from the model.');
        }

        console.log('[[DEBUG]] Finishing generateWeeklyContentFlow.');
        return output;
    } catch (error) {
        console.error('[[ERROR]] in generateWeeklyContentFlow:', error);
        // Re-throwing the error to be handled by the calling Server Action and the client.
        // This ensures the client is aware of the failure.
        throw new Error('Failed to generate weekly content due to a server-side AI error.');
    }
  }
);
