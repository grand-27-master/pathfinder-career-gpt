import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessagesSquare } from 'lucide-react';

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessagesSquare className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to InterviewGPT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Ready to practice your interview skills with AI?
          </p>
          <Button 
            onClick={() => navigate('/interview')}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Start Mock Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetStarted;