import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base'

export default {
  async fetch(request, env, ctx) {
    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    try {
      // Initialize the o200k_base encoding (used by GPT-4o and GPT-4o-mini)
      const encoding = new Tiktoken(o200k_base);

      if (url.pathname === '/encode' && request.method === 'POST') {
        const { text } = await request.json();
        const requestId = request.headers.get('cf-ray');
        console.log('[INFO](',requestId,'|/encode): Received ',text);
        if (!text || typeof text !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Invalid input. Please provide a text string.' }), 
            { status: 400, headers: corsHeaders }
          );
        }

        const tokens = encoding.encode(text);
        const tokenCount = tokens.length;
        console.log('[INFO](',requestId,'|/encode): Returning ',Array.from(tokens));
        return new Response(
          JSON.stringify({ 
            tokens: Array.from(tokens), 
            tokenCount,
            text 
          }), 
          { headers: corsHeaders }
        );
      }

      if (url.pathname === '/decode' && request.method === 'POST') {
        const { tokens } = await request.json();
        const requestId = request.headers.get('cf-ray');
        console.log('[INFO](',requestId,'|/decode): Received ',tokens);
        if (!Array.isArray(tokens) || !tokens.every(t => Number.isInteger(t) && t >= 0)) {
          return new Response(
            JSON.stringify({ error: 'Invalid input. Please provide an array of positive integers.' }), 
            { status: 400, headers: corsHeaders }
          );
        }

        try {
          const text = encoding.decode(new Uint32Array(tokens));
          console.log('[INFO](',requestId,'|/decode): Returning ',text);
          return new Response(
            JSON.stringify({ 
              text, 
              tokens, 
              tokenCount: tokens.length 
            }), 
            { headers: corsHeaders }
          );
        } catch (decodeError) {
          return new Response(
            JSON.stringify({ error: 'Failed to decode tokens. Invalid token sequence.' }), 
            { status: 400, headers: corsHeaders }
          );
        }
      }

      if (url.pathname === '/' && request.method === 'GET') {
        return new Response(
          JSON.stringify({ 
            message: 'O200k Tokenizer API',
            endpoints: {
              'POST /encode': 'Encode text to tokens',
              'POST /decode': 'Decode tokens to text'
            },
            encoding: 'o200k_base'
          }), 
          { headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Not found' }), 
        { status: 404, headers: corsHeaders }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error: ' + error.message }), 
        { status: 500, headers: corsHeaders }
      );
    }
  },
};