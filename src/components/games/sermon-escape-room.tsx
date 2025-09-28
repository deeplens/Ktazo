
'use client';

import { useState } from 'react';
import { SermonEscapeRoomPuzzle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, DoorOpen, KeyRound, Lightbulb, Lock, XCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

interface SermonEscapeRoomGameProps {
  data: SermonEscapeRoomPuzzle[];
}

export function SermonEscapeRoomGame({ data }: SermonEscapeRoomGameProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const totalSteps = data.length;
  const currentPuzzle = data[currentStep];

  const checkAnswer = () => {
    const isCorrect = userInput.trim().toLowerCase() === currentPuzzle.answer.toLowerCase();
    if (isCorrect) {
      setFeedback(currentPuzzle.feedback);
      setIsLocked(false);
    } else {
      setFeedback("That's not quite right. Try looking at the hint again or thinking about the sermon in a different way.");
    }
  };
  
  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
        setIsLocked(true);
        setFeedback(null);
        setUserInput('');
    } else {
        setIsFinished(true);
    }
  }
  
  const handleRestart = () => {
    setCurrentStep(0);
    setIsLocked(true);
    setFeedback(null);
    setUserInput('');
    setIsFinished(false);
  }

  if (isFinished) {
    return (
        <Card className="w-full">
            <CardHeader className="items-center text-center">
                <DoorOpen className="w-16 h-16 text-green-500" />
                <CardTitle>Congratulations!</CardTitle>
                <CardDescription>You've successfully completed the Sermon Escape Room.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center">You've shown great attentiveness to the sermon's message. Well done!</p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleRestart} className="w-full">Play Again</Button>
            </CardFooter>
        </Card>
    );
  }
  
  if (!currentPuzzle) return null;

  return (
    <Card className="w-full">
        <CardHeader>
            <CardTitle>Sermon Escape Room</CardTitle>
            <CardDescription>Solve the puzzles to unlock the next step and escape!</CardDescription>
            <div className="pt-2">
                <Progress value={((currentStep + 1) / totalSteps) * 100} />
                <p className="text-xs text-muted-foreground mt-1 text-right">Step {currentStep + 1} of {totalSteps}</p>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 min-h-[250px]">
            <div className="p-4 bg-muted rounded-lg space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Lightbulb className="text-yellow-500" />
                    Puzzle Prompt
                </h3>
                <p>{currentPuzzle.prompt}</p>
            </div>

            {isLocked && (
                <div className="space-y-4">
                    {currentPuzzle.type === 'Multiple Choice' && currentPuzzle.options && (
                        <RadioGroup onValueChange={setUserInput} value={userInput}>
                            {currentPuzzle.options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                     {currentPuzzle.type === 'Text Answer' && (
                        <Input 
                            placeholder="Type your answer here..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                        />
                    )}
                     {currentPuzzle.type === 'Verse Code' && (
                        <Input 
                            type="text"
                            placeholder="Enter the code (e.g., 123)"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                        />
                    )}
                </div>
            )}

            {feedback && (
                <Alert variant={isLocked ? 'destructive' : 'default'} className={cn(!isLocked && "border-green-500")}>
                    {isLocked ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    <AlertTitle>{isLocked ? 'Incorrect' : 'Correct!'}</AlertTitle>
                    <AlertDescription>
                        {feedback}
                    </AlertDescription>
                </Alert>
            )}

        </CardContent>
        <CardFooter>
            {isLocked ? (
                 <Button onClick={checkAnswer} className="w-full" disabled={!userInput}>
                    <Lock className="mr-2" />
                    Attempt to Unlock
                </Button>
            ) : (
                <Button onClick={handleNextStep} className="w-full">
                    {currentStep === totalSteps - 1 ? 'Escape!' : 'Proceed to Next Step'}
                    <KeyRound className="ml-2" />
                </Button>
            )}
        </CardFooter>
    </Card>
  );
}
