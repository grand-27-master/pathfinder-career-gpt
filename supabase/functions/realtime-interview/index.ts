import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple fallback response generator for reliable interviews
function generateFallbackResponse(message: string, role: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Interview questions based on role and conversation flow
  const interviewQuestions = {
    'software developer': [
      "Tell me about a challenging project you've worked on and how you solved it.",
      "How do you approach debugging when you encounter an error you've never seen before?",
      "What's your experience with version control systems like Git?",
      "Can you explain the difference between let, const, and var in JavaScript?",
      "How do you ensure your code is maintainable and readable?",
      "What testing frameworks have you used, and why do you think testing is important?"
    ],
    'data scientist': [
      "Walk me through your process for approaching a new data analysis project.",
      "How do you handle missing or dirty data in your datasets?",
      "What's your experience with machine learning algorithms?",
      "Can you explain the bias-variance tradeoff?",
      "How do you validate the performance of your models?",
      "What tools do you use for data visualization?"
    ],
    'product manager': [
      "How do you prioritize features when you have limited resources?",
      "Tell me about a time you had to make a decision with incomplete information.",
      "How do you gather and incorporate user feedback into product decisions?",
      "What's your approach to working with cross-functional teams?",
      "How do you measure the success of a product feature?",
      "Describe your experience with agile methodologies."
    ],
    'default': [
      "Tell me about yourself and your professional background.",
      "What interests you most about this role?",
      "How do you handle working under pressure?",
      "Describe a time when you had to learn something new quickly.",
      "What are your greatest strengths and how do they apply to this role?",
      "Where do you see yourself in five years?"
    ]
  };

  // Get questions for the role
  const roleKey = role.toLowerCase();
  const questions = interviewQuestions[roleKey] || interviewQuestions['default'];
  
  // If it's an introduction or greeting
  if (lowerMessage.includes('hello') || lowerMessage.includes('introduction') || lowerMessage.includes('myself')) {
    return `Thank you for that introduction! It's great to learn about your background. Now, let's dive deeper into your experience. ${questions[Math.floor(Math.random() * questions.length)]}`;
  }
  
  // If they're talking about experience or projects
  if (lowerMessage.includes('project') || lowerMessage.includes('experience') || lowerMessage.includes('work')) {
    return `That's interesting! I'd like to understand more about your technical approach. ${questions[Math.floor(Math.random() * questions.length)]}`;
  }
  
  // If they're talking about challenges or problems
  if (lowerMessage.includes('challenge') || lowerMessage.includes('problem') || lowerMessage.includes('difficult')) {
    return `Good example of problem-solving! Let me ask you about another aspect of your skills. ${questions[Math.floor(Math.random() * questions.length)]}`;
  }
  
  // Default follow-up
  return `Thank you for sharing that. Let me ask you another question to better understand your capabilities. ${questions[Math.floor(Math.random() * questions.length)]}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], role } = await req.json();

    console.log('Received interview request:', { message, role, historyLength: conversationHistory.length });
    
    // Generate response using fallback method (reliable and fast)
    const aiResponse = generateFallbackResponse(message, role || 'Software Developer');

    console.log('Generated response:', aiResponse);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in interview function:', error);
    
    // Even if there's an error, provide a basic response
    const fallbackResponse = "I apologize for the technical difficulty. Let me ask you this: Can you tell me about a recent project you've worked on and what technologies you used?";
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});