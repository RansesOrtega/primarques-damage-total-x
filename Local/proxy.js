// proxy.js
import express from 'express';
import cors    from 'cors';
import fetch   from 'node-fetch';

const app = express();
app.use(cors()); // añade Access-Control-Allow-Origin: *

const API_KEY = 'f29c74cc-fdb6-458e-97f2-383ae722bc87';
const TARGET  = 'https://api.tacticusgame.com/api/v1/guildRaid/';

app.get('/guildRaid/:season', async (req, res) => {
  const season = req.params.season;
  try {
    const apiRes = await fetch(`${TARGET}${season}`, {
      headers: {
        'X-API-KEY': API_KEY,
        'season':    season
      }
    });
    if (!apiRes.ok) {
      return res.status(apiRes.status).send(await apiRes.text());
    }
    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Proxy corriendo en http://localhost:3000');
});