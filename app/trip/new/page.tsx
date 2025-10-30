'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import type { Trip } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function NewTripPage() {
  const router = useRouter();

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load animations on mount
  useEffect(() => {
    fetch('/animation/AgentCreating.json')
      .then(res => res.json())
      .then(data => setBinocularsAnimation(data))
      .catch(err => console.error('Error loading binoculars animation:', err));
    
    fetch('/animation/StoryIdea.json')
      .then(res => res.json())
      .then(data => setStoryIdeaAnimation(data))
      .catch(err => console.error('Error loading story idea animation:', err));
  }, []);

  // Form state
  const [name, setName] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [purpose, setPurpose] = useState('Running');
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'challenging' | 'expert'>('moderate');
  const [loadingStage, setLoadingStage] = useState<'route' | 'knowledge' | null>(null);
  const [binocularsAnimation, setBinocularsAnimation] = useState(null);
  const [storyIdeaAnimation, setStoryIdeaAnimation] = useState(null);

  const handleQuickFillRunning = () => {
    setName('Schuylkill River Marathon');
    setStartPoint('Lloyd Hall & Kelly Drive, Philadelphia, PA');
    setEndPoint('Manayunk Main Street, Philadelphia, PA');
    setPurpose('Trail Running');
    setDifficulty('moderate');
    console.log('✨ Quick Fill: Schuylkill River Marathon (Lloyd Hall → Manayunk)');
  };

  const handleQuickFillHiking = () => {
    setName('Wissahickon Valley Waterfall Hike');
    setStartPoint('Valley Green Inn, Wissahickon Valley Park, Philadelphia, PA');
    setEndPoint('Devil\'s Pool & Forbidden Drive, Wissahickon, Philadelphia, PA');
    setPurpose('Hiking');
    setDifficulty('moderate');
    console.log('✨ Quick Fill: Wissahickon Valley Hike (Valley Green → Devil\'s Pool)');
  };

  const handleGenerateTrip = async () => {
    if (!startPoint || !endPoint || !purpose) {
      alert('Please fill in start point, end point, and purpose');
      return;
    }

    setGenerating(true);
    setProgress(10);

    try {
      console.log('🚀 Generating trip data...');
      setLoadingStage('route');
      setProgress(30);

      const response = await fetch('/api/generate-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startPoint,
          endPoint,
          purpose,
          difficulty,
          isRoundTrip: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to generate trip');
      }

      setLoadingStage('knowledge');
      const data = await response.json();
      const tripData = data.tripData;

      setProgress(70);
      console.log('✅ Trip data generated:', {
        waypoints: tripData.route.gpsPath.length,
        landmarks: tripData.route.landmarks.length,
        distance: tripData.route.distance,
      });

      // Save to IndexedDB
      const trip: Trip = {
        id: uuidv4(),
        name: name || `${startPoint} to ${endPoint}`,
        startPoint,
        endPoint,
        purpose,
        difficulty,
        distance: tripData.route.distance,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        knowledgeBase: tripData.knowledgeBase,
        trailData: {
          id: uuidv4(),
          name: name || `${startPoint} to ${endPoint}`,
          description: `${purpose} from ${startPoint} to ${endPoint}`,
          difficulty,
          distance: tripData.route.distance,
          elevationGain: tripData.route.elevationGain,
          coordinates: tripData.route.gpsPath.map((p: any) => ({ lat: p.lat, lon: p.lon })),
          waypoints: tripData.route.landmarks.map((lm: any, idx: number) => ({
            id: `wp-${idx}`,
            name: lm.name,
            description: lm.description,
            lat: lm.lat,
            lon: lm.lon,
            type: lm.type as any,
            order: idx,
          })),
        },
        gpsPath: tripData.route.gpsPath,
        status: 'ready',
      };

      await db.trips.put(trip);
      setProgress(100);

      console.log('✅ Trip saved to IndexedDB');
      
      setTimeout(() => {
        router.push('/trips');
      }, 500);
    } catch (error) {
      console.error('Error generating trip:', error);
      alert('Failed to generate trip: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setProgress(0);
      setLoadingStage(null);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-offblack mb-8">
            Plan New Trip
          </h1>

          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>
                Fill in your route details and we'll generate everything you need for offline use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Trip Name (Optional)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning River Run"
                />
              </div>

              <div>
                <Label htmlFor="startPoint">Start Point *</Label>
                <Input
                  id="startPoint"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  placeholder="e.g., Liberty Bell, Philadelphia"
                  required
                />
              </div>

              <div>
                <Label htmlFor="endPoint">End Point *</Label>
                <Input
                  id="endPoint"
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                  placeholder="e.g., Philadelphia Museum of Art"
                  required
                />
              </div>

              <div>
                <Label htmlFor="purpose">Purpose *</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Running">Running</SelectItem>
                    <SelectItem value="Hiking">Hiking</SelectItem>
                    <SelectItem value="Trail Running">Trail Running</SelectItem>
                    <SelectItem value="Cycling">Cycling</SelectItem>
                    <SelectItem value="Walking">Walking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="challenging">Challenging</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerateTrip}
                  disabled={generating || !startPoint || !endPoint || !purpose}
                  className="flex-1"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Trip
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={handleQuickFillRunning}
                    variant="outline"
                    disabled={generating}
                    size="sm"
                    className="flex-1"
                  >
                    🏃 Running
                  </Button>
                  <Button
                    onClick={handleQuickFillHiking}
                    variant="outline"
                    disabled={generating}
                    size="sm"
                    className="flex-1"
                  >
                    🥾 Hiking
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loading Modal */}
      {generating && loadingStage && (
        <div className="fixed inset-0 bg-offblack/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                {loadingStage === 'route' && binocularsAnimation && (
                  <>
                    <div className="w-48 h-48 mx-auto">
                      <Lottie animationData={binocularsAnimation} loop={true} />
                    </div>
                    <h3 className="text-xl font-semibold text-offblack">
                      Denoting Your Route with Google Maps
                    </h3>
                    <p className="text-sm text-telly-blue">
                      Getting accurate GPS coordinates and landmarks...
                    </p>
                  </>
                )}
                
                {loadingStage === 'knowledge' && storyIdeaAnimation && (
                  <>
                    <div className="w-48 h-48 mx-auto">
                      <Lottie animationData={storyIdeaAnimation} loop={true} />
                    </div>
                    <h3 className="text-xl font-semibold text-offblack">
                      Updating Knowledge Base with Gemini
                    </h3>
                    <p className="text-sm text-telly-blue">
                      Generating first aid, plants, wildlife, and navigation tips...
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}

