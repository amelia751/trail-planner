'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GPSSimulator } from '@/components/GPSSimulator';
import { chatWithAI } from '@/lib/ai';
import { SCHUYLKILL_RIVER_TRAIL, generateTrailPath } from '@/lib/mock-trail-data';
import type { GPSPosition, ChatMessage, KnowledgeBase } from '@/lib/types';
import { Send, Image as ImageIcon, Loader2, MapPin, Book } from 'lucide-react';
import Link from 'next/link';

export default function TrailPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingKnowledge, setIsGeneratingKnowledge] = useState(false);
  const [trailPath] = useState(() => generateTrailPath(SCHUYLKILL_RIVER_TRAIL, 100));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize position and generate knowledge base
  useEffect(() => {
    setCurrentPosition(trailPath[0]);
    generateKnowledgeBase();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateKnowledgeBase = async () => {
    setIsGeneratingKnowledge(true);
    try {
      const response = await fetch('/api/generate-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripPurpose: 'Running / Hiking',
          location: 'Schuylkill River Trail, Philadelphia, PA',
          difficulty: 'easy',
          distance: 8.5,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate knowledge base');

      const data = await response.json();
      setKnowledgeBase(data.knowledgeBase);
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Welcome to Schuylkill River Trail! 🏃‍♂️

I'm your offline AI trail companion. I've prepared comprehensive guides for:
- 🏥 First Aid & Safety
- 🌿 Local Plant Identification
- 🦌 Wildlife Information
- 🧭 Navigation Tips
- 📞 Emergency Contacts

Ask me anything about the trail, your location, or show me photos for identification! All processing happens on your device.`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error generating knowledge base:', error);
      setMessages([{
        id: Date.now().toString(),
        role: 'system',
        content: '⚠️ Failed to load knowledge base. Some features may be limited.',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsGeneratingKnowledge(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      image: selectedImage || undefined,
      gps: currentPosition || undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Build context from knowledge base and current position
      let context = '';
      
      if (knowledgeBase) {
        context += `KNOWLEDGE BASE (available for reference):\n\n`;
        context += `First Aid:\n${knowledgeBase.firstAid}\n\n`;
        context += `Plants:\n${knowledgeBase.plantIdentification}\n\n`;
        context += `Wildlife:\n${knowledgeBase.wildlifeInfo}\n\n`;
        context += `Navigation:\n${knowledgeBase.navigationTips}\n\n`;
        context += `Emergency:\n${knowledgeBase.emergencyContacts}\n\n`;
      }
      
      if (currentPosition) {
        context += `CURRENT GPS POSITION:\n`;
        context += `- Latitude: ${currentPosition.lat.toFixed(6)}\n`;
        context += `- Longitude: ${currentPosition.lon.toFixed(6)}\n`;
        context += `- Elevation: ${currentPosition.altitude?.toFixed(0)}m\n`;
        context += `- Speed: ${currentPosition.speed?.toFixed(1)} m/s\n\n`;
      }
      
      context += `You are a helpful trail assistant. Answer questions using the knowledge base and GPS data. Be concise and practical.`;

      // Try Chrome AI first (local, fast, private)
      let aiResponse: string;
      try {
        aiResponse = await chatWithAI({
          message: userMessage.content,
          context,
          image: selectedImage || undefined,
          gps: currentPosition || undefined,
        });
        console.log('✅ Response from Chrome AI (on-device)');
      } catch (chromeAIError) {
        console.warn('Chrome AI unavailable, using Gemini API fallback:', chromeAIError);
        
        // Fallback to Gemini API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.content,
            context,
            image: selectedImage || undefined,
            conversationHistory: messages.slice(-5).map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content,
            })),
          }),
        });

        if (!response.ok) throw new Error('Chat API failed');

        const data = await response.json();
        aiResponse = data.response;
        console.log('✅ Response from Gemini API (cloud fallback)');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: '❌ Failed to get response. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-paper-white">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/" className="text-peacock hover:text-true-turquoise text-sm mb-2 inline-block">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-offblack">Schuylkill River Trail</h1>
            <p className="text-telly-blue">AI-powered offline trail companion</p>
          </div>

          {/* Main Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: GPS Simulator */}
            <div className="lg:col-span-1 space-y-4">
              <GPSSimulator
                trailPath={trailPath}
                onPositionUpdate={setCurrentPosition}
              />
              
              {knowledgeBase && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Book className="w-5 h-5 text-peacock" />
                    <h3 className="font-bold text-offblack">Knowledge Base</h3>
                  </div>
                  <p className="text-xs text-telly-blue">
                    ✅ First Aid Guide<br />
                    ✅ Plant Identification<br />
                    ✅ Wildlife Info<br />
                    ✅ Navigation Tips<br />
                    ✅ Emergency Contacts
                  </p>
                </Card>
              )}
            </div>

            {/* Right: Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isGeneratingKnowledge && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-peacock" />
                      <span className="ml-2 text-telly-blue">Preparing knowledge base...</span>
                    </div>
                  )}
                  
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-true-turquoise text-white'
                            : msg.role === 'system'
                            ? 'bg-apricot text-offblack'
                            : 'bg-ecru text-offblack'
                        }`}
                      >
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Uploaded"
                            className="max-w-full rounded mb-2"
                          />
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.gps && msg.role === 'user' && (
                          <p className="text-xs opacity-70 mt-1">
                            <MapPin className="w-3 h-3 inline" /> {msg.gps.lat.toFixed(4)}, {msg.gps.lon.toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-ecru rounded-lg p-3">
                        <Loader2 className="w-4 h-4 animate-spin text-peacock" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-ecru-dark p-4">
                  {selectedImage && (
                    <div className="mb-2 relative inline-block">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="h-20 rounded border border-ecru-dark"
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-terra-cotta text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="icon"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      placeholder="Ask about location, plants, first aid..."
                      className="flex-1"
                    />
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

