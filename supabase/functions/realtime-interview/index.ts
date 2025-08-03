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
  interviewType: string;
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

// Enhanced resume analysis
function analyzeResume(content: string): {
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  companies: string[];
} {
  const lowerContent = content.toLowerCase();
  
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 
    'Kubernetes', 'Git', 'Agile', 'Scrum', 'TypeScript', 'Vue.js', 'Angular',
    'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API', 'Microservices',
    'Machine Learning', 'Data Analysis', 'Project Management', 'Leadership',
    'Communication', 'Problem Solving', 'Team Collaboration', 'HTML', 'CSS',
    'C++', 'C#', '.NET', 'Spring', 'Django', 'Flask', 'Express', 'Laravel',
    'Figma', 'Adobe', 'Photoshop', 'Illustrator', 'Sketch', 'InVision',
    'Firebase', 'Azure', 'GCP', 'Jenkins', 'CI/CD', 'DevOps', 'Linux'
  ];
  
  const skills = commonSkills.filter(skill => 
    lowerContent.includes(skill.toLowerCase())
  );

  // Extract experience indicators
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
    /(\d+)\+?\s*years?\s+(?:working\s+)?(?:with|in|as)/gi,
    /senior|lead|principal|manager|director|head of/gi,
    /developed|built|created|implemented|designed|architected/gi
  ];
  
  const experience = [];
  experiencePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) experience.push(...matches.slice(0, 3));
  });

  // Extract education
  const educationPatterns = [
    /bachelor|master|phd|doctorate|degree/gi,
    /university|college|institute/gi,
    /computer science|engineering|mathematics|physics|business/gi
  ];
  
  const education = [];
  educationPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) education.push(...matches.slice(0, 3));
  });

  // Extract project keywords
  const projectPatterns = [
    /project|application|system|platform|website|app/gi,
    /startup|company|team|collaboration/gi
  ];
  
  const projects = [];
  projectPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) projects.push(...matches.slice(0, 3));
  });

  // Extract company/work context
  const companyPatterns = [
    /(?:at|@)\s+([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd|Co\.?)?)/g,
    /(?:worked|employed|joined)\s+(?:at|with)\s+([A-Z][a-zA-Z\s&]+)/g
  ];
  
  const companies = [];
  companyPatterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && match[1].length > 2) companies.push(match[1].trim());
    });
  });

  return {
    skills: [...new Set(skills)],
    experience: [...new Set(experience)].slice(0, 5),
    education: [...new Set(education)].slice(0, 3),
    projects: [...new Set(projects)].slice(0, 3),
    companies: [...new Set(companies)].slice(0, 3)
  };
}

// Enhanced fallback response generator with resume awareness and interview type
function generateFallbackResponse(
  message: string, 
  conversationHistory: ConversationMessage[], 
  role: string, 
  interviewType: string,
  resumeContent?: string
): string {
  const messageCount = conversationHistory.length;
  const lowerMessage = message.toLowerCase();
  
  // If we have resume content, use it to generate deeply personalized questions
  if (resumeContent && resumeContent.length > 50) {
    const resumeAnalysis = analyzeResume(resumeContent);
    
    // Opening questions based on resume analysis
    if (messageCount <= 2) {
      if (resumeAnalysis.skills.length > 0) {
        const topSkills = resumeAnalysis.skills.slice(0, 2);
        return `Thank you for that introduction! I've reviewed your resume and noticed your experience with ${topSkills.join(' and ')}. Can you walk me through a specific project where you used ${topSkills[0]} and describe the most challenging aspect you encountered?`;
      }
      
      if (resumeAnalysis.companies.length > 0) {
        return `Great to meet you! I see from your resume that you've worked at ${resumeAnalysis.companies[0]}. Can you tell me about a significant project or achievement from your time there that you're particularly proud of?`;
      }
    }
    
    // Technical depth questions
    if (messageCount <= 4) {
      if (resumeAnalysis.skills.length > 2) {
        const techStack = resumeAnalysis.skills.slice(0, 3);
        return `That's impressive! Given your background with ${techStack.join(', ')}, how do you typically decide which technology to use when starting a new project? Can you give me an example of a technical decision you made and why?`;
      }
      
      if (resumeAnalysis.experience.length > 0 && resumeAnalysis.experience[0].includes('years')) {
        return `I notice you have ${resumeAnalysis.experience[0]} in the field. How has your approach to ${role.toLowerCase()} evolved over time? What's one thing you do differently now compared to when you started?`;
      }
    }
    
    // Experience and leadership questions
    if (messageCount <= 6) {
      if (resumeAnalysis.experience.some(exp => 
        exp.toLowerCase().includes('senior') || 
        exp.toLowerCase().includes('lead') || 
        exp.toLowerCase().includes('manager')
      )) {
        return `I see you have leadership experience. Can you describe a time when you had to mentor a junior team member or guide a team through a difficult technical challenge? What was your approach?`;
      }
      
      if (resumeAnalysis.projects.length > 0) {
        return `Based on your project experience, how do you typically approach the planning phase of a new project? What factors do you consider when estimating timelines and identifying potential risks?`;
      }
      
      if (resumeAnalysis.education.length > 0) {
        return `I notice your educational background includes ${resumeAnalysis.education[0]}. How do you apply theoretical concepts from your education to practical, real-world problems in your work?`;
      }
    }
    
    // Advanced scenario questions
    if (messageCount <= 8) {
      if (resumeAnalysis.skills.includes('AWS') || resumeAnalysis.skills.includes('Azure') || resumeAnalysis.skills.includes('GCP')) {
        return `Given your cloud experience, how would you design a scalable architecture for a high-traffic application? What considerations would you make for cost optimization and security?`;
      }
      
      if (resumeAnalysis.skills.some(skill => 
        ['React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript'].includes(skill)
      )) {
        return `With your frontend expertise, how do you approach performance optimization in web applications? Can you share a specific example where you improved application performance?`;
      }
    }
  }
  
  // Interview type specific questions
  const interviewTypeQuestions = {
    'screening': {
      'software engineer': [
        "Tell me about your background and what attracted you to software engineering.",
        "What programming languages are you most comfortable with?",
        "How do you stay updated with new technologies?",
        "What interests you about this particular role and company?",
        "Walk me through your recent projects."
      ],
      'default': [
        "Tell me about yourself and your professional background.",
        "What interests you most about this role?",
        "What are your salary expectations?",
        "Why are you looking for a new opportunity?",
        "What do you know about our company?"
      ]
    },
    'technical': {
      'software engineer': [
        "How would you optimize a slow database query?",
        "Explain the difference between REST and GraphQL APIs.",
        "How do you handle error handling in your applications?",
        "Design a system for handling user authentication.",
        "What's your approach to code reviews?",
        "How would you implement caching in a web application?"
      ],
      'data scientist': [
        "How would you handle a dataset with 90% missing values?",
        "Explain the difference between supervised and unsupervised learning.",
        "How do you prevent overfitting in machine learning models?",
        "Walk me through building a recommendation system.",
        "How do you evaluate model performance?"
      ],
      'default': [
        "Describe your most challenging technical project.",
        "How do you approach learning new technologies?",
        "What tools and technologies do you work with daily?",
        "How do you troubleshoot technical problems?"
      ]
    },
    'behavioral': {
      'software engineer': [
        "Tell me about a time you had to work with a difficult team member.",
        "Describe a situation where you had to meet a tight deadline.",
        "How do you handle conflicting priorities?",
        "Tell me about a time you made a mistake and how you handled it.",
        "Describe a time when you had to learn something completely new."
      ],
      'default': [
        "Tell me about a time you showed leadership.",
        "Describe a challenging situation and how you overcame it.",
        "How do you handle stress and pressure?",
        "Tell me about a time you had to adapt to change.",
        "Describe your ideal work environment."
      ]
    },
    'system-design': {
      'software engineer': [
        "Design a URL shortening service like bit.ly.",
        "How would you design a chat application like WhatsApp?",
        "Design a file storage system like Dropbox.",
        "How would you handle load balancing for a high-traffic website?",
        "Design a notification system for a social media platform."
      ],
      'default': [
        "How would you design a system to handle high traffic?",
        "What considerations would you make for scalability?",
        "How do you approach system architecture decisions?",
        "Describe your experience with distributed systems."
      ]
    },
    'cultural-fit': {
      'default': [
        "What values are most important to you in a workplace?",
        "How do you prefer to receive feedback?",
        "Describe your ideal team dynamic.",
        "How do you handle disagreements with colleagues?",
        "What motivates you in your work?",
        "How do you contribute to a positive team culture?"
      ]
    }
  };

  // Get questions based on interview type and role
  const typeQuestions = interviewTypeQuestions[interviewType] || interviewTypeQuestions['screening'];
  const roleKey = role.toLowerCase();
  const questions = typeQuestions[roleKey] || typeQuestions['default'] || [
    "Tell me more about your experience with this type of role.",
    "What challenges do you expect in this position?",
    "How do you approach professional development?"
  ];

  
  // Context-aware responses based on user message and interview type
  if (lowerMessage.includes('hello') || lowerMessage.includes('introduction') || lowerMessage.includes('myself')) {
    const resumeContext = resumeContent ? " I've also had a chance to review your resume." : "";
    const typeContext = interviewType === 'technical' ? " Since this is a technical interview, we'll focus on your technical skills and problem-solving abilities." :
                        interviewType === 'behavioral' ? " Since this is a behavioral interview, I'll be asking about your experiences and how you handle various situations." :
                        interviewType === 'system-design' ? " Since this is a system design interview, we'll focus on your architectural thinking and design skills." :
                        interviewType === 'cultural-fit' ? " Since this is a cultural fit interview, we'll explore how you work with teams and your values." : "";
    return `Thank you for that introduction!${resumeContext}${typeContext} Now, let's proceed with a question: ${questions[Math.floor(Math.random() * questions.length)]}`;
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
    const { message, conversationHistory = [], role, interviewType, resumeUrl }: RequestBody = await req.json();

    console.log('Received interview request:', {
      message,
      role,
      interviewType,
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
      interviewType || 'screening',
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