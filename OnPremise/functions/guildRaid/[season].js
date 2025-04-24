export default {
    async fetch(request, env) {
      // Extraemos la parte final de la ruta: /api/guildRaid/72 → "72"
      const url = new URL(request.url);
      const segments = url.pathname.split('/');
      const season = segments[segments.length - 1];
  
      const API_KEY = env.API_KEY;
      const TARGET  = `https://api.tacticusgame.com/api/v1/guildRaid/${season}`;
  
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