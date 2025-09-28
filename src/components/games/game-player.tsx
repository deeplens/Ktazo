
'use client';

import { Game, GameQuestion, MatchingGameItem, FillInTheBlankItem, WordGuessItem, WordleItem, JeopardyCategory, VerseScrambleItem, TrueFalseQuestion, ReflectionQuestionGroup, TwoTruthsAndALieItem } from "@/lib/types";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
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
import { ReflectionRoulette } from "./reflection-roulette";
import { getMockWeeklyContent } from "@/lib/mock-data";
import { TwoTruthsAndALieGame } from "./two-truths-and-a-lie";

interface GamePlayerProps {
    game: Game;
}

const QuizGame = ({ data }: { data: GameQuestion[] }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = data[currentQuestionIndex];
    const isFinished = currentQuestionIndex >= data.length;

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);
        if (option === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
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
    }

    if (isFinished) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Quiz Complete!</CardTitle>
                    <CardDescription>You've finished the quiz.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-center">Your Score: {score} / {data.length}</p>
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
                     <CardFooter className="flex justify-end">
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

export function GamePlayer({ game }: GamePlayerProps) {
    switch (game.type) {
        case "Quiz":
            return <QuizGame data={game.data as GameQuestion[]} />;
        case "Word Search":
             return <WordSearchGame words={(game.data as { words: string[] }).words} />;
        case "Matching":
            return <MatchingGame items={game.data as MatchingGameItem[]} />;
        case "Fill in the Blank":
             return <FillInTheBlankGame data={game.data as FillInTheBlankItem[]} />;
        case "Word Guess":
             return <WordGuessGame data={game.data as WordGuessItem[]} />;
        case "Wordle":
             return <WordleGame data={game.data as WordleItem} />;
        case "Jeopardy":
            return <JeopardyGame data={game.data as JeopardyCategory[]} />;
        case "Verse Scramble":
            return <VerseScrambleGame data={game.data as VerseScrambleItem} />;
        case "True/False":
            return <TrueFalseGame data={game.data as TrueFalseQuestion[]} />;
        case "Word Cloud Hunt":
            return <WordCloudHunt words={(game.data as { words: string[] }).words} />;
        case "Reflection Roulette": {
            const weeklyContent = getMockWeeklyContent().find(wc => wc.games.some(g => g.title === game.title));
            const questions = weeklyContent ? weeklyContent.reflectionQuestions.flatMap(qg => qg.questions) : [];
            return <ReflectionRoulette questions={questions} />;
        }
        case "Two Truths and a Lie":
            return <TwoTruthsAndALieGame data={game.data as TwoTruthsAndALieItem[]} />;
        default:
            return <p>Unknown game type</p>;
    }
}
