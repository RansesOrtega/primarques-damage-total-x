// OnPremise/functions/api/guildRaid/index.js

// Pages Function: maneja GET a /api/guildRaid
export async function onRequestGet({ request, env }) {
    // Clave API desde variables de entorno de Pages
    const API_KEY = env.API_KEY;
    const TARGET  = 'https://api.tacticusgame.com/api/v1/guildRaid';
  
    // Petición al API externo
    const apiRes = await fetch(TARGET, {
      headers: { 'X-API-KEY': API_KEY }
    });
  
    // Reenvía estado y cuerpo tal cual
    const body = await apiRes.text();
    return new Response(body, {
      status: apiRes.status,
      headers: { 'content-type': apiRes.headers.get('content-type') || 'application/json' }
    });
  }
  