
'use client';

import { useState, useEffect } from 'react';
import { VerseScrambleItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { RefreshCcw } from 'lucide-react';

interface VerseScrambleGameProps {
  data: VerseScrambleItem;
}

const shuffleArray = (array: string[]) => {
    // Create a copy to avoid modifying the original array
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

export function VerseScrambleGame({ data }: VerseScrambleGameProps) {
  const originalWords = data.verse.split(' ');
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [constructedVerse, setConstructedVerse] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    // Shuffle only once when the component mounts or data changes
    setScrambledWords(shuffleArray(originalWords));
    setConstructedVerse([]);
    setIsCorrect(null);
  }, [data.verse]);


  const handleWordClick = (word: string, index: number) => {
    if (isCorrect) return;
    setConstructedVerse(prev => [...prev, word]);
    
    const newScrambled = [...scrambledWords];
    newScrambled.splice(index, 1);
    setScrambledWords(newScrambled);
  };
  
  const handleUndo = () => {
    if (constructedVerse.length === 0 || isCorrect) return;
    
    const lastWord = constructedVerse[constructedVerse.length - 1];
    setConstructedVerse(prev => prev.slice(0, -1));
    setScrambledWords(prev => [...prev, lastWord]); // Add it back to the scrambled list
  }
  
  const handleReset = () => {
    setScrambledWords(shuffleArray(originalWords));
    setConstructedVerse([]);
    setIsCorrect(null);
  }

  useEffect(() => {
    if (constructedVerse.length > 0 && constructedVerse.length === originalWords.length) {
      if (constructedVerse.join(' ') === originalWords.join(' ')) {
        setIsCorrect(true);
      } else {
        setIsCorrect(false);
      }
    } else {
      setIsCorrect(null);
    }
  }, [constructedVerse, originalWords]);
  

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Verse Scramble</CardTitle>
        <CardDescription>Unscramble the words to form the correct Bible verse. Tap the words in the right order.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Constructed Verse Area */}
        <div className="p-4 min-h-[100px] bg-muted rounded-lg border border-dashed flex flex-wrap gap-2 items-center justify-center">
          {constructedVerse.map((word, index) => (
            <span key={index} className="text-lg font-medium">{word}</span>
          ))}
           {isCorrect === false && <p className="text-destructive font-semibold">Not quite, try again.</p>}
           {isCorrect === true && <p className="text-green-600 font-semibold">Correct! Well done.</p>}
        </div>

        {/* Scrambled Words Area */}
        <div className="p-4 min-h-[100px] rounded-lg flex flex-wrap gap-2 items-center justify-center">
            {isCorrect !== true ? (
                scrambledWords.map((word, index) => (
                    <Button key={index} variant="outline" onClick={() => handleWordClick(word, index)}>
                        {word}
                    </Button>
                ))
            ) : (
                <div className="text-center">
                    <p className="text-2xl font-bold">"{data.verse}"</p>
                    <p className="text-lg text-muted-foreground mt-2">- {data.reference}</p>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleReset} variant="ghost">
          <RefreshCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button onClick={handleUndo} variant="outline" disabled={constructedVerse.length === 0 || isCorrect === true}>
            Undo
        </Button>
      </CardFooter>
    </Card>
  );
}
