
'use client';

import { useState, useEffect } from 'react';
import { MatchingGameItem } from '@/lib/types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { RefreshCcw } from 'lucide-react';

interface MatchingGameProps {
  items: MatchingGameItem[];
  onScoreChange: (score: number) => void;
  initialScore: number;
}

type BoardItem = {
  type: 'term' | 'definition';
  id: number;
  content: string;
  isMatched: boolean;
};

const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
};

export function MatchingGame({ items, onScoreChange, initialScore }: MatchingGameProps) {
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<BoardItem[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [matchedPairs, setMatchedPairs] = useState(0);

  const POINTS_PER_MATCH = Math.floor(100 / (items.length || 1));

  const initializeGame = () => {
    const terms: BoardItem[] = items.map(item => ({ type: 'term', id: item.id, content: item.term, isMatched: false }));
    const definitions: BoardItem[] = items.map(item => ({ type: 'definition', id: item.id, content: item.definition, isMatched: false }));
    setBoard(shuffleArray([...terms, ...definitions]));
    setSelectedCards([]);
    setIsChecking(false);
    setMatchedPairs(0);
    onScoreChange(0);
  }

  useEffect(() => {
    initializeGame();
  }, [items]);

  const handleCardClick = (card: BoardItem) => {
    if (isChecking || card.isMatched || selectedCards.includes(card)) {
      return;
    }

    const newSelection = [...selectedCards, card];
    setSelectedCards(newSelection);

    if (newSelection.length === 2) {
      setIsChecking(true);
      const [first, second] = newSelection;

      if (first.id === second.id && first.type !== second.type) {
        // Match found
        const newMatchedCount = matchedPairs + 1;
        setMatchedPairs(newMatchedCount);
        onScoreChange(newMatchedCount * POINTS_PER_MATCH);

        setBoard(prevBoard =>
          prevBoard.map(item =>
            item.id === first.id ? { ...item, isMatched: true } : item
          )
        );
        setSelectedCards([]);
        setIsChecking(false);
      } else {
        // No match
        setTimeout(() => {
          setSelectedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };
  
  const handleRestart = () => {
    initializeGame();
  }

  const allMatched = board.length > 0 && board.every(item => item.isMatched);

  if (allMatched) {
    return (
        <div className="text-center p-8">
            <h3 className="text-2xl font-bold mb-4">Congratulations!</h3>
            <p className="text-muted-foreground mb-6">You've matched all the pairs and earned {matchedPairs * POINTS_PER_MATCH} points.</p>
            <Button onClick={handleRestart}>
                <RefreshCcw className="mr-2" />
                Play Again
            </Button>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground">Click two cards to see if they match. {matchedPairs} / {items.length} matched.</p>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {board.map((card, index) => (
                <Card
                key={index}
                onClick={() => handleCardClick(card)}
                className={cn(
                    'flex items-center justify-center p-4 text-center aspect-square cursor-pointer transition-all duration-300',
                    'transform-style-3d',
                    selectedCards.includes(card) || card.isMatched ? 'transform-rotate-y-0 bg-primary/10 border-primary' : 'bg-muted hover:bg-muted/80',
                    card.isMatched && 'bg-green-100 dark:bg-green-900 border-green-500 opacity-60 cursor-not-allowed'
                )}
                >
                    <div className={cn("text-sm font-medium",
                        !(selectedCards.includes(card) || card.isMatched) && 'invisible'
                    )}>
                        {card.content}
                    </div>
                </Card>
            ))}
        </div>
    </div>
  );
}
