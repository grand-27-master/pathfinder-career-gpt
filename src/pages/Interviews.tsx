import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessagesSquare, Send, User, Bot, Clock, Calendar, FileText } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sampleQuestions = {
  frontend: [
    "Can you explain your experience with React and how you've used it in your projects?",
    "How do you approach responsive design? What CSS frameworks do you prefer?",
    "Explain the concept of state management in frontend applications.",
    "How do you debug JavaScript issues in the browser?",
    "What's your experience with TypeScript and how has it benefited your development process?",
    "Can you explain the difference between client-side and server-side rendering?"
  ],
  backend: [
    "Tell me about your experience with server-side technologies.",
    "How do you design and implement APIs?",
    "Explain database normalization and when you might choose to denormalize data.",
    "How do you handle authentication and authorization in your backend applications?",
    "Describe your approach to error handling in a backend service.",
    "How do you ensure the scalability of your backend systems?"
  ],
  fullstack: [
    "How do you coordinate development between frontend and backend components?",
    "Explain your experience with full-stack frameworks.",
    "How do you approach database design in a full-stack application?",
    "What strategies do you use for state management across the entire application?",
    "How do you handle deployment of full-stack applications?",
    "Describe a challenging full-stack project you worked on."
  ],
  design: [
    "How do you approach the UX research process?",
    "Can you explain your design workflow from concept to implementation?",
    "How do you ensure your designs are accessible?",
    "What tools do you use in your design process?",
    "How do you collaborate with developers to implement your designs?",
    "Describe how you've used user feedback to iterate on a design."
  ]
};

const Interviews = () => {
  const [message, setMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState('simulator');
  const [isInterviewActive, setIsInterviewActive] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [interviewType, setInterviewType] = useState('frontend');
  const [questionIndex, setQuestionIndex] = useState(0);
  
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string; timestamp: string }[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your interview coach for today. We'll be conducting a mock interview for a Frontend Developer position. Are you ready to begin?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add user message
      const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages([
        ...chatMessages,
        {
          role: 'user',
          content: message,
          timestamp: userTimestamp
        }
      ]);
      
      // Clear input
      setMessage('');
      
      // Generate AI response based on user's message
      setTimeout(() => {
        let aiResponse = "";
        const questions = sampleQuestions[interviewType as keyof typeof sampleQuestions] || sampleQuestions.frontend;
        
        // If this is the beginning of the interview
        if (chatMessages.length <= 1) {
          aiResponse = "Great! Let's start with the first question:\n\n" + questions[0];
          setQuestionIndex(1);
        } 
        // If we still have questions left
        else if (questionIndex < questions.length) {
          // Provide feedback on previous answer, then ask next question
          aiResponse = `That's a thoughtful response! Here's my feedback: your answer was ${message.length > 100 ? 'detailed and thorough' : 'concise but could use more examples'}.\n\nNext question:\n${questions[questionIndex]}`;
          setQuestionIndex(questionIndex + 1);
        } 
        // If we've gone through all questions
        else {
          aiResponse = "Thank you for completing this mock interview! Overall, your responses were insightful. To improve, consider providing more specific examples from your experience and structuring your answers using the STAR method (Situation, Task, Action, Result). Would you like to try another interview type?";
        }
        
        const aiTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: aiResponse,
            timestamp: aiTimestamp
          }
        ]);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleScheduleInterview = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowScheduleDialog(false);
    
    // In a real app, this would save the interview details to a database
    toast({
      title: "Interview Scheduled",
      description: "Your mock interview has been scheduled. Check the 'Scheduled Interviews' tab for details.",
    });
    
    // Switch to the scheduled tab
    setSelectedTab('scheduled');
  };
  
  const handleEndInterview = () => {
    setIsInterviewActive(false);
    toast({
      title: "Interview Ended",
      description: "Your interview has been ended. You can view the feedback in the History tab.",
    });
  };
  
  const handleResetInterview = () => {
    setChatMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your interview coach for today. We'll be conducting a mock interview for a Frontend Developer position. Are you ready to begin?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsInterviewActive(true);
    setQuestionIndex(0);
    toast({
      title: "Interview Reset",
      description: "The interview has been reset. You can start fresh now.",
    });
  };

  const handleInterviewTypeChange = (value: string) => {
    setInterviewType(value);
    // In a real implementation, you would reset the interview or adapt questions
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mock Interviews</h1>
            <p className="text-gray-600 mt-1">Practice interviews with AI and get personalized feedback</p>
          </div>
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button 
                className="mt-4 md:mt-0 bg-careerGpt-indigo hover:bg-careerGpt-indigo/90"
              >
                <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule Mock Interview</DialogTitle>
                <DialogDescription>
                  Select a date, time, and type of interview you'd like to practice.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium col-span-1">Date</label>
                  <Input type="date" className="col-span-3" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium col-span-1">Time</label>
                  <Input type="time" className="col-span-3" defaultValue="10:00" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium col-span-1">Type</label>
                  <Select defaultValue="technical">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="mix">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium col-span-1">Position</label>
                  <Select defaultValue="frontend">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend Developer</SelectItem>
                      <SelectItem value="backend">Backend Developer</SelectItem>
                      <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                      <SelectItem value="design">UI/UX Designer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleScheduleInterview}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="simulator" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="simulator" className="text-sm sm:text-base">
              <MessagesSquare className="h-4 w-4 mr-2" /> Interview Simulator
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="text-sm sm:text-base">
              <Calendar className="h-4 w-4 mr-2" /> Scheduled Interviews
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm sm:text-base">
              <Clock className="h-4 w-4 mr-2" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simulator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle>Frontend Developer Interview</CardTitle>
                    <CardDescription>
                      Practice technical and behavioral questions for a frontend developer role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-auto p-4">
                    <div className="space-y-4">
                      {chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-careerGpt-indigo text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              {msg.role === 'assistant' ? (
                                <Bot className="h-4 w-4 mr-1" />
                              ) : (
                                <User className="h-4 w-4 mr-1" />
                              )}
                              <span className="text-xs opacity-70">{msg.timestamp}</span>
                            </div>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t">
                    <div className="flex w-full items-center space-x-2">
                      <Input
                        placeholder="Type your response..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                        disabled={!isInterviewActive}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        onClick={handleSendMessage}
                        disabled={!isInterviewActive}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Interview Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Position</h3>
                      <p className="text-gray-900">Frontend Developer</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Focus Areas</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          React
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          JavaScript
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          CSS
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Problem Solving
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Resume Used</h3>
                      <div className="flex items-center mt-1">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">Frontend_Resume.pdf</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Interview Type</h3>
                      <p className="text-gray-900">Technical & Behavioral</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button variant="outline" className="w-full" onClick={handleEndInterview} disabled={!isInterviewActive}>
                      End Interview
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={handleResetInterview}
                    >
                      Reset Interview
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scheduled">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ScheduledInterviewCard
                title="Frontend Developer Technical Interview"
                date="Apr 18, 2023"
                time="2:00 PM"
                duration="45 minutes"
                interviewType="Technical"
              />
              
              <ScheduledInterviewCard
                title="Behavioral Interview Practice"
                date="Apr 20, 2023"
                time="10:00 AM"
                duration="30 minutes"
                interviewType="Behavioral"
              />
              
              <Card className="bg-gray-50 border-dashed border-2 flex flex-col items-center justify-center py-8 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setShowScheduleDialog(true)}>
                <Calendar className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">Schedule New Interview</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <CompletedInterviewCard
                title="Software Engineer Technical Interview"
                date="Apr 10, 2023"
                duration="45 minutes"
                score={83}
                strengths={["Problem solving approach", "JavaScript knowledge", "Communication"]}
                improvements={["System design explanations", "Time management"]}
              />
              
              <CompletedInterviewCard
                title="Product Manager Case Study"
                date="Apr 5, 2023"
                duration="60 minutes"
                score={91}
                strengths={["Market analysis", "User-focused thinking", "Strategic planning"]}
                improvements={["More quantitative approach", "Competitor analysis"]}
              />
              
              <CompletedInterviewCard
                title="Full Stack Developer Interview"
                date="Mar 28, 2023"
                duration="50 minutes"
                score={78}
                strengths={["Backend knowledge", "Database design", "API design"]}
                improvements={["Frontend framework knowledge", "CSS positioning", "Responsive design"]}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

interface ScheduledInterviewCardProps {
  title: string;
  date: string;
  time: string;
  duration: string;
  interviewType: string;
}

const ScheduledInterviewCard = ({
  title,
  date,
  time,
  duration,
  interviewType,
}: ScheduledInterviewCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
      <CardDescription>
        {date} at {time} ({duration})
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Interview Type</h3>
          <div className="flex items-center mt-1">
            <span className="bg-careerGpt-indigo/10 text-careerGpt-indigo rounded px-2 py-1 text-xs font-medium">
              {interviewType}
            </span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Focus Areas</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Problem Solving
            </span>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Communication
            </span>
            {interviewType === "Technical" && (
              <>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  JavaScript
                </span>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  React
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="flex space-x-3">
      <Button className="flex-1 bg-careerGpt-indigo hover:bg-careerGpt-indigo/90">Prepare</Button>
      <Button variant="outline" className="flex-1">Reschedule</Button>
    </CardFooter>
  </Card>
);

interface CompletedInterviewCardProps {
  title: string;
  date: string;
  duration: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

const CompletedInterviewCard = ({
  title,
  date,
  duration,
  score,
  strengths,
  improvements,
}: CompletedInterviewCardProps) => (
  <Card>
    <CardHeader>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>
            {date} • {duration}
          </CardDescription>
        </div>
        <div className="mt-2 sm:mt-0">
          <div 
            className={`text-lg font-bold rounded-full h-12 w-12 flex items-center justify-center ${
              score >= 90 
                ? 'bg-green-100 text-green-800' 
                : score >= 80 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            {score}%
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Strengths</h3>
          <ul className="mt-2 space-y-1">
            {strengths.map((strength, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-green-500 mr-2">✓</span> {strength}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-900">Areas for Improvement</h3>
          <ul className="mt-2 space-y-1">
            {improvements.map((improvement, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-orange-500 mr-2">•</span> {improvement}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button className="w-full bg-careerGpt-indigo hover:bg-careerGpt-indigo/90">
        View Full Feedback
      </Button>
    </CardFooter>
  </Card>
);

export default Interviews;
