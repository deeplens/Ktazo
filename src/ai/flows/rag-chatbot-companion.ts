
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
  prompt: `You are a helpful chatbot companion for a church called Ktazo Weekly. Your purpose is to answer questions based *only* on a provided corpus of sermons and a list of pastor-approved custom URLs.

You must strictly adhere to the following rules:
1.  Your knowledge is limited to the documents in the retrieval system (sermons and approved URLs).
2.  If a user asks a question that is outside the scope of the provided documents (e.g., about general knowledge, other religions, or any topic not covered in the sermons), you MUST politely refuse to answer.
3.  When you refuse, explain that you can only answer questions about the church's sermons and approved materials. Do not apologize.
4.  When you can answer a question, provide a helpful and direct response based on the source material.
5.  After answering, list the specific sources you used. In a real scenario you would be provided with source names, but for now you can use placeholder source names like "Sermon: The Good Shepherd" or "Beliefs Page".

User query: {{{query}}}

{{#if conversationHistory}}
Conversation History:
{{#each conversationHistory}}
  {{this.role}}: {{this.content}}
{{/each}}
{{/if}}

Based on the user's query and the conversation history, generate a response and a list of sources.
`,
});

const ragChatbotCompanionFlow = ai.defineFlow(
  {
    name: 'ragChatbotCompanionFlow',
    inputSchema: RagChatbotCompanionInputSchema,
    outputSchema: RagChatbotCompanionOutputSchema,
  },
  async input => {
    try {
        console.log('[[SERVER - DEBUG]] Starting ragChatbotCompanionFlow');
        
        // In a real implementation, this would query a RAG system and retrieve
        // relevant documents. For this demo, we will simulate it.
        const { output } = await ragChatbotCompanionPrompt(input);

        if (!output) {
            throw new Error('AI chat generation failed: No output was returned from the model.');
        }
        
        // Simulate adding sources if the AI didn't hallucinate them.
        if (output.sources.length === 0 && !output.response.includes("only answer questions about")) {
            output.sources = ["Sermon: The Good Shepherd", "Our Beliefs page"];
        }


        console.log('[[SERVER - DEBUG]] Finishing ragChatbotCompanionFlow.');
        return output;
    } catch (error) {
        console.error('[[SERVER - ERROR]] in ragChatbotCompanionFlow:', error);
        throw new Error('Failed to get a response from the chatbot due to a server-side AI error.');
    }
  }
);
