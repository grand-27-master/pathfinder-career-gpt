import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessagesSquare, Mic, Volume2, Brain, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartInterview = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/interview');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <MessagesSquare className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">InterviewGPT</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Practice Audio Mock 
              <span className="text-indigo-600 dark:text-indigo-400"> Interviews</span> with AI
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Improve your interview skills with realistic AI-powered voice conversations. 
              Upload your resume for personalized questions and build confidence for your next interview.
            </p>
            
            <Button 
              size="lg" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg rounded-full w-full sm:w-auto"
              onClick={handleStartInterview}
            >
              Start Mock Interview
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Practice with InterviewGPT?</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI interview coach provides realistic practice sessions tailored to your resume and needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Mic className="h-8 sm:h-12 w-8 sm:w-12 text-indigo-600" />}
              title="Voice-Based Practice"
              description="Speak naturally with our AI interviewer. Practice your verbal communication and build confidence in real conversation flow."
            />
            <FeatureCard
              icon={<Brain className="h-8 sm:h-12 w-8 sm:w-12 text-purple-600" />}
              title="Resume-Based Questions"
              description="Upload your resume to get personalized questions based on your experience, skills, and the role you're targeting."
            />
            <FeatureCard
              icon={<Volume2 className="h-8 sm:h-12 w-8 sm:w-12 text-green-600" />}
              title="Instant Feedback"
              description="Receive immediate feedback on your responses, speaking pace, and areas for improvement after each session."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <StepCard
              step="1"
              title="Upload & Choose"
              description="Upload your resume and select the position you're interviewing for to get relevant questions."
            />
            <StepCard
              step="2"
              title="Start Speaking"
              description="Have a natural conversation with our AI interviewer using your voice."
            />
            <StepCard
              step="3"
              title="Get Feedback"
              description="Receive detailed feedback and tips to improve your interview performance."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-indigo-600 rounded-2xl shadow-xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Start practicing now and build the confidence you need to land your dream job.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100 px-12 py-4 text-lg rounded-full" 
              onClick={handleStartInterview}
            >
              Begin Practice Session
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-center">
        <p className="text-gray-400">© 2024 InterviewGPT. Practice makes perfect.</p>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{description}</p>
  </div>
);

interface StepCardProps {
  step: string;
  title: string;
  description: string;
}

const StepCard = ({ step, title, description }: StepCardProps) => (
  <div className="text-center">
    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-white text-lg sm:text-xl font-bold">{step}</span>
    </div>
    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{description}</p>
  </div>
);

export default Index;