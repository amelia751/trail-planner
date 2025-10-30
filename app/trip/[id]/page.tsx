'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GPSSimulator } from '@/components/GPSSimulator';
import { MapView } from '@/components/MapView';
import { chatWithAI } from '@/lib/ai';
import { db } from '@/lib/db';
import type { GPSPosition, ChatMessage, Trip } from '@/lib/types';
import { Send, Image as ImageIcon, Loader2, MapPin, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function TripSessionPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load trip from IndexedDB
  useEffect(() => {
    loadTrip();
  }, [tripId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTrip = async () => {
    try {
      console.log('📖 Loading trip from IndexedDB:', tripId);
      const loadedTrip = await db.trips.get(tripId);
      
      if (!loadedTrip) {
        alert('Trip not found');
        router.push('/trips');
        return;
      }

      console.log('✅ Trip loaded:', {
        name: loadedTrip.name,
        waypoints: loadedTrip.gpsPath.length,
        knowledgeBase: Object.keys(loadedTrip.knowledgeBase),
      });

      setTrip(loadedTrip);
      
      // Generate realistic GPS path if needed (for testing with real route data)
      let gpsPath = loadedTrip.gpsPath;
      if (!gpsPath || gpsPath.length === 0) {
        // Generate from route coordinates if available
        if (loadedTrip.trailData?.coordinates && loadedTrip.trailData.coordinates.length > 0) {
          const { generateRealisticGPSPath } = await import('@/lib/mock-trail-data');
          gpsPath = generateRealisticGPSPath(loadedTrip.trailData.coordinates, 800);
        }
      }
      
      // Set initial position to first GPS point
      if (gpsPath && gpsPath.length > 0) {
        setCurrentPosition(gpsPath[0]);
      }

      // Add welcome message
      const welcomeMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Welcome to your ${loadedTrip.purpose} trip from ${loadedTrip.startPoint} to ${loadedTrip.endPoint}! 🎒\n\nI'm your offline trail assistant powered by Chrome AI. I have access to:\n- GPS route with ${loadedTrip.gpsPath.length} waypoints\n- ${loadedTrip.trailData.waypoints.length} landmarks along the trail\n- Complete knowledge base for ${loadedTrip.purpose}\n\nI can help with navigation, identify plants/wildlife, provide first aid tips, and answer questions about your route - all completely offline!\n\nHow can I help you today?`,
        timestamp: Date.now(),
      };
      setMessages([welcomeMsg]);
    } catch (error) {
      console.error('Error loading trip:', error);
      alert('Failed to load trip');
      router.push('/trips');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;
    if (!trip) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
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
      // Build context from knowledge base
      const context = `
CURRENT TRIP: ${trip.name}
Route: ${trip.startPoint} → ${trip.endPoint}
Purpose: ${trip.purpose}
Difficulty: ${trip.difficulty}
Distance: ${trip.distance} km

CURRENT POSITION: ${currentPosition ? `Lat ${currentPosition.lat.toFixed(4)}, Lon ${currentPosition.lon.toFixed(4)}` : 'Unknown'}

KNOWLEDGE BASE:
${Object.entries(trip.knowledgeBase).map(([key, value]) => `${key}:\n${value}\n`).join('\n')}

NEARBY LANDMARKS:
${trip.trailData.waypoints.map(wp => `- ${wp.name} (${wp.type}): ${wp.description}`).join('\n')}
`;

      const response = await chatWithAI({
        message: inputMessage,
        context,
        image: selectedImage || undefined,
        useServerFallback: false, // Force Chrome AI only
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Make sure Chrome AI is enabled.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      alert('Please drop an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-peacock" />
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <div className="min-h-screen bg-paper-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-ecru-dark px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link 
            href="/trips" 
            className="text-peacock hover:text-true-turquoise flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trips
          </Link>
          <div className="text-center flex-1">
            <h1 className="font-semibold text-offblack">{trip.name}</h1>
            <p className="text-xs text-telly-blue">{trip.purpose} • {trip.distance} km</p>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile: Tabs Layout */}
      <div className="lg:hidden flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="gps" className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="gps" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              GPS
            </TabsTrigger>
            <TabsTrigger value="agent" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Agent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gps" className="flex-1 mt-4 space-y-4">
            {trip.gpsPath && (
              <>
                <GPSSimulator
                  trailPath={trip.gpsPath}
                  waypoints={trip.trailData?.waypoints}
                  onPositionUpdate={setCurrentPosition}
                />
                <MapView
                  route={trip.gpsPath}
                  currentPosition={currentPosition || undefined}
                  waypoints={trip.trailData?.waypoints}
                  className="h-80 rounded-lg border border-ecru-dark"
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="agent" className="flex-1 mt-4">
            <Card className="h-full flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-peacock text-white'
                          : 'bg-paper-white-alt text-offblack'
                      }`}
                    >
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="Uploaded"
                          className="max-w-xs rounded mb-2"
                        />
                      )}
                      {msg.gps && msg.role === 'user' && (
                        <p className="text-xs opacity-75 mb-1">
                          📍 Lat: {msg.gps.lat.toFixed(4)}, Lon: {msg.gps.lon.toFixed(4)}
                        </p>
                      )}
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-strong:text-offblack prose-strong:font-bold prose-em:text-offblack prose-em:italic">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              strong: ({ children }) => <strong className="font-bold text-offblack">{children}</strong>,
                              em: ({ children }) => <em className="italic text-offblack">{children}</em>,
                              p: ({ children }) => <p className="my-2 text-offblack">{children}</p>,
                              ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                              li: ({ children }) => <li className="my-0.5">{children}</li>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-paper-white-alt text-offblack rounded-lg p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div 
                className={`border-t border-ecru-dark p-4 transition-colors ${
                  isDragging ? 'bg-sky/20 border-peacock' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDragging && (
                  <div className="mb-2 text-center text-peacock text-sm font-medium">
                    📸 Drop image here to upload
                  </div>
                )}
                {selectedImage && (
                  <div className="mb-2 relative inline-block">
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="h-20 rounded border border-ecru-dark"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-2 -right-2 bg-terra-cotta text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask anything about your trip..."
                    className="flex-1 min-h-[60px] max-h-[120px]"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Side-by-Side Layout */}
      <div className="hidden lg:flex flex-1 container mx-auto px-4 py-6 gap-6">
        {/* Left: GPS Simulator & Map */}
        <div className="w-96 space-y-4">
          {trip.gpsPath && (
            <>
              <GPSSimulator
                trailPath={trip.gpsPath}
                waypoints={trip.trailData?.waypoints}
                onPositionUpdate={setCurrentPosition}
                className="sticky top-6"
              />
              <div className="sticky top-[28rem]">
                <MapView
                  route={trip.gpsPath}
                  currentPosition={currentPosition || undefined}
                  waypoints={trip.trailData?.waypoints}
                  className="h-64 rounded-lg border border-ecru-dark"
                />
              </div>
            </>
          )}
        </div>

        {/* Right: Chat */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-peacock text-white'
                        : 'bg-paper-white-alt text-offblack'
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Uploaded"
                        className="max-w-xs rounded mb-2"
                      />
                    )}
                    {msg.gps && msg.role === 'user' && (
                      <p className="text-xs opacity-75 mb-1">
                        📍 Lat: {msg.gps.lat.toFixed(4)}, Lon: {msg.gps.lon.toFixed(4)}
                      </p>
                    )}
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-strong:text-offblack prose-strong:font-bold prose-em:text-offblack prose-em:italic">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            strong: ({ children }) => <strong className="font-bold text-offblack">{children}</strong>,
                            em: ({ children }) => <em className="italic text-offblack">{children}</em>,
                            p: ({ children }) => <p className="my-2 text-offblack">{children}</p>,
                            ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-paper-white-alt text-offblack rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div 
              className={`border-t border-ecru-dark p-4 transition-colors ${
                isDragging ? 'bg-sky/20 border-peacock' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isDragging && (
                <div className="mb-2 text-center text-peacock text-sm font-medium">
                  📸 Drop image here to upload
                </div>
              )}
              {selectedImage && (
                <div className="mb-2 relative inline-block">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="h-20 rounded border border-ecru-dark"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-terra-cotta text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask about your route, plants, first aid..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

