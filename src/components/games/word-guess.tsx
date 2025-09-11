
'use client';

import { useState, useEffect } from 'react';
import { WordGuessItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordGuessGameProps {
  data: WordGuessItem;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_INCORRECT_GUESSES = 6;

export function WordGuessGame({ data }: WordGuessGameProps) {
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const word = data.word.toUpperCase();
  const hint = data.hint;

  useEffect(() => {
    const correctLetters = word.split('').filter(letter => guessedLetters.includes(letter));
    if (correctLetters.length === new Set(word.split('')).size) {
      setGameState('won');
    } else if (incorrectGuesses.length >= MAX_INCORRECT_GUESSES) {
      setGameState('lost');
    }
  }, [guessedLetters, incorrectGuesses.length, word]);

  const handleGuess = (letter: string) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter)) {
      return;
    }

    setGuessedLetters(prev => [...prev, letter]);

    if (!word.includes(letter)) {
      setIncorrectGuesses(prev => [...prev, letter]);
    }
  };

  const handleRestart = () => {
    setGuessedLetters([]);
    setIncorrectGuesses([]);
    setGameState('playing');
  };

  const HangmanFigure = () => {
    const errors = incorrectGuesses.length;
    return (
      <div className="relative w-24 h-32">
        {/* Gallow */}
        <div className="absolute bottom-0 left-1/2 w-16 h-1 bg-foreground rounded-full -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-28 bg-foreground rounded-full"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-foreground rounded-full"></div>
        <div className="absolute top-0 right-0 w-1 h-6 bg-foreground rounded-full"></div>
        
        {/* Figure */}
        {errors > 0 && <div className="absolute top-6 right-[-6px] w-4 h-4 border-2 border-foreground rounded-full"></div>}
        {errors > 1 && <div className="absolute top-10 right-0 w-1 h-8 bg-foreground"></div>}
        {errors > 2 && <div className="absolute top-11 right-[-8px] w-5 h-1 bg-foreground -rotate-45 origin-left"></div>}
        {errors > 3 && <div className="absolute top-11 right-[8px] w-5 h-1 bg-foreground rotate-45 origin-right"></div>}
        {errors > 4 && <div className="absolute top-[68px] right-[-8px] w-5 h-1 bg-foreground -rotate-45 origin-left"></div>}
        {errors > 5 && <div className="absolute top-[68px] right-[8px] w-5 h-1 bg-foreground rotate-45 origin-right"></div>}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Word Guess</CardTitle>
        <CardDescription>{hint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-around gap-8">
        <HangmanFigure />
        <div className="space-y-4 text-center">
            <div className="flex justify-center gap-2">
                {word.split('').map((letter, index) => (
                <div key={index} className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 border-b-2 text-2xl md:text-3xl font-bold">
                    {guessedLetters.includes(letter) || gameState !== 'playing' ? letter : ''}
                </div>
                ))}
            </div>
             <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                {ALPHABET.map(letter => (
                    <Button
                        key={letter}
                        variant="outline"
                        size="icon"
                        className={cn(
                            "h-8 w-8 text-xs md:h-9 md:w-9 md:text-sm",
                             guessedLetters.includes(letter) && incorrectGuesses.includes(letter) && "bg-destructive text-destructive-foreground",
                             guessedLetters.includes(letter) && word.includes(letter) && "bg-green-500 text-white"
                        )}
                        onClick={() => handleGuess(letter)}
                        disabled={gameState !== 'playing' || guessedLetters.includes(letter)}
                    >
                        {letter}
                    </Button>
                ))}
            </div>
        </div>
      </CardContent>
       <CardFooter className="flex flex-col items-center gap-4">
        {gameState !== 'playing' && (
           <Alert variant={gameState === 'won' ? 'default' : 'destructive'} className={cn("w-full", gameState === 'won' && "border-green-500")}>
              {gameState === 'won' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{gameState === 'won' ? 'You Won!' : 'Game Over'}</AlertTitle>
              <AlertDescription>
                {gameState === 'won' ? 'Congratulations, you guessed the word!' : `The word was "${word}".`}
              </AlertDescription>
          </Alert>
        )}
        <Button onClick={handleRestart}>
          {gameState === 'playing' ? 'Restart Game' : 'Play Again'}
        </Button>
      </CardFooter>
    </Card>
  );
}
