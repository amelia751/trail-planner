import { NextRequest, NextResponse } from 'next/server';
import { generateHybridTripData } from '@/lib/google-maps';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startPoint, endPoint, purpose, difficulty, isRoundTrip } = body;

    if (!startPoint || !endPoint || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields: startPoint, endPoint, purpose' },
        { status: 400 }
      );
    }

    console.log('🎯 HYBRID: Generating trip data with Google Maps + Gemini...');
    console.log('  Route:', { startPoint, endPoint, purpose, difficulty, isRoundTrip });

    const tripData = await generateHybridTripData({
      startPoint,
      endPoint,
      purpose,
      difficulty: difficulty || 'moderate',
      isRoundTrip: isRoundTrip || false,
    });

    console.log('✅ Hybrid trip data generated successfully!');

    return NextResponse.json({ tripData });
  } catch (error) {
    console.error('❌ Error generating trip data:', error);
    return NextResponse.json(
      { error: 'Failed to generate trip data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

