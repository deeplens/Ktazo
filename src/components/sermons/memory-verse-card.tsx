
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, BrainCircuit, Building } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { GamePlayer } from "../games/game-player";
import { Game } from "@/lib/types";
import { VerseMemoryBuilderGame } from "../games/verse-memory-builder";

interface MemoryVerseCardProps {
    verse: string;
    reference: string;
    game: Game;
}

export function MemoryVerseCard({ verse, reference, game }: MemoryVerseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Bookmark /> Memory Verse
        </CardTitle>
        <CardDescription>Commit this week's key verse to memory.</CardDescription>
      </CardHeader>
      <CardContent>
        <blockquote className="space-y-2">
          <p className="text-lg font-semibold leading-snug">&quot;{verse}&quot;</p>
          <footer className="text-sm text-muted-foreground">{reference}</footer>
        </blockquote>
      </CardContent>
      <CardFooter className="grid gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
                <BrainCircuit className="mr-2 h-4 w-4" />
                Practice Now
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
              <DialogHeader>
                  <DialogTitle>Practice the Memory Verse</DialogTitle>
                  <DialogDescription>Unscramble the words to reconstruct the verse.</DialogDescription>
              </DialogHeader>
              <GamePlayer game={game} />
          </DialogContent>
        </Dialog>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">
                    <Building className="mr-2 h-4 w-4" />
                    Memory Builder
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Verse Memory Builder</DialogTitle>
                    <DialogDescription>Gradually recall the verse from memory.</DialogDescription>
                </DialogHeader>
                <VerseMemoryBuilderGame verse={verse} reference={reference} />
            </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
