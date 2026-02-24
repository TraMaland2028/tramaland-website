



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
  polygon: '0x09c4681F706eA371C9b44ea1502aE2959e13dbbB',
  ton: 'UQBycExf_jrE8umE9vzQ3fduTQyLxw4S7CIzxh6z1VMDHbUo'
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

  if (trmlHintEl && payload && payload.market_data_fresh === false) {
    trmlHintEl.textContent += ' Market closed or unchanged: latest available prices used.';
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

      updateSupportPanel(lang);
      localStorage.setItem('selectedLang', lang);
    });
}

function getCurrentLang() {
  return localStorage.getItem('selectedLang') || 'en';
}

function updateSupportPanel(lang) {
  const tr = translations[lang] || translations.ru;
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
    // silent fallback
  }
}

function toggleSupportPanel() {
  const panel = document.getElementById('supportPanel');
  if (!panel) return;

  const lang = getCurrentLang();
  updateSupportPanel(lang);

  const isHidden = panel.hasAttribute('hidden');
  if (isHidden) {
    panel.removeAttribute('hidden');
    panel.classList.add('is-open');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    panel.setAttribute('hidden', 'hidden');
    panel.classList.remove('is-open');
  }
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

window.addEventListener('DOMContentLoaded', () => {
  initTrmlTilt();
  loadTrmlWidget();
  loadTrmlHistoryChart();
  localStorage.setItem('selectedLang', 'en');
  updateSupportPanel('en');
  setInterval(loadTrmlWidget, 10 * 60 * 1000);
  setInterval(loadTrmlHistoryChart, 10 * 60 * 1000);
});

window.showText = showText;
window.toggleSupportPanel = toggleSupportPanel;

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


