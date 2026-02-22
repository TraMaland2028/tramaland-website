

const slogans = {
  en: 'Total Resilience Meme Line',
  ru: 'Total Resilience Meme Line',
  cn: 'Total Resilience Meme Line',
  de: 'Total Resilience Meme Line',
  fr: 'Total Resilience Meme Line',
  es: 'Total Resilience Meme Line',
  jp: 'Total Resilience Meme Line'
};

const translations = {
  en: { selectLang: 'Select the Whitepaper Language', telegramText: 'Ready? Join us!' },
  ru: { selectLang: 'Выбери язык белой книги', telegramText: 'Готов к будущему? Присоединяйся!' },
  fr: { selectLang: 'Selectionne la langue du livre blanc', telegramText: 'Pret pour l\'avenir? Rejoins-nous !' },
  cn: { selectLang: '请选择白皮书语言', telegramText: '准备迎接未来？加入我们！' },
  de: { selectLang: 'Wahle die Sprache des Whitepapers', telegramText: 'Bereit fur die Zukunft? Mach mit!' },
  es: { selectLang: 'Selecciona el idioma del libro blanco', telegramText: 'Listo para el futuro? Unete!' },
  jp: { selectLang: 'ホワイトペーパーの言語を選択してください', telegramText: '未来のために準備はできていますか？ 参加しよう！' }
};

const TRML_CHART_WINDOW_POINTS = 120;

const basketLabels = {
  'CL=F': 'Oil (CL)',
  'NG=F': 'Natural Gas (NG)',
  'GC=F': 'Gold (GC)',
  'SI=F': 'Silver (SI)',
  'HG=F': 'Copper (HG)',
  'PL=F': 'Platinum (PL)',
  'ZW=F': 'Wheat (ZW)',
  'ZC=F': 'Corn (ZC)',
  'ZS=F': 'Soybeans (ZS)',
  'KC=F': 'Coffee (KC)',
  'SB=F': 'Sugar (SB)',
  'CT=F': 'Cotton (CT)'
};

function asNumber(value) {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value) {
  const num = asNumber(value);
  if (num === null) return '-';
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function formatPercent(value) {
  const num = asNumber(value);
  if (num === null) return '-';
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
}

function formatMoney(value) {
  const num = asNumber(value);
  if (num === null) return '-';
  return `$${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function formatIsoDate(isoDate) {
  if (!isoDate) return '-';
  const dt = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return isoDate;
  return dt.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

async function fetchJson(url) {
  const response = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function loadHistoryRows() {
  const sources = [
    'assets/trml-history.json',
    'TRML-base/data/history.json'
  ];

  for (const src of sources) {
    try {
      const history = await fetchJson(src);
      if (Array.isArray(history) && history.length > 0) return history;
    } catch (_e) {
      // try next source
    }
  }

  return [];
}

function getDailyChangePercent(history) {
  if (!Array.isArray(history) || history.length < 2) return null;
  const rows = history
    .map((r) => ({ raw: asNumber(r.raw), date: r.date || '' }))
    .filter((r) => r.raw !== null);

  if (rows.length < 2) return null;

  const prev = rows[rows.length - 2].raw;
  const curr = rows[rows.length - 1].raw;
  if (!prev || !curr) return null;

  return ((curr / prev) - 1) * 100;
}

function updateStatusChip(chipEl, dayPct) {
  if (!chipEl) return;

  chipEl.classList.remove('is-up', 'is-down', 'is-flat');

  const pct = asNumber(dayPct);
  if (pct === null) {
    chipEl.textContent = 'Нет данных';
    chipEl.classList.add('is-flat');
    return;
  }

  if (pct > 0.05) {
    chipEl.textContent = 'День инфляции';
    chipEl.classList.add('is-up');
    return;
  }

  if (pct < -0.05) {
    chipEl.textContent = 'День дефляции';
    chipEl.classList.add('is-down');
    return;
  }

  chipEl.textContent = 'Нейтрально';
  chipEl.classList.add('is-flat');
}

async function loadTrmlWidget() {
  const trmlIndexEl = document.getElementById('trmlIndexValue');
  const trmlMetaEl = document.getElementById('trmlMeta');
  const trmlKRawEl = document.getElementById('trmlKRawVal');
  const trmlUsdRawEl = document.getElementById('trmlUsdRawVal');
  const trmlCostKEl = document.getElementById('trmlCostKVal');
  const trmlPpChangeEl = document.getElementById('trmlPpChangeVal');
  const trmlHundredNowEl = document.getElementById('trmlHundredNowVal');
  const trmlHintEl = document.getElementById('trmlHumanHint');
  const trmlUpdatedEl = document.getElementById('trmlUpdated');

  if (!trmlIndexEl || !trmlMetaEl || !trmlKRawEl || !trmlUsdRawEl || !trmlCostKEl || !trmlPpChangeEl || !trmlHundredNowEl || !trmlUpdatedEl) {
    return;
  }

  const sources = [
    { label: 'assets/trml-latest.json', url: 'assets/trml-latest.json' },
    { label: 'TRML-base/archive/latest.json', url: 'TRML-base/archive/latest.json' }
  ];

  let payload = null;
  let sourceLabel = '-';

  for (const source of sources) {
    try {
      payload = await fetchJson(source.url);
      sourceLabel = source.label;
      break;
    } catch (_err) {
      // try next source
    }
  }

  if (!payload) {
    trmlIndexEl.textContent = 'N/A';
    trmlMetaEl.textContent = 'Source: unavailable';
    trmlKRawEl.textContent = '-';
    trmlUsdRawEl.textContent = '-';
    trmlCostKEl.textContent = '-';
    trmlPpChangeEl.textContent = '-';
    trmlHundredNowEl.textContent = '-';
    if (trmlHintEl) trmlHintEl.textContent = 'No data for interpretation.';
    trmlUpdatedEl.textContent = 'Updated (UTC): no data';
    renderBasketRows(null);
    renderDrivers(null);
    return;
  }

  const baseIndex = asNumber(payload.base_index_value) ?? 1000000;
  const indexValue = asNumber(payload.index);
  const kRaw = asNumber(payload.cost_index_k) ?? asNumber(payload.k_raw) ?? (indexValue !== null ? indexValue / baseIndex : null);
  const usdRaw = asNumber(payload.trml_usd_raw) ?? (kRaw !== null ? baseIndex * kRaw : null);

  const ppValue = asNumber(payload.purchasing_power_usd) ?? (kRaw !== null && kRaw > 0 ? 1 / kRaw : null);
  const ppChangePct = asNumber(payload.purchasing_power_change_pct) ?? (ppValue !== null ? (ppValue - 1) * 100 : null);
  const hundredNow = ppValue !== null ? 100 * ppValue : null;

  trmlIndexEl.textContent = formatNumber(indexValue);
  trmlMetaEl.textContent = `Source: ${sourceLabel} | Version: ${payload.version || '-'}`;
  trmlKRawEl.textContent = formatNumber(kRaw);
  trmlUsdRawEl.textContent = formatNumber(usdRaw);

  trmlCostKEl.textContent = kRaw !== null ? kRaw.toFixed(4) : '-';
  trmlPpChangeEl.textContent = formatPercent(ppChangePct);
  trmlHundredNowEl.textContent = formatMoney(hundredNow);

  if (trmlHintEl) {
    if (ppChangePct === null) {
      trmlHintEl.textContent = 'No data for interpretation.';
    } else if (ppChangePct < 0) {
      trmlHintEl.textContent = `For the same basket, today you need more USD (change: ${formatPercent(ppChangePct)}).`;
    } else if (ppChangePct > 0) {
      trmlHintEl.textContent = `For the same basket, today you need less USD (change: ${formatPercent(ppChangePct)}).`;
    } else {
      trmlHintEl.textContent = 'USD purchasing power is close to the base level.';
    }
  }

  trmlUpdatedEl.textContent = `Updated (UTC): ${formatIsoDate(payload.date_utc)}`;
  renderBasketRows(payload);
  renderDrivers(payload);
}

function renderBasketRows(payload) {
  const basketEl = document.getElementById('trmlBasketRows');
  if (!basketEl) return;

  const prices = payload?.prices || {};
  const basePrices = payload?.base_prices || {};
  const tickers = Object.keys(prices);

  if (tickers.length === 0) {
    basketEl.textContent = 'No basket data';
    return;
  }

  const rows = tickers.map((ticker) => {
    const now = asNumber(prices[ticker]);
    const base = asNumber(basePrices[ticker]);
    const pct = (now !== null && base !== null && base > 0) ? ((now / base) - 1) * 100 : null;

    return `
      <div class="trml-basket-row">
        <span class="trml-basket-name">${basketLabels[ticker] || ticker}</span>
        <span class="trml-basket-now">${formatNumber(now)}</span>
        <span class="trml-basket-change ${changeClass(pct)}">${formatPercent(pct)}</span>
      </div>
    `;
  }).join('');

  basketEl.innerHTML = `
    <div class="trml-basket-head">
      <span>Component</span>
      <span>Price</span>
      <span>vs base</span>
    </div>
    ${rows}
  `;
}

function changeClass(pct) {
  const v = asNumber(pct);
  if (v === null) return 'is-flat';
  if (v > 0) return 'is-up';
  if (v < 0) return 'is-down';
  return 'is-flat';
}

function renderDrivers(payload) {
  const el = document.getElementById('trmlDriversRows');
  if (!el) return;

  const prices = payload?.prices || {};
  const basePrices = payload?.base_prices || {};
  const entries = Object.keys(prices).map((ticker) => {
    const now = asNumber(prices[ticker]);
    const base = asNumber(basePrices[ticker]);
    const pct = (now !== null && base !== null && base > 0) ? ((now / base) - 1) * 100 : null;
    const absPct = pct === null ? -1 : Math.abs(pct);
    return { ticker, pct, absPct };
  }).filter((x) => x.pct !== null)
    .sort((a, b) => b.absPct - a.absPct)
    .slice(0, 3);

  if (entries.length === 0) {
    el.textContent = 'No drivers data';
    return;
  }

  el.innerHTML = entries.map((item, idx) => `
    <div class="trml-driver-row">
      <span class="trml-driver-rank">#${idx + 1}</span>
      <span class="trml-driver-name">${basketLabels[item.ticker] || item.ticker}</span>
      <span class="trml-driver-change ${changeClass(item.pct)}">${formatPercent(item.pct)}</span>
    </div>
  `).join('');
}

function initTrmlTilt() {
  const trmlWidgetEl = document.getElementById('trmlWidget');
  if (!trmlWidgetEl) return;
  trmlWidgetEl.style.transform = 'none';
}

function showText(lang) {
  const textEl = document.getElementById('text-display');
  const sloganEl = document.getElementById('slogan');
  const langNote = document.querySelector('.language-note');
  const telegramBtn = document.querySelector('.telegram-btn');

  if (!textEl || !sloganEl) return;

  textEl.textContent = '...';

  fetch(`/texts/whitepaper-${lang}.txt`)
    .then(res => res.text())
    .then(text => {
      textEl.style.display = 'block';
      textEl.classList.remove('typing-cursor');
      textEl.style.whiteSpace = 'pre-wrap';
      textEl.textContent = text.replace(/\r\n/g, '\n');

      sloganEl.textContent = slogans[lang] || '';
      if (langNote) langNote.textContent = translations[lang]?.selectLang || '';
      if (telegramBtn) {
        telegramBtn.innerHTML = `
          <img src="assets/telegram-icon.png" alt="Telegram" class="telegram-icon" />
          ${translations[lang]?.telegramText || ''}
        `;
      }


      localStorage.setItem('selectedLang', lang);
    });
}


const telegramBtn = document.getElementById('telegramBtn');
if (telegramBtn) {
  telegramBtn.addEventListener('click', () => {

    const textEl = document.getElementById('text-display');
    if (textEl) {
      textEl.textContent = '';
      textEl.classList.remove('typing-cursor');
    }

    setTimeout(() => {
      window.open('https://t.me/trml_dispenser_bot', '_blank');
    }, 300);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initTrmlTilt();
  loadTrmlWidget();
  loadTrmlHistoryChart();
  setInterval(loadTrmlWidget, 10 * 60 * 1000);
  setInterval(loadTrmlHistoryChart, 10 * 60 * 1000);
});

window.showText = showText;

let trmlChartInstance = null;

function renderTrmlChart(history) {
  const canvas = document.getElementById('trmlChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const allRows = Array.isArray(history) ? history : [];
  const rows = allRows.length > TRML_CHART_WINDOW_POINTS
    ? allRows.slice(-TRML_CHART_WINDOW_POINTS)
    : allRows;

  const labels = rows.map(r => r.date || '');
  const rawData = rows.map(r => asNumber(r.raw));
  if (trmlChartInstance) {
    trmlChartInstance.destroy();
  }

  trmlChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Index (raw)',
          data: rawData,
          borderColor: '#7ff6ff',
          backgroundColor: 'rgba(127, 246, 255, 0.12)',
          pointRadius: 2,
          tension: 0.25,
          borderWidth: 2,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#dff7ff' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#cdefff', maxTicksLimit: 5 },
          grid: { color: 'rgba(132, 243, 255, 0.14)' }
        },
        y: {
          ticks: {
            color: '#cdefff',
            callback: (value) => formatNumber(value)
          },
          grid: { color: 'rgba(132, 243, 255, 0.14)' }
        }
      }
    }
  });
}

async function loadTrmlHistoryChart() {
  const sources = [
    'assets/trml-history.json',
    'TRML-base/data/history.json'
  ];

  for (const src of sources) {
    try {
      const history = await fetchJson(src);
      if (Array.isArray(history) && history.length > 0) {
        renderTrmlChart(history);
        return;
      }
    } catch (_e) {
      // try next source
    }
  }
}













