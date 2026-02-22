# TRML Base

Daily commodity index calculator with fallback market data providers.

## Run

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe trml_base.py
```

## Daily update (Windows Task Scheduler)

```powershell
schtasks /Create /TN "TRML_Daily_Update" /SC DAILY /ST 00:10 /TR "powershell -ExecutionPolicy Bypass -File C:\Users\Иван\Desktop\SITE-trml\TRML-base\run_trml_daily.ps1" /F
```

## Output

- `archive/YYYY-MM-DD.json` daily snapshot
- `archive/latest.json` latest snapshot for frontend
- `data/history.json` index history with SMA values
- `data/last_prices.json` cached latest prices
- `../assets/trml-latest.json` public snapshot for website widget
- `logs/trml.log` run logs
