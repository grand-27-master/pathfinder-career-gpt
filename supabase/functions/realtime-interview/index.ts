import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Upgrade': 'websocket',
  'Connection': 'Upgrade',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    let openAISocket: WebSocket | null = null;

    socket.onopen = async () => {
      console.log("Client WebSocket connected");
      
      try {
        // Connect to OpenAI Realtime API
        const openAIUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
        openAISocket = new WebSocket(openAIUrl, [], {
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "realtime=v1",
          }
        });

        openAISocket.onopen = () => {
          console.log("Connected to OpenAI Realtime API");
        };

        openAISocket.onmessage = (event) => {
          console.log("Message from OpenAI:", event.data);
          // Forward OpenAI messages to client
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        openAISocket.onclose = () => {
          console.log("OpenAI WebSocket closed");
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };

        openAISocket.onerror = (error) => {
          console.error("OpenAI WebSocket error:", error);
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ 
              type: 'error', 
              message: 'OpenAI connection error' 
            }));
          }
        };

      } catch (error) {
        console.error("Error connecting to OpenAI:", error);
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Failed to connect to AI service' 
        }));
      }
    };

    socket.onmessage = (event) => {
      console.log("Message from client:", event.data);
      // Forward client messages to OpenAI
      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    };

    socket.onclose = () => {
      console.log("Client WebSocket disconnected");
      if (openAISocket) {
        openAISocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error("Client WebSocket error:", error);
      if (openAISocket) {
        openAISocket.close();
      }
    };

    return response;
  }

  return new Response("WebSocket upgrade required", { status: 426 });
});