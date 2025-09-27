
'use server';

import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Extracts the full transcript text from a YouTube video URL.
 * @param youtubeUrl The full URL of the YouTube video.
 * @returns A promise that resolves to the full transcript as a single string.
 */
export async function extractTranscriptFromYouTube(youtubeUrl: string): Promise<string> {
    try {
        // The library can handle the full URL directly.
        const transcriptArray = await YoutubeTranscript.fetchTranscript(youtubeUrl);
        
        if (!transcriptArray || transcriptArray.length === 0) {
            throw new Error("No transcript found for this YouTube video. It might be disabled or not available.");
        }

        const fullTranscriptText = transcriptArray
            .map(item => item.text)
            .join(' ');

        return fullTranscriptText;

    } catch (error) {
        console.error("Error fetching or processing YouTube transcript:", error);
        
        if (error instanceof Error && error.message.includes('subtitles are disabled')) {
            throw new Error("Could not retrieve transcript because subtitles are disabled for this video.");
        }
        
        throw new Error("An unexpected error occurred while fetching the YouTube transcript.");
    }
}
