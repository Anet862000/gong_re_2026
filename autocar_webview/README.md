# Autocar Webview Status

Python + Flask + pywebview based desktop webview UI for checking autocar state.

## Run with uv

```powershell
cd autocar_webview
uv sync
uv run python main.py
```

## Run with venv

```powershell
cd autocar_webview
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python main.py
```

The app starts a local Flask server on `127.0.0.1:49340` and opens it in a
native webview window. If the webview backend is unavailable on your system,
open `http://127.0.0.1:49340` in a browser while the script is running.
