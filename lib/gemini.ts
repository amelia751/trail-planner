// Real Gemini API integration for backend (server-side)
// Uses Firebase Admin SDK with service account

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with API key or service account
function getGeminiClient() {
  // Try environment variable first
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

export async function generateTripData(params: {
  startPoint: string;
  endPoint: string;
  purpose: string;
  difficulty: string;
  isRoundTrip?: boolean;
}): Promise<{
  route: {
    gpsPath: Array<{ lat: number; lon: number; altitude?: number }>;
    landmarks: Array<{
      name: string;
      lat: number;
      lon: number;
      description: string;
      type: string;
    }>;
    distance: number;
    elevationGain: number;
  };
  knowledgeBase: {
    firstAid: string;
    plantIdentification: string;
    wildlifeInfo: string;
    navigationTips: string;
    emergencyContacts: string;
  };
}> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Generate comprehensive trip data for an offline trail navigation app.

TRIP REQUEST:
- Start Point: ${params.startPoint}
- End Point: ${params.endPoint}
- Purpose: ${params.purpose}
- Difficulty: ${params.difficulty}
- Round Trip: ${params.isRoundTrip ? 'Yes (return to start)' : 'No (one-way)'}

Generate a realistic GPS route with landmarks and complete knowledge base for offline use.

Return ONLY valid JSON in this exact format:
{
  "route": {
    "gpsPath": [
      {"lat": 39.9526, "lon": -75.1652, "altitude": 10},
      {"lat": 39.9530, "lon": -75.1655, "altitude": 12}
      // ... 20-30 waypoints along the route
    ],
    "landmarks": [
      {
        "name": "Starting Point Name",
        "lat": 39.9526,
        "lon": -75.1652,
        "description": "Brief description",
        "type": "start"
      },
      {
        "name": "Notable Landmark",
        "lat": 39.9550,
        "lon": -75.1700,
        "description": "What makes this notable",
        "type": "poi"
      }
      // ... 5-10 landmarks along route
    ],
    "distance": 8.5,
    "elevationGain": 45
  },
  "knowledgeBase": {
    "firstAid": "# First Aid Guide\\n\\nActivity-specific first aid for ${params.purpose}...\\n\\n**Common Injuries:**\\n- Sprains/strains\\n- Blisters\\n- Dehydration\\n\\n**Emergency:** 911",
    "plantIdentification": "# Local Plants\\n\\nPlants specific to the region between ${params.startPoint} and ${params.endPoint}...\\n\\n**Edible:**\\n**Poisonous:**",
    "wildlifeInfo": "# Wildlife Information\\n\\nAnimals you might encounter along this route...\\n\\n**Safety Tips:**",
    "navigationTips": "# Navigation Guide\\n\\nRoute from ${params.startPoint} to ${params.endPoint}...\\n\\n**Key Waypoints:**\\n**Trail Conditions:**",
    "emergencyContacts": "# Emergency Contacts\\n\\n**Emergency:** 911\\n**Nearby Hospitals:**\\n**Park Rangers:**"
  }
}

IMPORTANT:
- GPS coordinates must be realistic for the region between start and end points
- Include 20-30 waypoints in gpsPath for smooth route
- Include 5-10 notable landmarks along the route
- Knowledge base should be markdown formatted and location-specific
- Include real emergency numbers for the region
- Navigation tips should reference the specific route landmarks`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Extract JSON from response
  let jsonText = response.trim();
  
  // Remove markdown code blocks if present
  if (jsonText.includes('```')) {
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
  }
  
  // Extract JSON object
  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(jsonText);
}

export async function chatWithGemini(params: {
  message: string;
  context?: string;
  image?: string; // base64
  conversationHistory?: Array<{ role: string; content: string }>;
}): Promise<string> {
  const genAI = getGeminiClient();
  
  // Use vision model if image is provided (gemini-2.0-flash supports multimodal)
  const modelName = 'gemini-2.0-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

  let prompt = params.context ? `${params.context}\n\n` : '';
  
  // Add conversation history
  if (params.conversationHistory && params.conversationHistory.length > 0) {
    prompt += 'CONVERSATION HISTORY:\n';
    params.conversationHistory.forEach(msg => {
      prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
    });
    prompt += '\n';
  }
  
  prompt += `USER: ${params.message}\n\nASSISTANT:`;

  // If image is provided, use multimodal generation
  if (params.image) {
    // Convert base64 to part
    const imagePart = {
      inlineData: {
        data: params.image.split(',')[1] || params.image, // Remove data:image/jpeg;base64, prefix if present
        mimeType: 'image/jpeg',
      },
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    return result.response.text();
  } else {
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

