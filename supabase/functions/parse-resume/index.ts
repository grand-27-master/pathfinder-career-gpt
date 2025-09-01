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
  console.log('Analyzing resume content length:', content.length);
  
  // Early return if content is too short
  if (!content || content.trim().length < 20) {
    console.log('Content too short for analysis');
    return { skills: [], experience: [], education: [], projects: [], companies: [], jobTitles: [], achievements: [] };
  }

  const lowerContent = content.toLowerCase();
  // Normalize content for robust matching
  const normalized = content
    .replace(/[\u2010-\u2015]/g, '-') // normalize dashes
    .replace(/[·•]/g, ' ') // replace bullets with spaces
    .replace(/\s+/g, ' ') // normalize whitespace
    .trim();

  console.log('Normalized content preview:', normalized.substring(0, 300));

  // Enhanced skill detection with more comprehensive patterns
  const skillPatterns: Record<string, RegExp[]> = {
    'JavaScript': [/\b(java\s*script|javascript|js(?!\w))\b/gi, /\bnode\s*js\b/gi],
    'TypeScript': [/\b(type\s*script|typescript|ts(?!ql))\b/gi],
    'Python': [/\bpython\b/gi, /\bdjango\b/gi, /\bflask\b/gi, /\bfastapi\b/gi],
    'Java': [/\bjava(?!\s*script)\b/gi, /\bspring\b/gi],
    'React': [/\breact(\.js)?\b/gi, /\bnext\.js\b/gi, /\bgatsby\b/gi],
    'Vue.js': [/\bvue(\.js)?\b/gi, /\bnuxt\b/gi],
    'Angular': [/\bangular\b/gi],
    'Node.js': [/\bnode(\.js)?|nodejs\b/gi, /\bexpress(\.js)?\b/gi],
    'SQL': [/\bsql\b/gi, /\bmysql\b/gi, /\bsqlite\b/gi],
    'PostgreSQL': [/\b(postgres|postgresql|psql)\b/gi],
    'MongoDB': [/\bmongo\s*db|mongodb\b/gi, /\bmongoose\b/gi],
    'GraphQL': [/\bgraphql\b/gi, /\bapollo\b/gi],
    'REST API': [/\brest(ful)?\s*api\b/gi, /\bapi\s*development\b/gi],
    'AWS': [/\baws|amazon\s+web\s+services\b/gi, /\bec2\b/gi, /\bs3\b/gi, /\blambda\b/gi],
    'Azure': [/\bazure\b/gi, /\bmicrosoft\s+azure\b/gi],
    'GCP': [/\b(gcp|google\s+cloud)\b/gi],
    'Docker': [/\bdocker\b/gi, /\bcontainer\b/gi],
    'Kubernetes': [/\bk8s|kubernetes\b/gi, /\bhelm\b/gi],
    'Git': [/\bgit\b/gi, /\bgithub\b/gi, /\bgitlab\b/gi],
    'Linux': [/\blinux\b/gi, /\bunix\b/gi, /\bubuntu\b/gi],
    'CI/CD': [/\bci\s*\/\s*cd|continuous\s+integration|continuous\s+delivery\b/gi],
    'Jenkins': [/\bjenkins\b/gi],
    'TensorFlow': [/\btensor\s*flow|tensorflow\b/gi],
    'PyTorch': [/\bpytorch\b/gi],
    'Pandas': [/\bpandas\b/gi],
    'NumPy': [/\bnumpy\b/gi],
    'Scikit-learn': [/\bscikit\s*-?learn|sklearn\b/gi],
    'HTML': [/\bhtml\b/gi, /\bhtml5\b/gi],
    'CSS': [/\bcss\b/gi, /\bcss3\b/gi, /\bsass\b/gi, /\bless\b/gi],
    'Tailwind CSS': [/\btailwind\s*css|tailwindcss\b/gi],
    'Bootstrap': [/\bbootstrap\b/gi],
    'C++': [/\bc\+\+\b/gi],
    'C#': [/\bc#|csharp\b/gi],
    '.NET': [/\b\.net|dotnet\b/gi],
    'Django': [/\bdjango\b/gi],
    'Flask': [/\bflask\b/gi],
    'Express': [/\bexpress(\.js)?\b/gi],
    'Spring': [/\bspring\b/gi],
    'Firebase': [/\bfirebase\b/gi],
    'Redis': [/\bredis\b/gi],
    'Jira': [/\bjira\b/gi],
    'Tableau': [/\btableau\b/gi],
    'Power BI': [/\bpower\s*bi\b/gi],
    'Figma': [/\bfigma\b/gi],
    'Photoshop': [/\bphotoshop\b/gi],
    'Machine Learning': [/\bmachine\s*learning|ml\b/gi],
    'Artificial Intelligence': [/\bartificial\s*intelligence|ai\b/gi],
    'Data Science': [/\bdata\s*science\b/gi],
    'DevOps': [/\bdevops\b/gi],
    'Agile': [/\bagile\b/gi],
    'Scrum': [/\bscrum\b/gi]
  };

  const skills: string[] = [];
  Object.entries(skillPatterns).forEach(([skill, patterns]) => {
    const found = patterns.some(pattern => pattern.test(normalized));
    if (found) {
      skills.push(skill);
    }
  });

  console.log('Found skills:', skills);

  // Enhanced experience extraction
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?experience/gi,
    /(\d+)\+?\s*years?\s+(?:working\s+)?(?:with|in|as)/gi,
    /(\d+)\+?\s*year\s+(?:of\s+)?experience/gi,
    /(\d{4})\s*[-–]\s*(\d{4}|present|current)/gi,
    /(\d{4})\s*[-–]\s*(\d{4})/gi
  ];
  const experience: string[] = [];
  experiencePatterns.forEach(p => {
    const matches = content.match(p);
    if (matches) experience.push(...matches.slice(0,5));
  });
  console.log('Found experience:', experience);

  // Enhanced job title extraction
  const jobTitlePatterns = [
    /(?:senior|lead|principal|staff|manager|director|head\s+of|chief|vp|vice\s+president)\s+[\w\s]+/gi,
    /(?:software|frontend|backend|full\s*stack|data|machine\s+learning|devops|cloud|platform)\s+(?:engineer|developer|scientist|analyst|architect)/gi,
    /(?:product|project|program|engineering)\s+manager/gi,
    /(?:ui|ux|product)\s+designer/gi,
    /(?:technical|team|tech)\s+lead/gi,
    /(?:qa|quality\s+assurance)\s+engineer/gi,
    /(?:business|data)\s+analyst/gi,
    /(?:intern|internship|co-op)/gi
  ];
  const jobTitles: string[] = [];
  jobTitlePatterns.forEach(p => {
    const matches = content.match(p);
    if (matches) {
      matches.forEach(match => {
        if (match.length > 3 && match.length < 50) {
          jobTitles.push(match.trim());
        }
      });
    }
  });
  console.log('Found job titles:', jobTitles);

  // Enhanced education extraction
  const educationPatterns = [
    /(?:bachelor|master|phd|doctorate|b\.?s\.?|m\.?s\.?|ph\.?d\.?|mba)\s+(?:in|of|degree)?\s*([a-z\s]+)/gi,
    /(?:university|college|institute|school)\s+of\s+([a-z\s]+)/gi,
    /computer science|software engineering|electrical engineering|mathematics|physics|business|economics|finance|marketing/gi,
    /(?:graduated|degree|diploma|certification)\s+(?:from|in)\s+([a-z\s]+)/gi
  ];
  const education: string[] = [];
  educationPatterns.forEach(p => {
    const matches = content.match(p);
    if (matches) {
      matches.forEach(match => {
        if (match.length > 5 && match.length < 100) {
          education.push(match.trim());
        }
      });
    }
  });
  console.log('Found education:', education);

  // Enhanced project extraction
  const projectPatterns = [
    /(?:built|developed|created|designed|implemented|architected|delivered|launched)\s+(?:a|an)?\s*([a-z\s]+(?:application|system|platform|website|app|service|api|dashboard|tool|feature))/gi,
    /(?:led|managed|coordinated|oversaw)\s+(?:a|the)?\s*([a-z\s]+(?:project|initiative|team|development|migration|integration))/gi,
    /project\s*[:\-]?\s*([a-z\s]+(?:application|system|platform|website|app|service|api|dashboard|tool))/gi,
    /(?:worked\s+on|contributed\s+to)\s+(?:a|the)?\s*([a-z\s]+(?:application|system|platform|project|initiative))/gi
  ];
  const projects: string[] = [];
  projectPatterns.forEach(p => {
    const matches = [...content.matchAll(p)];
    matches.forEach(m => { 
      if (m[1] && m[1].length > 5 && m[1].length < 80) {
        projects.push(m[1].trim()); 
      }
    });
  });
  console.log('Found projects:', projects);

  // Enhanced company extraction
  const companyPatterns = [
    /(?:at|@)\s+([A-Z][a-zA-Z0-9\s&\.]+(?:Inc|LLC|Corp|Ltd|Co\.?|Technologies|Systems|Solutions|Group|Labs|Consulting)?)/g,
    /(?:worked|employed|joined|contractor)\s+(?:at|with|for)\s+([A-Z][a-zA-Z0-9\s&\.]+)/g,
    /(?:company|employer|organization)\s*[:\-]?\s*([A-Z][a-zA-Z0-9\s&\.]+)/g,
    /([A-Z][a-zA-Z0-9\s&\.]+(?:Inc|LLC|Corp|Ltd|Co\.?|Technologies|Systems|Solutions|Group|Labs))\s*[-–]\s*\d{4}/g
  ];
  const companies: string[] = [];
  companyPatterns.forEach(p => {
    const matches = [...content.matchAll(p)];
    matches.forEach(m => { 
      if (m[1] && m[1].length > 2 && m[1].length < 60) {
        const company = m[1].trim();
        // Filter out common false positives
        if (!company.match(/^(Experience|Skills|Education|Projects?|Work|Employment|Professional|Career|Summary|Objective)$/i)) {
          companies.push(company); 
        }
      }
    });
  });
  console.log('Found companies:', companies);

  // Enhanced achievement extraction
  const achievementPatterns = [
    /(?:increased|improved|reduced|optimized|enhanced|boosted|accelerated|streamlined|automated)\s+([^\.]{10,100})/gi,
    /(?:\d+%|\$\d+[\d,]*|x\d+|\d+\s*(?:users|customers|clients|revenue|performance|efficiency|speed|time|cost|bugs|errors))/gi,
    /(?:award|recognition|certification|promoted|achieved|accomplished|delivered|exceeded|outperformed)\s+([^\.]{5,80})/gi,
    /(?:responsible\s+for|led\s+to|resulted\s+in)\s+([^\.]{10,100})/gi
  ];
  const achievements: string[] = [];
  achievementPatterns.forEach(p => {
    const matches = content.match(p);
    if (matches) {
      matches.forEach(match => {
        if (match.length > 10 && match.length < 150) {
          achievements.push(match.trim());
        }
      });
    }
  });
  console.log('Found achievements:', achievements);

  const result = {
    skills: [...new Set(skills)].slice(0, 15),
    experience: [...new Set(experience)].slice(0, 8),
    education: [...new Set(education)].slice(0, 5),
    projects: [...new Set(projects)].slice(0, 8),
    companies: [...new Set(companies)].slice(0, 5),
    jobTitles: [...new Set(jobTitles)].slice(0, 5),
    achievements: [...new Set(achievements)].slice(0, 8)
  };
  
  console.log('Final analysis result:', result);
  return result;
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
