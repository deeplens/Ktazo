
'use client';

import { useState, useEffect } from 'react';
import { WordleItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordleGameProps {
  data: WordleItem;
}

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const KEYBOARD_LAYOUT = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  ['Enter', ...'ZXCVBNM'.split(''), 'Backspace'],
];

type TileStatus = 'correct' | 'present' | 'absent' | 'empty';

export function WordleGame({ data }: WordleGameProps) {
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(''));
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [keyStatuses, setKeyStatuses] = useState<Record<string, TileStatus>>({});

  useEffect(() => {
    setSolution(data.word.toUpperCase());
    // Reset game state when a new word is provided
    setGuesses(Array(MAX_GUESSES).fill(''));
    setCurrentGuessIndex(0);
    setCurrentGuess('');
    setGameState('playing');
    setKeyStatuses({});
  }, [data]);

  const handleKeyPress = (key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'Enter') {
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      }
      return;
    }

    if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
      return;
    }

    if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/i.test(key)) {
      setCurrentGuess(prev => prev + key.toUpperCase());
    }
  };

  const submitGuess = () => {
    const newGuesses = [...guesses];
    newGuesses[currentGuessIndex] = currentGuess;
    setGuesses(newGuesses);
    
    // Update keyboard statuses
    const newKeyStatuses = {...keyStatuses};
    currentGuess.split('').forEach((letter, index) => {
      if (solution[index] === letter) {
        newKeyStatuses[letter] = 'correct';
      } else if (solution.includes(letter)) {
        if (newKeyStatuses[letter] !== 'correct') {
            newKeyStatuses[letter] = 'present';
        }
      } else {
        newKeyStatuses[letter] = 'absent';
      }
    });
    setKeyStatuses(newKeyStatuses);

    if (currentGuess === solution) {
      setGameState('won');
    } else if (currentGuessIndex === MAX_GUESSES - 1) {
      setGameState('lost');
    } else {
      setCurrentGuessIndex(prev => prev + 1);
      setCurrentGuess('');
    }
  };
  
  const handleRestart = () => {
    setSolution(data.word.toUpperCase());
    setGuesses(Array(MAX_GUESSES).fill(''));
    setCurrentGuessIndex(0);
    setCurrentGuess('');
    setGameState('playing');
    setKeyStatuses({});
  }

  // Effect for physical keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleKeyPress('Enter');
      } else if (event.key === 'Backspace') {
        handleKeyPress('Backspace');
      } else if (event.key.length === 1 && event.key.match(/[a-z]/i)) {
        handleKeyPress(event.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameState]);


  const getTileStatus = (letter: string, index: number, guess: string): TileStatus => {
    if (!guess) return 'empty';
    if (solution[index] === letter) return 'correct';
    if (solution.includes(letter)) return 'present';
    return 'absent';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-rows-6 gap-1.5">
        {guesses.map((guess, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
              const letter = rowIndex === currentGuessIndex ? currentGuess[colIndex] : guess[colIndex];
              const isSubmitted = rowIndex < currentGuessIndex;
              const status = isSubmitted ? getTileStatus(letter, colIndex, guess) : 'empty';
              
              return (
                <div
                  key={colIndex}
                  className={cn(
                    'w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-2xl font-bold uppercase transition-all duration-300',
                    status === 'empty' && 'border-muted-foreground/50',
                    status === 'correct' && 'bg-green-500 text-white border-green-500',
                    status === 'present' && 'bg-yellow-500 text-white border-yellow-500',
                    status === 'absent' && 'bg-muted-foreground text-white border-muted-foreground',
                    letter && status === 'empty' && 'border-muted-foreground'
                  )}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameState !== 'playing' && (
        <Alert variant={gameState === 'won' ? 'default' : 'destructive'} className="w-full max-w-sm my-4">
          {gameState === 'won' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <AlertTitle>{gameState === 'won' ? 'You Won!' : 'Game Over'}</AlertTitle>
          <AlertDescription>
            {gameState === 'won' ? 'Congratulations!' : `The word was "${solution}".`}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 mt-4">
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map(key => {
                const status = keyStatuses[key];
                return (
                    <Button
                        key={key}
                        variant="outline"
                        className={cn("h-12 font-bold",
                            key.length > 1 ? "px-4" : "w-10 px-0",
                            status === 'correct' && 'bg-green-500 text-white',
                            status === 'present' && 'bg-yellow-500 text-white',
                            status === 'absent' && 'bg-muted-foreground text-white',
                        )}
                        onClick={() => handleKeyPress(key)}
                        disabled={gameState !== 'playing'}
                    >
                        {key}
                    </Button>
                )
            })}
          </div>
        ))}
      </div>
      
       {gameState !== 'playing' && (
        <Button onClick={handleRestart} className="mt-4">
            Play Again
        </Button>
      )}

    </div>
  );
}
