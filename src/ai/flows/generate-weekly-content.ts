
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

const GameSchema = z.object({
    type: z.enum(['Quiz', 'Word Search', 'Fill in the Blank', 'Matching', 'Word Guess', 'Wordle', 'Jeopardy', 'Verse Scramble', 'True/False', 'Word Cloud Hunt', 'Reflection Roulette']),
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
        z.array(TrueFalseQuestionSchema).describe('An array of exactly 20 true or false statements.'),
        z.object({ words: z.array(z.string()).describe("A list of 15-20 single-word keywords from the sermon for the Word Cloud Hunt.") }),
        z.object({}).nullable().describe("For 'Reflection Roulette', this field is not used as the data is derived from other parts of the content.")
    ]),
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
  games: z.array(GameSchema).length(12).describe("An array of exactly 12 interactive games based on the sermon. One game MUST be a 'Jeopardy' game. One game MUST be a 'Verse Scramble' game. One game MUST be a 'True/False' game with exactly 20 questions. One game MUST be a 'Word Cloud Hunt' with 15-20 key words; its data field can be empty. One game MUST be a 'Reflection Roulette' game; its data field can be empty. Include a mix of other types like Quiz, Word Search, Fill in the Blank, Matching, Word Guess, or Wordle. For Quizzes, provide 3-4 questions with 4 multiple-choice options each. For Matching games, provide 4-6 pairs of terms and definitions. For Fill in the Blank, provide four key sentences with an important word missing. For Word Guess, provide four key words from the sermon, each with a hint. For Wordle, provide a single, relevant 5-letter word from the sermon. For the required Jeopardy game, create 2-3 categories with 3 questions each, with point values of 200, 400, and 600."),
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
  - Two one-liner reminders (oneLiners): one for Tuesday and one for Thursday. These should be concise, memorable, and impactful quotes or thoughts directly from the sermon.
  - An object containing five daily devotionals for Monday (monday), Tuesday (tuesday), Wednesday (wednesday), Thursday (thursday), and Friday (friday). Each devotional should be substantial, around 200 words long.
  - Reflection questions for four audiences: Individuals, Families, Small Groups, and Youth. Each audience should have its own group with 3-4 questions.
  - An array of exactly 12 interactive games based on the sermon's content. 
    - One of these games MUST be a 'Jeopardy' game. For the Jeopardy game, the 'answer' field MUST be in the form of a question (e.g., "What is..."). Create 2-3 categories, each with 3 questions having point values of 200, 400, and 600.
    - One of the games must be a 'Verse Scramble' game based on a key bible verse from the sermon. 
    - One of the games must be a 'True/False' game. It must contain exactly 20 questions.
    - One of the games must be a 'Word Cloud Hunt'. For this game, provide a list of 15-20 important, single-word keywords from the sermon in the 'words' field of the 'data' object.
    - One of the games must be a 'Reflection Roulette' game. For this game, the 'data' field should be null or an empty object.
    - Fill the remaining 7 slots with a mix of other game types like 'Quiz', 'Word Search', 'Fill in the Blank', 'Matching', 'Word Guess', or 'Wordle'. 
    - For Quizzes, provide 3-4 questions with 4 multiple-choice options each. 
    - For Matching games, provide 4-6 pairs of terms and definitions. 
    - For Fill in the Blank, provide four key sentences with an important word missing. 
    - For Word Guess, provide four key words from the sermon, each with a hint for it. 
    - For Wordle, provide one significant 5-letter word from the sermon.
  - A Bible Reading Plan (bibleReadingPlan): Generate 2-3 thematic reading connections based on the sermon. For each theme, provide 2-3 relevant Bible passages (cross-references, Old/New Testament echoes) and a brief explanation for each passage's connection to the sermon.
  - A list of 2-3 Spiritual Practice Challenges (spiritualPractices): Generate small, practical challenges that are thematically related to the sermon. Examples include fasting one meal, practicing hospitality by inviting someone over, or keeping a gratitude journal for a week.
  - An Outward Focus section (outwardFocus):
    - Mission Focus: Spotlight a real or exemplary missionary/ministry, connecting their work to the sermon's theme.
    - Service Challenge: Create a tangible, actionable service challenge for the week.
    - Cultural Engagement: Pose a thought-provoking question or resource about applying the sermon in modern culture (work, media, etc.).
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
        throw error;
    }
  }
);
