'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';
import type { Trip } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trash2, Info, MapPin, Book } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [noTripAnimation, setNoTripAnimation] = useState(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);

  useEffect(() => {
    loadTrips();
    fetch('/animation/NoStory.json')
      .then(res => res.json())
      .then(data => setNoTripAnimation(data))
      .catch(err => console.error('Error loading animation:', err));
  }, []);

  const loadTrips = async () => {
    try {
      const allTrips = await db.trips.toArray();
      setTrips(allTrips.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async () => {
    if (!deletingTrip) return;

    try {
      await db.sessions.where('tripId').equals(deletingTrip.id).delete();
      await db.trips.delete(deletingTrip.id);
      await loadTrips();
      setDeletingTrip(null);
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip');
      setDeletingTrip(null);
    }
  };

  return (
    <main className="min-h-screen bg-paper-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-medium text-offblack">
              Your Trips
            </h1>
            <Button asChild size="lg">
              <Link href="/trip/new">
                + Plan New Trip
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-muted-foreground">Loading trips...</p>
              ) : trips.length === 0 ? (
                <div className="text-center py-8">
                  {noTripAnimation && (
                    <div className="w-64 h-64 mx-auto mb-4">
                      <Lottie animationData={noTripAnimation} loop={true} />
                    </div>
                  )}
                  <h2 className="text-xl font-medium text-offblack mb-2">
                    No trips yet
                  </h2>
                  <p className="text-muted-foreground">
                    Start planning your first trail adventure
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle>{trip.name}</CardTitle>
                            <CardDescription>
                              {trip.startPoint} → {trip.endPoint}
                            </CardDescription>
                            <div className="flex gap-2 mt-2">
                              <span className="text-xs bg-sky/20 text-peacock px-2 py-1 rounded">
                                {trip.purpose}
                              </span>
                              <span className="text-xs bg-apricot/20 text-terra-cotta px-2 py-1 rounded">
                                {trip.difficulty}
                              </span>
                              <span className="text-xs bg-ecru text-offblack px-2 py-1 rounded">
                                {trip.distance} km
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setDeletingTrip(trip)}
                            className="text-terra-cotta hover:text-boysenberry p-2"
                            title="Delete trip"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button asChild variant="default" className="flex-1">
                            <Link href={`/trip/${trip.id}`}>
                              Start Trip
                            </Link>
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" title="View Trip Details">
                                <Info className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{trip.name}</DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-6 mt-4">
                                {/* Route Info */}
                                <div>
                                  <h3 className="font-semibold text-offblack flex items-center gap-2 mb-3">
                                    <MapPin className="w-4 h-4 text-peacock" />
                                    Route Data (Google Maps API)
                                  </h3>
                                  <div className="bg-paper-white-alt p-4 rounded-lg space-y-2 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-muted-foreground">Distance:</span>
                                        <p className="font-medium text-peacock">{trip.distance} km</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">GPS Points:</span>
                                        <p className="font-medium text-peacock">{trip.gpsPath?.length || 0}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Landmarks:</span>
                                        <p className="font-medium text-peacock">{trip.trailData?.waypoints?.length || 0}</p>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Elevation Gain:</span>
                                        <p className="font-medium text-peacock">{trip.trailData?.elevationGain || 0}m</p>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-ecru">
                                      <span className="text-muted-foreground text-xs">GPS Coordinates:</span>
                                      <div className="mt-1 font-mono text-xs space-y-1 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                                        {trip.gpsPath?.map((pos, idx) => (
                                          <div key={idx} className="text-telly-blue">
                                            [{idx}] Lat: {pos.lat.toFixed(6)}, Lng: {pos.lon.toFixed(6)}, Alt: {pos.altitude?.toFixed(1) || 0}m
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Landmarks */}
                                {trip.trailData?.waypoints && trip.trailData.waypoints.length > 0 && (
                                  <div>
                                    <h3 className="font-semibold text-offblack flex items-center gap-2 mb-3">
                                      <MapPin className="w-4 h-4 text-true-turquoise" />
                                      Landmarks (Google Places API)
                                    </h3>
                                    <div className="bg-paper-white-alt p-4 rounded-lg text-sm max-h-64 overflow-y-auto scrollbar-thin">
                                      <div className="space-y-3">
                                        {trip.trailData.waypoints.map((wp, idx) => (
                                          <div key={wp.id} className="pb-3 border-b border-ecru last:border-0 last:pb-0">
                                            <p className="font-medium text-peacock">{idx + 1}. {wp.name}</p>
                                            <p className="text-telly-blue text-xs mt-1">{wp.description}</p>
                                            <p className="text-muted-foreground text-xs mt-1 font-mono">
                                              📍 {wp.lat.toFixed(6)}, {wp.lon.toFixed(6)}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Knowledge Base */}
                                {trip.knowledgeBase && (
                                  <div>
                                    <h3 className="font-semibold text-offblack flex items-center gap-2 mb-3">
                                      <Book className="w-4 h-4 text-apricot" />
                                      Knowledge Base (Gemini AI)
                                    </h3>
                                    <Accordion type="single" collapsible className="bg-paper-white-alt rounded-lg">
                                      {Object.entries(trip.knowledgeBase).map(([key, value]) => (
                                        <AccordionItem key={key} value={key} className="border-ecru px-4">
                                          <AccordionTrigger className="hover:no-underline">
                                            <span className="font-medium text-peacock capitalize text-left">
                                              {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                          </AccordionTrigger>
                                          <AccordionContent>
                                            <div className="text-offblack text-sm max-h-64 overflow-y-auto pr-2 scrollbar-thin prose prose-sm max-w-none prose-headings:text-peacock prose-headings:font-bold prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-strong:text-offblack prose-strong:font-bold">
                                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {value}
                                              </ReactMarkdown>
                                            </div>
                                          </AccordionContent>
                                        </AccordionItem>
                                      ))}
                                    </Accordion>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTrip} onOpenChange={(open) => !open && setDeletingTrip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingTrip?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingTrip(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteTrip}
              className="bg-terra-cotta hover:bg-boysenberry"
            >
              Delete Trip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

