
'use client';

import { useState } from 'react';
import { JeopardyCategory, JeopardyQuestion } from '@/lib/types';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { cn } from '@/lib/utils';
import { RefreshCcw, CheckSquare } from 'lucide-react';

interface JeopardyGameProps {
  data: JeopardyCategory[];
  onScoreChange: (score: number) => void;
  initialScore: number;
}

export function JeopardyGame({ data, onScoreChange, initialScore }: JeopardyGameProps) {
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const [currentQuestion, setCurrentQuestion] = useState<{ category: string, question: JeopardyQuestion } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(initialScore);
  const [awardedPoints, setAwardedPoints] = useState<Record<string, boolean>>({});


  const handleSelectQuestion = (category: string, question: JeopardyQuestion) => {
    setCurrentQuestion({ category, question });
    setShowAnswer(false);
  };
  
  const handleCloseDialog = () => {
      if(currentQuestion){
        const key = `${currentQuestion.category}-${currentQuestion.question.points}`;
        setAnswered(prev => ({ ...prev, [key]: true }));
      }
      setCurrentQuestion(null);
      setShowAnswer(false);
  }
  
  const handleAwardPoints = () => {
    if (!currentQuestion) return;
    const key = `${currentQuestion.category}-${currentQuestion.question.points}`;
    if (awardedPoints[key]) return; // Don't award points twice

    const newScore = score + currentQuestion.question.points;
    setScore(newScore);
    onScoreChange(newScore);
    setAwardedPoints(prev => ({...prev, [key]: true}));
  }

  const handleRestart = () => {
    setAnswered({});
    setCurrentQuestion(null);
    setShowAnswer(false);
    setScore(0);
    onScoreChange(0);
    setAwardedPoints({});
  };
  
  if (!data || !Array.isArray(data)) {
    return <p>There was an error loading the Jeopardy game data.</p>;
  }
  
  const allAnswered = data.flatMap(c => c.questions).length === Object.keys(answered).length;
  const numRows = data.length > 0 ? Math.max(...data.map(c => c.questions.length)) : 0;
  
  const isCurrentQuestionAwarded = currentQuestion ? !!awardedPoints[`${currentQuestion.category}-${currentQuestion.question.points}`] : false;


  return (
    <div className="w-full">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
        {/* Category Headers */}
        {data.map(category => (
          <div key={category.title} className="text-center bg-primary text-primary-foreground p-2 rounded-t-lg font-bold h-24 flex items-center justify-center">
            {category.title}
          </div>
        ))}
        
        {/* Questions Grid - Rendered Row by Row */}
        {Array.from({ length: numRows }).map((_, rowIndex) => 
            data.map(category => {
                const question = category.questions[rowIndex];
                if (!question) return <div key={`${category.title}-${rowIndex}`} className="h-20 bg-blue-800" />;

                const key = `${category.title}-${question.points}`;
                const isAnswered = !!answered[key];
                
                return (
                    <Dialog key={key} onOpenChange={(open) => !open && handleCloseDialog()}>
                        <DialogTrigger asChild>
                            <button
                                onClick={() => handleSelectQuestion(category.title, question)}
                                disabled={isAnswered}
                                className={cn(
                                'text-center bg-blue-800 text-yellow-300 p-2 font-bold text-2xl h-20 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                (rowIndex === numRows - 1) && 'rounded-b-lg'
                                )}
                            >
                                {isAnswered ? '' : `$${question.points}`}
                            </button>
                        </DialogTrigger>
                    </Dialog>
                );
            })
        )}
      </div>
      
      {currentQuestion && (
         <Dialog open={!!currentQuestion} onOpenChange={(open) => !open && handleCloseDialog()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='text-yellow-400'>{currentQuestion.category} for ${currentQuestion.question.points}</DialogTitle>
                </DialogHeader>
                <div className='min-h-[200px] flex items-center justify-center text-center text-xl'>
                    {!showAnswer ? (
                        <p>{currentQuestion.question.question}</p>
                    ) : (
                        <div>
                            <p className='text-muted-foreground text-sm'>Answer:</p>
                            <p className='font-bold'>{currentQuestion.question.answer}</p>
                        </div>
                    )}
                </div>
                <div className='flex justify-between items-center gap-2'>
                    <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
                    {showAnswer ? (
                        <Button 
                            onClick={handleAwardPoints} 
                            disabled={isCurrentQuestionAwarded}
                            variant={isCurrentQuestionAwarded ? "secondary" : "default"}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckSquare className="mr-2" />
                            {isCurrentQuestionAwarded ? 'Points Awarded' : 'I got it right!'}
                        </Button>
                    ) : (
                        <Button onClick={() => setShowAnswer(true)} disabled={showAnswer}>Show Answer</Button>
                    )}
                </div>
            </DialogContent>
         </Dialog>
      )}
      
      {(allAnswered || Object.keys(answered).length > 0) && (
        <div className="mt-4 flex justify-center">
            <Button onClick={handleRestart} variant="outline">
                <RefreshCcw className="mr-2" />
                {allAnswered ? 'Play Again' : 'Reset Board'}
            </Button>
        </div>
      )}
    </div>
  );
}

