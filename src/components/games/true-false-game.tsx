
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
}

export function TrueFalseGame({ data }: TrueFalseGameProps) {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
  };

  const handleAnswer = (answer: boolean) => {
    if (gameState !== 'playing') return;

    if (data[currentQuestionIndex].isTrue === answer) {
      setScore(prev => prev + 1);
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
            <p className="text-muted-foreground mt-2">You have 60 seconds to answer 20 questions.</p>
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
            <p className="text-4xl font-bold my-4">Your Score: {score}</p>
            <p className="text-muted-foreground">You correctly answered {score} out of {data.length} questions.</p>
            <Button onClick={startGame} className="mt-6">Play Again</Button>
          </div>
        );
    }
  };
  
  const progressPercentage = (currentQuestionIndex / data.length) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>True/False Challenge</CardTitle>
        <div className="flex justify-between items-center pt-2">
            <div className='flex items-center gap-2 text-lg font-semibold'>
                <Timer className="h-5 w-5" />
                <span>{timeLeft}s</span>
            </div>
            <div className='flex items-center gap-2 text-lg font-semibold'>
                <span>Score: {score}</span>
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
