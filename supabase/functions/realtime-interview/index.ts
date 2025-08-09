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
  
  // Enforce resume-driven questioning only
  const hasResume = !!resumeContent && resumeContent.length > 50;
  if (!hasResume) {
    return "To begin, please upload your resume. I ask questions strictly based on your resume content to keep this interview personalized.";
  }

  // Build a resume-based fallback if earlier branches didn't return
  const resumeAnalysis = analyzeResume(resumeContent);
  const { skills = [], projects = [], companies = [], jobTitles = [], experience = [], achievements = [] } = resumeAnalysis as any;

  // Light defaults by interview type, always grounded in resume
  if (interviewType === 'technical') {
    if (skills.length > 0) {
      const s = skills[0];
      return `Let's focus on your ${s} experience from your resume. Can you walk me through a challenging problem you solved using ${s}, including trade-offs and outcomes?`;
    }
    if (projects.length > 0) {
      return `From your resume project "${projects[0]}", what was the hardest technical issue you encountered and how did you resolve it?`;
    }
  } else if (interviewType === 'behavioral') {
    if (achievements.length > 0) {
      return `You noted "${achievements[0]}" in your resume. Tell me the situation, actions you took, and the impact.`;
    }
    if (companies.length > 0) {
      return `At ${companies[0]}, describe a time you faced a setback and how you handled it.`;
    }
  } else if (interviewType === 'system-design') {
    if (skills.some(s => ['AWS','GCP','Azure','Kubernetes','Docker'].includes(s))) {
      return `Based on your cloud/devops experience, design a highly available service for processing user uploads. Discuss scaling, data storage, and fault tolerance.`;
    }
    if (projects.length > 0) {
      return `Using lessons from "${projects[0]}", outline the high-level architecture if you had to rebuild it for 10x traffic.`;
    }
  } else if (interviewType === 'screening' || interviewType === 'cultural-fit') {
    if (jobTitles.length > 0) {
      return `As a ${jobTitles[0]} noted in your resume, what kind of team environment helps you do your best work?`;
    }
    if (experience.length > 0) {
      return `You mention ${experience[0]}. What initially drew you to this field and what keeps you motivated?`;
    }
  }

  // Generic resume-grounded fallback
  if (skills.length >= 2) {
    return `Given your resume highlights in ${skills.slice(0,2).join(' and ')}, tell me about a project where these were critical to success. What was your impact?`;
  }
  if (companies.length > 0) {
    return `From your time at ${companies[0]} on your resume, what's a specific contribution you're most proud of and why?`;
  }
  if (projects.length > 0) {
    return `Tell me more about the project "${projects[0]}" from your resume. What problem did it solve and what was your role?`;
  }

  return "I reviewed your resume, but couldn't extract enough detail. Could you upload a clearer text-based version or summarize a key project?";
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