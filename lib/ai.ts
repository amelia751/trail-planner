// Chrome Built-in AI API helpers
// All functions run client-side using Gemini Nano

import type { AICapabilities, GPSPosition } from './types';

// SESSION POOL for parallel processing
class SessionPool {
  private sessions: any[] = [];
  private available: any[] = [];
  private creating = false;
  private poolSize = 2;

  async initialize() {
    if (this.sessions.length > 0) return;
    if (this.creating) {
      while (this.creating) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.creating = true;
    console.log(`%c🏊 Creating session pool (${this.poolSize} sessions)...`, 'color: #2d9d9b; font-weight: bold;');
    
    try {
      // @ts-ignore
      const sessionPromises = Array(this.poolSize).fill(null).map(() => 
        // @ts-ignore
        LanguageModel.create({
          language: 'en',
          temperature: 0.8,
          topK: 40,
        })
      );

      this.sessions = await Promise.all(sessionPromises);
      this.available = [...this.sessions];
      
      console.log(`%c✅ Session pool ready: ${this.sessions.length} sessions`, 'color: #2d9d9b; font-weight: bold;');
    } finally {
      this.creating = false;
    }
  }

  async acquire(): Promise<any> {
    await this.initialize();

    while (this.available.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return this.available.pop()!;
  }

  release(session: any) {
    if (this.sessions.includes(session)) {
      this.available.push(session);
    }
  }

  async destroy() {
    for (const session of this.sessions) {
      try {
        session.destroy();
      } catch (e) {
        // Ignore
      }
    }
    this.sessions = [];
    this.available = [];
  }
}

const sessionPool = new SessionPool();

export async function cleanupAISessions() {
  await sessionPool.destroy();
}

// Check which AI capabilities are available
export async function checkAICapabilities(): Promise<AICapabilities> {
  console.log('%c🔍 CHECKING CHROME BUILT-IN AI', 'background: #2d9d9b; color: white; padding: 4px 8px; font-weight: bold;');
  
  const capabilities: AICapabilities = {
    available: false,
    createAvailable: false,
    promptAvailable: false,
    canCreateSession: false,
    promptAPI: false,
    summarizer: false,
    writer: false,
    rewriter: false,
    proofreader: false,
    translator: false,
  };

  try {
    // @ts-ignore
    if (typeof LanguageModel !== 'undefined') {
      // @ts-ignore
      const status = await LanguageModel.availability();
      capabilities.promptAPI = status === 'available';
      capabilities.available = status === 'available';
      capabilities.createAvailable = status === 'available';
      capabilities.promptAvailable = status === 'available';
      capabilities.canCreateSession = status === 'available';
      console.log(`%c${capabilities.promptAPI ? '✅' : '⏳'} Prompt API: ${status}`, `color: ${capabilities.promptAPI ? '#2d9d9b' : '#fabf89'}`);
    }

    // @ts-ignore
    if (typeof Summarizer !== 'undefined') {
      // @ts-ignore
      const status = await Summarizer.availability();
      capabilities.summarizer = status === 'available';
      console.log(`%c${capabilities.summarizer ? '✅' : '⏳'} Summarizer API: ${status}`, `color: ${capabilities.summarizer ? '#2d9d9b' : '#fabf89'}`);
    }

    // @ts-ignore
    if (typeof Writer !== 'undefined') {
      // @ts-ignore
      const status = await Writer.availability();
      capabilities.writer = status === 'available';
      console.log(`%c${capabilities.writer ? '✅' : '⏳'} Writer API: ${status}`, `color: ${capabilities.writer ? '#2d9d9b' : '#fabf89'}`);
    }

    // @ts-ignore
    if (typeof Rewriter !== 'undefined') {
      // @ts-ignore
      const status = await Rewriter.availability();
      capabilities.rewriter = status === 'available';
      console.log(`%c${capabilities.rewriter ? '✅' : '⏳'} Rewriter API: ${status}`, `color: ${capabilities.rewriter ? '#2d9d9b' : '#fabf89'}`);
    }

    // @ts-ignore
    if (typeof Proofreader !== 'undefined') {
      // @ts-ignore
      const status = await Proofreader.availability();
      capabilities.proofreader = status === 'available';
      console.log(`%c${capabilities.proofreader ? '✅' : '⏳'} Proofreader API: ${status}`, `color: ${capabilities.proofreader ? '#2d9d9b' : '#fabf89'}`);
    }

    // @ts-ignore
    if (typeof Translator !== 'undefined') {
      try {
        // @ts-ignore
        const status = await Translator.availability({
          sourceLanguage: 'en',
          targetLanguage: 'es'
        });
        capabilities.translator = status === 'available';
        console.log(`%c${capabilities.translator ? '✅' : '⏳'} Translator API: ${status}`, `color: ${capabilities.translator ? '#2d9d9b' : '#fabf89'}`);
      } catch (e) {
        capabilities.translator = false;
      }
    }
  } catch (error) {
    console.error('❌ Error checking AI capabilities:', error);
  }

  return capabilities;
}

// Prompt API - chat with context (multimodal support)
export async function chatWithAI(params: {
  message: string;
  context?: string;
  image?: string; // base64 image data
  gps?: GPSPosition;
}): Promise<string> {
  let session: any = null;
  
  try {
    session = await sessionPool.acquire();

    let prompt = params.context ? `${params.context}\n\n` : '';
    
    if (params.gps) {
      prompt += `CURRENT LOCATION: Latitude ${params.gps.lat.toFixed(6)}, Longitude ${params.gps.lon.toFixed(6)}`;
      if (params.gps.altitude) {
        prompt += `, Elevation ${Math.round(params.gps.altitude)}m`;
      }
      prompt += '\n\n';
    }
    
    prompt += `USER: ${params.message}\n\nASSISTANT:`;

    // If image is provided, use multimodal prompt (when supported)
    let result: string;
    if (params.image) {
      // @ts-ignore - Multimodal support
      result = await session.prompt(prompt, {
        image: params.image
      });
    } else {
      result = await session.prompt(prompt);
    }
    
    sessionPool.release(session);
    return result.trim();
  } catch (error) {
    if (session) {
      sessionPool.release(session);
    }
    throw new Error(`Chrome AI failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Summarizer API
export async function summarizeText(text: string): Promise<string> {
  try {
    // @ts-ignore
    const summarizer = await Summarizer.create({
      type: 'key-points',
      format: 'plain-text',
      length: 'short',
      language: 'en',
    });

    const summary = await summarizer.summarize(text);
    summarizer.destroy();
    return summary;
  } catch (error) {
    console.error('Summarizer API unavailable:', error);
    // Fallback: return first 300 chars
    return text.slice(0, 300) + (text.length > 300 ? '...' : '');
  }
}

// Writer API
export async function writeContent(prompt: string): Promise<string> {
  try {
    // @ts-ignore
    const writer = await Writer.create({
      tone: 'neutral',
      length: 'medium',
      language: 'en',
    });

    const result = await writer.write(prompt);
    writer.destroy();
    return result;
  } catch (error) {
    throw new Error('Writer API unavailable');
  }
}

// Rewriter API
export async function rewriteContent(text: string): Promise<string> {
  try {
    // @ts-ignore
    const rewriter = await Rewriter.create({
      tone: 'as-is',
      length: 'as-is',
      language: 'en',
    });

    const result = await rewriter.rewrite(text);
    rewriter.destroy();
    return result;
  } catch (error) {
    throw new Error('Rewriter API unavailable');
  }
}

// Proofreader API
export async function proofreadContent(text: string): Promise<string> {
  try {
    // @ts-ignore
    const proofreader = await Proofreader.create({
      language: 'en',
    });
    const result = await proofreader.proofread(text);
    proofreader.destroy();
    return result;
  } catch (error) {
    throw new Error('Proofreader API unavailable');
  }
}

