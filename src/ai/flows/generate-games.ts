
'use server';

/**
 * @fileOverview This flow generates interactive games from a sermon transcript.
 *
 * - generateGames - A function that handles the game generation process.
 * - GenerateGamesInput - The input type for the function.
 * - GenerateGamesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateWeeklyContentInputSchema, GamesSchema } from '@/lib/types';


export const GenerateGamesInputSchema = GenerateWeeklyContentInputSchema.pick({ sermonTranscript: true, targetLanguage: true });
export type GenerateGamesInput = z.infer<typeof GenerateGamesInputSchema>;
export type GenerateGamesOutput = z.infer<typeof GamesSchema>;

export async function generateGames(input: GenerateGamesInput): Promise<GenerateGamesOutput> {
  return generateGamesFlow(input);
}

const languageInstruction = (targetLanguage?: string) => {
    return targetLanguage
      ? `IMPORTANT: All generated text content MUST be in ${targetLanguage}.`
      : 'IMPORTANT: All generated text content MUST be in English.';
};

const generateGamesFlow = ai.defineFlow(
  {
    name: 'generateGamesFlow',
    inputSchema: GenerateGamesInputSchema,
    outputSchema: GamesSchema,
  },
  async (input) => {
    const langInstructionText = languageInstruction(input.targetLanguage);

    const gamesPrompt = ai.definePrompt({
        name: 'gamesPrompt',
        input: { schema: GenerateGamesInputSchema },
        output: { schema: GamesSchema },
        prompt: `${langInstructionText}\n\nSermon Transcript: {{{sermonTranscript}}}\n\nGenerate exactly 12 interactive games. One game MUST be 'Jeopardy'. One game MUST be 'Verse Scramble'. One game MUST be a 'True/False' game with 20 questions. Fill the remaining 9 slots with a wide variety of the other available game types.`,
    });
    
    const gamesResponse = await gamesPrompt(input);
    if (!gamesResponse.output) throw new Error('Failed to generate games.');
    return gamesResponse.output;
  }
);
