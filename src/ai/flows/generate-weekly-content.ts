
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
    question: z.string().describe('The clue or prompt provided to the contestant.'),
    answer: z.string().describe('The correct response, which MUST be in the form of a question (e.g., "What is...").'),
    points: z.number().describe('The point value of the question (e.g., 200, 400, 600).'),
});

const JeopardyCategorySchema = z.object({
    title: z.string().describe('The title of the category.'),
    questions: z.array(JeopardyQuestionSchema).describe('An array of 3 questions for this category, in increasing order of difficulty/points.'),
});

const VerseScrambleItemSchema = z.object({
    verse: z.string().describe('The full text of a key bible verse from the sermon.'),
    reference: z.string().describe('The bible reference for the verse (e.g., "John 3:16").'),
});

const TrueFalseQuestionSchema = z.object({
    statement: z.string().describe('A statement that is either true or false based on the sermon.'),
    isTrue: z.boolean().describe('Whether the statement is true or false.'),
});

const TwoTruthsAndALieItemSchema = z.object({
    truth1: z.string().describe('The first true statement based on the sermon.'),
    truth2: z.string().describe('The second true statement based on the sermon.'),
    lie: z.string().describe('The false statement that is subtly incorrect.'),
});

const GameSchema = z.object({
    type: z.enum(['Quiz', 'Word Search', 'Fill in the Blank', 'Matching', 'Word Guess', 'Wordle', 'Jeopardy', 'Verse Scramble', 'True/False', 'Word Cloud Hunt', 'Two Truths and a Lie']),
    title: z.string(),
    audience: z.enum(['Youth', 'Adults']),
    data: z.any().describe("The data for the game, which varies by type. See prompt for specific structures."),
});

const BibleReadingPlanItemSchema = z.object({
    theme: z.string().describe('The theme connecting the passages.'),
    passages: z.array(z.object({
        reference: z.string().describe('The Bible reference (e.g., "Genesis 1:1-5").'),
        explanation: z.string().describe('A brief explanation of how this passage connects to the sermon theme.')
    })).describe('An array of 2-3 related Bible passages.')
});

const SpiritualPracticeSchema = z.object({
    title: z.string().describe('The name of the spiritual practice challenge.'),
    description: z.string().describe('A short, practical description of the challenge and how to do it.'),
});

const OutwardFocusItemSchema = z.object({
    title: z.string().describe('The title for this outward focus item.'),
    description: z.string().describe('A short, 1-2 sentence description of the item.'),
    details: z.string().describe('A longer paragraph providing more details, context, or specific steps for the item.'),
});


const GenerateWeeklyContentOutputSchema = z.object({
  summaryShort: z.string().describe('A short summary of the sermon.'),
  summaryLong: z.string().describe('A longer devotional guide summary of the sermon.'),
  oneLiners: z.object({
    tuesday: z.string().describe('A concise, impactful one-liner quote or thought from the sermon for Tuesday.'),
    thursday: z.string().describe('A concise, impactful one-liner quote or thought from the sermon for Thursday.'),
  }).describe('Two one-liner reminders from the sermon for mid-week engagement.'),
  devotionals: z.object({
      monday: z.string().describe('A devotional for Monday, approximately 200 words.'),
      tuesday: z.string().describe('A devotional for Tuesday, approximately 200 words.'),
      wednesday: z.string().describe('A devotional for Wednesday, approximately 200 words.'),
      thursday: z.string().describe('A devotional for Thursday, approximately 200 words.'),
      friday: z.string().describe('A devotional for Friday, approximately 200 words.'),
  }).describe('An object containing five daily devotionals for Mon-Fri.'),
  reflectionQuestions: z.array(ReflectionQuestionGroupSchema).describe('An array of reflection question groups for different audiences.'),
  games: z.array(GameSchema).max(12).describe("An array of interactive games based on the sermon. If the sermon material is not substantial enough to create 12 high-quality, distinct games, generate fewer. One game MUST be a 'Jeopardy' game. One game MUST be a 'Verse Scramble' game. One game MUST be a 'True/False' game with exactly 20 questions. One game MUST be a 'Word Cloud Hunt' with 15-20 key words. Include a mix of other types like Quiz, Word Search, Fill in the Blank, Matching, Word Guess, Wordle, or 'Two Truths and a Lie'. For Quizzes, provide 3-4 questions with 4 multiple-choice options each. For Matching games, provide 4-6 pairs of terms and definitions. For Fill in the Blank, provide four key sentences with an important word missing. For Word Guess, provide four key words from the sermon, each with a hint. For Wordle, provide a single, relevant 5-letter word from the sermon. For the required Jeopardy game, create 2-3 categories with 3 questions each, with point values of 200, 400, and 600. For 'Two Truths and a Lie', generate 3-5 rounds, where each round has two true statements and one subtle lie based on the sermon."),
  bibleReadingPlan: z.array(BibleReadingPlanItemSchema).describe('An array of 2-3 thematic Bible reading connections based on the sermon, including cross-references and Old/New Testament echoes.'),
  spiritualPractices: z.array(SpiritualPracticeSchema).describe('An array of 2-3 small, practical spiritual practice challenges related to the sermon theme (e.g., fasting one meal, practicing hospitality, journaling gratitude).'),
  outwardFocus: z.object({
      missionFocus: OutwardFocusItemSchema.describe("Spotlight a missionary or ministry the church supports, tying it to the sermon's theme if possible."),
      serviceChallenge: OutwardFocusItemSchema.describe("Provide one tangible way for members to bless someone this week, inspired by the sermon."),
      culturalEngagement: OutwardFocusItemSchema.describe("Offer a reflection question or resource on applying the sermon in today's world (workplace, school, media, etc.)."),
  }).describe('A section dedicated to outward-focused application of the sermon.'),
});
export type GenerateWeeklyContentOutput = z.infer<typeof GenerateWeeklyContentOutputSchema>;


export async function generateWeeklyContent(input: GenerateWeeklyContentInput): Promise<GenerateWeeklyContentOutput> {
  return generateWeeklyContentFlow(input);
}

const generateWeeklyContentPrompt = ai.definePrompt({
  name: 'generateWeeklyContentPrompt',
  input: {schema: GenerateWeeklyContentInputSchema},
  output: {format: 'text'},
  prompt: `You are an AI assistant designed to generate weekly content for a church, based on a given sermon. You MUST return a single, valid JSON object that conforms to the schema described below. Do not add any extra text, formatting, or code fences around the JSON.

  {{#if targetLanguage}}
  IMPORTANT: All generated text content MUST be in {{targetLanguage}}.
  {{else}}
  IMPORTANT: All generated text content MUST be in English.
  {{/if}}

  Sermon Transcript: {{{sermonTranscript}}}

  Generate a valid JSON object with the following fields:

  - summaryShort: A short summary of the sermon.
  - summaryLong: A longer devotional guide summary of the sermon.
  - oneLiners: An object with two fields, 'tuesday' and 'thursday', containing concise, impactful one-liner quotes from the sermon.
  - devotionals: An object with five fields (monday, tuesday, wednesday, thursday, friday), each containing a devotional of around 200 words.
  - reflectionQuestions: An array of question group objects. Each object in the array MUST have an 'audience' field (one of 'Individuals', 'Families', 'Small Groups', 'Youth') and a 'questions' field (an array of 3-4 strings).
  - games: An array of up to 12 interactive game objects. Each game object MUST have a 'type', 'title', 'audience', and 'data' field. If the sermon material is not substantial enough to create 12 high-quality, distinct games, generate fewer.
    - One game MUST be 'Jeopardy'.
    - One game MUST be 'Verse Scramble'.
    - One game MUST be 'True/False' with exactly 20 questions.
    - One game MUST be 'Word Cloud Hunt'.
    - Fill the remaining slots with a mix of 'Quiz', 'Word Search', 'Fill in the Blank', 'Matching', 'Word Guess', 'Wordle', or 'Two Truths and a Lie'.
  - bibleReadingPlan: An array of 2-3 thematic reading connections. Each theme should have 2-3 relevant Bible passages with explanations.
  - spiritualPractices: An array of 2-3 small, practical spiritual practice challenges related to the sermon.
  - outwardFocus: An object with three fields: 'missionFocus', 'serviceChallenge', and 'culturalEngagement'. Each should be an object with 'title', 'description', and 'details' fields.

  Game Data Structures (for the 'data' field within each game object):
  - For 'Quiz': An array of objects, each with 'question' (string), 'options' (array of 4 strings), and 'correctAnswer' (string). Generate 3-4 questions.
  - For 'Word Search': An object like { "words": ["ARRAY", "OF", "STRINGS"] }.
  - For 'Fill in the Blank': An array of 4 objects, each with 'sentence' (string with '___') and 'blank' (string).
  - For 'Matching': An array of 4-6 objects, each with 'id' (number), 'term' (string), and 'definition' (string).
  - For 'Word Guess': An array of 4 objects, each with 'word' (string) and 'hint' (string).
  - For 'Wordle': An object with a single 5-letter 'word' (string).
  - For 'Jeopardy': An array of 2-3 category objects. Each category has 'title' and 'questions' (an array of 3 objects with 'question', 'answer' [must be a question], and 'points').
  - For 'Verse Scramble': An object with 'verse' (string) and 'reference' (string).
  - For 'True/False': An array of exactly 20 objects, each with 'statement' (string) and 'isTrue' (boolean).
  - For 'Word Cloud Hunt': An object with a 'words' field containing an array of 15-20 single-word keywords.
  - For 'Two Truths and a Lie': An array of 3-5 objects, each with 'truth1', 'truth2', and 'lie' (all strings).
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
        
        const response = await generateWeeklyContentPrompt(input);
        
        const jsonText = response.text
          .replace(/^```json/, '')
          .replace(/```$/, '')
          .trim();

        const output = JSON.parse(jsonText);

        if (!output) {
            throw new Error('AI content generation failed: No output was returned from the model.');
        }

        // Validate the parsed output against the Zod schema
        const validatedOutput = GenerateWeeklyContentOutputSchema.parse(output);

        console.log('[[DEBUG]] Finishing generateWeeklyContentFlow.');
        return validatedOutput;
    } catch (error) {
        console.error('[[ERROR]] in generateWeeklyContentFlow:', error);
        // Re-throwing the error to be handled by the calling Server Action and the client.
        // This ensures the client is aware of the failure.
        throw error;
    }
  }
);
