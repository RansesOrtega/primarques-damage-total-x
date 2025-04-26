// proxy.js (Local Express proxy)
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Permitir CORS
app.use(cors());

const API_KEY = 'f29c74cc-fdb6-458e-97f2-383ae722bc87';
const BASE_URL = 'https://api.tacticusgame.com/api/v1/guildRaid';

// 1) Endpoint sin parámetro: devuelve JSON completo con campo 'season'
app.get('/api/guildRaid', async (req, res) => {
  try {
    const apiRes = await fetch(BASE_URL, {
      headers: { 'X-API-KEY': API_KEY }
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2) Endpoint con parámetro season: proxy de datos específicos
app.get('/api/guildRaid/:season', async (req, res) => {
  const { season } = req.params;
  try {
    const apiRes = await fetch(`${BASE_URL}/${season}`, {
      headers: {
        'X-API-KEY': API_KEY,
        'season': season
      }
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});