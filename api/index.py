import os
import sys
from pathlib import Path

# Ensure project root is in sys.path for Vercel serverless environment
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from backend.main import app
except Exception as e:
    from fastapi import FastAPI, Response
    app = FastAPI()

    @app.get("/api/health")
    def health_err():
        return {"status": "error", "message": f"Serverless Init Error: {str(e)}"}

    @app.get("/api/settings")
    @app.post("/api/settings")
    def settings_err():
        return {"status": "error", "message": f"Serverless Init Error: {str(e)}"}

    @app.post("/api/chat")
    def chat_err():
        return {"role": "assistant", "content": f"⚠️ Vercel Import Error: {str(e)}"}
