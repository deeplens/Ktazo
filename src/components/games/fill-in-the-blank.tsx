
'use client';

import { useState } from 'react';
import { FillInTheBlankItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from '../ui/progress';

interface FillInTheBlankGameProps {
  data: FillInTheBlankItem[];
  onScoreChange: (score: number) => void;
  initialScore: number;
}

export function FillInTheBlankGame({ data, onScoreChange, initialScore }: FillInTheBlankGameProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { guess: string; isCorrect: boolean | null }>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(initialScore > 0 ? initialScore / (100 / data.length) : 0);

  const POINTS_PER_QUESTION = 100 / (data.length || 4);
  const totalQuestions = data.length;

  const currentItem = data[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex] || { guess: '', isCorrect: null };
  const isSubmitted = currentAnswer.isCorrect !== null;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitted) return;
    const newAnswers = { ...answers };
    newAnswers[currentQuestionIndex] = { ...currentAnswer, guess: e.target.value };
    setAnswers(newAnswers);
  }

  const handleSubmit = () => {
    if (!currentAnswer.guess.trim() || isSubmitted) return;
    
    const isCorrect = currentAnswer.guess.trim().toLowerCase() === currentItem.blank.toLowerCase();
    
    const newAnswers = { ...answers };
    newAnswers[currentQuestionIndex] = { ...currentAnswer, isCorrect: isCorrect };
    setAnswers(newAnswers);

    if (isCorrect) {
        const newScore = score + 1;
        setScore(newScore);
        onScoreChange(Math.round(newScore * POINTS_PER_QUESTION));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsFinished(false);
    setScore(0);
    onScoreChange(0);
  }

  if (isFinished) {
    const finalScore = Math.round(score * POINTS_PER_QUESTION);
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Quiz Complete!</CardTitle>
                <CardDescription>You've answered all the questions.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold text-center">Your Score: {finalScore}</p>
                 <p className="text-center text-muted-foreground">{score} / {totalQuestions} correct</p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleRestart} className="w-full">Play Again</Button>
            </CardFooter>
        </Card>
    );
  }
  
  if (!currentItem) {
    return null;
  }

  const sentenceParts = currentItem.sentence.split(/_{3,}/);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fill in the Blank</CardTitle>
        <CardDescription>Complete the sentence based on this week's sermon.</CardDescription>
        <div className="pt-2">
            <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} />
            <p className="text-xs text-muted-foreground mt-1 text-right">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 min-h-[150px]">
        <div className="text-lg md:text-xl text-center p-6 bg-muted rounded-lg flex flex-wrap items-center justify-center gap-2">
          <span>{sentenceParts[0]}</span>
          <Input
            type="text"
            value={currentAnswer.guess}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={isSubmitted}
            className="inline-block w-32 md:w-48 h-10 text-center text-lg bg-background"
            style={{ minWidth: `${(currentItem.blank.length || 10) * 0.9}ch` }}
          />
          <span>{sentenceParts[1]}</span>
        </div>

        {isSubmitted && (
          <Alert variant={currentAnswer.isCorrect ? 'default' : 'destructive'} className={currentAnswer.isCorrect ? 'border-green-500' : ''}>
             {currentAnswer.isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription className="font-semibold">
              {currentAnswer.isCorrect ? `Correct! +${Math.round(POINTS_PER_QUESTION)} points.` : `Not quite. The correct answer is "${currentItem.blank}".`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handlePrevious} variant="outline" disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="mr-2" />
            Previous
        </Button>
        {isSubmitted ? (
            <Button onClick={handleNext}>
                {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}
                <ArrowRight className="ml-2" />
            </Button>
        ) : (
            <Button onClick={handleSubmit} disabled={!currentAnswer.guess.trim()}>Check Answer</Button>
        )}
      </CardFooter>
    </Card>
  );
}
