export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;
    
        // 1) Lógica de proxy solo si path=/api/guildRaid/:season
        if (path.startsWith('/api/guildRaid/')) {
          // extraer season y hacer fetch al API externo
          const season = path.split('/').pop();
          const API_KEY = env.API_KEY;
          const TARGET  = `https://api.tacticusgame.com/api/v1/guildRaid/${season}`;
          const apiRes = await fetch(TARGET, {
            headers: { 'X-API-KEY': API_KEY, 'season': season }
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
        return env.__STATIC_CONTENT.fetch(request);
     
    }
  };