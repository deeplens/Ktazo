
'use server';
/**
 * @fileOverview Searches YouTube for videos or channels.
 * 
 * - searchYouTube - A function that searches YouTube.
 * - YouTubeSearchInput - The input type for the function.
 * - YouTubeSearchOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';

const YouTubeSearchInputSchema = z.object({
  query: z.string().describe('The search query.'),
  type: z.enum(['video', 'channel']).describe('The type of resource to search for.'),
  channelId: z.string().optional().describe('An optional YouTube channel ID to search within.'),
});
export type YouTubeSearchInput = z.infer<typeof YouTubeSearchInputSchema>;

const YouTubeVideoResultSchema = z.object({
    id: z.string(),
    title: z.string(),
    channel: z.string(),
    thumbnailUrl: z.string(),
});
export type YouTubeVideoResult = z.infer<typeof YouTubeVideoResultSchema>;

const YouTubeChannelResultSchema = z.object({
    id: z.string(),
    name: z.string(),
    handle: z.string(),
    thumbnailUrl: z.string(),
});
export type YouTubeChannelResult = z.infer<typeof YouTubeChannelResultSchema>;


const YouTubeSearchOutputSchema = z.object({
    videos: z.array(YouTubeVideoResultSchema).optional(),
    channels: z.array(YouTubeChannelResultSchema).optional(),
});
export type YouTubeSearchOutput = z.infer<typeof YouTubeSearchOutputSchema>;

export async function searchYouTube(input: YouTubeSearchInput): Promise<YouTubeSearchOutput> {
  return searchYouTubeFlow(input);
}

const searchYouTubeFlow = ai.defineFlow(
  {
    name: 'searchYouTubeFlow',
    inputSchema: YouTubeSearchInputSchema,
    outputSchema: YouTubeSearchOutputSchema,
  },
  async ({ query, type, channelId }) => {
    console.log(`[[SERVER - DEBUG]] Starting YouTube search for ${type}(s) with query: "${query}"`);
    
    const youtube = google.youtube('v3');
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.warn('[[SERVER - WARN]] YouTube API key is missing. YouTube search functionality will be disabled. Please add a YOUTUBE_API_KEY to your .env file.');
      return { videos: [], channels: [] }; // Gracefully return empty results
    }

    try {
        const searchParams: any = {
            key: apiKey,
            part: ['snippet'],
            q: query,
            type: type,
            order: type === 'video' ? 'date' : 'relevance',
            maxResults: 10,
        };

        if (type === 'video' && channelId) {
            searchParams.channelId = channelId;
        }

      const response = await youtube.search.list(searchParams);
      
      const items = response.data.items || [];

      if (type === 'video') {
        const videos = items.map(item => ({
          id: item.id?.videoId || '',
          title: item.snippet?.title || 'No Title',
          channel: item.snippet?.channelTitle || 'Unknown Channel',
          thumbnailUrl: item.snippet?.thumbnails?.high?.url || '',
        }));
        return { videos };
      } else { // channel
        const channels = items.map(item => ({
            id: item.snippet?.channelId || '',
            name: item.snippet?.title || 'No Name',
            handle: item.snippet?.customUrl || '', // Note: customUrl might not be the @handle
            thumbnailUrl: item.snippet?.thumbnails?.high?.url || '',
        }));
        return { channels };
      }

    } catch (error: any) {
        console.error('[[SERVER - ERROR]] YouTube API search failed:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred with the YouTube API.';
        throw new Error(`Failed to search YouTube: ${errorMessage}`);
    }
  }
);
