import { config } from './config.js';

const proxyBase = '/api/guildRaid'; 

let dataRows = [];   // Array de { name, dmg }
let currentSort = {  // Empieza ordenando por daño DESC
  column: 'damage',
  asc: true
};

document.addEventListener('DOMContentLoaded', () => {
  const tableBody   = document.getElementById('damageTableBody');
  const seasonInput = document.getElementById('seasonInput');
  const loadBtn     = document.getElementById('loadBtn');
  const exportBtn   = document.getElementById('exportBtn');
  const thPlayer    = document.getElementById('thPlayer');
  const thDamage    = document.getElementById('thDamage');
  const arrowPlayer = document.getElementById('arrowPlayer');
  const arrowDamage = document.getElementById('arrowDamage');

  async function fetchSeason() {
    const res = await fetch(proxyBase, { method: 'GET' });
    if (!res.ok) throw new Error(`Error fetching season: ${res.status}`);
    const json = await res.json();
    return json.season;
  }


  // Renderiza la tabla con posición, nombre y daño
  function renderTable() {
    tableBody.innerHTML = '';
    dataRows.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${row.name}</td>
        <td>${row.dmg.toLocaleString()}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Actualiza las flechas de orden en el header
  function updateArrows() {
    arrowPlayer.textContent = '';
    arrowDamage.textContent = '';
    const arrow = currentSort.asc ? '▲' : '▼';
    if (currentSort.column === 'player') {
      arrowPlayer.textContent = arrow;
    } else {
      arrowDamage.textContent = arrow;
    }
  }

  // Ordena dataRows por la columna indicada
  function sortData(column) {
    if (currentSort.column === column) {
      currentSort.asc = !currentSort.asc;
    } else {
      currentSort.column = column;
      currentSort.asc = true;
    }
    dataRows.sort((a, b) => {
      if (column === 'damage') {
        return currentSort.asc
          ? a.dmg - b.dmg
          : b.dmg - a.dmg;
      } else {
        return currentSort.asc
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });
    updateArrows();
    renderTable();
  }

  // Descarga un .xlsx con la tabla actual
  function exportToExcel() {
    // Construye array de objetos para SheetJS
    const wsData = dataRows.map((row, idx) => ({
      Position: idx + 1,
      Player: row.name,
      'Total Damage': row.dmg
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Damage');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const season = seasonInput.value || config.season;
    a.href = url;
    a.download = `guild-raid-season-${season}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Carga los datos del proxy y prepara dataRows
  async function loadData(season) {
    tableBody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';
    try {
      const res = await fetch(`${config.endpoint}${season}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const { entries = [] } = await res.json();

      dataRows = Object.entries(config.userMapping).map(([name, uid]) => {
        const total = entries
          .filter(e => e.userId === uid)
          .reduce((sum, e) => sum + (e.damageDealt || 0), 0);
        return { name, dmg: total };
      });

      // Orden inicial: daño DESC
      sortData('damage');
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="3" style="color:red;">${err.message}</td></tr>`;
    }
  }

  async function init() {
    try {
      const season = await fetchSeason();
      seasonInput.value = season;
      await loadData(season);
    } catch (err) {
      console.error(err);
      // Quizá mostrar un mensaje de error en la UI
    }
  }

  // Listeners
  loadBtn.addEventListener('click', () => {
    const s = parseInt(seasonInput.value, 10) || config.season;
    loadData(s);
  });
  exportBtn.addEventListener('click', exportToExcel);
  thPlayer.addEventListener('click', () => sortData('player'));
  thDamage.addEventListener('click', () => sortData('damage'));

  // Primera carga
  init();
});
