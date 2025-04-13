import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileUp, BriefcaseBusiness, MessagesSquare, Check } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
    toast({
      title: "Welcome to CareerGPT!",
      description: "You're now ready to start your career journey.",
    });
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Your AI Career Mentor for Job Success
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Upload your resume, get personalized job matches, and ace your interviews with AI-powered coaching.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="bg-careerGpt-indigo hover:bg-careerGpt-indigo/90" onClick={handleGetStarted}>
                  Get Started
                </Button>
                <Button size="lg" variant="outline" onClick={handleLearnMore}>
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600"
                alt="Person using laptop for job search"
                className="rounded-lg shadow-xl w-full h-auto object-cover"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How CareerGPT Helps Your Career</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform analyzes your skills and experience to provide personalized career guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<FileUp className="h-10 w-10 text-careerGpt-indigo" />}
              title="Resume Analysis"
              description="Upload your resume and get AI-powered insights on how to improve it for better job matches."
            />
            <FeatureCard
              icon={<BriefcaseBusiness className="h-10 w-10 text-careerGpt-purple" />}
              title="Job Matching"
              description="Receive personalized job suggestions based on your skills, experience, and career goals."
            />
            <FeatureCard
              icon={<MessagesSquare className="h-10 w-10 text-careerGpt-orange" />}
              title="Mock Interviews"
              description="Practice with AI-simulated interviews tailored to your target roles and get instant feedback."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from professionals who advanced their careers with CareerGPT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah J."
              role="Software Engineer"
              testimonial="CareerGPT helped me identify the gaps in my resume and prepare for technical interviews. I landed my dream job at a top tech company!"
            />
            <TestimonialCard
              name="Michael T."
              role="Marketing Director"
              testimonial="The job matching algorithm is spot on! It recommended positions I hadn't considered but were perfect for my skill set."
            />
            <TestimonialCard
              name="Priya N."
              role="Data Scientist"
              testimonial="The mock interviews were incredibly realistic. The feedback helped me refine my answers and build confidence for the real thing."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-careerGpt-indigo rounded-xl shadow-xl p-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals using CareerGPT to find better jobs and advance their careers.
            </p>
            <Button size="lg" className="bg-white text-careerGpt-indigo hover:bg-gray-100" onClick={handleGetStarted}>
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="career-card flex flex-col items-center text-center">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

interface TestimonialCardProps {
  name: string;
  role: string;
  testimonial: string;
}

const TestimonialCard = ({ name, role, testimonial }: TestimonialCardProps) => (
  <div className="career-card">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-careerGpt-indigo/10 rounded-full flex items-center justify-center mr-4">
        <Check className="h-6 w-6 text-careerGpt-indigo" />
      </div>
      <div>
        <h4 className="font-semibold">{name}</h4>
        <p className="text-gray-600 text-sm">{role}</p>
      </div>
    </div>
    <p className="text-gray-700 italic">{testimonial}</p>
  </div>
);

export default Index;
