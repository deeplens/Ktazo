
'use client';

import { useState, useMemo } from 'react';
import { TwoTruthsAndALieItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface TwoTruthsAndALieGameProps {
  data: TwoTruthsAndALieItem[];
}

const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export function TwoTruthsAndALieGame({ data }: TwoTruthsAndALieGameProps) {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedStatement, setSelectedStatement] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentRound = data[currentRoundIndex];
  const isFinished = currentRoundIndex >= data.length;

  const shuffledStatements = useMemo(() => {
    if (!currentRound) return [];
    return shuffleArray([
      { text: currentRound.truth1, isLie: false },
      { text: currentRound.truth2, isLie: false },
      { text: currentRound.lie, isLie: true },
    ]);
  }, [currentRound]);

  const handleStatementSelect = (statement: { text: string; isLie: boolean }) => {
    if (isAnswered) return;
    setSelectedStatement(statement.text);
    setIsAnswered(true);
    if (statement.isLie) {
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
          <CardDescription>You've finished all the rounds.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-center">Your Score: {score} / {data.length}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestart} className="w-full">Play Again</Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (!currentRound) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Two Truths and a Lie</CardTitle>
        <CardDescription>
          Round {currentRoundIndex + 1} of {data.length}. Read the statements below and identify the lie.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {shuffledStatements.map((statement, index) => {
          const isSelected = statement.text === selectedStatement;
          const showAsCorrect = isAnswered && statement.isLie;
          const showAsIncorrect = isAnswered && isSelected && !statement.isLie;
          
          return (
            <Button
              key={index}
              onClick={() => handleStatementSelect(statement)}
              disabled={isAnswered}
              variant={isAnswered && (showAsCorrect || showAsIncorrect) ? 'default' : 'outline'}
              className={cn(
                "w-full justify-start text-left h-auto py-3 transition-all",
                isAnswered && !showAsCorrect && "bg-muted text-muted-foreground",
                showAsCorrect && "bg-green-600 text-white",
                showAsIncorrect && "bg-destructive text-destructive-foreground",
              )}
            >
              <div className="flex items-start gap-4">
                {isAnswered && showAsCorrect && <CheckCircle />}
                {isAnswered && showAsIncorrect && <XCircle />}
                <span className={cn(isAnswered && "opacity-80")}>{statement.text}</span>
              </div>
            </Button>
          );
        })}
      </CardContent>
      {isAnswered && (
        <CardFooter className="flex flex-col items-end gap-4">
             <div className="text-sm p-3 bg-accent rounded-md w-full">
                <p className="font-bold">The lie was:</p>
                <p className="text-muted-foreground">{currentRound.lie}</p>
            </div>
            <Button onClick={handleNextRound}>
                {currentRoundIndex === data.length - 1 ? 'Finish Game' : 'Next Round'}
                <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
