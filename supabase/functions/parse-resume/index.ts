import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseBody {
  resumeUrl?: string;
  rawContent?: string;
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
      // PDF detected - leave parsing to client-side when possible
      console.log('PDF detected - expecting rawContent from client for accurate parsing.');
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
  // Normalize content for robust matching
  const normalized = content
    .replace(/[\u2010-\u2015]/g, '-') // dashes
    .replace(/[·•]/g, ' ')
    .replace(/\s+/g, ' ');

  // Robust skill detection using regex patterns with common variations
  const skillPatterns: Record<string, RegExp> = {
    'JavaScript': /\b(java\s*script|javascript|js(?!on))\b/i,
    'TypeScript': /\b(type\s*script|typescript|ts(?!ql))\b/i,
    'Python': /\bpython\b/i,
    'Java': /\bjava\b/i,
    'React': /\breact(\.js)?\b/i,
    'Node.js': /\bnode(\.js)?|nodejs\b/i,
    'SQL': /\bsql\b/i,
    'PostgreSQL': /\b(postgres|postgresql)\b/i,
    'MongoDB': /\bmongo\s*db|mongodb\b/i,
    'GraphQL': /\bgraphql\b/i,
    'REST API': /\brest(ful)?\s*api\b/i,
    'AWS': /\baws|amazon\s+web\s+services\b/i,
    'Azure': /\bazure\b/i,
    'GCP': /\b(gcp|google\s+cloud)\b/i,
    'Docker': /\bdocker\b/i,
    'Kubernetes': /\bk8s|kubernetes\b/i,
    'Git': /\bgit\b/i,
    'Linux': /\blinux\b/i,
    'CI/CD': /\bci\s*\/\s*cd|continuous\s+integration|continuous\s+delivery\b/i,
    'Jenkins': /\bjenkins\b/i,
    'TensorFlow': /\btensor\s*flow|tensorflow\b/i,
    'PyTorch': /\bpytorch\b/i,
    'Pandas': /\bpandas\b/i,
    'NumPy': /\bnumpy\b/i,
    'Scikit-learn': /\bscikit\s*-?learn|sklearn\b/i,
    'HTML': /\bhtml\b/i,
    'CSS': /\bcss\b/i,
    'C++': /\bc\+\+\b/i,
    'C#': /\bc#|csharp\b/i,
    '.NET': /\b\.net|dotnet\b/i,
    'Django': /\bdjango\b/i,
    'Flask': /\bflask\b/i,
    'Express': /\bexpress(\.js)?\b/i,
    'Spring': /\bspring\b/i,
    'Firebase': /\bfirebase\b/i,
    'Redis': /\bredis\b/i,
    'Jira': /\bjira\b/i,
    'Tableau': /\btableau\b/i,
  };

  const skills = Object.entries(skillPatterns)
    .filter(([_, rx]) => rx.test(normalized))
    .map(([name]) => name);

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
    const { resumeUrl, rawContent }: ParseBody = await req.json();
    console.log('parse-resume called with', { resumeUrl, hasRawContent: !!rawContent });

    if (!resumeUrl && !rawContent) {
      return new Response(JSON.stringify({ success: false, error: 'Missing resumeUrl or rawContent' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = (rawContent && rawContent.trim().length > 0)
      ? rawContent
      : (resumeUrl ? await extractResumeContent(resumeUrl) : '');

    const analysis = content ? analyzeResume(content) : {
      skills: [], experience: [], education: [], projects: [], companies: [], jobTitles: [], achievements: []
    };

    // Infer a likely role from the parsed analysis
    function inferRole(): { role: string; confidence: number } {
      const s = new Set(analysis.skills || []);
      const titles = (analysis.jobTitles || []).map(t => t.toLowerCase());

      const has = (arr: string[]) => arr.some(x => s.has(x));

      // Title-based direct mapping first
      const titleMap: Array<{ rx: RegExp; role: string }> = [
        { rx: /(product)\s+manager/i, role: 'Product Manager' },
        { rx: /(project)\s+manager/i, role: 'Project Manager' },
        { rx: /(data)\s+(scientist|analyst)/i, role: 'Data Scientist' },
        { rx: /(ml|machine\s+learning)/i, role: 'Machine Learning Engineer' },
        { rx: /(devops|site\s+reliability|sre)/i, role: 'DevOps Engineer' },
        { rx: /(frontend|ui)\s+(engineer|developer)/i, role: 'Frontend Engineer' },
        { rx: /(backend)\s+(engineer|developer)/i, role: 'Backend Engineer' },
        { rx: /(full\s*stack)/i, role: 'Full Stack Developer' },
        { rx: /(ux|ui)\s+designer/i, role: 'UX Designer' }
      ];
      for (const t of analysis.jobTitles || []) {
        for (const m of titleMap) {
          if (m.rx.test(t)) return { role: m.role, confidence: 0.95 };
        }
      }

      // Skill-based heuristics
      if (has(['TensorFlow','PyTorch','Pandas','NumPy','Scikit-learn'])) return { role: 'Data Scientist', confidence: 0.85 };
      if (has(['AWS','Kubernetes','Docker','CI/CD'])) return { role: 'DevOps Engineer', confidence: 0.8 };
      if (has(['React']) && has(['Node.js'])) return { role: 'Full Stack Developer', confidence: 0.8 };
      if (has(['React','HTML','CSS','TypeScript','JavaScript'])) return { role: 'Frontend Engineer', confidence: 0.75 };
      if (has(['Java','SQL','PostgreSQL','MongoDB','Express','Django','Flask'])) return { role: 'Backend Engineer', confidence: 0.75 };
      if (has(['Tableau','Power BI','SQL'])) return { role: 'Data Analyst', confidence: 0.7 };

      return { role: 'Software Engineer', confidence: 0.6 };
    }

    const inferred = inferRole();

    const summaryParts: string[] = [];
    if (analysis.skills.length) summaryParts.push(`${analysis.skills.length} skills`);
    if (analysis.companies.length) summaryParts.push(`${analysis.companies.length} companies`);
    if (analysis.projects.length) summaryParts.push(`${analysis.projects.length} projects`);
    const summary = summaryParts.length ? `Parsed ${summaryParts.join(', ')} from your resume. Detected role: ${inferred.role}.` : 'Parsed your resume but found limited structured information.';

    return new Response(
      JSON.stringify({ success: true, analysis, rawLength: content.length, summary, detectedRole: inferred.role, roleConfidence: inferred.confidence }),
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
