
'use server';

/**
 * @fileOverview A Genkit tool for fetching the content of a URL.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const GetUrlContentInputSchema = z.object({
    url: z.string().describe('The URL to fetch.'),
});

const GetUrlContentOutputSchema = z.object({
    contentType: z.string().describe('The MIME type of the content (e.g., "text/html", "audio/mpeg").'),
    content: z.string().describe('The content of the URL. For text, it is the raw text. For media, it is a confirmation message.'),
    url: z.string().describe('The final URL after any redirects.'),
});

export const getUrlContent = ai.defineTool(
    {
        name: 'getUrlContent',
        description: 'Fetches the content and content type of a given URL. Useful for determining if a link points to a media file or a webpage.',
        inputSchema: GetUrlContentInputSchema,
        outputSchema: GetUrlContentOutputSchema,
    },
    async ({ url }) => {
        try {
            console.log(`[[DEBUG]] Fetching URL with getUrlContent tool: ${url}`);
            const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
            const contentType = response.headers.get('content-type') || 'unknown';
            const finalUrl = response.url;

            console.log(`[[DEBUG]] URL content type: ${contentType}, Final URL: ${finalUrl}`);

            if (contentType.startsWith('audio/') || contentType.startsWith('video/')) {
                return {
                    contentType,
                    content: `This is a direct media file of type ${contentType}.`,
                    url: finalUrl,
                };
            } else if (contentType.startsWith('text/html')) {
                // If it's HTML, fetch the full body for the agent to parse
                const bodyResponse = await fetch(finalUrl);
                const htmlContent = await bodyResponse.text();
                return {
                    contentType,
                    content: htmlContent,
                    url: finalUrl,
                };
            } else {
                 return {
                    contentType,
                    content: `Content type is ${contentType}. If this is not a media file, it may need to be treated as an HTML page.`,
                    url: finalUrl,
                };
            }
        } catch (error) {
            console.error('[[ERROR]] in getUrlContent tool:', error);
            throw new Error(`Failed to fetch URL content: ${(error as Error).message}`);
        }
    }
);
