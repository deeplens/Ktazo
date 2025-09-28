

'use client';

import { useState, useEffect, useRef } from 'react';
import { TrueFalseQuestion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Check, ThumbsDown, ThumbsUp, Timer, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrueFalseGameProps {
  data: TrueFalseQuestion[];
  onScoreChange: (score: number) => void;
  initialScore: number;
}

export function TrueFalseGame({ data, onScoreChange, initialScore }: TrueFalseGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctScore, setCorrectScore] = useState(0);
  const [incorrectScore, setIncorrectScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const POINTS_PER_CORRECT = 5;

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('finished');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft]);

  const startGame = () => {
    setCurrentQuestionIndex(0);
    setCorrectScore(0);
    setIncorrectScore(0);
    setTimeLeft(60);
    setGameState('playing');
    onScoreChange(0);
  };

  const handleAnswer = (answer: boolean) => {
    if (gameState !== 'playing') return;

    if (data[currentQuestionIndex].isTrue === answer) {
        const newCorrectCount = correctScore + 1;
        setCorrectScore(newCorrectCount);
        onScoreChange(newCorrectCount * POINTS_PER_CORRECT);
    } else {
      setIncorrectScore(prev => prev + 1);
    }

    if (currentQuestionIndex < data.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setGameState('finished');
    }
  };

  const renderContent = () => {
    switch (gameState) {
      case 'ready':
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold">Timed True/False Challenge</h2>
            <p className="text-muted-foreground mt-2">You have 60 seconds to answer 20 questions. Each correct answer is worth {POINTS_PER_CORRECT} points.</p>
            <Button onClick={startGame} className="mt-6">Start Game</Button>
          </div>
        );
      case 'playing':
        const currentQuestion = data[currentQuestionIndex];
        return (
          <div className='flex flex-col h-full'>
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <p className="text-muted-foreground mb-4">Question {currentQuestionIndex + 1} of {data.length}</p>
                <h3 className="text-xl md:text-2xl font-semibold">{currentQuestion.statement}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleAnswer(true)} className="h-20 bg-green-600 hover:bg-green-700">
                    <ThumbsUp className="h-8 w-8 mr-2" /> True
                </Button>
                <Button onClick={() => handleAnswer(false)} className="h-20 bg-red-600 hover:bg-red-700">
                    <ThumbsDown className="h-8 w-8 mr-2" /> False
                </Button>
            </div>
          </div>
        );
      case 'finished':
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold">Game Over!</h2>
            <div className="my-4">
              <p className="text-4xl font-bold">Final Score: {correctScore * POINTS_PER_CORRECT}</p>
              <div className="flex justify-center gap-6 mt-2 text-muted-foreground">
                <p><span className="font-bold text-green-600">{correctScore}</span> Correct</p>
                <p><span className="font-bold text-red-600">{incorrectScore}</span> Incorrect</p>
              </div>
            </div>
            <p className="text-muted-foreground">You attempted {correctScore + incorrectScore} out of {data.length} questions.</p>
            <Button onClick={startGame} className="mt-6">Play Again</Button>
          </div>
        );
    }
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / data.length) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>True/False Challenge</CardTitle>
        <div className="flex justify-between items-center pt-2 text-lg font-semibold">
            <div className='flex items-center gap-2'>
                <Timer className="h-5 w-5" />
                <span>{timeLeft}s</span>
            </div>
            <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1 text-green-600'>
                    <Check className="h-5 w-5" />
                    <span>{correctScore}</span>
                </div>
                <div className='flex items-center gap-1 text-red-600'>
                    <X className="h-5 w-5" />
                    <span>{incorrectScore}</span>
                </div>
            </div>
        </div>
         <Progress value={progressPercentage} className="mt-2" />
      </CardHeader>
      <CardContent className="min-h-[300px] flex items-center justify-center">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
