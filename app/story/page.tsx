import React from 'react';
import InteractiveStory from '@/components/InteractiveStory'; // Import file vừa tạo ở Bước 1

export default function StoryPage() {
  return (
    <main className="w-full min-h-screen bg-[#1a1a1a]">
       <InteractiveStory />
    </main>
  );
}