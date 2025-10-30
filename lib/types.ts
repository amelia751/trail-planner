// Type definitions for Trail app

export interface AICapabilities {
  available: boolean;
  createAvailable: boolean;
  promptAvailable: boolean;
  canCreateSession: boolean;
  promptAPI: boolean;
  summarizer: boolean;
  writer: boolean;
  rewriter: boolean;
  proofreader: boolean;
  translator: boolean;
}

export interface GPSPosition {
  lat: number;
  lon: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: number;
}

export interface Trail {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  distance: number; // km
  elevationGain: number; // meters
  coordinates: Array<{ lat: number; lon: number }>;
  waypoints: TrailWaypoint[];
}

export interface TrailWaypoint {
  id: string;
  name: string;
  description: string;
  lat: number;
  lon: number;
  altitude?: number;
  type: 'start' | 'checkpoint' | 'poi' | 'water' | 'shelter' | 'summit' | 'end';
  order: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  image?: string; // base64 image data
  gps?: GPSPosition;
  timestamp: number;
}

export interface KnowledgeBase {
  firstAid: string;
  plantIdentification: string;
  wildlifeInfo: string;
  navigationTips: string;
  emergencyContacts: string;
  [key: string]: string;
}

export interface Trip {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  purpose: string;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  distance: number;
  createdAt: number;
  updatedAt: number;
  knowledgeBase: KnowledgeBase;
  trailData: Trail;
  gpsPath: GPSPosition[];
  status: 'draft' | 'ready' | 'in-progress' | 'completed';
}

export interface TripSession {
  id: string;
  tripId: string;
  startedAt: number;
  endedAt?: number;
  currentPosition: GPSPosition;
  messages: ChatMessage[];
}
