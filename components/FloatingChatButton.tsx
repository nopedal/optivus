"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';
import ChatWidget from './ChatWidget';
import { useChat } from '@/contexts/chat-context';

const FloatingChatButton = () => {
  const { isChatOpen, toggleChat } = useChat();

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg transition-all duration-300 z-40 ${
          isChatOpen 
            ? 'bg-slate-600 hover:bg-slate-700' 
            : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
        } text-white border-0`}
        size="lg"
      >
        <MessageSquare className={`h-6 w-6 transition-transform duration-300 ${
          isChatOpen ? 'scale-90' : 'scale-100'
        }`} />
      </Button>

      {/* Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onToggle={toggleChat} />
    </>
  );
};

export default FloatingChatButton;