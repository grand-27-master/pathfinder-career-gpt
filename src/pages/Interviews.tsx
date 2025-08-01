import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import RoleSelector from '@/components/Interview/RoleSelector';
import ResumeUpload from '@/components/ResumeUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const Interviews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize Speech APIs
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        addMessage('user', transcript);
        setIsListening(false);
        await getAIResponse(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not process your speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const getAIResponse = async (userMessage: string) => {
    setIsProcessing(true);
    
    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('realtime-interview', {
        body: {
          message: userMessage,
          conversationHistory,
          role: selectedRole,
          resumeUrl: resumeUrl || null
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.response) {
        addMessage('ai', data.response);
        await speakText(data.response);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "AI Response Error",
        description: "Failed to get response from AI interviewer",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        resolve();
      };

      synthRef.current.speak(utterance);
    });
  };

  const startInterview = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose the position you're interviewing for",
        variant: "destructive",
      });
      return;
    }

    setInterviewStarted(true);
    setInterviewStartTime(new Date());
    
    // Start with AI greeting
    const greeting = `Hello! I'm your AI interviewer today. I'll be conducting a mock interview for the ${selectedRole} position. Let's begin with an introduction - please tell me about yourself and why you're interested in this role.`;
    
    addMessage('ai', greeting);
    await speakText(greeting);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition",
        variant: "destructive",
      });
      return;
    }

    if (isSpeaking) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
    }

    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const saveInterview = async () => {
    if (!user || !interviewStartTime) return;

    const duration = Math.floor((new Date().getTime() - interviewStartTime.getTime()) / 1000);
    const transcript = messages.map(msg => `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n\n');

    try {
      const { error } = await supabase
        .from('interviews')
        .insert({
          user_id: user.id,
          role: selectedRole,
          transcript,
          duration_seconds: duration,
          resume_url: resumeUrl || null
        });

      if (error) throw error;

      toast({
        title: "Interview Saved",
        description: "Your interview has been saved to your profile.",
      });
    } catch (error: any) {
      console.error('Error saving interview:', error);
      toast({
        title: "Error saving interview",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const endInterview = async () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Save interview if user is logged in
    if (user && messages.length > 0) {
      await saveInterview();
    }
    
    setInterviewStarted(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setMessages([]);
    setInterviewStartTime(null);
    
    toast({
      title: "Interview Ended",
      description: "Great job! Practice makes perfect.",
    });
  };

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto py-4 px-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Mock Interview Setup</h1>
              <div className="w-20"></div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl">Interview Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RoleSelector onRoleSelect={setSelectedRole} />
                  
                  {selectedRole && (
                    <div className="text-center space-y-4">
                      <p className="text-gray-600 text-sm sm:text-base">
                        Selected Role: <span className="font-semibold text-indigo-600">{selectedRole}</span>
                      </p>
                      <Button
                        onClick={startInterview}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3"
                        disabled={isProcessing}
                      >
                        Begin Audio Interview
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <ResumeUpload 
                onResumeUploaded={setResumeUrl}
                currentResume={resumeUrl}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                {isSpeaking ? (
                  <Volume2 className="h-4 w-4 text-white animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {selectedRole} Interview
                </h1>
                <p className="text-sm text-gray-600">
                  {isSpeaking ? 'AI is speaking...' : isProcessing ? 'Processing...' : 'Ready for your response'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={endInterview}
              className="text-red-600 hover:text-red-700"
            >
              End Interview
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-600 py-8">
                    <p>Interview is starting... The AI interviewer will speak to you shortly.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <div className="flex justify-center items-center space-x-4">
              {!isListening ? (
                <Button
                  onClick={startListening}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full"
                  disabled={isSpeaking || isProcessing}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Speaking
                </Button>
              ) : (
                <Button
                  onClick={stopListening}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full animate-pulse"
                >
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Recording
                </Button>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              {isSpeaking 
                ? 'AI is speaking...' 
                : isProcessing
                ? 'Processing your response...'
                : isListening 
                ? 'Listening to your response...' 
                : 'Click to speak your answer'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interviews;