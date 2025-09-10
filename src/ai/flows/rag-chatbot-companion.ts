'use server';

/**
 * @fileOverview Implements a RAG-based chatbot companion flow.
 *
 * - ragChatbotCompanion - A function that handles the RAG chatbot interaction.
 * - RagChatbotCompanionInput - The input type for the ragChatbotCompanion function.
 * - RagChatbotCompanionOutput - The return type for the ragChatbotCompanion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RagChatbotCompanionInputSchema = z.object({
  query: z.string().describe('The user query for the chatbot.'),
  tenantId: z.string().describe('The ID of the tenant.'),
  userId: z.string().describe('The ID of the user.'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('Previous conversation history.'),
});

export type RagChatbotCompanionInput = z.infer<typeof RagChatbotCompanionInputSchema>;

const RagChatbotCompanionOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
  sources: z.array(z.string()).describe('The sources used to generate the response.'),
});

export type RagChatbotCompanionOutput = z.infer<typeof RagChatbotCompanionOutputSchema>;


const ensureTopicalCorrectnessTool = ai.defineTool({
  name: 'ensureTopicalCorrectness',
  description: 'This tool will check if the content of the query is relevant to the sermon corpus and the approved custom URLs. It helps maintain topical correctness.',
  inputSchema: z.object({
    query: z.string().describe('The user query.'),
    relevant: z.boolean().describe('Whether the user query is relevant to the current sermon corpus.'),
  }),
  outputSchema: z.boolean(),
}, async (input) => {
  // In a real implementation, this would involve checking the query against the
  // sermon corpus and approved URLs.  For this example, we'll just return true.
  console.log("ensureTopicalCorrectness tool was called with input: ", input);
  return input.relevant;  // Placeholder implementation
});

export async function ragChatbotCompanion(input: RagChatbotCompanionInput): Promise<RagChatbotCompanionOutput> {
  return ragChatbotCompanionFlow(input);
}

const ragChatbotCompanionPrompt = ai.definePrompt({
  name: 'ragChatbotCompanionPrompt',
  input: {
    schema: RagChatbotCompanionInputSchema,
  },
  output: {
    schema: RagChatbotCompanionOutputSchema,
  },
  tools: [ensureTopicalCorrectnessTool],
  prompt: `You are a helpful chatbot companion that answers questions based on the sermon corpus and approved custom URLs for tenant {{tenantId}}.  You must only use information from these sources.

      User query: {{{query}}}

      {% if conversationHistory %}
      Conversation History:
      {% each conversationHistory %}
        {{this.role}}: {{this.content}}
      {% endeach %}
      {% endif %}

      If the user asks a question that is not related to the sermon corpus or approved custom URLs, politely refuse to answer. Before answering, use the ensureTopicalCorrectness tool to ensure topical correctness. If it returns false, then refuse to answer.  Make it clear that you cannot answer questions outside of that scope.

      Output the response and the sources used. Do not mention the tool in your response.
      {
        response: string,
        sources: string[],
      }`,
});

const ragChatbotCompanionFlow = ai.defineFlow(
  {
    name: 'ragChatbotCompanionFlow',
    inputSchema: RagChatbotCompanionInputSchema,
    outputSchema: RagChatbotCompanionOutputSchema,
  },
  async input => {
    // In a real implementation, this would query the RAG system and retrieve
    // relevant documents.

    const {output} = await ragChatbotCompanionPrompt(input);
    return output!;
  }
);
