import json
import logging
import math
import os
import statistics
import time
from datetime import datetime, timezone

import requests
import yfinance as yf

# --- TRML-R1 basket (fixed weights) ---
TICKERS = {
    "CL=F": 0.20,  # WTI
    "NG=F": 0.08,  # Henry Hub
    "GC=F": 0.11,  # Gold
    "SI=F": 0.07,  # Silver
    "HG=F": 0.11,  # Copper
    "PL=F": 0.07,  # Platinum
    "ZW=F": 0.09,  # Wheat
    "ZC=F": 0.08,  # Corn
    "ZS=F": 0.07,  # Soybeans
    "KC=F": 0.04,  # Coffee
    "SB=F": 0.04,  # Sugar
    "CT=F": 0.04,  # Cotton
}

INDEX_VERSION = "TRML-R1"
BASE_INDEX_VALUE = 1_000_000.0
MEME_USD_BASE = 1_000_000.0
SPOT_BLEND_ALPHA = 0.5
SPOT_SYMBOLS = {
    "GC=F": {"stooq": "xauusd", "yahoo": "XAUUSD=X"},
    "SI=F": {"stooq": "xagusd", "yahoo": "XAGUSD=X"},
    "PL=F": {"stooq": "xptusd", "yahoo": "XPTUSD=X"},
}

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_FILE = os.path.join(ROOT_DIR, "base_prices.json")
BASE_SPOT_FILE = os.path.join(ROOT_DIR, "base_spot_prices.json")
ARCHIVE_DIR = os.path.join(ROOT_DIR, "archive")
LATEST_ARCHIVE_FILE = os.path.join(ARCHIVE_DIR, "latest.json")
LOG_DIR = os.path.join(ROOT_DIR, "logs")
LOG_FILE = os.path.join(LOG_DIR, "trml.log")

DATA_DIR = os.path.join(ROOT_DIR, "data")
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")
LAST_PRICES_FILE = os.path.join(DATA_DIR, "last_prices.json")
LAST_SPOT_FILE = os.path.join(DATA_DIR, "last_spot_prices.json")
PUBLIC_SNAPSHOT_FILE = os.path.abspath(os.path.join(ROOT_DIR, "..", "assets", "trml-latest.json"))
PUBLIC_HISTORY_FILE = os.path.abspath(os.path.join(ROOT_DIR, "..", "assets", "trml-history.json"))

SLEEP_BETWEEN_TICKERS_SEC = 0.8
FETCH_RETRIES = 3
MIN_WEIGHT_COVERAGE = 0.85
MEDIAN_WINDOW = 3
MAX_DAILY_MOVE = 0.15
EMA_PERIOD = 7


# ================= Logging =================

def setup_logging():
    os.makedirs(LOG_DIR, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.FileHandler(LOG_FILE, encoding="utf-8"),
            logging.StreamHandler(),
        ],
    )


def utc_today_str():
    return datetime.now(timezone.utc).date().isoformat()


# ================= Utils =================

def safe_float(value):
    try:
        f = float(value)
        return f if f > 0 else None
    except (TypeError, ValueError):
        return None


def calculate_ema(new_value: float, previous_value: float | None, period: int) -> float:
    if previous_value is None:
        return new_value
    alpha = 2.0 / (period + 1)
    return alpha * new_value + (1 - alpha) * previous_value


def inverse_power(value: float | None) -> float | None:
    if value is None or value <= 0:
        return None
    return 1.0 / value


# ================= Yahoo/Stooq Fetch =================

def fetch_last_close(ticker: str) -> float:
    last_error = None
    for attempt in range(1, FETCH_RETRIES + 1):
        try:
            hist = yf.Ticker(ticker).history(period="15d", interval="1d")
            if hist is None or hist.empty or "Close" not in hist.columns:
                raise RuntimeError(f"No data for {ticker}")

            close_values = [safe_float(v) for v in hist["Close"].tolist()]
            close_values = [v for v in close_values if v is not None]
            if not close_values:
                raise RuntimeError(f"No close prices for {ticker}")

            recent = close_values[-MEDIAN_WINDOW:]
            return float(statistics.median(recent))
        except Exception as e:
            last_error = e
            logging.warning(f"Fetch attempt {attempt}/{FETCH_RETRIES} failed for {ticker}: {e}")
            if attempt < FETCH_RETRIES:
                time.sleep(0.8 * attempt)
    raise RuntimeError(f"Failed to fetch {ticker} after {FETCH_RETRIES} attempts: {last_error}")


def fetch_last_close_stooq(ticker: str) -> float:
    symbol = ticker.replace("=F", ".F").lower()
    headers = {"User-Agent": "Mozilla/5.0 (TRML Index Bot)"}

    # Prefer daily history (median of up to 3 closes).
    history_url = f"https://stooq.com/q/d/l/?s={symbol}&i=d"
    response = requests.get(history_url, headers=headers, timeout=15)
    response.raise_for_status()

    rows = [line.strip() for line in response.text.splitlines() if line.strip()]
    data_rows = [line for line in rows if not line.lower().startswith("date,") and not line.lower().startswith("symbol,")]

    closes = []
    for line in reversed(data_rows):
        cols = [c.strip() for c in line.split(",")]
        close = None
        if len(cols) >= 5 and "-" in cols[0]:
            close = safe_float(cols[4])
        elif len(cols) >= 7:
            close = safe_float(cols[6])

        if close is not None:
            closes.append(close)
        if len(closes) == MEDIAN_WINDOW:
            break

    if closes:
        return float(statistics.median(closes))

    # Fallback to quote endpoint (single close).
    quote_url = f"https://stooq.com/q/l/?s={symbol}&f=sd2t2ohlcv&h&e=csv"
    quote_response = requests.get(quote_url, headers=headers, timeout=15)
    quote_response.raise_for_status()

    quote_rows = [line.strip() for line in quote_response.text.splitlines() if line.strip()]
    quote_data_rows = [line for line in quote_rows if not line.lower().startswith("symbol,")]
    if not quote_data_rows:
        raise RuntimeError(f"No stooq data for {ticker}")

    quote_cols = [c.strip() for c in quote_data_rows[0].split(",")]
    if len(quote_cols) < 7:
        raise RuntimeError(f"Malformed stooq quote data for {ticker}: {quote_data_rows[0]}")

    quote_close = safe_float(quote_cols[6])
    if quote_close is None:
        raise RuntimeError(f"No valid stooq close for {ticker}")

    return float(quote_close)


def fetch_last_close_stooq_symbol(symbol: str) -> float:
    headers = {"User-Agent": "Mozilla/5.0 (TRML Index Bot)"}

    history_url = f"https://stooq.com/q/d/l/?s={symbol.lower()}&i=d"
    response = requests.get(history_url, headers=headers, timeout=15)
    response.raise_for_status()

    rows = [line.strip() for line in response.text.splitlines() if line.strip()]
    data_rows = [line for line in rows if not line.lower().startswith("date,")]

    closes = []
    for line in reversed(data_rows):
        cols = [c.strip() for c in line.split(",")]
        if len(cols) < 5:
            continue
        close = safe_float(cols[4])
        if close is not None:
            closes.append(close)
        if len(closes) == MEDIAN_WINDOW:
            break

    if not closes:
        raise RuntimeError(f"No stooq spot data for symbol={symbol}")

    return float(statistics.median(closes))


# ================= Storage =================


def load_json(path: str):
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        logging.error(f"Failed to load JSON '{path}': {e}")
        return None


def save_json(path: str, obj):
    folder = os.path.dirname(path)
    if folder:
        os.makedirs(folder, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def save_public_snapshot(snapshot: dict):
    public_dir = os.path.dirname(PUBLIC_SNAPSHOT_FILE)
    if os.path.isdir(public_dir):
        save_json(PUBLIC_SNAPSHOT_FILE, snapshot)
        logging.info(f"Public snapshot updated: {PUBLIC_SNAPSHOT_FILE}")



def save_public_history(history: list):
    public_dir = os.path.dirname(PUBLIC_HISTORY_FILE)
    if os.path.isdir(public_dir):
        save_json(PUBLIC_HISTORY_FILE, history)
        logging.info(f"Public history updated: {PUBLIC_HISTORY_FILE}")

def get_last_price_from_archive(ticker: str):
    if not os.path.exists(ARCHIVE_DIR):
        return None

    files = sorted(os.listdir(ARCHIVE_DIR), reverse=True)
    for filename in files:
        path = os.path.join(ARCHIVE_DIR, filename)
        if not os.path.isfile(path) or not filename.endswith(".json"):
            continue
        data = load_json(path)
        if not isinstance(data, dict):
            continue
        prices = data.get("prices", {})
        if ticker in prices and prices[ticker] is not None:
            return prices[ticker]
    return None


def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(HISTORY_FILE):
        save_json(HISTORY_FILE, [])


def load_last_prices_cache() -> dict:
    ensure_data_dir()
    data = load_json(LAST_PRICES_FILE)
    return data if isinstance(data, dict) else {}


def save_last_prices_cache(prices: dict):
    ensure_data_dir()
    existing = load_last_prices_cache()
    existing.update({k: v for k, v in prices.items() if v is not None})
    save_json(LAST_PRICES_FILE, existing)


def load_last_spot_cache() -> dict:
    ensure_data_dir()
    data = load_json(LAST_SPOT_FILE)
    return data if isinstance(data, dict) else {}


def save_last_spot_cache(prices: dict):
    ensure_data_dir()
    existing = load_last_spot_cache()
    existing.update({k: v for k, v in prices.items() if v is not None})
    save_json(LAST_SPOT_FILE, existing)


# ================= Price pipeline =================

def reference_price_for_ticker(ticker: str, cache: dict, base_prices: dict | None):
    cached = cache.get(ticker)
    if cached is not None:
        return cached

    archived = get_last_price_from_archive(ticker)
    if archived is not None:
        return archived

    if base_prices and base_prices.get(ticker) is not None:
        return base_prices[ticker]

    return None


def reference_spot_price_for_ticker(ticker: str, cache: dict, base_spot: dict | None):
    cached = cache.get(ticker)
    if cached is not None:
        return cached

    if base_spot and base_spot.get(ticker) is not None:
        return base_spot[ticker]

    return None


def clamp_price_change(ticker: str, price: float, reference: float | None) -> float:
    if reference is None or reference <= 0:
        return price

    lower = reference * (1 - MAX_DAILY_MOVE)
    upper = reference * (1 + MAX_DAILY_MOVE)

    if price < lower:
        logging.warning(f"Clamped {ticker} from {price} to lower bound {lower} (ref={reference})")
        return lower
    if price > upper:
        logging.warning(f"Clamped {ticker} from {price} to upper bound {upper} (ref={reference})")
        return upper
    return price


def fetch_all_prices(base_prices: dict | None = None) -> dict:
    prices = {}
    cache = load_last_prices_cache()

    for ticker in TICKERS.keys():
        ref_price = reference_price_for_ticker(ticker, cache, base_prices)

        try:
            live_price = fetch_last_close_stooq(ticker)
            live_price = clamp_price_change(ticker, live_price, ref_price)
            prices[ticker] = live_price
            logging.info(f"Fetched {ticker} via stooq (median-{MEDIAN_WINDOW}): {live_price}")

        except Exception as stooq_error:
            logging.warning(f"Stooq fetch failed for {ticker}: {stooq_error}")

            try:
                live_price = fetch_last_close(ticker)
                live_price = clamp_price_change(ticker, live_price, ref_price)
                prices[ticker] = live_price
                logging.info(f"Fetched {ticker} via yahoo (median-{MEDIAN_WINDOW}): {live_price}")
                time.sleep(SLEEP_BETWEEN_TICKERS_SEC)
                continue
            except Exception as yahoo_error:
                logging.warning(f"Yahoo fetch failed for {ticker}: {yahoo_error}")

            fallback = get_last_price_from_archive(ticker)
            source = "archive"

            if fallback is None and cache.get(ticker) is not None:
                fallback = cache[ticker]
                source = "last_prices_cache"

            if fallback is None and base_prices and base_prices.get(ticker) is not None:
                fallback = base_prices[ticker]
                source = "base_prices"

            if fallback is not None:
                prices[ticker] = fallback
                logging.warning(f"Using fallback ({source}) for {ticker}: {fallback}")
            else:
                prices[ticker] = None
                logging.error(f"No fallback available for {ticker}")

        time.sleep(SLEEP_BETWEEN_TICKERS_SEC)

    save_last_prices_cache(prices)
    return prices


def fetch_all_spot_prices(base_spot: dict | None = None) -> dict:
    spot_prices = {}
    cache = load_last_spot_cache()

    for ticker, feed in SPOT_SYMBOLS.items():
        _ref_price = reference_spot_price_for_ticker(ticker, cache, base_spot)
        stooq_symbol = feed.get("stooq")
        yahoo_symbol = feed.get("yahoo")

        try:
            live_price = fetch_last_close_stooq_symbol(stooq_symbol)
            spot_prices[ticker] = live_price
            logging.info(f"Fetched SPOT {ticker} via stooq symbol={stooq_symbol} (median-{MEDIAN_WINDOW}): {live_price}")
        except Exception as stooq_err:
            logging.warning(f"SPOT stooq fetch failed for {ticker} ({stooq_symbol}): {stooq_err}")
            try:
                live_price = fetch_last_close(yahoo_symbol)
                spot_prices[ticker] = live_price
                logging.info(f"Fetched SPOT {ticker} via yahoo symbol={yahoo_symbol} (median-{MEDIAN_WINDOW}): {live_price}")
                time.sleep(SLEEP_BETWEEN_TICKERS_SEC)
                continue
            except Exception as yahoo_err:
                logging.warning(f"SPOT yahoo fetch failed for {ticker} ({yahoo_symbol}): {yahoo_err}")

            fallback = cache.get(ticker)
            source = "last_spot_cache"

            if fallback is None and base_spot and base_spot.get(ticker) is not None:
                fallback = base_spot[ticker]
                source = "base_spot_prices"

            if fallback is not None:
                spot_prices[ticker] = fallback
                logging.warning(f"Using SPOT fallback ({source}) for {ticker}: {fallback}")
            else:
                spot_prices[ticker] = None
                logging.warning(f"No SPOT price available for {ticker}; futures-only mode for this ticker")
        time.sleep(SLEEP_BETWEEN_TICKERS_SEC)

    save_last_spot_cache(spot_prices)
    return spot_prices


# ================= Index Core =================

def validate_weights():
    total_weight = sum(TICKERS.values())
    if abs(total_weight - 1.0) > 1e-9:
        raise ValueError(f"Weights must sum to 1.0, got {total_weight}")


def geometric_index_with_coverage(prices: dict, base: dict) -> tuple[float, float, list]:
    total_log = 0.0
    covered_weight = 0.0
    missing = []

    for ticker, weight in TICKERS.items():
        current = prices.get(ticker)
        base_price = base.get(ticker) if isinstance(base, dict) else None

        if current is None or base_price is None or current <= 0 or base_price <= 0:
            missing.append(ticker)
            continue

        total_log += weight * math.log(current / base_price)
        covered_weight += weight

    if covered_weight < MIN_WEIGHT_COVERAGE:
        raise RuntimeError(
            f"Insufficient coverage for index calculation: {covered_weight:.2%} < {MIN_WEIGHT_COVERAGE:.2%}"
        )

    normalized_log = total_log / covered_weight
    index_value = BASE_INDEX_VALUE * math.exp(normalized_log)
    return index_value, covered_weight, missing


def hybrid_ratio(
    ticker: str,
    current_fut: float,
    base_fut: float,
    current_spot: float | None,
    base_spot: float | None,
) -> tuple[float, bool]:
    fut_ratio = current_fut / base_fut
    if ticker not in SPOT_SYMBOLS:
        return fut_ratio, False

    if current_spot is None or base_spot is None or current_spot <= 0 or base_spot <= 0:
        return fut_ratio, False

    spot_ratio = current_spot / base_spot
    combined_log = (1.0 - SPOT_BLEND_ALPHA) * math.log(fut_ratio) + SPOT_BLEND_ALPHA * math.log(spot_ratio)
    return math.exp(combined_log), True


def backfill_missing_base_tickers(base: dict, prices: dict) -> tuple[dict, list]:
    updated = dict(base or {})
    added = []

    for ticker in TICKERS.keys():
        if updated.get(ticker) is None:
            value = prices.get(ticker)
            if value is not None and value > 0:
                updated[ticker] = value
                added.append(ticker)

    return updated, added


def normalize_base_spot_prices(base_spot: dict, spot_prices: dict) -> tuple[dict, list]:
    updated = dict(base_spot or {})
    changed = []

    for ticker, current in spot_prices.items():
        if current is None or current <= 0:
            continue

        previous = updated.get(ticker)
        if previous is None or previous <= 0:
            updated[ticker] = current
            changed.append(ticker)
            continue

        ratio = max(previous / current, current / previous)
        if ratio > 5.0:
            logging.warning(
                f"SPOT base normalization for {ticker}: old={previous}, new={current} (ratio={ratio:.2f})"
            )
            updated[ticker] = current
            changed.append(ticker)

    return updated, changed


def geometric_hybrid_index_with_coverage(
    prices: dict,
    base: dict,
    spot_prices: dict,
    base_spot: dict,
) -> tuple[float, float, list, list, list]:
    total_log = 0.0
    covered_weight = 0.0
    missing = []
    hybrid_used = []
    futures_only_fallback = []

    for ticker, weight in TICKERS.items():
        current = prices.get(ticker)
        base_price = base.get(ticker) if isinstance(base, dict) else None

        if current is None or base_price is None or current <= 0 or base_price <= 0:
            missing.append(ticker)
            continue

        ratio, used_hybrid = hybrid_ratio(
            ticker=ticker,
            current_fut=current,
            base_fut=base_price,
            current_spot=spot_prices.get(ticker),
            base_spot=base_spot.get(ticker) if isinstance(base_spot, dict) else None,
        )

        if used_hybrid:
            hybrid_used.append(ticker)
        elif ticker in SPOT_SYMBOLS:
            futures_only_fallback.append(ticker)

        total_log += weight * math.log(ratio)
        covered_weight += weight

    if covered_weight < MIN_WEIGHT_COVERAGE:
        raise RuntimeError(
            f"Insufficient coverage for index calculation: {covered_weight:.2%} < {MIN_WEIGHT_COVERAGE:.2%}"
        )

    normalized_log = total_log / covered_weight
    index_value = BASE_INDEX_VALUE * math.exp(normalized_log)
    return index_value, covered_weight, missing, hybrid_used, futures_only_fallback


# ================= History =================

def load_history() -> list:
    ensure_data_dir()
    data = load_json(HISTORY_FILE)
    return data if isinstance(data, list) else []


def save_history(history: list):
    ensure_data_dir()
    save_json(HISTORY_FILE, history)


def calculate_sma(history: list, period: int):
    if len(history) < period:
        return None
    values = [entry["raw"] for entry in history[-period:]]
    return sum(values) / period


def upsert_history(run_date: str, raw_index: float, k_raw: float, k_smooth: float):
    history = load_history()

    if history and history[-1].get("date") == run_date:
        history[-1]["raw"] = raw_index
        history[-1]["k_raw"] = k_raw
        history[-1]["k_smooth_ema7"] = k_smooth
    else:
        history.append({
            "date": run_date,
            "raw": raw_index,
            "k_raw": k_raw,
            "k_smooth_ema7": k_smooth,
            "sma_7": None,
            "sma_30": None,
        })

    history[-1]["sma_7"] = calculate_sma(history, 7)
    history[-1]["sma_30"] = calculate_sma(history, 30)

    save_history(history)
    return history[-1], history


# ================= Main =================

def build_output(run_date: str, prices: dict, base: dict, index_value: float, history_row: dict,
                 coverage: float | None, excluded: list, note: str | None = None,
                 spot_prices: dict | None = None, base_spot_prices: dict | None = None,
                 hybrid_used: list | None = None, hybrid_fallback: list | None = None) -> dict:
    k_raw = history_row["k_raw"]
    k_smooth = history_row["k_smooth_ema7"]
    pp_raw = inverse_power(k_raw)
    pp_smooth = inverse_power(k_smooth)

    out = {
        "date_utc": run_date,
        "version": INDEX_VERSION,
        "index": index_value,
        "prices": prices,
        "base_prices": base,
        "spot_prices": spot_prices or {},
        "base_spot_prices": base_spot_prices or {},
        "method": "geometric_weighted_hybrid_spot_futures_median3",
        "spot_blend_alpha": SPOT_BLEND_ALPHA,
        "hybrid_tickers_used": hybrid_used or [],
        "hybrid_tickers_futures_only": hybrid_fallback or [],
        "base_index_value": BASE_INDEX_VALUE,
        "coverage": coverage,
        "excluded_tickers": excluded,
        "k_raw": k_raw,
        "k_smooth_ema7": k_smooth,
        "cost_index_k": k_raw,
        "cost_index_k_smooth": k_smooth,
        "cost_index_change_pct": (k_raw - 1.0) * 100.0,
        "purchasing_power_usd": pp_raw,
        "purchasing_power_usd_smooth": pp_smooth,
        "purchasing_power_change_pct": ((pp_raw - 1.0) * 100.0) if pp_raw is not None else None,
        "trml_usd_raw": MEME_USD_BASE * k_raw,
        "trml_usd_smooth": MEME_USD_BASE * k_smooth,
        "sma_7": history_row["sma_7"],
        "sma_30": history_row["sma_30"],
    }

    if note:
        out["note"] = note

    return out


def main():
    setup_logging()
    validate_weights()

    run_date = utc_today_str()
    logging.info(f"=== TRML run start | date(UTC)={run_date} | version={INDEX_VERSION} ===")

    base = load_json(BASE_FILE)
    if base is not None and not isinstance(base, dict):
        logging.error(f"Invalid {BASE_FILE} format, expected object/dict. Stop.")
        return

    base_spot = load_json(BASE_SPOT_FILE)
    if base_spot is not None and not isinstance(base_spot, dict):
        logging.error(f"Invalid {BASE_SPOT_FILE} format, expected object/dict. Stop.")
        return
    if base_spot is None:
        base_spot = {}

    prices = fetch_all_prices(base_prices=base)

    if base is not None:
        base, added_base_tickers = backfill_missing_base_tickers(base, prices)
        if added_base_tickers:
            save_json(BASE_FILE, base)
            logging.info(f"Backfilled missing base tickers: {added_base_tickers}")

    spot_prices = fetch_all_spot_prices(base_spot=base_spot)
    base_spot, normalized = normalize_base_spot_prices(base_spot, spot_prices)
    if normalized:
        save_json(BASE_SPOT_FILE, base_spot)
        logging.info(f"Normalized base SPOT prices for: {normalized}")
    missing = [ticker for ticker, value in prices.items() if value is None]

    if base is None:
        if missing:
            logging.error(f"First run requires all tickers, but missing: {missing}. Stop.")
            return

        save_json(BASE_FILE, prices)
        base_spot_seed = {ticker: value for ticker, value in spot_prices.items() if value is not None}
        save_json(BASE_SPOT_FILE, base_spot_seed)
        logging.info("Base prices saved. Next run will calculate index.")

        last_row, history = upsert_history(run_date, BASE_INDEX_VALUE, 1.0, 1.0)

        out = build_output(
            run_date=run_date,
            prices=prices,
            base=prices,
            index_value=BASE_INDEX_VALUE,
            history_row=last_row,
            coverage=1.0,
            excluded=[],
            note="Base fixed on first run.",
            spot_prices=spot_prices,
            base_spot_prices=base_spot_seed,
            hybrid_used=list(base_spot_seed.keys()),
            hybrid_fallback=[ticker for ticker in SPOT_SYMBOLS.keys() if ticker not in base_spot_seed],
        )

        save_json(os.path.join(ARCHIVE_DIR, f"{run_date}.json"), out)
        save_json(LATEST_ARCHIVE_FILE, out)
        save_public_snapshot(out)
        save_public_history(history)
        logging.info("Day-0 archive saved.")
        return

    existing_history = load_history()
    previous = existing_history[-1] if existing_history else None

    note = None
    excluded = []
    coverage = None
    hybrid_used = []
    hybrid_fallback = []

    if not base_spot:
        base_spot = {ticker: value for ticker, value in spot_prices.items() if value is not None}
        if base_spot:
            save_json(BASE_SPOT_FILE, base_spot)
            logging.info("Base SPOT prices initialized from current SPOT data.")

    try:
        idx, coverage, excluded, hybrid_used, hybrid_fallback = geometric_hybrid_index_with_coverage(
            prices=prices,
            base=base,
            spot_prices=spot_prices,
            base_spot=base_spot,
        )
        if excluded:
            logging.warning(f"Index calculated with partial basket, excluded: {excluded}, coverage={coverage:.2%}")
        if hybrid_fallback:
            logging.warning(f"Hybrid unavailable for tickers (futures-only fallback): {hybrid_fallback}")
    except RuntimeError as e:
        if previous and previous.get("raw") is not None:
            idx = float(previous["raw"])
            coverage = 0.0
            excluded = missing if missing else list(TICKERS.keys())
            note = f"{e}. Reused previous index values."
            logging.warning(note)
        else:
            logging.error(f"Index calculation failed and no previous history to reuse: {e}")
            return

    k_raw = idx / BASE_INDEX_VALUE
    prev_k_smooth = previous.get("k_smooth_ema7") if previous else None
    if prev_k_smooth is None and previous and previous.get("k_raw") is not None:
        prev_k_smooth = previous["k_raw"]

    k_smooth = calculate_ema(k_raw, prev_k_smooth, EMA_PERIOD)

    last_row, history = upsert_history(run_date, idx, k_raw, k_smooth)

    out = build_output(
        run_date=run_date,
        prices=prices,
        base=base,
        index_value=idx,
        history_row=last_row,
        coverage=coverage,
        excluded=excluded,
        note=note,
        spot_prices=spot_prices,
        base_spot_prices=base_spot,
        hybrid_used=hybrid_used,
        hybrid_fallback=hybrid_fallback,
    )

    save_json(os.path.join(ARCHIVE_DIR, f"{run_date}.json"), out)
    save_json(LATEST_ARCHIVE_FILE, out)
    save_public_snapshot(out)
    save_public_history(history)

    logging.info(f"TRML index: {idx}")
    pp_raw = inverse_power(k_raw)
    pp_smooth = inverse_power(k_smooth)
    logging.info(f"K raw: {k_raw} | K smooth EMA7: {k_smooth}")
    logging.info(f"Index (raw): {MEME_USD_BASE * k_raw} | Index (smooth): {MEME_USD_BASE * k_smooth}")
    logging.info(f"Purchasing power USD (raw): {pp_raw} | Purchasing power USD (smooth): {pp_smooth}")
    logging.info(f"Purchasing power change vs base: {((pp_raw - 1.0) * 100.0) if pp_raw is not None else None}%")
    logging.info(f"Hybrid spot used: {hybrid_used} | Spot fallback to futures: {hybrid_fallback}")
    logging.info(f"SMA7: {last_row['sma_7']} | SMA30: {last_row['sma_30']}")
    logging.info("Archive saved.")
    logging.info("=== TRML run end ===")


if __name__ == "__main__":
    main()






