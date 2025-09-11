
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

interface WordSearchGameProps {
  words: string[];
}

const gridSize = 12; // 12x12 grid
type Grid = (string | null)[][];
type Position = { row: number; col: number };

// Helper function to generate the word search grid
const generateGrid = (words: string[]): Grid => {
    const grid: Grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const directions = [
        { x: 1, y: 0 }, // Horizontal
        { x: 0, y: 1 }, // Vertical
        { x: 1, y: 1 }, // Diagonal down-right
        { x: -1, y: 1 }, // Diagonal up-right
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
                    for (let j = 0; j < wordLength; j++) {
                        const row = startRow + j * direction.y;
                        const col = startCol + j * direction.x;
                        grid[row][col] = word[j];
                    }
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

    return grid;
};


export function WordSearchGame({ words }: WordSearchGameProps) {
    const [grid, setGrid] = useState<Grid>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selection, setSelection] = useState<Position[]>([]);
    
    useEffect(() => {
        setGrid(generateGrid(words));
        setFoundWords([]);
    }, [words]);

    const handleMouseDown = (row: number, col: number) => {
        setIsSelecting(true);
        setSelection([{ row, col }]);
    };

    const handleMouseEnter = (row: number, col: number) => {
        if (!isSelecting) return;
        
        const start = selection[0];
        const end = { row, col };
        const newSelection: Position[] = [];

        const dx = Math.sign(end.col - start.col);
        const dy = Math.sign(end.row - start.row);

        // Allow only straight lines (horizontal, vertical, diagonal)
        if (Math.abs(end.col - start.col) === Math.abs(end.row - start.row) || start.col === end.col || start.row === end.row) {
            let curr = { ...start };
            while (curr.row !== end.row || curr.col !== end.col) {
                newSelection.push({ ...curr });
                curr.row += dy;
                curr.col += dx;
            }
            newSelection.push(end);
            setSelection(newSelection);
        }
    };
    
    const handleMouseUp = () => {
        if (!isSelecting) return;
        setIsSelecting(false);
        
        const selectedWord = selection.map(({ row, col }) => grid[row]?.[col]).join('');
        const reversedSelectedWord = selectedWord.split('').reverse().join('');
        const upperCaseWords = words.map(w => w.toUpperCase());

        if (upperCaseWords.includes(selectedWord) || upperCaseWords.includes(reversedSelectedWord)) {
            const foundWord = upperCaseWords.includes(selectedWord) ? selectedWord : reversedSelectedWord;
            if (!foundWords.map(w => w.toUpperCase()).includes(foundWord)) {
                 setFoundWords(prev => [...prev, words.find(w => w.toUpperCase() === foundWord)!]);
            }
        }

        setSelection([]);
    };

    const isCellSelected = (row: number, col: number) => {
        return selection.some(p => p.row === row && p.col === col);
    };

    const isCellFound = (row: number, col: number) => {
        // This is a simplified check. A full implementation would store the positions of found words.
        // For now, we rely on the user seeing the struck-through word in the list.
        return false;
    };
    
    const handleRestart = () => {
        setGrid(generateGrid(words));
        setFoundWords([]);
        setSelection([]);
    }

    if (grid.length === 0) {
        return <div>Loading game...</div>
    }
    
    const allWordsFound = foundWords.length === words.length;

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <div className="flex-shrink-0 grid grid-cols-12 gap-1 bg-card p-2 rounded-lg shadow-inner select-none">
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                            className={cn(
                                'w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg font-bold border rounded-md cursor-pointer transition-colors',
                                isCellSelected(rowIndex, colIndex) ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                            )}
                        >
                            {cell}
                        </div>
                    ))
                )}
            </div>
            <div className="w-full md:w-64">
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

