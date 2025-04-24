export async function onRequestGet({ params, env }) {
  const season = params.season;
  const API_KEY = env.API_KEY;            // vendrá de tus variables de entorno
  const TARGET  = `https://api.tacticusgame.com/api/v1/guildRaid/${season}`;

  const apiRes = await fetch(TARGET, {
    headers: { 'X-API-KEY': API_KEY, 'season': season }
  });
  if (!apiRes.ok) {
    return new Response(await apiRes.text(), {
      status: apiRes.status
    });
  }
  const data = await apiRes.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
  
}