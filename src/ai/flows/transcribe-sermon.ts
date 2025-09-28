'use server';
/**
 * @fileOverview A sermon transcription AI agent.
 *
 * - transcribeSermon - A function that handles the sermon transcription process.
 * - TranscribeSermonInput - The input type for the transcribeSermon function.
 * - TranscribeSermonOutput - The return type for the transcribeSermon function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getUrlContent } from '../tools/get-url-content';
import { extractTranscriptFromYouTube } from '@/lib/youtube-utils';

const TranscribeSermonInputSchema = z.object({
  sermonUrl: z
    .string()
    .describe(
      "The URL of the sermon audio or video file. This can be a public URL (including YouTube videos) or a data URI with Base64 encoding. Expected data URI format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeSermonInput = z.infer<typeof TranscribeSermonInputSchema>;

const TranscribeSermonOutputSchema = z.object({
  transcript: z.string().describe('The transcript of the sermon.'),
});
export type TranscribeSermonOutput = z.infer<typeof TranscribeSermonOutputSchema>;

export async function transcribeSermon(
  input: TranscribeSermonInput
): Promise<TranscribeSermonOutput> {
  return transcribeSermonFlow(input);
}

/* --------------------------- MIME helpers --------------------------- */

function guessContentTypeFromUrl(u: string): string | null {
  const noQuery = u.split('?')[0].toLowerCase();
  if (noQuery.endsWith('.mp3')) return 'audio/mpeg';
  if (noQuery.endsWith('.wav')) return 'audio/wav';
  if (noQuery.endsWith('.m4a')) return 'audio/mp4'; // sometimes audio/x-m4a
  if (noQuery.endsWith('.aac')) return 'audio/aac';
  if (noQuery.endsWith('.flac')) return 'audio/flac';
  if (noQuery.endsWith('.ogg') || noQuery.endsWith('.oga')) return 'audio/ogg';
  if (noQuery.endsWith('.mp4')) return 'video/mp4';
  if (noQuery.endsWith('.mov')) return 'video/quicktime';
  return null;
}

function mimeFromExtension(ext: string): string | null {
  const e = ext.toLowerCase();
  const map: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',   // or audio/x-m4a
    aac: 'audio/aac',
    flac: 'audio/flac',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
  };
  return map[e] ?? null;
}

function filenameFromContentDisposition(cd: string | null): string | null {
  if (!cd) return null;
  // filename*=UTF-8''... OR filename="..."
  const star = cd.match(/filename\*\s*=\s*[^']*''([^;]+)/i);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1]);
    } catch {
      return star[1];
    }
  }
  const quoted = cd.match(/filename\s*=\s*"([^"]+)"/i);
  if (quoted?.[1]) return quoted[1];
  const bare = cd.match(/filename\s*=\s*([^;]+)/i);
  if (bare?.[1]) return bare[1].trim();
  return null;
}

async function detectContentTypeFromHeaders(resp: Response): Promise<string | null> {
  // Prefer explicit content-type header
  const headerCT = resp.headers.get('content-type');
  if (headerCT) {
    const ct = headerCT.split(';')[0].trim();
    if (ct) return ct;
  }
  // Otherwise try to infer from Content-Disposition filename
  const cd = resp.headers.get('content-disposition');
  const fname = filenameFromContentDisposition(cd);
  if (fname) {
    const m = fname.toLowerCase().match(/\.([a-z0-9]+)$/);
    if (m?.[1]) return mimeFromExtension(m[1]);
  }
  return null;
}

/**
 * Resolve contentType for a media URL.
 * Strategy:
 * 1) Guess from extension.
 * 2) HEAD request -> Content-Type or Content-Disposition filename.
 * 3) Fallback: GET first byte with Range header (servers that reject HEAD).
 */
async function resolveContentType(mediaUrl: string): Promise<string | null> {
  // 1) quick guess by extension
  const guessed = guessContentTypeFromUrl(mediaUrl);
  if (guessed) return guessed;

  // 2) HEAD (many servers allow this; follows redirects by default)
  try {
    const head = await fetch(mediaUrl, { method: 'HEAD' });
    if (head.ok) {
      const ct = await detectContentTypeFromHeaders(head);
      if (ct) return ct;
    }
  } catch (e) {
    console.warn('[[WARN]] HEAD request failed for content-type detection:', (e as Error).message);
  }

  // 3) Tiny GET with Range to avoid downloading the file
  try {
    const get0 = await fetch(mediaUrl, { method: 'GET', headers: { Range: 'bytes=0-0' } });
    if (get0.ok) {
      const ct = await detectContentTypeFromHeaders(get0);
      if (ct) return ct;
    }
  } catch (e) {
    console.warn('[[WARN]] Ranged GET request failed for content-type detection:', (e as Error).message);
  }

  return null;
}

/* ------------------------- Agents / Prompts ------------------------- */

const transcriptionAgent = ai.definePrompt({
  name: 'transcriptionAgent',
  input: { schema: z.object({ sermonUrl: z.string() }) },
  output: { format: 'text' },
  tools: [getUrlContent],
  prompt: `You are an expert transcription agent. Your goal is to get a transcript from the provided sermonUrl.
    
    1. First, use the getUrlContent tool to inspect the sermonUrl.
    2. If the tool returns a media file (like audio or video), you have the direct media URL.
    3. If the tool returns HTML content, you must find the audio download link within the HTML. Look for '<a>' tags with 'href' attributes pointing to '.mp3' files.
    4. Once you have the direct media URL (either from the start or by finding it in the HTML), your final output should be ONLY the following text:
    
    MEDIA_URL::[the direct media url]
    
    Do not add any other text, explanation, or formatting.
    `,
});

const transcribeFinalMediaPrompt = ai.definePrompt({
  name: 'transcribeFinalMediaPrompt',
  input: { schema: z.object({ mediaUri: z.string(), contentType: z.string() }) },
  output: { format: 'text' },
  // NOTE: for URIs, Gemini requires an explicit contentType
  prompt: 'Transcribe the following audio: {{media uri=mediaUri contentType=contentType}}',
});

/* ------------------------------ Flow ------------------------------- */

const transcribeSermonFlow = ai.defineFlow(
  {
    name: 'transcribeSermonFlow',
    inputSchema: TranscribeSermonInputSchema,
    outputSchema: TranscribeSermonOutputSchema,
  },
  async ({ sermonUrl }) => {
    try {
      console.log('[[DEBUG]] Starting transcribeSermonFlow for URL:', sermonUrl);

      // Data URI: MIME is embedded; extract and pass through
      if (sermonUrl.startsWith('data:')) {
        console.log('[[DEBUG]] Data URI detected. Transcribing directly.');
        const ct = sermonUrl.slice(5, sermonUrl.indexOf(';'));
        const { text } = await transcribeFinalMediaPrompt({
          mediaUri: sermonUrl,
          contentType: ct,
        });
        if (!text) {
          throw new Error(
            'AI transcription failed: No text was returned from the model for the data URI.'
          );
        }
        console.log('[[DEBUG]] Finishing transcribeSermonFlow for data URI.');
        return { transcript: text };
      }

      // YouTube: try transcript library first
      if (sermonUrl.includes('youtube.com/') || sermonUrl.includes('youtu.be/')) {
        console.log('[[DEBUG]] YouTube URL detected. Attempting to use youtube-transcript library.');
        try {
          const transcript = await extractTranscriptFromYouTube(sermonUrl);
          console.log('[[DEBUG]] Successfully extracted transcript from YouTube library.');
          return { transcript };
        } catch (youtubeError) {
          console.warn(
            '[[WARN]] YouTube transcript library failed. Error:',
            (youtubeError as Error).message
          );
          console.log('[[DEBUG]] Falling back to agent-based transcription for YouTube URL.');
        }
      }

      // Agent fallback to discover a direct media URL
      const agentResponse = await transcriptionAgent({ sermonUrl });
      const agentText = agentResponse.text.trim();

      let mediaUrl: string;
      if (agentText.startsWith('MEDIA_URL::')) {
        mediaUrl = agentText.substring('MEDIA_URL::'.length).trim();
      } else {
        console.warn(
          '[[WARN]] Transcription agent did not return a media URL. Falling back to original URL.'
        );
        mediaUrl = sermonUrl;
      }

      console.log('[[DEBUG]] Final media URL for transcription:', mediaUrl);

      // Resolve content type robustly (extension -> HEAD -> ranged GET)
      let contentType =
        mediaUrl.startsWith('data:')
          ? mediaUrl.slice(5, mediaUrl.indexOf(';'))
          : await resolveContentType(mediaUrl);

      if (!contentType) {
        throw new Error(
          'Cannot determine contentType for media URL. Provide a file with a known extension (.mp3, .wav, .m4a, etc.), ' +
            'a data: URI with MIME type, or a URL whose server returns Content-Type/Content-Disposition headers.'
        );
      }

      const { text } = await transcribeFinalMediaPrompt({
        mediaUri: mediaUrl,
        contentType,
      });

      if (!text) {
        throw new Error('AI transcription failed: No text was returned from the model.');
      }

      console.log('[[DEBUG]] Finishing transcribeSermonFlow.');
      return { transcript: text };
    } catch (error) {
      console.error('[[ERROR]] in transcribeSermonFlow:', error);
      throw error;
    }
  }
);
