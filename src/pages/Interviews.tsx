import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import RoleSelector from '@/components/Interview/RoleSelector';
import { AudioRecorder, encodeAudioForAPI, AudioQueue } from '@/utils/audioUtils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const Interviews = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [interviewStarted, setInterviewStarted] = useState(false);
  
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new AudioContext();
    audioQueueRef.current = new AudioQueue(audioContextRef.current);

    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
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

  const startInterview = async () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose the position you're interviewing for",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Initialize WebSocket connection to your edge function
      const wsUrl = `wss://${window.location.hostname.includes('localhost') 
        ? 'localhost:54321' 
        : window.location.hostname.replace('.lovableproject.com', '')}.functions.supabase.co/functions/v1/realtime-interview`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsProcessing(false);
        setInterviewStarted(true);
        
        // Send initial session configuration after connection
        setTimeout(() => {
          const sessionConfig = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: `You are an AI interviewer conducting a mock interview for a ${selectedRole} position. Ask relevant questions for this role, provide helpful feedback, and maintain a professional yet friendly tone. Start with a greeting and your first question.`,
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: 'inf'
            }
          };
          
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(sessionConfig));
          }
        }, 1000);
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data.type, data);

        switch (data.type) {
          case 'session.created':
            console.log('Session created');
            break;
            
          case 'session.updated':
            console.log('Session updated, starting conversation');
            // After session is updated, send initial greeting request
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'response.create' }));
            }
            break;
            
          case 'response.audio.delta':
            if (audioQueueRef.current && data.delta) {
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await audioQueueRef.current.addToQueue(bytes);
            }
            setIsAIResponding(true);
            break;
            
          case 'response.audio.done':
            setIsAIResponding(false);
            break;
            
          case 'response.audio_transcript.delta':
            if (data.delta) {
              // Update or add AI message with transcript
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.type === 'ai') {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: lastMessage.content + data.delta }
                  ];
                } else {
                  return [...prev, {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: data.delta,
                    timestamp: new Date()
                  }];
                }
              });
            }
            break;
            
          case 'input_audio_buffer.speech_started':
            console.log('User started speaking');
            break;
            
          case 'input_audio_buffer.speech_stopped':
            console.log('User stopped speaking');
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'response.create' }));
            }
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsProcessing(false);
        toast({
          title: "Connection Error",
          description: "Failed to connect to interview service",
          variant: "destructive",
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setInterviewStarted(false);
        setIsRecording(false);
        setIsAIResponding(false);
        setIsProcessing(false);
      };

    } catch (error) {
      console.error('Error starting interview:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to start interview session",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      audioRecorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await audioRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Speak your answer to the interviewer",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const endInterview = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
    }
    
    setInterviewStarted(false);
    setIsRecording(false);
    setIsAIResponding(false);
    setMessages([]);
    
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
                <span>Back to Home</span>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Mock Interview Setup</h1>
              <div></div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Start Your Mock Interview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RoleSelector onRoleSelect={setSelectedRole} />
                
                {selectedRole && (
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Selected Role: <span className="font-semibold text-indigo-600">{selectedRole}</span>
                    </p>
                    <Button
                      onClick={startInterview}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting Interview...
                        </>
                      ) : (
                        'Begin Audio Interview'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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
                {isAIResponding ? (
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
                  {isAIResponding ? 'AI is speaking...' : 'Ready for your response'}
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
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full"
                  disabled={isAIResponding}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Speaking
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full animate-pulse"
                >
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Recording
                </Button>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              {isAIResponding 
                ? 'AI is responding...' 
                : isRecording 
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