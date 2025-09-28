
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface WordSearchGameProps {
  words: string[];
  onScoreChange: (score: number) => void;
  initialScore: number;
}

const gridSize = 12; // 12x12 grid
type Grid = (string | null)[][];
type Position = { row: number; col: number };

// Helper function to generate the word search grid
const generateGrid = (words: string[]): { grid: Grid, wordPositions: Map<string, Position[]> } => {
    const grid: Grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const wordPositions = new Map<string, Position[]>();
    const directions = [
        { x: 1, y: 0 }, // Horizontal
        { x: 0, y: 1 }, // Vertical
        { x: 1, y: 1 }, // Diagonal down-right
        { x: -1, y: 1 }, // Diagonal up-right
        // For simplicity, let's stick to forward directions for now
        // { x: -1, y: 0 }, // Horizontal-reverse
        // { x: 0, y: -1 }, // Vertical-reverse
        // { x: -1, y: -1}, // Diagonal up-left
        // { x: 1, y: -1}, // Diagonal down-left
    ];

    const placeWord = (word: string): boolean => {
        word = word.toUpperCase();
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const wordLength = word.length;
        const attempts = 50;

        for (let i = 0; i < attempts; i++) {
            const startRow = Math.floor(Math.random() * gridSize);
            const startCol = Math.floor(Math.random() * gridSize);

            const endRow = startRow + (wordLength - 1) * direction.y;
            const endCol = startCol + (wordLength - 1) * direction.x;

            if (endRow >= 0 && endRow < gridSize && endCol >= 0 && endCol < gridSize) {
                let canPlace = true;
                for (let j = 0; j < wordLength; j++) {
                    const row = startRow + j * direction.y;
                    const col = startCol + j * direction.x;
                    if (grid[row][col] !== null && grid[row][col] !== word[j]) {
                        canPlace = false;
                        break;
                    }
                }

                if (canPlace) {
                    const positions: Position[] = [];
                    for (let j = 0; j < wordLength; j++) {
                        const row = startRow + j * direction.y;
                        const col = startCol + j * direction.x;
                        grid[row][col] = word[j];
                        positions.push({ row, col });
                    }
                    wordPositions.set(word, positions);
                    return true;
                }
            }
        }
        return false;
    };
    
    // Sort words by length descending to place longer words first
    words.sort((a, b) => b.length - a.length).forEach(word => placeWord(word));

    // Fill empty cells with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === null) {
                grid[i][j] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }

    return { grid, wordPositions };
};


export function WordSearchGame({ words, onScoreChange, initialScore }: WordSearchGameProps) {
    const [grid, setGrid] = useState<Grid>([]);
    const [wordPositions, setWordPositions] = useState<Map<string, Position[]>>(new Map());
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [startPosition, setStartPosition] = useState<Position | null>(null);
    const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
    
    const POINTS_PER_WORD = Math.floor(100 / words.length);

    const initializeGame = () => {
        const { grid: newGrid, wordPositions: newWordPositions } = generateGrid(words);
        setGrid(newGrid);
        setWordPositions(newWordPositions);
        setFoundWords([]);
        setStartPosition(null);
        setFoundCells(new Set());
        onScoreChange(0);
    }

    useEffect(() => {
        initializeGame();
    }, [words]);

    const handleCellClick = (row: number, col: number) => {
        const cellKey = `${row}-${col}`;
        if (foundCells.has(cellKey)) return;

        if (!startPosition) {
            setStartPosition({ row, col });
        } else {
            const endPosition = { row, col };
            
            for(const [word, positions] of wordPositions.entries()){
                if (foundWords.includes(word.toLowerCase())) continue;

                const firstLetterPos = positions[0];
                const lastLetterPos = positions[positions.length - 1];
                
                const isMatch = (
                    (startPosition.row === firstLetterPos.row && startPosition.col === firstLetterPos.col && endPosition.row === lastLetterPos.row && endPosition.col === lastLetterPos.col) ||
                    (startPosition.row === lastLetterPos.row && startPosition.col === lastLetterPos.col && endPosition.row === firstLetterPos.row && endPosition.col === firstLetterPos.col)
                );

                if(isMatch){
                    const newFoundWords = [...foundWords, words.find(w => w.toUpperCase() === word)!];
                    setFoundWords(newFoundWords);
                    
                    const newFoundCells = new Set(foundCells);
                    positions.forEach(p => newFoundCells.add(`${p.row}-${p.col}`));
                    setFoundCells(newFoundCells);
                    
                    onScoreChange(newFoundWords.length * POINTS_PER_WORD);
                    break; 
                }
            }
            setStartPosition(null);
        }
    };

    const handleRestart = () => {
        initializeGame();
    }

    const isCellFound = (row: number, col: number) => {
        return foundCells.has(`${row}-${col}`);
    }

    if (grid.length === 0) {
        return <div>Loading game...</div>
    }
    
    const allWordsFound = foundWords.length === words.length;

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            <div className="flex-shrink-0 grid grid-cols-12 gap-1 bg-card p-2 rounded-lg shadow-inner select-none">
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            className={cn(
                                'w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg font-bold border rounded-md cursor-pointer transition-colors',
                                isCellFound(rowIndex, colIndex) ? 'bg-primary text-primary-foreground' : 'bg-muted/50',
                                startPosition?.row === rowIndex && startPosition?.col === colIndex && 'ring-2 ring-primary ring-offset-2',
                                !isCellFound(rowIndex, colIndex) && 'hover:bg-accent'
                            )}
                        >
                            {cell}
                        </div>
                    ))
                )}
            </div>
            <div className="w-full md:w-52">
                <h3 className="font-bold text-xl mb-4">Find These Words:</h3>
                {allWordsFound ? (
                     <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                        <p className="font-bold text-green-700 dark:text-green-300">Congratulations!</p>
                        <p className="text-sm text-green-600 dark:text-green-400">You found all the words.</p>
                        <Button onClick={handleRestart} className="mt-4">Play Again</Button>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {words.map(word => (
                            <li
                                key={word}
                                className={cn(
                                    'text-lg transition-colors',
                                    foundWords.includes(word) ? 'line-through text-muted-foreground' : 'text-foreground'
                                )}
                            >
                                {word}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
