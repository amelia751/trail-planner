'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { checkAICapabilities } from '@/lib/ai';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function LandingPage() {
  const [hasAI, setHasAI] = useState<boolean | null>(null);

  useEffect(() => {
    checkAICapabilities().then((caps) => {
      setHasAI(caps.promptAPI || false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-paper-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Logo */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-bold text-offblack mb-2" style={{ fontFamily: "'Rimouski', 'Dancing Script', cursive", letterSpacing: '0.02em' }}>
              T<span className="text-true-turquoise">RAIL</span>
            </h1>
            <p className="text-lg text-peacock font-medium">
              Chrome-AI-Enabled Offline Trip Planner
            </p>
          </div>

          {/* Manga Grid - 2x2 */}
          <div className="grid grid-cols-2 gap-1.5 mb-12 max-w-xs mx-auto">
            {/* Panel 1: Download Chrome */}
            <Card className="bg-paper-white-alt border border-offblack relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex flex-col items-center justify-between p-2 h-32">
                <div className="w-32 h-20 -mt-6 -mb-2">
                  <Lottie
                    animationData={require('../public/animation/DownloadChrome.json')}
                    loop={true}
                    autoplay={true}
                  />
                </div>
                <p className="text-[10px] font-medium text-offblack text-center leading-tight px-1">
                  Get Chrome Dev
                </p>
              </div>
              <div className="absolute top-1 left-1 bg-offblack text-white text-[9px] font-bold px-1 py-0.5 rounded">
                1
              </div>
            </Card>

            {/* Panel 2: Story Idea */}
            <Card className="bg-paper-white-alt border border-offblack relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex flex-col items-center justify-between p-2 h-32">
                <div className="w-32 h-20 -mt-6 -mb-2">
                  <Lottie
                    animationData={require('../public/animation/StoryIdea.json')}
                    loop={true}
                    autoplay={true}
                  />
                </div>
                <p className="text-[10px] font-medium text-offblack text-center leading-tight px-1">
                  Plan your trip route
                </p>
              </div>
              <div className="absolute top-1 left-1 bg-offblack text-white text-[9px] font-bold px-1 py-0.5 rounded">
                2
              </div>
            </Card>

            {/* Panel 3: Agent Creating */}
            <Card className="bg-paper-white-alt border border-offblack relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex flex-col items-center justify-between p-2 h-32">
                <div className="w-32 h-20 -mt-6 -mb-2">
                  <Lottie
                    animationData={require('../public/animation/AgentCreating.json')}
                    loop={true}
                    autoplay={true}
                  />
                </div>
                <p className="text-[10px] font-medium text-offblack text-center leading-tight px-1">
                  AI prepares guides
                </p>
              </div>
              <div className="absolute top-1 left-1 bg-offblack text-white text-[9px] font-bold px-1 py-0.5 rounded">
                3
              </div>
            </Card>

            {/* Panel 4: Start Diving */}
            <Card className="bg-paper-white-alt border border-offblack relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex flex-col items-center justify-between p-2 h-32">
                <div className="w-32 h-20 -mt-6 -mb-2">
                  <Lottie
                    animationData={require('../public/animation/StartDiving.json')}
                    loop={true}
                    autoplay={true}
                  />
                </div>
                <p className="text-[10px] font-medium text-offblack text-center leading-tight px-1">
                  Explore offline
                </p>
              </div>
              <div className="absolute top-1 left-1 bg-offblack text-white text-[9px] font-bold px-1 py-0.5 rounded">
                4
              </div>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center max-w-md mx-auto">
            {hasAI === null ? (
              <div className="py-8">
                <div className="animate-pulse text-muted-foreground">
                  Checking Chrome AI...
                </div>
              </div>
            ) : hasAI ? (
              <div className="space-y-4">
                <p className="text-sm text-peacock font-medium mb-4">
                  ✨ Chrome AI detected! You&apos;re ready to create.
                </p>
                <Button asChild size="lg" className="w-full h-auto py-4 text-lg font-bold">
                  <Link href="/trips">
                    Go to Trips
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-terra-cotta font-medium mb-4">
                  Seems like you have not integrated Chrome AI
                </p>
                <Button asChild size="lg" variant="secondary" className="w-full h-auto py-4 text-lg font-bold">
                  <Link href="/install">
                    Install Chrome AI
                  </Link>
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
