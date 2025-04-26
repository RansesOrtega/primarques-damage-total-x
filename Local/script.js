import { config } from './config.js';

const proxyBase = `${config.proxyBase}/api/guildRaid`;
let dataRows = [];
let currentSort = { column: 'damage', asc: true };

document.addEventListener('DOMContentLoaded', () => {
  const seasonInput = document.getElementById('seasonInput');
  const loadBtn     = document.getElementById('loadBtn');
  const tableBody   = document.getElementById('damageTableBody');
  const thPlayer    = document.getElementById('thPlayer');
  const thDamage    = document.getElementById('thDamage');
  const arrowPlayer = document.getElementById('arrowPlayer');
  const arrowDamage = document.getElementById('arrowDamage');

  async function fetchSeason() {
    const res = await fetch(proxyBase);
    if (!res.ok) throw new Error(`Error fetching season: ${res.status}`);
    const json = await res.json();
    return json.season;
  }

  function renderTable() {
    tableBody.innerHTML = '';
    dataRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${idx+1}</td><td>${row.name}</td><td>${row.dmg.toLocaleString()}</td>`;
      tableBody.appendChild(tr);
    });
  }

  function updateArrows() {
    arrowPlayer.textContent = '';
    arrowDamage.textContent = '';
    const arrow = currentSort.asc ? '▲' : '▼';
    if (currentSort.column === 'player') arrowPlayer.textContent = arrow;
    else arrowDamage.textContent = arrow;
  }

  function sortData(col) {
    if (currentSort.column === col) currentSort.asc = !currentSort.asc;
    else { currentSort.column = col; currentSort.asc = true; }
    dataRows.sort((a,b) => {
      if (col==='damage') return currentSort.asc ? a.dmg-b.dmg : b.dmg-a.dmg;
      return currentSort.asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    updateArrows();
    renderTable();
  }

  async function loadData(season) {
    tableBody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';
    try {
      const res = await fetch(`${proxyBase}/${season}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const { entries=[] } = await res.json();
      dataRows = Object.entries(config.userMapping).map(([name,uid]) => ({
        name,
        dmg: entries.filter(e=>e.userId===uid).reduce((sum,e)=>sum+(e.damageDealt||0),0)
      }));
      dataRows.sort((a,b)=>b.dmg-a.dmg);
      currentSort={column:'damage',asc:false};
      updateArrows();
      renderTable();
    } catch(err) {
      tableBody.innerHTML = `<tr><td colspan="3" style="color:red;">${err.message}</td></tr>`;
    }
  }

  async function init() {
    try {
      const season = await fetchSeason();
      seasonInput.value = season;
      await loadData(season);
    } catch(err) {
      console.error(err);
    }
  }

  loadBtn.addEventListener('click', ()=> loadData(parseInt(seasonInput.value,10)||config.season));
  thPlayer.addEventListener('click',()=>sortData('player'));
  thDamage.addEventListener('click',()=>sortData('damage'));

  init();
});
