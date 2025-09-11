
'use client';

import { useState } from 'react';
import { FillInTheBlankItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface FillInTheBlankGameProps {
  data: FillInTheBlankItem;
}

export function FillInTheBlankGame({ data }: FillInTheBlankGameProps) {
  const [userGuess, setUserGuess] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const sentenceParts = data.sentence.split(/_{3,}/); // Split by 3 or more underscores

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGuess.trim()) return;

    const correct = userGuess.trim().toLowerCase() === data.blank.toLowerCase();
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleRestart = () => {
    setUserGuess('');
    setIsSubmitted(false);
    setIsCorrect(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fill in the Blank</CardTitle>
        <CardDescription>Complete the sentence based on this week's sermon.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-lg md:text-xl text-center p-6 bg-muted rounded-lg flex flex-wrap items-center justify-center gap-2">
          <span>{sentenceParts[0]}</span>
          <form onSubmit={handleSubmit} className="inline-block">
             <Input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                disabled={isSubmitted}
                className="inline-block w-32 md:w-48 h-10 text-center text-lg bg-background"
                style={{ minWidth: `${(data.blank.length || 10) * 0.9}ch` }}
             />
          </form>
          <span>{sentenceParts[1]}</span>
        </div>

        {isSubmitted && (
          <Alert variant={isCorrect ? 'default' : 'destructive'} className={isCorrect ? 'border-green-500' : ''}>
             {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription className="font-semibold">
              {isCorrect ? 'Correct! Well done.' : `Not quite. The correct answer is "${data.blank}".`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {isSubmitted ? (
            <Button onClick={handleRestart}>Play Again</Button>
        ) : (
            <Button onClick={handleSubmit} disabled={!userGuess.trim()}>Check Answer</Button>
        )}
      </CardFooter>
    </Card>
  );
}
