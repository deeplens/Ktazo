
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
  query: z.string().describe('The search query. Can be text or a channel ID.'),
  type: z.enum(['video', 'channel']).describe('The type of resource to search for.'),
  channelId: z.string().optional().describe('An optional YouTube channel ID to search within for videos.'),
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
    handle: z.string().optional(),
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
      return { videos: [], channels: [] };
    }

    try {
        if (type === 'video') {
            const searchParams: any = {
                key: apiKey,
                part: ['snippet'],
                q: query,
                type: 'video',
                maxResults: 20,
            };

            if (channelId) {
                searchParams.channelId = channelId;
                searchParams.order = 'date';
            }

            const response = await youtube.search.list(searchParams);
            const items = response.data.items || [];
            const videos = items
                .filter(item => item.id?.videoId)
                .map(item => ({
                    id: item.id!.videoId!,
                    title: item.snippet?.title || 'No Title',
                    channel: item.snippet?.channelTitle || 'Unknown Channel',
                    thumbnailUrl: item.snippet?.thumbnails?.high?.url || '',
                }));
            return { videos };

        } else { // channel search
             const isChannelIdQuery = query.startsWith('UC') && query.length === 24;
             
             let channelsResponse;
             if (isChannelIdQuery) {
                 channelsResponse = await youtube.channels.list({
                     key: apiKey,
                     part: ['snippet'],
                     id: [query],
                 });
             } else {
                 channelsResponse = await youtube.search.list({
                    key: apiKey,
                    part: ['snippet'],
                    q: query,
                    type: 'channel',
                    maxResults: 10,
                });
             }

            const items = channelsResponse.data.items || [];
            
            const channels = items
                .filter(item => item.id && (isChannelIdQuery ? item.id : item.id.channelId) && item.snippet)
                .map(item => {
                    const id = isChannelIdQuery ? item.id! : item.id!.channelId!;
                    return {
                        id: id,
                        name: item.snippet!.title || 'No Name',
                        handle: item.snippet!.customUrl, 
                        thumbnailUrl: item.snippet!.thumbnails?.high?.url || '',
                    }
                });

            return { channels };
        }

    } catch (error: any) {
        console.error('[[SERVER - ERROR]] YouTube API search failed:', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred with the YouTube API.';
        throw new Error(`Failed to search YouTube: ${errorMessage}`);
    }
  }
);
