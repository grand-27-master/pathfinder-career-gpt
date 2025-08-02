import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory: ConversationMessage[];
  role: string;
  resumeUrl?: string;
}

// Helper function to extract text content from resume URL
async function extractResumeContent(resumeUrl: string): Promise<string> {
  try {
    const response = await fetch(resumeUrl);
    if (!response.ok) return '';
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/plain')) {
      return await response.text();
    }
    
    // For other file types, return a placeholder
    // In a real implementation, you'd use a PDF/DOC parser
    return `Resume content from ${resumeUrl} (file parsing not implemented - user should provide text version)`;
  } catch (error) {
    console.error('Error extracting resume content:', error);
    return '';
  }
}

// Extract keywords from resume content
function extractKeywords(content: string): string[] {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 
    'Kubernetes', 'Git', 'Agile', 'Scrum', 'TypeScript', 'Vue.js', 'Angular',
    'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API', 'Microservices',
    'Machine Learning', 'Data Analysis', 'Project Management', 'Leadership',
    'Communication', 'Problem Solving', 'Team Collaboration', 'HTML', 'CSS',
    'C++', 'C#', '.NET', 'Spring', 'Django', 'Flask', 'Express', 'Laravel'
  ];
  
  return commonSkills.filter(skill => 
    content.toLowerCase().includes(skill.toLowerCase())
  );
}

// Enhanced fallback response generator with resume awareness
function generateFallbackResponse(
  message: string, 
  conversationHistory: ConversationMessage[], 
  role: string, 
  resumeContent?: string
): string {
  const messageCount = conversationHistory.length;
  const lowerMessage = message.toLowerCase();
  
  // If we have resume content, use it to generate personalized questions
  if (resumeContent && resumeContent.length > 50) {
    const resumeKeywords = extractKeywords(resumeContent);
    
    // First few questions based on resume
    if (messageCount <= 2) {
      if (resumeKeywords.length > 0) {
        return `Great introduction! I can see from your resume that you have experience with ${resumeKeywords.slice(0, 2).join(' and ')}. Can you tell me about a specific project where you used these technologies and what challenges you faced?`;
      }
    }
    
    if (messageCount <= 4 && resumeKeywords.length > 0) {
      const technologies = resumeKeywords.filter(k => 
        ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker'].some(tech => 
          k.toLowerCase().includes(tech)
        )
      );
      
      if (technologies.length > 0) {
        return `I notice you have experience with ${technologies[0]}. Can you walk me through how you would approach a complex problem using this technology? What's your problem-solving process?`;
      }
    }
    
    if (messageCount <= 6) {
      return `Based on your background, how do you stay current with industry trends and continue learning? Can you give me an example of a recent skill you've developed that's mentioned in your resume?`;
    }
  }
  
  // Role-specific questions
  const interviewQuestions = {
    'software developer': [
      "Tell me about a challenging project you've worked on and how you solved it.",
      "How do you approach debugging when you encounter an error you've never seen before?",
      "What's your experience with version control systems like Git?",
      "Can you explain the difference between let, const, and var in JavaScript?",
      "How do you ensure your code is maintainable and readable?",
      "What testing frameworks have you used, and why do you think testing is important?"
    ],
    'software engineer': [
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
    'marketing manager': [
      "How do you measure the ROI of a marketing campaign?",
      "Tell me about a time when a campaign didn't perform as expected. What did you do?",
      "How do you stay updated with the latest marketing trends and technologies?",
      "Describe your experience with customer segmentation and targeting.",
      "How do you collaborate with sales teams to align on lead generation goals?"
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
  
  // Context-aware responses based on user message
  if (lowerMessage.includes('hello') || lowerMessage.includes('introduction') || lowerMessage.includes('myself')) {
    const resumeContext = resumeContent ? " I've also had a chance to review your resume." : "";
    return `Thank you for that introduction!${resumeContext} It's great to learn about your background. Now, let's dive deeper into your experience. ${questions[Math.floor(Math.random() * questions.length)]}`;
  }
  
  if (lowerMessage.includes('project') || lowerMessage.includes('experience') || lowerMessage.includes('work')) {
    return `That's interesting! I'd like to understand more about your technical approach. ${questions[Math.floor(Math.random() * questions.length)]}`;
  }
  
  if (lowerMessage.includes('challenge') || lowerMessage.includes('problem') || lowerMessage.includes('difficult')) {
    return `Good example of problem-solving! Let me ask you about another aspect of your skills. ${questions[Math.floor(Math.random() * questions.length)]}`;
  }
  
  // Wrap up questions for longer conversations
  if (messageCount > 8) {
    return `Thank you for sharing that. ${questions[Math.floor(Math.random() * questions.length)]} As we wrap up, is there anything specific about this role or our company that you'd like to know more about?`;
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
    const { message, conversationHistory = [], role, resumeUrl }: RequestBody = await req.json();

    console.log('Received interview request:', { 
      message, 
      role, 
      historyLength: conversationHistory.length,
      hasResume: !!resumeUrl 
    });
    
    // Extract resume content if provided
    let resumeContent = '';
    if (resumeUrl) {
      resumeContent = await extractResumeContent(resumeUrl);
      console.log('Resume content extracted:', resumeContent.substring(0, 200) + '...');
    }
    
    // Generate response using enhanced fallback method
    const aiResponse = generateFallbackResponse(
      message, 
      conversationHistory, 
      role || 'Software Developer',
      resumeContent
    );

    console.log('Generated response:', aiResponse);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true,
      resumeAnalyzed: !!resumeContent
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