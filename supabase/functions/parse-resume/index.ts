import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseBody {
  resumeUrl: string;
}

async function extractResumeContent(resumeUrl: string): Promise<string> {
  try {
    const response = await fetch(resumeUrl);
    if (!response.ok) {
      console.error(`Failed to fetch resume: ${response.status} ${response.statusText}`);
      return '';
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/plain') || contentType.includes('text/')) {
      return await response.text();
    }
    if (contentType.includes('application/pdf')) {
      console.log('PDF detected - cannot parse reliably without OCR.');
      return '';
    }
    return await response.text();
  } catch (e) {
    console.error('Error extracting resume content:', e);
    return '';
  }
}

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
    'JavaScript','Python','Java','React','Node.js','SQL','AWS','Docker','Kubernetes','Git','Agile','Scrum','TypeScript','Vue.js','Angular','MongoDB','PostgreSQL','Redis','GraphQL','REST API','Microservices','Machine Learning','Data Analysis','Project Management','Leadership','Communication','Problem Solving','Team Collaboration','HTML','CSS','C++','C#','.NET','Spring','Django','Flask','Express','Laravel','Figma','Adobe','Photoshop','Illustrator','Sketch','InVision','Firebase','Azure','GCP','Jenkins','CI/CD','DevOps','Linux','TensorFlow','PyTorch','Pandas','NumPy','Scikit-learn','Tableau','Power BI','Salesforce','Jira','Confluence','Slack','Teams'
  ];
  const skills = commonSkills.filter(s => lowerContent.includes(s.toLowerCase()));

  const experiencePatterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
    /(\d+)\+?\s*years?\s+(?:working\s+)?(?:with|in|as)/gi,
    /(\d+)\+?\s*year\s+(?:of\s+)?experience/gi
  ];
  const experience: string[] = [];
  experiencePatterns.forEach(p => {
    const matches = content.match(p);
    if (matches) experience.push(...matches.slice(0,3));
  });

  const jobTitlePatterns = [
    /(?:senior|lead|principal|staff|manager|director|head of|chief)\s+\w+/gi,
    /(?:software|frontend|backend|full stack|data|machine learning|devops|cloud)\s+(?:engineer|developer|scientist|analyst)/gi,
    /(?:product|project)\s+manager/gi,
    /(?:ui|ux)\s+designer/gi
  ];
  const jobTitles: string[] = [];
  jobTitlePatterns.forEach(p => {
    const matches = content.match(p);
    if (matches) jobTitles.push(...matches.slice(0,3));
  });

  const educationPatterns = [
    /(?:bachelor|master|phd|doctorate|b\.?s\.?|m\.?s\.?|ph\.?d\.?)\s+(?:in|of)?\s*([a-z\s]+)/gi,
    /(?:university|college|institute)\s+of\s+([a-z\s]+)/gi,
    /computer science|software engineering|electrical engineering|mathematics|physics|business/gi
  ];
  const education: string[] = [];
  educationPatterns.forEach(p => {
    const matches = content.match(p);
    if (matches) education.push(...matches.slice(0,3));
  });

  const projectPatterns = [
    /(?:built|developed|created|designed|implemented|architected)\s+(?:a|an)?\s*([a-z\s]+(?:application|system|platform|website|app|service|api))/gi,
    /(?:led|managed|coordinated)\s+(?:a|the)?\s*([a-z\s]+(?:project|initiative|team|development))/gi
  ];
  const projects: string[] = [];
  projectPatterns.forEach(p => {
    const matches = [...content.matchAll(p)];
    matches.forEach(m => { if (m[1] && m[1].length > 3) projects.push(m[1].trim()); });
  });

  const companyPatterns = [
    /(?:at|@)\s+([A-Z][a-zA-Z0-9\s&\.]+(?:Inc|LLC|Corp|Ltd|Co\.?|Technologies|Systems|Solutions|Group)?)/g,
    /(?:worked|employed|joined)\s+(?:at|with)\s+([A-Z][a-zA-Z0-9\s&\.]+)/g
  ];
  const companies: string[] = [];
  companyPatterns.forEach(p => {
    const matches = [...content.matchAll(p)];
    matches.forEach(m => { if (m[1] && m[1].length > 2 && m[1].length < 50) companies.push(m[1].trim()); });
  });

  const achievementPatterns = [
    /(?:increased|improved|reduced|optimized|enhanced)\s+([^\.]+)/gi,
    /(?:\d+%|\$\d+|x\d+|\d+\s*(?:users|customers|revenue|performance|efficiency))/gi,
    /(?:award|recognition|certification|promoted|achieved)/gi
  ];
  const achievements: string[] = [];
  achievementPatterns.forEach(p => {
    const matches = content.match(p);
    if (matches) achievements.push(...matches.slice(0,3));
  });

  return {
    skills: [...new Set(skills)],
    experience: [...new Set(experience)].slice(0,5),
    education: [...new Set(education)].slice(0,3),
    projects: [...new Set(projects)].slice(0,5),
    companies: [...new Set(companies)].slice(0,3),
    jobTitles: [...new Set(jobTitles)].slice(0,3),
    achievements: [...new Set(achievements)].slice(0,3)
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeUrl }: ParseBody = await req.json();
    console.log('parse-resume called with', { resumeUrl });

    if (!resumeUrl) {
      return new Response(JSON.stringify({ success: false, error: 'Missing resumeUrl' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = await extractResumeContent(resumeUrl);
    const analysis = content ? analyzeResume(content) : {
      skills: [], experience: [], education: [], projects: [], companies: [], jobTitles: [], achievements: []
    };

    const summaryParts: string[] = [];
    if (analysis.skills.length) summaryParts.push(`${analysis.skills.length} skills`);
    if (analysis.companies.length) summaryParts.push(`${analysis.companies.length} companies`);
    if (analysis.projects.length) summaryParts.push(`${analysis.projects.length} projects`);
    const summary = summaryParts.length ? `Parsed ${summaryParts.join(', ')} from your resume.` : 'Parsed your resume but found limited structured information.';

    return new Response(
      JSON.stringify({ success: true, analysis, rawLength: content.length, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in parse-resume function:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to parse resume' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
