

'use client';

import { Game, GameQuestion, MatchingGameItem, FillInTheBlankItem, WordGuessItem, WordleItem, JeopardyCategory, VerseScrambleItem, TrueFalseQuestion, TwoTruthsAndALieItem, SermonEscapeRoomPuzzle } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, ArrowRight, Star } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { WordSearchGame } from "./word-search";
import { MatchingGame } from "./matching-game";
import { FillInTheBlankGame } from "./fill-in-the-blank";
import { WordGuessGame } from "./word-guess";
import { WordleGame } from "./wordle-game";
import { JeopardyGame } from "./jeopardy-game";
import { VerseScrambleGame } from "./verse-scramble";
import { TrueFalseGame } from "./true-false-game";
import { WordCloudHunt } from "./word-cloud-hunt";
import { TwoTruthsAndALieGame } from "./two-truths-and-a-lie";
import { SermonEscapeRoomGame } from "./sermon-escape-room";

interface GamePlayerProps {
    game: Game;
    onScoreChange: (score: number) => void;
    initialScore: number;
}

const QuizGame = ({ data, onScoreChange, initialScore }: { data: GameQuestion[], onScoreChange: (score: number) => void, initialScore: number }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(initialScore / 10);
    
    const POINTS_PER_QUESTION = 10;

    const currentQuestion = data[currentQuestionIndex];
    const isFinished = currentQuestionIndex >= data.length;

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);
        if (option === currentQuestion.correctAnswer) {
            const newScore = score + 1;
            setScore(newScore);
            onScoreChange(newScore * POINTS_PER_QUESTION);
        }
    };

    const handleNextQuestion = () => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        onScoreChange(0);
    }

    if (isFinished) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Quiz Complete!</CardTitle>
                    <CardDescription>You've finished the quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-center">Your Score: {score * POINTS_PER_QUESTION}</p>
                    <p className="text-center text-muted-foreground">{score} / {data.length} correct</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleRestart} className="w-full">Play Again</Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardDescription>Question {currentQuestionIndex + 1} of {data.length}</CardDescription>
                    <CardTitle>{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {currentQuestion.options.map(option => {
                        const isCorrect = option === currentQuestion.correctAnswer;
                        const isSelected = option === selectedAnswer;
                        return (
                            <Button 
                                key={option} 
                                onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                                variant={isAnswered && (isCorrect || isSelected) ? 'default' : 'outline'}
                                className={cn(
                                    "w-full justify-start text-left h-auto py-3",
                                    isAnswered && isSelected && !isCorrect && "bg-destructive text-destructive-foreground",
                                    isAnswered && isCorrect && "bg-green-600 text-white",
                                )}
                            >
                                <div className="flex items-center gap-4">
                                     {isAnswered && isSelected && !isCorrect && <XCircle />}
                                     {isAnswered && isCorrect && <CheckCircle />}
                                    <span>{option}</span>
                                </div>
                            </Button>
                        )
                    })}
                </CardContent>
                {isAnswered && (
                     <CardFooter className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            {selectedAnswer === currentQuestion.correctAnswer ? `+${POINTS_PER_QUESTION} points!` : `The correct answer was: ${currentQuestion.correctAnswer}`}
                        </div>
                        <Button onClick={handleNextQuestion}>
                           {currentQuestionIndex === data.length - 1 ? 'Finish Quiz' : 'Next Question'}
                           <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                     </CardFooter>
                )}
            </Card>
        </div>
    )
}

export function GamePlayer({ game, onScoreChange, initialScore }: GamePlayerProps) {
    const gamePoints = game.type === 'Jeopardy' ? (game.data as JeopardyCategory[]).flatMap(c => c.questions).reduce((sum, q) => sum + q.points, 0) : 100;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold">{game.title}</h3>
                    <p className="text-sm text-muted-foreground">An interactive '{game.type}' game for {game.audience}.</p>
                </div>
                <div className="flex items-center gap-2 text-lg font-bold text-primary">
                    <Star className="text-yellow-400 fill-yellow-400" />
                    <span>{initialScore} / {gamePoints} Points</span>
                </div>
            </div>
            
            {(() => {
                switch (game.type) {
                    case "Quiz":
                        return <QuizGame data={game.data as GameQuestion[]} onScoreChange={onScoreChange} initialScore={initialScore} />;
                    case "Word Search":
                        return <WordSearchGame words={(game.data as { words: string[] }).words} onScoreChange={onScoreChange} initialScore={initialScore} />;
                    case "Matching":
                        return <MatchingGame items={game.data as MatchingGameItem[]} onScoreChange={onScoreChange} initialScore={initialScore} />;
                    case "Fill in the Blank":
                        return <FillInTheBlankGame data={game.data as FillInTheBlankItem[]} onScoreChange={onScoreChange} initialScore={initialScore} />;
                    case "Word Guess":
                        return <WordGuessGame data={game.data as WordGuessItem[]} />;
                    case "Wordle":
                        return <WordleGame data={game.data as WordleItem} />;
                    case "Jeopardy":
                        return <JeopardyGame data={game.data as JeopardyCategory[]} onScoreChange={onScoreChange} initialScore={initialScore} />;
                    case "Verse Scramble":
                        return <VerseScrambleGame data={game.data as VerseScrambleItem} />;
                    case "True/False":
                        return <TrueFalseGame data={game.data as TrueFalseQuestion[]} onScoreChange={onScoreChange} initialScore={initialScore} />;
                    case "Word Cloud Hunt":
                        return <WordCloudHunt words={(game.data as { words: string[] }).words} onScoreChange={onScoreChange} initialScore={initialScore} />;
                    case "Two Truths and a Lie":
                        return <TwoTruthsAndALieGame data={game.data as TwoTruthsAndALieItem[]} />;
                    case "Sermon Escape Room":
                        return <SermonEscapeRoomGame data={game.data as SermonEscapeRoomPuzzle[]} />;
                    default:
                        return <p>Unknown game type</p>;
                }
            })()}
        </div>
    )
}
