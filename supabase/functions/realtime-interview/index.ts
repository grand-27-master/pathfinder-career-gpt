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
    if (!response.ok) {
      console.error(`Failed to fetch resume: ${response.status} ${response.statusText}`);
      return '';
    }
    
    const contentType = response.headers.get('content-type') || '';
    console.log(`Resume content type: ${contentType}`);
    
    if (contentType.includes('text/plain') || contentType.includes('text/')) {
      const content = await response.text();
      console.log(`Extracted text content length: ${content.length}`);
      return content;
    }
    
    if (contentType.includes('application/pdf')) {
      // For PDFs, we'll need the user to upload as text for now
      console.log('PDF detected - user should upload text version');
      return '';
    }
    
    // Try to extract as text anyway
    const content = await response.text();
    console.log(`Fallback text extraction length: ${content.length}`);
    return content;
  } catch (error) {
    console.error('Error extracting resume content:', error);
    return '';
  }
}

// Enhanced resume analysis with better parsing
function analyzeResume(content: string): {
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  companies: string[];
  jobTitles: string[];
  achievements: string[];
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
    'Firebase', 'Azure', 'GCP', 'Jenkins', 'CI/CD', 'DevOps', 'Linux',
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Tableau',
    'Power BI', 'Salesforce', 'Jira', 'Confluence', 'Slack', 'Teams'
  ];
  
  const skills = commonSkills.filter(skill => 
    lowerContent.includes(skill.toLowerCase())
  );

  // Extract years of experience
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
    /(\d+)\+?\s*years?\s+(?:working\s+)?(?:with|in|as)/gi,
    /(\d+)\+?\s*year\s+(?:of\s+)?experience/gi
  ];
  
  const experience = [];
  experiencePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) experience.push(...matches.slice(0, 3));
  });

  // Extract job titles and seniority
  const jobTitlePatterns = [
    /(?:senior|lead|principal|staff|manager|director|head of|chief)\s+\w+/gi,
    /(?:software|frontend|backend|full stack|data|machine learning|devops|cloud)\s+(?:engineer|developer|scientist|analyst)/gi,
    /(?:product|project)\s+manager/gi,
    /(?:ui|ux)\s+designer/gi
  ];
  
  const jobTitles = [];
  jobTitlePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) jobTitles.push(...matches.slice(0, 3));
  });

  // Extract education
  const educationPatterns = [
    /(?:bachelor|master|phd|doctorate|b\.?s\.?|m\.?s\.?|ph\.?d\.?)\s+(?:in|of)?\s*([a-z\s]+)/gi,
    /(?:university|college|institute)\s+of\s+([a-z\s]+)/gi,
    /computer science|software engineering|electrical engineering|mathematics|physics|business/gi
  ];
  
  const education = [];
  educationPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) education.push(...matches.slice(0, 3));
  });

  // Extract specific project details
  const projectPatterns = [
    /(?:built|developed|created|designed|implemented|architected)\s+(?:a|an)?\s*([a-z\s]+(?:application|system|platform|website|app|service|api))/gi,
    /(?:led|managed|coordinated)\s+(?:a|the)?\s*([a-z\s]+(?:project|initiative|team|development))/gi
  ];
  
  const projects = [];
  projectPatterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && match[1].length > 3) projects.push(match[1].trim());
    });
  });

  // Extract company names more accurately
  const companyPatterns = [
    /(?:at|@)\s+([A-Z][a-zA-Z0-9\s&\.]+(?:Inc|LLC|Corp|Ltd|Co\.?|Technologies|Systems|Solutions|Group)?)/g,
    /(?:worked|employed|joined)\s+(?:at|with)\s+([A-Z][a-zA-Z0-9\s&\.]+)/g
  ];
  
  const companies = [];
  companyPatterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && match[1].length > 2 && match[1].length < 50) {
        companies.push(match[1].trim());
      }
    });
  });

  // Extract achievements and metrics
  const achievementPatterns = [
    /(?:increased|improved|reduced|optimized|enhanced)\s+([^.]+)/gi,
    /(?:\d+%|\$\d+|x\d+|\d+\s*(?:users|customers|revenue|performance|efficiency))/gi,
    /(?:award|recognition|certification|promoted|achieved)/gi
  ];
  
  const achievements = [];
  achievementPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) achievements.push(...matches.slice(0, 3));
  });

  return {
    skills: [...new Set(skills)],
    experience: [...new Set(experience)].slice(0, 5),
    education: [...new Set(education)].slice(0, 3),
    projects: [...new Set(projects)].slice(0, 5),
    companies: [...new Set(companies)].slice(0, 3),
    jobTitles: [...new Set(jobTitles)].slice(0, 3),
    achievements: [...new Set(achievements)].slice(0, 3)
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
    console.log('Resume analysis results:', resumeAnalysis);
    
    // Interview type-specific resume-based questions
    if (interviewType === 'technical') {
      // Technical questions based on resume
      if (messageCount <= 2 && resumeAnalysis.skills.length > 0) {
        const primarySkill = resumeAnalysis.skills[0];
        const questions = {
          'JavaScript': `I see you have JavaScript experience. Can you explain the difference between let, const, and var? When would you use each one?`,
          'React': `I notice you work with React. How would you optimize a React component that's re-rendering too frequently?`,
          'Python': `You have Python on your resume. Can you explain the difference between a list and a tuple, and when you'd use each?`,
          'AWS': `I see AWS experience. How would you design a fault-tolerant system using AWS services?`,
          'SQL': `You mention SQL experience. How would you optimize a slow database query?`,
          'Node.js': `I see Node.js experience. How do you handle error management in asynchronous Node.js code?`
        };
        return questions[primarySkill] || `I see you have ${primarySkill} experience. Can you walk me through how you would architect a scalable system using this technology?`;
      }
      
      if (messageCount <= 4 && resumeAnalysis.projects.length > 0) {
        return `I noticed you worked on ${resumeAnalysis.projects[0]}. What was the most technically challenging part of this project, and how did you solve it?`;
      }
      
      if (messageCount <= 6 && resumeAnalysis.skills.length > 2) {
        const techStack = resumeAnalysis.skills.slice(0, 3);
        return `Given your experience with ${techStack.join(', ')}, how would you approach integrating these technologies in a microservices architecture?`;
      }
    }
    
    if (interviewType === 'behavioral') {
      // Behavioral questions based on resume
      if (messageCount <= 2 && resumeAnalysis.jobTitles.length > 0) {
        const title = resumeAnalysis.jobTitles[0];
        return `I see you've worked as a ${title}. Can you tell me about a time when you had to handle a difficult situation with a team member or stakeholder?`;
      }
      
      if (messageCount <= 4 && resumeAnalysis.achievements.length > 0) {
        return `I noticed your achievement: "${resumeAnalysis.achievements[0]}". Can you walk me through the steps you took to accomplish this and what challenges you faced?`;
      }
      
      if (messageCount <= 6 && resumeAnalysis.companies.length > 0) {
        return `During your time at ${resumeAnalysis.companies[0]}, can you describe a situation where you had to adapt to a significant change or challenge?`;
      }
    }
    
    if (interviewType === 'system-design') {
      // System design questions based on resume
      if (messageCount <= 2 && resumeAnalysis.skills.length > 0) {
        const hasBackend = resumeAnalysis.skills.some(s => ['Node.js', 'Python', 'Java', 'SQL'].includes(s));
        const hasFrontend = resumeAnalysis.skills.some(s => ['React', 'Vue.js', 'Angular', 'JavaScript'].includes(s));
        
        if (hasBackend && hasFrontend) {
          return `Given your full-stack experience, how would you design a real-time chat application that needs to support 100,000 concurrent users?`;
        } else if (hasBackend) {
          return `With your backend experience, how would you design an API that can handle 10,000 requests per second?`;
        } else if (hasFrontend) {
          return `Given your frontend expertise, how would you design a dashboard that displays real-time data from multiple sources?`;
        }
      }
      
      if (messageCount <= 4 && resumeAnalysis.skills.includes('AWS')) {
        return `I see you have AWS experience. How would you design a serverless architecture for a file processing system?`;
      }
    }
    
    if (interviewType === 'screening') {
      // Screening questions based on resume
      if (messageCount <= 2 && resumeAnalysis.experience.length > 0) {
        const expMatch = resumeAnalysis.experience[0].match(/(\d+)\+?\s*years?/);
        const years = expMatch ? expMatch[1] : 'several';
        return `I see you have ${years} years of experience. What initially drew you to this field, and what keeps you motivated?`;
      }
      
      if (messageCount <= 4 && resumeAnalysis.companies.length > 1) {
        return `You've worked at ${resumeAnalysis.companies.slice(0, 2).join(' and ')}. What motivated you to make these career transitions?`;
      }
    }
    
    // General resume-based questions for any interview type
    if (messageCount <= 3 && resumeAnalysis.skills.length > 0) {
      const topSkills = resumeAnalysis.skills.slice(0, 2);
      return `I've reviewed your resume and noticed your experience with ${topSkills.join(' and ')}. Can you walk me through a specific project where you used these technologies and describe the impact you made?`;
    }
    
    if (messageCount <= 5 && resumeAnalysis.companies.length > 0) {
      return `I see from your resume that you've worked at ${resumeAnalysis.companies[0]}. Can you tell me about a significant project or achievement from your time there that you're particularly proud of?`;
    }
    
    if (messageCount <= 7 && resumeAnalysis.jobTitles.length > 0) {
      const isLeadership = resumeAnalysis.jobTitles.some(title => 
        title.toLowerCase().includes('senior') || 
        title.toLowerCase().includes('lead') || 
        title.toLowerCase().includes('manager')
      );
      
      if (isLeadership) {
        return `I see you have leadership experience as a ${resumeAnalysis.jobTitles[0]}. Can you describe a time when you had to mentor someone or guide a team through a difficult technical challenge?`;
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