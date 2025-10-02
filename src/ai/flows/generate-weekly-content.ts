
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

const SermonEscapeRoomPuzzleSchema = z.object({
    type: z.enum(['Multiple Choice', 'Text Answer', 'Verse Code']),
    prompt: z.string().describe('The question or puzzle to solve.'),
    options: z.array(z.string()).optional().describe('Options for Multiple Choice questions.'),
    answer: z.string().describe('The correct answer or solution to the puzzle.'),
    feedback: z.string().describe('A piece of the story or a clue revealed upon solving the puzzle.'),
});


const GameSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.enum(['Quiz']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.array(GameQuestionSchema),
    }),
    z.object({
        type: z.enum(['Word Search']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.object({ words: z.array(z.string()) }),
    }),
    z.object({
        type: z.enum(['Fill in the Blank']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.array(FillInTheBlankItemSchema),
    }),
    z.object({
        type: z.enum(['Matching']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.array(MatchingGameItemSchema),
    }),
    z.object({
        type: z.enum(['Word Guess']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.array(WordGuessItemSchema),
    }),
    z.object({
        type: z.enum(['Wordle']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: WordleItemSchema,
    }),
    z.object({
        type: z.enum(['Jeopardy']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.array(JeopardyCategorySchema),
    }),
    z.object({
        type: z.enum(['Verse Scramble']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: VerseScrambleItemSchema,
    }),
    z.object({
        type: z.enum(['True/False']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.array(TrueFalseQuestionSchema),
    }),
    z.object({
        type: z.enum(['Word Cloud Hunt']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.object({ words: z.array(z.string()) }),
    }),
    z.object({
        type: z.enum(['Two Truths and a Lie']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.array(TwoTruthsAndALieItemSchema),
    }),
    z.object({
        type: z.enum(['Sermon Escape Room']),
        title: z.string(),
        audience: z.enum(['Youth', 'Adults']),
        data: z.array(SermonEscapeRoomPuzzleSchema),
    }),
]);

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
  games: z.array(GameSchema).describe("An array of 12 interactive games based on the sermon. Generate a wide variety of game types. One game MUST be a 'Jeopardy' game. One game MUST be a 'Verse Scramble' game. For Quizzes, provide 3-4 questions with 4 multiple-choice options each. For Matching games, provide 4-6 pairs of terms and definitions. For Fill in the Blank, provide four key sentences with an important word missing. For Word Guess, provide four key words from the sermon, each with a hint. For the required Jeopardy game, create 2-3 categories with 3 questions each, with point values of 200, 400, and 600."),
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
  output: {schema: GenerateWeeklyContentOutputSchema},
  prompt: `You are an AI assistant designed to generate weekly content for a church, based on a given sermon. You MUST return a single, valid JSON object that conforms to the schema.

  {{#if targetLanguage}}
  IMPORTANT: All generated text content MUST be in {{targetLanguage}}.
  {{else}}
  IMPORTANT: All generated text content MUST be in English.
  {{/if}}

  Sermon Transcript: {{{sermonTranscript}}}

  Your task is to generate the full JSON object based on the provided schema definitions. Ensure all fields are populated with high-quality, relevant content derived from the sermon transcript.

  - For the 'games' array: Generate exactly 12 games. This is an important requirement.
    - One game MUST be 'Jeopardy'.
    - One game MUST be 'Verse Scramble'.
    - Fill the remaining 10 slots with a wide variety of the other available game types, avoiding repetition where possible.
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
        console.log('[[SERVER - DEBUG]] Starting generateWeeklyContentFlow');
        
        const response = await generateWeeklyContentPrompt(input);
        const output = response.output;

        if (!output) {
            throw new Error('AI content generation failed: No output was returned from the model.');
        }

        // Data validation and transformation
        output.games.forEach(game => {
            if (game.type === 'Jeopardy') {
                // Ensure Jeopardy data is an array
                if (game.data && !Array.isArray(game.data)) {
                    console.warn('[[SERVER - WARN]] Jeopardy data was not an array, wrapping it.');
                    game.data = [game.data as any];
                }
            }
        });

        console.log('[[SERVER - DEBUG]] Finishing generateWeeklyContentFlow.');
        return output;
    } catch (error: any) {
        console.error('[[SERVER - ERROR]] in generateWeeklyContentFlow:', error);
        
        let finalMessage = 'AI content generation failed. ';

        if (error instanceof z.ZodError) {
             finalMessage += 'The AI returned data in an unexpected format. Please try again. Details: ' + error.errors.map(e => `${e.path.join('.')} - ${e.message}`).join(', ');
        } else if (error instanceof SyntaxError) {
             finalMessage += `The AI returned malformed JSON. Details: ${error.message}`;
        } else if (error.message) {
             finalMessage += error.message;
        } else {
            finalMessage += 'An unknown error occurred during content generation.';
        }

        throw new Error(finalMessage);
    }
  }
);
