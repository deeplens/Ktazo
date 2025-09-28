
'use client';

import { useState } from 'react';
import { TwoTruthsAndALieItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, ArrowRight, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface TwoTruthsAndALieGameProps {
  data: TwoTruthsAndALieItem[];
}

export function TwoTruthsAndALieGame({ data }: TwoTruthsAndALieGameProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedStatement, setSelectedStatement] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentRound = data[currentRoundIndex];
  const isFinished = currentRoundIndex >= data.length;

  const handleSelectStatement = (index: number) => {
    if (isAnswered) return;
    setSelectedStatement(index);
    setIsAnswered(true);
    if (index === currentRound.lieIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextRound = () => {
    setIsAnswered(false);
    setSelectedStatement(null);
    setCurrentRoundIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    setCurrentRoundIndex(0);
    setSelectedStatement(null);
    setIsAnswered(false);
    setScore(0);
  };

  if (isFinished) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Complete!</CardTitle>
          <CardDescription>You've completed all the rounds.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-center">Your Score: {score} / {data.length}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestart} className="w-full">
            <RefreshCcw className="mr-2" /> Play Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Two Truths and a Lie</CardTitle>
        <CardDescription>Read the three statements and identify the lie.</CardDescription>
        <div className="pt-2">
            <Progress value={((currentRoundIndex + 1) / data.length) * 100} />
            <p className="text-xs text-muted-foreground mt-1 text-right">Round {currentRoundIndex + 1} of {data.length}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentRound.statements.map((statement, index) => {
          const isLie = index === currentRound.lieIndex;
          const isSelected = index === selectedStatement;
          
          return (
            <Button
              key={index}
              variant={isAnswered && (isLie || isSelected) ? 'default' : 'outline'}
              className={cn(
                "w-full justify-start text-left h-auto py-3 leading-snug",
                isAnswered && isSelected && !isLie && "bg-destructive text-destructive-foreground",
                isAnswered && isLie && "bg-green-600 text-white"
              )}
              onClick={() => handleSelectStatement(index)}
              disabled={isAnswered}
            >
              <div className="flex items-start gap-3">
                {isAnswered && isSelected && !isLie && <XCircle className="mt-1 flex-shrink-0" />}
                {isAnswered && isLie && <CheckCircle className="mt-1 flex-shrink-0" />}
                <span>{statement}</span>
              </div>
            </Button>
          );
        })}
      </CardContent>
      {isAnswered && (
        <CardFooter className="flex justify-end">
          <Button onClick={handleNextRound}>
            {currentRoundIndex === data.length - 1 ? 'Finish Game' : 'Next Round'}
            <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
