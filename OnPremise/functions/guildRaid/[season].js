export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const segments = url.pathname.split('/').filter(Boolean);
      const season = segments.pop();
      const API_KEY = env.API_KEY;
      if (!season || isNaN(Number(season))) {
        return new Response(
          JSON.stringify({ error: 'Missing or invalid season parameter' }),
          { status: 400, headers: { 'content-type': 'application/json' } }
        );
      }
  
      const TARGET = `https://api.tacticusgame.com/api/v1/guildRaid/${season}`;
  
      // Hacemos la petición al API externo
      const apiRes = await fetch(TARGET, {
        headers: {
          'X-API-KEY': API_KEY,
          'season': season
        }
      });
  
      // Si falla, devolvemos el mismo status y cuerpo
      if (!apiRes.ok) {
        const text = await apiRes.text();
        return new Response(text, {
          status: apiRes.status,
          headers: { 'content-type': apiRes.headers.get('content-type') || 'text/plain' }
        });
      }
  
      // En caso de éxito, reenviamos el JSON
      const data = await apiRes.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
  };