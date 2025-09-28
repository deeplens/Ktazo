
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { Play, Pause, RefreshCcw } from 'lucide-react';

interface ReflectionRouletteProps {
  questions: string[];
}

const TIMER_SECONDS = 60;

export function ReflectionRoulette({ questions }: ReflectionRouletteProps) {
  const [spinning, setSpinning] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const spinnerRef = useRef<HTMLUListElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const allQuestions = questions.length > 0 ? questions : ["No questions available for this week."];
  const listItems = Array.from({ length: 50 }).flatMap(() => allQuestions);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTimerRunning(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const startSpin = () => {
    setSpinning(true);
    setSelectedQuestion(null);
    if(spinnerRef.current) {
        spinnerRef.current.style.transition = 'none';
        spinnerRef.current.style.transform = 'translateY(0)';
    }

    setTimeout(() => {
        if(spinnerRef.current) {
            const randomIndex = Math.floor(Math.random() * allQuestions.length) + (allQuestions.length * 3);
            const questionHeight = spinnerRef.current.children[0]?.clientHeight || 50;
            const finalPosition = -(randomIndex * questionHeight);
            
            spinnerRef.current.style.transition = 'transform 3s ease-out';
            spinnerRef.current.style.transform = `translateY(${finalPosition}px)`;

            setTimeout(() => {
                const finalQuestion = allQuestions[randomIndex % allQuestions.length];
                setSelectedQuestion(finalQuestion);
                setSpinning(false);
                setTimeLeft(TIMER_SECONDS);
                setIsTimerRunning(true);
            }, 3000);
        }
    }, 100);
  };
  
  const toggleTimer = () => {
      setIsTimerRunning(prev => !prev);
  }

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setTimeLeft(TIMER_SECONDS);
  }

  return (
    <Card className="w-full">
        <CardHeader>
            <CardTitle>Reflection Roulette</CardTitle>
            <CardDescription>Spin the wheel to get a random reflection question. Answer before time runs out!</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative h-40 w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <div 
                    className="absolute inset-0 h-full w-full pointer-events-none z-10"
                    style={{
                        background: 'linear-gradient(to bottom, hsl(var(--muted)) 0%, transparent 30%, transparent 70%, hsl(var(--muted)) 100%)'
                    }}
                />
                <div className="absolute top-1/2 left-0 w-full h-12 bg-primary/10 border-y-2 border-primary -translate-y-1/2 z-0" />
                 <div className="h-full overflow-hidden">
                    <ul ref={spinnerRef} className="text-center text-lg font-semibold">
                        {listItems.map((q, i) => (
                        <li key={i} className="h-12 flex items-center justify-center p-2 text-center">
                            {q}
                        </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                 {selectedQuestion ? (
                    <div className="text-center space-y-4">
                        <p className="font-semibold text-xl">{selectedQuestion}</p>
                        <div className="text-6xl font-bold text-primary">{timeLeft}</div>
                         <div className="flex gap-2">
                             <Button onClick={toggleTimer} variant="outline" size="icon">
                                 {isTimerRunning ? <Pause /> : <Play />}
                            </Button>
                             <Button onClick={resetTimer} variant="outline" size="icon">
                                <RefreshCcw />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button onClick={startSpin} disabled={spinning} size="lg">
                        {spinning ? 'Spinning...' : 'Spin the Wheel'}
                    </Button>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
