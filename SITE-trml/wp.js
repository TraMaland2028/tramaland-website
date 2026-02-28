





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
  en: {
    selectLang: 'Select the Whitepaper Language',
    telegramText: 'Ready? Join us!',
    supportText: 'Support the project',
    supportTitle: 'Support the project',
    supportBody: 'If you like TRML and would like to support the development of the project, you can send a donation to any of the addresses below:',
    supportThanks: 'Thank you for your support 🙏❤️',
    copyBtn: 'Copy',
    copiedBtn: 'Copied'
  },
  ru: {
    selectLang: 'Выбери язык белой книги',
    telegramText: 'Готов к будущему? Присоединяйся!',
    supportText: 'Поддержать проект',
    supportTitle: 'Поддержка проекта',
    supportBody: 'Если вам нравится TRML и вы хотите поддержать развитие проекта, вы можете отправить донат на любой из адресов ниже:',
    supportThanks: 'Спасибо за поддержку 🙏❤️',
    copyBtn: 'Копировать',
    copiedBtn: 'Скопировано'
  },
  fr: {
    selectLang: 'Selectionne la langue du livre blanc',
    telegramText: 'Pret pour l\'avenir? Rejoins-nous !',
    supportText: 'Soutenir le projet',
    supportTitle: 'Soutenir le projet',
    supportBody: 'Si vous aimez TRML et souhaitez soutenir le développement du projet, vous pouvez envoyer un don à l’une des adresses ci-dessous :',
    supportThanks: 'Merci pour votre soutien 🙏❤️',
    copyBtn: 'Copier',
    copiedBtn: 'Copié'
  },
  cn: {
    selectLang: '请选择白皮书语言',
    telegramText: '准备迎接未来？加入我们！',
    supportText: '支持该项目',
    supportTitle: '支持该项目',
    supportBody: '如果您喜欢 TRML，并希望支持项目的发展，您可以向以下任一地址发送捐赠：',
    supportThanks: '感谢您的支持 🙏❤️',
    copyBtn: '复制',
    copiedBtn: '已复制'
  },
  de: {
    selectLang: 'Wahle die Sprache des Whitepapers',
    telegramText: 'Bereit fur die Zukunft? Mach mit!',
    supportText: 'Projekt unterstützen',
    supportTitle: 'Projekt unterstützen',
    supportBody: 'Wenn Ihnen TRML gefällt und Sie die Weiterentwicklung des Projekts unterstützen möchten, können Sie eine Spende an eine der untenstehenden Adressen senden:',
    supportThanks: 'Vielen Dank für Ihre Unterstützung 🙏❤️',
    copyBtn: 'Kopieren',
    copiedBtn: 'Kopiert'
  },
  es: {
    selectLang: 'Selecciona el idioma del libro blanco',
    telegramText: 'Listo para el futuro? Unete!',
    supportText: 'Apoyar el proyecto',
    supportTitle: 'Apoyar el proyecto',
    supportBody: 'Si te gusta TRML y deseas apoyar el desarrollo del proyecto, puedes enviar una donación a cualquiera de las siguientes direcciones:',
    supportThanks: 'Gracias por tu apoyo 🙏❤️',
    copyBtn: 'Copiar',
    copiedBtn: 'Copiado'
  },
  jp: {
    selectLang: 'ホワイトペーパーの言語を選択してください',
    telegramText: '未来のために準備はできていますか？ 参加しよう！',
    supportText: 'プロジェクトを応援する',
    supportTitle: 'プロジェクトを支援する',
    supportBody: 'TRMLを気に入っていただき、プロジェクトの発展を支援したい場合は、以下のいずれかのアドレスへご寄付をお送りください。',
    supportThanks: 'ご支援ありがとうございます 🙏❤️',
    copyBtn: 'コピー',
    copiedBtn: 'コピー済み'
  }
};

const DONATION_ADDRESSES = {
  polygon: '0x0739AF0E36A7220aC25b2B5Ba378ea627b332937',
  ton: 'UQBycExf_jrE8umE9vzQ3fduTQyLxw4S7CIzxh6z1VMDHbUo'
};

const TRML_CHART_DEFAULT_WINDOW_POINTS = 30;

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

let trmlChartInstance = null;
let trmlChartWindowPoints = TRML_CHART_DEFAULT_WINDOW_POINTS;
let trmlHistoryCache = [];
let currentUiLang = 'en';

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
  return dt.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

async function fetchJson(url) {
  const response = await fetch(`${url}?v=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function changeClass(pct) {
  const value = asNumber(pct);
  if (value === null) return 'is-flat';
  if (value > 0) return 'is-up';
  if (value < 0) return 'is-down';
  return 'is-flat';
}

function getCurrentLang() {
  return currentUiLang || 'en';
}

function getDefaultLang() {
  const existing = localStorage.getItem('selectedLang');
  if (existing) return existing;
  localStorage.setItem('selectedLang', 'en');
  return 'en';
}

function renderBasketRows(payload) {
  const basketEl = document.getElementById('trmlBasketRows');
  if (!basketEl) return;

  const displayPrices = payload?.display_prices_usd_per_unit || {};
  const displayBasePrices = payload?.display_base_prices_usd_per_unit || {};
  const units = payload?.display_units || {};
  const sources = payload?.display_price_sources || {};

  const fallbackPrices = payload?.prices || {};
  const fallbackBasePrices = payload?.base_prices || {};

  const tickers = Object.keys(displayPrices).length > 0
    ? Object.keys(displayPrices)
    : Object.keys(fallbackPrices);

  if (tickers.length === 0) {
    basketEl.textContent = 'No basket data';
    return;
  }

  const rows = tickers.map((ticker) => {
    const now = asNumber(displayPrices[ticker] ?? fallbackPrices[ticker]);
    const base = asNumber(displayBasePrices[ticker] ?? fallbackBasePrices[ticker]);
    const pct = (now !== null && base !== null && base > 0) ? ((now / base) - 1) * 100 : null;
    const unit = units[ticker] || 'USD/unit';
    const source = (sources[ticker] || 'futures').toLowerCase();

    return `
      <div class="trml-basket-row">
        <span class="trml-basket-name">${basketLabels[ticker] || ticker}<span class="trml-basket-unit">${unit}</span><span class="trml-basket-source">source: ${source}</span></span>
        <span class="trml-basket-now">${formatNumber(now)}</span>
        <span class="trml-basket-change ${changeClass(pct)}">${formatPercent(pct)}</span>
      </div>
    `;
  }).join('');

  basketEl.innerHTML = `
    <div class="trml-basket-head">
      <span>Component</span>
      <span>Price (USD/unit)</span>
      <span>vs base</span>
    </div>
    ${rows}
  `;
}

function renderDrivers(payload) {
  const el = document.getElementById('trmlDriversRows');
  if (!el) return;

  const prices = payload?.prices || {};
  const basePrices = payload?.base_prices || {};

  const entries = Object.keys(prices)
    .map((ticker) => {
      const now = asNumber(prices[ticker]);
      const base = asNumber(basePrices[ticker]);
      const pct = (now !== null && base !== null && base > 0) ? ((now / base) - 1) * 100 : null;
      return { ticker, pct, absPct: pct === null ? -1 : Math.abs(pct) };
    })
    .filter((item) => item.pct !== null)
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

async function loadTrmlWidget() {
  const trmlIndexEl = document.getElementById('trmlIndexValue');
  const trmlMetaEl = document.getElementById('trmlMeta');
  const trmlKRawEl = document.getElementById('trmlKRawVal');
  const trmlUsdRawEl = document.getElementById('trmlUsdRawVal');
  const trmlCostKEl = document.getElementById('trmlCostKVal');
  const trmlPpChangeEl = document.getElementById('trmlPpChangeVal');
  const trmlHintEl = document.getElementById('trmlHumanHint');
  const trmlUpdatedEl = document.getElementById('trmlUpdated');

  const hasWidgetTarget = trmlIndexEl || trmlMetaEl || trmlKRawEl || trmlUsdRawEl || trmlCostKEl || trmlPpChangeEl || trmlHintEl || trmlUpdatedEl;
  if (!hasWidgetTarget) {
    return;
  }

  const setText = (el, text) => {
    if (el) el.textContent = text;
  };

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
    setText(trmlIndexEl, 'N/A');
    setText(trmlMetaEl, 'Source: unavailable');
    setText(trmlKRawEl, '-');
    setText(trmlUsdRawEl, '-');
    setText(trmlCostKEl, '-');
    setText(trmlPpChangeEl, '-');
    setText(trmlHintEl, 'No data for interpretation.');
    setText(trmlUpdatedEl, 'Updated (UTC): no data');
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

  setText(trmlIndexEl, formatNumber(indexValue));
  setText(trmlMetaEl, `Source: ${sourceLabel} | Version: ${payload.version || '-'}`);
  setText(trmlKRawEl, formatNumber(kRaw));
  setText(trmlUsdRawEl, formatNumber(usdRaw));

  setText(trmlCostKEl, kRaw !== null ? kRaw.toFixed(4) : '-');
  setText(trmlPpChangeEl, formatPercent(ppChangePct));

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

    if (payload.market_data_fresh === false) {
      trmlHintEl.textContent += ' Market closed or unchanged: latest available prices used.';
    }
  }

  setText(trmlUpdatedEl, `Updated (UTC): ${formatIsoDate(payload.date_utc)}`);
  renderBasketRows(payload);
  renderDrivers(payload);
}

function updateSupportPanel(lang) {
  const tr = translations[lang] || translations.en;
  const supportTitleEl = document.getElementById('supportTitle');
  const supportTextEl = document.getElementById('supportText');
  const supportThanksEl = document.getElementById('supportThanks');
  const supportBtnEl = document.getElementById('supportBtn');
  const polygonEl = document.getElementById('polygonAddress');
  const tonEl = document.getElementById('tonAddress');
  const copyButtons = document.querySelectorAll('.copy-btn');

  if (supportTitleEl) supportTitleEl.textContent = tr.supportTitle;
  if (supportTextEl) supportTextEl.textContent = tr.supportBody;
  if (supportThanksEl) supportThanksEl.textContent = tr.supportThanks;
  if (supportBtnEl) supportBtnEl.textContent = tr.supportText;

  if (polygonEl) polygonEl.textContent = DONATION_ADDRESSES.polygon;
  if (tonEl) tonEl.textContent = DONATION_ADDRESSES.ton;

  copyButtons.forEach((btn) => {
    btn.textContent = tr.copyBtn;
    btn.dataset.copyDefault = tr.copyBtn;
    btn.dataset.copyDone = tr.copiedBtn;
  });
}

async function copyAddress(targetId, button) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const text = target.textContent?.trim() || '';
  if (!text) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }

    const done = button.dataset.copyDone || 'Copied';
    const def = button.dataset.copyDefault || 'Copy';
    button.textContent = done;
    setTimeout(() => {
      button.textContent = def;
    }, 1200);
  } catch (_e) {
    // silent
  }
}

function toggleSupportPanel() {
  const panel = document.getElementById('supportPanel');
  if (!panel) return;

  updateSupportPanel(getCurrentLang());

  if (panel.hasAttribute('hidden')) {
    panel.removeAttribute('hidden');
    panel.classList.add('is-open');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    panel.setAttribute('hidden', 'hidden');
    panel.classList.remove('is-open');
  }
}

function showText(lang) {
  const textEl = document.getElementById('text-display');
  const sloganEl = document.getElementById('slogan');
  const langNote = document.querySelector('.language-note');
  const telegramBtn = document.querySelector('.telegram-btn');

  if (!textEl || !sloganEl) return;

  const targetLang = translations[lang] ? lang : 'en';
  currentUiLang = targetLang;
  localStorage.setItem('selectedLang', targetLang);

  sloganEl.textContent = slogans[targetLang] || '';
  if (langNote) langNote.textContent = translations[targetLang]?.selectLang || '';
  if (telegramBtn) {
    telegramBtn.innerHTML =       `
          <img src="assets/telegram-icon.png" alt="Telegram" class="telegram-icon" />
          ${translations[targetLang]?.telegramText || ''}
        `;
  }
  updateSupportPanel(targetLang);

  textEl.textContent = '...';
  fetch(`/texts/whitepaper-${targetLang}.txt`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((text) => {
      textEl.style.display = 'block';
      textEl.style.whiteSpace = 'pre-wrap';
      textEl.textContent = text.replace(/\r\n/g, '\n');
    })
    .catch(() => {
      textEl.style.display = 'block';
      textEl.style.whiteSpace = 'pre-wrap';
      textEl.textContent = 'Whitepaper text is unavailable for this language.';
    });
}


function normalizeHistoryForChart(history) {
  const rows = Array.isArray(history) ? history : [];
  const normalized = rows
    .map((row) => ({
      date: String(row?.date || ''),
      raw: asNumber(row?.raw)
    }))
    .filter((row) => row.raw !== null && /^\d{4}-\d{2}-\d{2}$/.test(row.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (normalized.length === 0) return [];

  const byDate = new Map(normalized.map((row) => [row.date, row.raw]));
  const out = [];

  const start = new Date(`${normalized[0].date}T00:00:00Z`);
  const lastDate = new Date(`${normalized[normalized.length - 1].date}T00:00:00Z`);

  let current = new Date(start);
  let lastRaw = normalized[0].raw;

  while (current <= lastDate) {
    const iso = current.toISOString().slice(0, 10);
    if (byDate.has(iso)) {
      lastRaw = byDate.get(iso);
    }

    out.push({ date: iso, raw: lastRaw });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return out;
}
function renderTrmlChart(history) {
  const canvas = document.getElementById('trmlChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const allRows = normalizeHistoryForChart(history);
  const rows = Number.isFinite(trmlChartWindowPoints)
    ? (allRows.length > trmlChartWindowPoints ? allRows.slice(-trmlChartWindowPoints) : allRows)
    : allRows;

  const labels = rows.map((r) => r.date || '');
  const rawData = rows.map((r) => asNumber(r.raw));

  if (trmlChartInstance) trmlChartInstance.destroy();

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
          borderWidth: 2
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
          ticks: {
            color: '#cdefff',
            autoSkip: false,
            callback: (_value, index) => {
              const total = labels.length;
              if (total <= 1) return labels[index] || '';

              const step = total <= 45 ? 2 : total <= 90 ? 3 : total <= 180 ? 7 : 14;
              const isFirst = index === 0;
              const isLast = index === total - 1;
              const isStep = index % step === 0;

              return (isFirst || isLast || isStep) ? labels[index] : '';
            }
          },
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
        trmlHistoryCache = history;
        renderTrmlChart(history);
        return;
      }
    } catch (_e) {
      // try next source
    }
  }
}


function setChartRange(value) {
  if (value === 'all') {
    trmlChartWindowPoints = Number.POSITIVE_INFINITY;
  } else {
    const days = Number.parseInt(value, 10);
    trmlChartWindowPoints = Number.isFinite(days) ? days : TRML_CHART_DEFAULT_WINDOW_POINTS;
  }

  document.querySelectorAll('.trml-range-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-range') === value);
  });

  if (Array.isArray(trmlHistoryCache) && trmlHistoryCache.length > 0) {
    renderTrmlChart(trmlHistoryCache);
  }
}

function bindChartControls() {
  const buttons = document.querySelectorAll('.trml-range-btn');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const range = btn.getAttribute('data-range') || '30';
      setChartRange(range);
    });
  });
}
function bindUi() {
  bindChartControls();

  const telegramBtn = document.getElementById('telegramBtn');
  if (telegramBtn) {
    telegramBtn.addEventListener('click', () => {
      const textEl = document.getElementById('text-display');
      if (textEl) textEl.textContent = '';
      setTimeout(() => {
        window.open('https://t.me/trml_dispenser_bot', '_blank');
      }, 300);
    });
  }

  const supportBtn = document.getElementById('supportBtn');
  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      if (supportBtn.hasAttribute('onclick')) return;
      toggleSupportPanel();
    });
  }

  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy-target');
      copyAddress(targetId, btn);
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  bindUi();
  loadTrmlWidget();
  loadTrmlHistoryChart();

  currentUiLang = 'en';
  updateSupportPanel('en');

  setInterval(loadTrmlWidget, 10 * 60 * 1000);
  setInterval(loadTrmlHistoryChart, 10 * 60 * 1000);
});

window.showText = showText;
window.toggleSupportPanel = toggleSupportPanel;


