from pathlib import Path

import webview

from backend.server import AutocarApiServer

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"


def main() -> None:
    server = AutocarApiServer(FRONTEND_DIR)
    server.start()

    try:
        webview.create_window(
            "Autocar Status",
            url=server.base_url,
            width=1100,
            height=760,
            min_size=(920, 640),
            resizable=True,
        )
        webview.start()
    finally:
        server.stop()


if __name__ == "__main__":
    main()
