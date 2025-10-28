"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Send, Loader2, Bot, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

type ChatWidgetProps = {
  isOpen: boolean;
  onToggle: () => void;
};

const ChatWidget = ({ isOpen, onToggle }: ChatWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your AI assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const cleanUserId = (user?.id || 'anonymous').replace(/-/g, '_');
      const url = `https://n8n.solynex.me/webhook/optivus-chat?message=${encodeURIComponent(inputMessage)}&userId=${encodeURIComponent(cleanUserId)}&userEmail=${encodeURIComponent(user?.email || 'anonymous@example.com')}&timestamp=${encodeURIComponent(new Date().toISOString())}`;
      
      console.log('Making API request to:', url);
      console.log('Clean userId:', cleanUserId);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let data;
      
      try {
        if (contentType && contentType.includes('application/json')) {
          const responseText = await response.text();
          console.log('Raw response text:', responseText);
          
          if (responseText.trim()) {
            data = JSON.parse(responseText);
          } else {
            console.log('Empty response received');
            data = { response: 'I\'m sorry, but I didn\'t receive a proper response from the AI service. This might be a temporary issue with the server. Please try asking your question again.' };
          }
        } else {
          // If it's not JSON, treat it as text
          const textResponse = await response.text();
          console.log('API response (text):', textResponse);
          data = { response: textResponse || 'I\'m sorry, but I didn\'t receive a proper response from the AI service. Please try your question again.' };
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        data = { response: 'I received your message but had trouble processing the response. Please try again.' };
      }
      
      console.log('Parsed API data:', data);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.message || data.text || data.reply || (typeof data === 'string' ? data : '') || 'I received your message, but I\'m having trouble generating a response right now. Please try again or check if the AI service is properly configured.',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat API Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-20 right-4 w-96 h-[500px] shadow-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-50 flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Bot className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </div>
            <span className="text-slate-800 dark:text-slate-200">AI Assistant</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggle}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-slate-600 dark:bg-slate-500' 
                  : 'bg-slate-200 dark:bg-slate-600'
              }`}>
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                )}
              </div>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-slate-600 dark:bg-slate-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 opacity-70 ${
                  message.sender === 'user' ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400"
            />
            <Button 
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500 text-white px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWidget;