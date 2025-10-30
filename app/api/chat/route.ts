import { NextRequest, NextResponse } from 'next/server';
import { chatWithGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, image, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Missing required field: message' },
        { status: 400 }
      );
    }

    console.log('Chat request:', { 
      message: message.substring(0, 100), 
      hasContext: !!context,
      hasImage: !!image,
      historyLength: conversationHistory?.length || 0
    });

    const response = await chatWithGemini({
      message,
      context,
      image,
      conversationHistory,
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Chat failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

