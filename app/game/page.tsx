import React from 'react';
import {Game} from '@/components/game'; // Import file game.tsx có sẵn trong components của bạn

export default function GamePage() {
  return (
    <main className="w-full min-h-screen bg-[#111111]">
       <Game />
    </main>
  );
}