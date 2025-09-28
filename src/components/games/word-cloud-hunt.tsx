

'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { RefreshCcw } from 'lucide-react';

interface WordCloudHuntProps {
  words: string[];
  onScoreChange: (score: number) => void;
  initialScore: number;
}

interface CloudWord {
  text: string;
  size: number; // e.g., 1 to 10
  rotation: number; // 0 or 90
  isKeyWord: boolean;
  isFound: boolean;
  x: number;
  y: number;
}

const fillerWords = [
    'faith', 'hope', 'love', 'grace', 'peace', 'joy', 'pray', 'God', 'Jesus', 
    'spirit', 'holy', 'bible', 'truth', 'life', 'light', 'glory', 'amen', 'soul',
    'mercy', 'cross', 'save', 'king', 'lord', 'word', 'give', 'seek', 'find'
];

export function WordCloudHunt({ words, onScoreChange, initialScore }: WordCloudHuntProps) {
    const [cloudWords, setCloudWords] = useState<CloudWord[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);

    const keyWords = useMemo(() => words.map(w => w.toUpperCase()), [words]);
    const POINTS_PER_WORD = Math.floor(100 / (keyWords.length || 1));

    const generateCloud = () => {
        const allWords = [...new Set([...words.map(w => w.toUpperCase()), ...fillerWords.map(w => w.toUpperCase())])];
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        
        const newCloudWords: CloudWord[] = shuffled.slice(0, 50).map(word => ({
            text: word,
            size: Math.floor(Math.random() * 6) + 3, // font size scale
            rotation: Math.random() > 0.7 ? 90 : 0,
            isKeyWord: keyWords.includes(word),
            isFound: false,
            // These are placeholder positions, a real library would calculate this
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
        }));

        setCloudWords(newCloudWords);
        setFoundWords([]);
        onScoreChange(0);
    };

    useEffect(() => {
        generateCloud();
    }, [words]);

    const handleWordClick = (word: CloudWord) => {
        if (word.isKeyWord && !word.isFound) {
            const newFoundWords = [...foundWords, word.text];
            setFoundWords(newFoundWords);
            
            setCloudWords(prev =>
                prev.map(w =>
                    w.text === word.text ? { ...w, isFound: true } : w
                )
            );
            
            const newScore = newFoundWords.length * POINTS_PER_WORD;
            onScoreChange(newScore);
        }
    };
    
    const handleRestart = () => {
        generateCloud();
    }

    const allFound = foundWords.length === keyWords.length;

    return (
        <div className="w-full flex flex-col md:flex-row gap-8 items-start">
            <div className="relative w-full h-96 bg-muted/30 rounded-lg overflow-hidden select-none">
                {cloudWords.map(word => (
                    <span
                        key={word.text}
                        className={cn(
                            'absolute cursor-pointer transition-all duration-300',
                            word.isFound ? 'text-primary scale-110 font-bold' : 'hover:text-primary hover:scale-110',
                            !word.isKeyWord && 'text-muted-foreground/60',
                        )}
                        style={{
                            fontSize: `${word.size * 0.25}rem`,
                            left: `${word.x}%`,
                            top: `${word.y}%`,
                            transform: `translate(-50%, -50%) rotate(${word.rotation}deg)`,
                            lineHeight: 1,
                        }}
                        onClick={() => handleWordClick(word)}
                    >
                        {word.text}
                    </span>
                ))}
            </div>
            <div className="w-full md:w-64 flex-shrink-0">
                <h3 className="font-bold text-xl mb-4">Words to Find ({foundWords.length}/{keyWords.length})</h3>
                {allFound ? (
                     <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                        <p className="font-bold text-green-700 dark:text-green-300">Congratulations!</p>
                        <p className="text-sm text-green-600 dark:text-green-400">You found all the words.</p>
                    </div>
                ) : (
                    <ul className="space-y-1 text-sm list-disc pl-5">
                        {keyWords.map(word => (
                            <li
                                key={word}
                                className={cn(
                                    'transition-colors',
                                    foundWords.includes(word) ? 'line-through text-muted-foreground' : 'text-foreground'
                                )}
                            >
                                {word}
                            </li>
                        ))}
                    </ul>
                )}
                 <Button onClick={handleRestart} className="w-full mt-4" variant="outline">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    {allFound ? 'Play Again' : 'Reset'}
                </Button>
            </div>
        </div>
    );
}
