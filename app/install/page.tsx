'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Globe,
  Flag,
  Target,
  Download,
  CheckCircle,
  PartyPopper,
  Settings,
  AlertTriangle,
  Info,
  Key,
  Clock,
  BookOpen,
  ArrowLeft,
  Search,
  BarChart3,
  RefreshCw,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface InstallStep {
  id: string;
  title: string;
  status: 'pending' | 'complete' | 'error';
}

export default function InstallPage() {
  const [windowAiExists, setWindowAiExists] = useState<boolean | null>(null);
  const [installSteps, setInstallSteps] = useState<InstallStep[]>([
    { id: 'browser', title: 'Install Chrome Dev', status: 'pending' },
    { id: 'flags', title: 'Enable Chrome Flags', status: 'pending' },
    { id: 'register', title: 'Register Component', status: 'pending' },
    { id: 'download', title: 'Download Gemini Nano', status: 'pending' },
    { id: 'verify', title: 'Verify Installation', status: 'pending' },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTests, setShowTests] = useState(false);
  const [chromeVersion, setChromeVersion] = useState<string>('Unknown');
  const [chromeChannel, setChromeChannel] = useState<string>('Unknown');

  useEffect(() => {
    // Set browser info on client-side only
    const version = navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    setChromeVersion(version);

    const userAgent = navigator.userAgent.toLowerCase();
    let channel = '❌ Stable (NOT supported)';
    if (userAgent.includes('canary')) {
      channel = '✅ Canary';
    } else if (userAgent.includes('dev')) {
      channel = '✅ Dev';
    }
    setChromeChannel(channel);

    checkChromeAI();
  }, []);

  const checkChromeAI = () => {
    // @ts-ignore
    const hasLanguageModel = typeof LanguageModel !== 'undefined';
    // @ts-ignore
    const hasWriter = typeof Writer !== 'undefined';

    const anyApiExists = hasLanguageModel || hasWriter;
    setWindowAiExists(anyApiExists);

    if (anyApiExists) {
      setInstallSteps(prev => prev.map(step => ({ ...step, status: 'complete' })));
      setCurrentStep(5);
      setShowTests(true);
    } else {
      checkInstallProgress();
    }
  };

  const checkInstallProgress = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isDevOrCanary = userAgent.includes('dev') || userAgent.includes('canary');
    const chromeVersion = parseInt(navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || '0');

    if (isDevOrCanary && chromeVersion >= 128) {
      updateStepStatus('browser', 'complete');
      setCurrentStep(1);
    }
  };

  const updateStepStatus = (stepId: string, status: 'pending' | 'complete' | 'error') => {
    setInstallSteps(prev =>
      prev.map(step => (step.id === stepId ? { ...step, status } : step))
    );
  };

  const StepIndicator = ({ step, index }: { step: InstallStep; index: number }) => (
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${
          step.status === 'complete'
            ? 'bg-true-turquoise text-white border-true-turquoise'
            : step.status === 'error'
            ? 'bg-terra-cotta text-white border-terra-cotta'
            : index === currentStep
            ? 'bg-peacock text-white border-peacock animate-pulse'
            : 'bg-paper-white border-ecru-dark text-offblack/40'
        }`}
      >
        {step.status === 'complete' ? '✓' : index + 1}
      </div>
      <div>
        <p
          className={`font-semibold ${
            step.status === 'complete'
              ? 'text-true-turquoise'
              : index === currentStep
              ? 'text-peacock'
              : 'text-offblack/40'
          }`}
        >
          {step.title}
        </p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-paper-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="text-peacock hover:text-true-turquoise text-sm mb-4 inline-flex items-center gap-2 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-offblack mb-2">
              Chrome AI Installation
            </h1>
            <p className="text-telly-blue">
              Step-by-step guide to enable Gemini Nano and Chrome AI APIs
            </p>
          </div>

          {/* Status Banner */}
          {windowAiExists ? (
            <Card className="mb-6 bg-true-turquoise/10 border-true-turquoise/30">
              <CardHeader>
                <CardTitle className="text-true-turquoise flex items-center gap-2">
                  <PartyPopper className="w-6 h-6 fill-true-turquoise" />
                  All Set!
                </CardTitle>
                <CardDescription className="text-peacock">
                  Chrome Built-in AI is fully installed and ready to use.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowTests(!showTests)}
                  variant="default"
                  size="sm"
                >
                  {showTests ? 'Hide' : 'Show'} Details
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 bg-apricot/10 border-apricot/30">
              <CardHeader>
                <CardTitle className="text-terra-cotta flex items-center gap-2">
                  <Settings className="w-6 h-6 fill-terra-cotta" />
                  Setup Required
                </CardTitle>
                <CardDescription className="text-telly-blue">
                  Follow the steps below to install Chrome Built-in AI
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Progress Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Installation Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {installSteps.map((step, index) => (
                  <StepIndicator key={step.id} step={step} index={index} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Browser */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-peacock" />
                Step 1: Install Chrome Dev
              </CardTitle>
              <CardDescription>
                Chrome Built-in AI requires Chrome Dev channel (version 128+)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-sky/30 border border-true-turquoise/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-peacock mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Your Browser:
                </p>
                <div className="space-y-1 text-xs text-telly-blue">
                  <p>• Version: Chrome {chromeVersion}</p>
                  <p>• Channel: {chromeChannel}</p>
                </div>
              </div>

              <div className="bg-paper-white-alt rounded-lg p-4 border border-ecru-dark">
                <p className="text-sm font-semibold text-offblack mb-2">Why Chrome Dev?</p>
                <ul className="text-xs text-telly-blue space-y-1">
                  <li>• <strong>Chrome Stable (130):</strong> ❌ AI component doesn't register reliably</li>
                  <li>• <strong>Chrome Canary (132):</strong> ⚠️ Too unstable, updates daily</li>
                  <li>• <strong>Chrome Dev (131):</strong> ✅ Sweet spot - stable enough, has all APIs</li>
                </ul>
              </div>

              <Button asChild className="w-full">
                <a
                  href="https://www.google.com/chrome/dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Chrome Dev
                </a>
              </Button>

              <Button
                onClick={() => {
                  checkChromeAI();
                  if (
                    navigator.userAgent.toLowerCase().includes('dev') ||
                    navigator.userAgent.toLowerCase().includes('canary')
                  ) {
                    updateStepStatus('browser', 'complete');
                    setCurrentStep(1);
                  }
                }}
                variant="secondary"
                className="w-full flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                I've installed Chrome Dev
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Enable Flags */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-6 h-6 text-peacock" />
                Step 2: Enable Chrome Flags
              </CardTitle>
              <CardDescription>
                Enable experimental AI features in Chrome
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-apricot/20 border border-terra-cotta/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-terra-cotta mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Critical: Enable ALL flags below
                </p>
                <p className="text-xs text-telly-blue">
                  Missing even one flag will cause the AI APIs to be unavailable
                </p>
              </div>

              {[
                {
                  name: 'optimization-guide-on-device-model',
                  value: 'Enabled BypassPerfRequirement',
                  note: 'Downloads Gemini Nano model',
                },
                {
                  name: 'prompt-api-for-gemini-nano-multimodal-input',
                  value: 'Enabled',
                  note: 'Main AI API (LanguageModel)',
                },
                {
                  name: 'summarization-api-for-gemini-nano',
                  value: 'Enabled',
                  note: 'Summarizer API',
                },
                {
                  name: 'writer-api',
                  value: 'Enabled',
                  note: 'Writer API',
                },
                {
                  name: 'rewriter-api',
                  value: 'Enabled',
                  note: 'Rewriter API',
                },
                {
                  name: 'proofreader-api',
                  value: 'Enabled',
                  note: 'Proofreader API',
                },
                {
                  name: 'translation-api',
                  value: 'Enabled',
                  note: 'Translator API',
                },
              ].map((flag, i) => (
                <div key={flag.name} className="bg-paper-white-alt rounded-lg p-4 border border-ecru-dark">
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-bold text-peacock">{i + 1}.</span>
                    <div className="flex-1">
                      <p className="font-mono text-sm text-peacock mb-1 break-all">
                        chrome://flags/#{flag.name}
                      </p>
                      <p className="text-xs text-telly-blue mb-2">{flag.note}</p>
                      <p className="text-xs">
                        Set to: <span className="text-true-turquoise font-semibold">{flag.value}</span>
                      </p>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(`chrome://flags/#${flag.name}`);
                          alert('Copied to clipboard! Paste in Chrome address bar.');
                        }}
                        variant="secondary"
                        size="sm"
                        className="mt-2 flex items-center gap-2"
                      >
                        <Info className="w-3 h-3" />
                        Copy URL
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-terra-cotta/10 border border-terra-cotta/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-terra-cotta mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  MUST RESTART CHROME
                </p>
                <p className="text-xs text-telly-blue">
                  After enabling all flags, click the blue "Relaunch" button at the bottom of
                  chrome://flags, or quit Chrome completely and reopen it.
                </p>
              </div>

              <Button
                onClick={() => {
                  checkChromeAI();
                  updateStepStatus('flags', 'complete');
                  setCurrentStep(2);
                }}
                variant="secondary"
                className="w-full flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                I've enabled all flags and restarted Chrome
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: Register Component */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-peacock" />
                Step 3: Force Component Registration
              </CardTitle>
              <CardDescription>
                Force Chrome to register the AI component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-boysenberry/10 border border-boysenberry/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-boysenberry mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  The Hidden Trick
                </p>
                <p className="text-xs text-telly-blue">
                  Even with flags enabled, Chrome sometimes doesn't register the AI component. This
                  console command forces it to register!
                </p>
              </div>

              <div className="bg-paper-white-alt rounded-lg p-4 border border-ecru-dark">
                <p className="text-xs text-telly-blue mb-3">
                  <strong>Step 3.1:</strong> Open DevTools
                </p>
                <ul className="text-xs text-telly-blue space-y-1 mb-4">
                  <li>• Press <kbd className="bg-ecru px-2 py-1 rounded text-offblack">F12</kbd> or <kbd className="bg-ecru px-2 py-1 rounded text-offblack">Cmd+Option+I</kbd></li>
                  <li>• Click the "Console" tab</li>
                </ul>

                <p className="text-xs text-telly-blue mb-2">
                  <strong>Step 3.2:</strong> Run this command (it will fail, that's expected!)
                </p>
                <div className="bg-offblack rounded-lg p-3 mb-2">
                  <code className="text-true-turquoise text-sm">await window.ai.createTextSession()</code>
                </div>
                <p className="text-xs text-terra-cotta italic mb-3">
                  Expected error: "Cannot read properties of undefined"
                  <br />
                  <strong>This is GOOD!</strong> The error forces Chrome to register the component.
                </p>

                <Button
                  onClick={() => {
                    navigator.clipboard.writeText('await window.ai.createTextSession()');
                    alert('Copied! Paste in DevTools Console and press Enter.');
                  }}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Info className="w-3 h-3" />
                  Copy Command
                </Button>
              </div>

              <div className="bg-apricot/20 border border-terra-cotta/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-terra-cotta mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  After running the command:
                </p>
                <ol className="text-xs text-telly-blue space-y-1 ml-4">
                  <li>1. Close Chrome COMPLETELY (quit, don't just close tab)</li>
                  <li>2. Check Task Manager to ensure no Chrome processes</li>
                  <li>3. Reopen Chrome Dev</li>
                  <li>4. Come back to this page</li>
                </ol>
              </div>

              <Button
                onClick={() => {
                  checkChromeAI();
                  updateStepStatus('register', 'complete');
                  setCurrentStep(3);
                }}
                variant="secondary"
                className="w-full flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                I've run the command and restarted Chrome
              </Button>
            </CardContent>
          </Card>

          {/* Step 4: Download Model */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-6 h-6 text-peacock" />
                Step 4: Download Gemini Nano
              </CardTitle>
              <CardDescription>
                Check download status and install the ~1.7GB AI model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-sky/30 border border-true-turquoise/20 rounded-lg p-4">
                <p className="text-sm font-semibold text-peacock mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Step 4.1: Check Component Status
                </p>
                <p className="text-xs text-telly-blue mb-2">Open this in a new tab:</p>
                <Button
                  onClick={() => window.open('chrome://components/', '_blank')}
                  size="sm"
                  className="mb-3 flex items-center gap-2"
                >
                  <Globe className="w-3 h-3" />
                  Open chrome://components/
                </Button>
                <p className="text-xs text-telly-blue">
                  Look for: <strong className="text-offblack">"Optimization Guide On Device Model"</strong>
                </p>
              </div>

              <div className="bg-boysenberry/10 border border-boysenberry/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-boysenberry mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Step 4.2: Check Internal Status
                </p>
                <Button
                  onClick={() => window.open('chrome://on-device-internals/', '_blank')}
                  size="sm"
                  variant="secondary"
                  className="mb-3 flex items-center gap-2"
                >
                  <Globe className="w-3 h-3" />
                  Open chrome://on-device-internals/
                </Button>
                <p className="text-xs text-telly-blue mb-2">Look for "Foundational model state":</p>
                <ul className="text-xs text-telly-blue space-y-2">
                  <li>
                    • <strong className="text-terra-cotta">"Install Not Complete"</strong>: Model is downloading
                  </li>
                  <li>
                    • <strong className="text-true-turquoise">"Ready"</strong>: ✅ Model installed!
                  </li>
                </ul>
              </div>

              <div className="bg-apricot/20 border border-terra-cotta/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-terra-cotta mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  While Downloading...
                </p>
                <ul className="text-xs text-telly-blue space-y-1">
                  <li>• Model size: ~1.7 GB</li>
                  <li>• Time: 5-15 minutes (depending on connection)</li>
                  <li>• Keep Chrome open and connected to internet</li>
                </ul>
              </div>

              <Button
                onClick={() => {
                  checkChromeAI();
                  updateStepStatus('download', 'complete');
                  setCurrentStep(4);
                }}
                variant="secondary"
                className="w-full flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Model shows "Ready" in chrome://on-device-internals
              </Button>
            </CardContent>
          </Card>

          {/* Step 5: Verify */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-peacock" />
                Step 5: Verify Installation
              </CardTitle>
              <CardDescription>Test that the API works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-true-turquoise/10 border border-true-turquoise/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-true-turquoise mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Test the NEW API syntax
                </p>
                <p className="text-xs text-telly-blue">
                  The APIs are now direct globals (LanguageModel, Writer, etc.), NOT under window.ai!
                </p>
              </div>

              <Button
                onClick={() => {
                  checkChromeAI();
                  if (windowAiExists) {
                    updateStepStatus('verify', 'complete');
                    setCurrentStep(5);
                    setShowTests(true);
                  } else {
                    alert(
                      'APIs still not available. Make sure:\n1. Model status is "Ready"\n2. You restarted Chrome completely'
                    );
                  }
                }}
                className="w-full flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Check if APIs are Available
              </Button>
            </CardContent>
          </Card>

          {/* Tests Section */}
          {showTests && (
            <Card className="mb-6 bg-true-turquoise/10 border-true-turquoise/30">
              <CardHeader>
                <CardTitle className="text-true-turquoise flex items-center gap-2">
                  <PartyPopper className="w-6 h-6 fill-true-turquoise" />
                  Installation Complete!
                </CardTitle>
                <CardDescription>
                  All APIs are available! You can now start your trail session.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/trail">
                    Start Trail Session
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Troubleshooting */}
          <Card className="mb-6 bg-terra-cotta/10 border-terra-cotta/30">
            <CardHeader>
              <CardTitle className="text-terra-cotta flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <details className="bg-paper-white-alt rounded-lg p-3 border border-ecru-dark">
                <summary className="cursor-pointer font-semibold text-offblack text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-terra-cotta" />
                  "LanguageModel is not defined"
                </summary>
                <div className="mt-2 text-xs text-telly-blue space-y-1 ml-4">
                  <p>• Make sure you're in Chrome Dev (not Stable)</p>
                  <p>• Double-check ALL flags are enabled</p>
                  <p>• Did you restart Chrome after enabling flags?</p>
                  <p>• Try the component registration trick again</p>
                </div>
              </details>

              <details className="bg-paper-white-alt rounded-lg p-3 border border-ecru-dark">
                <summary className="cursor-pointer font-semibold text-offblack text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-terra-cotta" />
                  Component shows "0.0.0.0"
                </summary>
                <div className="mt-2 text-xs text-telly-blue space-y-1 ml-4">
                  <p>• Click "Check for update" button</p>
                  <p>• Wait for version to change to 2025.x.x.xxxx</p>
                  <p>• Check chrome://on-device-internals</p>
                </div>
              </details>

              <details className="bg-paper-white-alt rounded-lg p-3 border border-ecru-dark">
                <summary className="cursor-pointer font-semibold text-offblack text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-terra-cotta" />
                  Model shows "Ready" but APIs undefined
                </summary>
                <div className="mt-2 text-xs text-telly-blue space-y-1 ml-4">
                  <p>• Close Chrome COMPLETELY</p>
                  <p>• Check Task Manager (no Chrome processes)</p>
                  <p>• Reopen Chrome Dev</p>
                </div>
              </details>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-peacock flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <a
                href="https://developer.chrome.com/docs/ai/built-in-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-peacock hover:text-true-turquoise underline"
              >
                → Official Chrome AI Documentation
              </a>
              <a
                href="https://www.google.com/chrome/dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-peacock hover:text-true-turquoise underline"
              >
                → Download Chrome Dev
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
