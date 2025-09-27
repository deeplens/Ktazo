
'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

interface VerseMemoryBuilderProps {
  verse: string;
  reference: string;
}

const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

export function VerseMemoryBuilderGame({ verse, reference }: VerseMemoryBuilderProps) {
  const [level, setLevel] = useState(0);
  const [revealedVerse, setRevealedVerse] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const originalWords = verse.split(' ');
  const totalLevels = 4; // Read, 25% hidden, 50% hidden, Recall

  useEffect(() => {
    const getRevealedVerse = (currentLevel: number) => {
      if (currentLevel === 0) { // Full verse
        return originalWords;
      }
      if (currentLevel === 1) { // 25% hidden
        const wordsToHide = Math.floor(originalWords.length * 0.25);
        const shuffledIndexes = shuffleArray(originalWords.map((_, i) => i));
        const indexesToHide = new Set(shuffledIndexes.slice(0, wordsToHide));
        return originalWords.map((word, i) => (indexesToHide.has(i) ? '___'.repeat(Math.ceil(word.length / 3)) : word));
      }
      if (currentLevel === 2) { // 50% hidden
        const wordsToHide = Math.floor(originalWords.length * 0.5);
        const shuffledIndexes = shuffleArray(originalWords.map((_, i) => i));
        const indexesToHide = new Set(shuffledIndexes.slice(0, wordsToHide));
        return originalWords.map((word, i) => (indexesToHide.has(i) ? '___'.repeat(Math.ceil(word.length / 3)) : word));
      }
      if (level === 3) { // Recall
        return [];
      }
      return originalWords;
    };

    setRevealedVerse(getRevealedVerse(level));
    setUserInput('');
    setResult(null);
  }, [level, verse]);

  const handleNextLevel = () => {
    if (level < totalLevels - 1) {
      setLevel(prev => prev + 1);
    }
  };

  const handleCheckRecall = () => {
    // Normalize by removing punctuation and making lowercase
    const normalize = (text: string) => text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
    
    if (normalize(userInput) === normalize(verse)) {
      setResult('correct');
    } else {
      setResult('incorrect');
    }
  };

  const handleRestart = () => {
    setLevel(0);
  };
  
  const renderContent = () => {
    if (result === 'correct') {
      return (
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-green-600">Excellent!</h2>
            <p className="text-lg">&quot;{verse}&quot;</p>
            <p className="text-muted-foreground">- {reference}</p>
        </div>
      );
    }
    
    switch (level) {
      case 0:
        return (
          <div>
            <CardTitle>Step 1: Read and Memorize</CardTitle>
            <CardDescription className="mt-2 mb-4">Read the verse carefully a few times.</CardDescription>
            <p className="text-xl font-semibold leading-relaxed p-4 bg-muted rounded-md">&quot;{revealedVerse.join(' ')}&quot;</p>
          </div>
        );
      case 1:
      case 2:
        return (
          <div>
            <CardTitle>Step {level + 1}: Partial Recall</CardTitle>
            <CardDescription className="mt-2 mb-4">Read the verse, filling in the blanks in your mind.</CardDescription>
            <p className="text-xl font-semibold leading-relaxed p-4 bg-muted rounded-md">{revealedVerse.map((word, i) => <span key={i} className="mr-1.5">{word}</span>)}</p>
          </div>
        );
      case 3:
        return (
          <div>
            <CardTitle>Step 4: Full Recall</CardTitle>
            <CardDescription className="mt-2 mb-4">Type the full verse from memory.</CardDescription>
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the verse here..."
              disabled={!!result}
            />
            {result === 'incorrect' && (
              <Alert variant="destructive" className="mt-4">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Not quite</AlertTitle>
                <AlertDescription>That's not a perfect match. Try again or show the answer.</AlertDescription>
              </Alert>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="pt-6">
        {renderContent()}
      </CardContent>
      <CardFooter className="flex justify-between mt-4">
        <Button variant="ghost" onClick={handleRestart}>Start Over</Button>
        {level < 3 ? (
          <Button onClick={handleNextLevel}>Next Step</Button>
        ) : (
          <div className="flex gap-2">
            {result === 'incorrect' && <Button variant="secondary" onClick={() => setResult('correct')}>Show Answer</Button>}
            <Button onClick={handleCheckRecall} disabled={!!result && result !== 'incorrect'}>Check My Memory</Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
