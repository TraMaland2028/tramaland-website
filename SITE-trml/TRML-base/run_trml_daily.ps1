$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

& .\.venv\Scripts\python.exe .\trml_base.py
if ($LASTEXITCODE -ne 0) {
  throw "TRML daily run failed with exit code $LASTEXITCODE"
}
