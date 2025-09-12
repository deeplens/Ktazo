
'use client';

import { useState, useEffect } from 'react';
import { WordGuessItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface WordGuessGameProps {
  data: WordGuessItem[];
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_INCORRECT_GUESSES = 6;

const SingleWordGuess = ({
  item,
  onComplete,
}: {
  item: WordGuessItem;
  onComplete: (isCorrect: boolean) => void;
}) => {
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const word = item.word.toUpperCase();
  const hint = item.hint;

  useEffect(() => {
    if (gameState !== 'playing') return;

    const uniqueWordLetters = [...new Set(word.split(''))];
    const correctGuessedLetters = uniqueWordLetters.filter(letter => guessedLetters.includes(letter));

    if (correctGuessedLetters.length === uniqueWordLetters.length) {
      setGameState('won');
      setTimeout(() => onComplete(true), 1500);
    } else if (incorrectGuesses.length >= MAX_INCORRECT_GUESSES) {
      setGameState('lost');
      setTimeout(() => onComplete(false), 1500);
    }
  }, [guessedLetters, incorrectGuesses.length, word, onComplete, gameState]);

  const handleGuess = (letter: string) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter)) {
      return;
    }

    setGuessedLetters(prev => [...prev, letter]);

    if (!word.includes(letter)) {
      setIncorrectGuesses(prev => [...prev, letter]);
    }
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
      <>
        <CardContent className="flex flex-col md:flex-row items-center justify-around gap-8 min-h-[300px]">
            <HangmanFigure />
            <div className="space-y-4 text-center">
                <p className='text-muted-foreground italic'>Hint: {hint}</p>
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
        <CardFooter>
             {gameState !== 'playing' && (
                <Alert variant={gameState === 'won' ? 'default' : 'destructive'} className={cn("w-full", gameState === 'won' && "border-green-500")}>
                    {gameState === 'won' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertTitle>{gameState === 'won' ? 'You Won!' : 'Game Over'}</AlertTitle>
                    <AlertDescription>
                        {gameState === 'won' ? 'Congratulations, you guessed the word!' : `The word was "${word}".`}
                    </AlertDescription>
                </Alert>
            )}
        </CardFooter>
      </>
  );
};


export function WordGuessGame({ data }: WordGuessGameProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [results, setResults] = useState<boolean[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    
    const totalWords = data.length;

    const handleWordComplete = (isCorrect: boolean) => {
        setResults(prev => [...prev, isCorrect]);
        if (currentWordIndex < totalWords - 1) {
            setCurrentWordIndex(prev => prev + 1);
        } else {
            setIsFinished(true);
        }
    };
    
    const handleRestart = () => {
        setCurrentWordIndex(0);
        setResults([]);
        setIsFinished(false);
    }
    
    const score = results.filter(r => r).length;

    if (isFinished) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Game Complete!</CardTitle>
                    <CardDescription>You've attempted all the words.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-center">Your Score: {score} / {totalWords}</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleRestart} className="w-full">Play Again</Button>
                </CardFooter>
            </Card>
        );
    }

    const currentItem = data[currentWordIndex];

    if (!currentItem) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Word Guess</CardTitle>
                <CardDescription>Guess the word based on the hint. You have 6 incorrect guesses per word.</CardDescription>
                 <div className="pt-2">
                    <Progress value={((currentWordIndex + 1) / totalWords) * 100} />
                    <p className="text-xs text-muted-foreground mt-1 text-right">Word {currentWordIndex + 1} of {totalWords}</p>
                </div>
            </CardHeader>
            <SingleWordGuess item={currentItem} onComplete={handleWordComplete} />
        </Card>
    )
}
