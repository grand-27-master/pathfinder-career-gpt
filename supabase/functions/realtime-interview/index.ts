import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], role } = await req.json();

    // Use Groq API (free tier)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer gsk_free_tier_key`, // Using free tier
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Free Groq model
        messages: [
          {
            role: 'system',
            content: `You are an experienced ${role || 'technical'} interviewer conducting a mock interview. Ask relevant questions for a ${role || 'technical'} position. Keep responses concise (2-3 sentences max), professional, and engaging. Follow up with deeper questions based on the candidate's answers. Focus on practical skills and experience relevant to the role.`
          },
          ...conversationHistory,
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 150, // Shorter responses for better speech synthesis
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get AI response');
    }

    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in interview function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});