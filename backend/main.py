import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional

from backend.config import get_config, update_config
from backend.ai_service import get_active_chat_response
import backend.meta_api as meta_api

app = FastAPI(title="Ad Manager AI Chatbot", version="2.5")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SettingsPayload(BaseModel):
    gemini_api_key: Optional[str] = None
    nvidia_nim_api_key: Optional[str] = None
    ai_provider: Optional[str] = "gemini"
    nvidia_model: Optional[str] = "deepseek-v4-flash-0731"
    meta_access_token: Optional[str] = None
    meta_ad_account_id: Optional[str] = None
    meta_api_version: Optional[str] = "v20.0"

class MessageItem(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    messages: List[MessageItem]
    provider: Optional[str] = None
    model: Optional[str] = "gemini-3.6-flash"

# Dual routes to match both /api/path and /path for bulletproof Vercel routing
@app.get("/api/health")
@app.get("/health")
def health_check():
    return JSONResponse(content={"status": "ok", "version": "2.5"})

@app.get("/api/settings")
@app.get("/settings")
def get_settings():
    try:
        cfg = get_config()
        return JSONResponse(content={
            "status": "success",
            "gemini_api_key": cfg.get("GEMINI_API_KEY", ""),
            "nvidia_nim_api_key": cfg.get("NVIDIA_NIM_API_KEY", ""),
            "ai_provider": cfg.get("AI_PROVIDER", "gemini"),
            "nvidia_model": cfg.get("NVIDIA_MODEL", "deepseek-v4-flash-0731"),
            "meta_access_token": cfg.get("META_ACCESS_TOKEN", ""),
            "meta_ad_account_id": cfg.get("META_AD_ACCOUNT_ID", "act_1397457568798633"),
            "meta_api_version": cfg.get("META_API_VERSION", "v20.0"),
            "has_gemini_key": bool(cfg.get("GEMINI_API_KEY")),
            "has_nvidia_key": bool(cfg.get("NVIDIA_NIM_API_KEY")),
            "has_meta_token": bool(cfg.get("META_ACCESS_TOKEN")),
        })
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)})

@app.post("/api/settings")
@app.post("/settings")
def save_settings(payload: SettingsPayload):
    try:
        updated = update_config(
            gemini_api_key=payload.gemini_api_key,
            nvidia_nim_api_key=payload.nvidia_nim_api_key,
            ai_provider=payload.ai_provider,
            nvidia_model=payload.nvidia_model,
            meta_access_token=payload.meta_access_token,
            meta_ad_account_id=payload.meta_ad_account_id,
            meta_api_version=payload.meta_api_version
        )
        cfg = get_config()
        return JSONResponse(content={
            "status": "success",
            "gemini_api_key": cfg.get("GEMINI_API_KEY", ""),
            "nvidia_nim_api_key": cfg.get("NVIDIA_NIM_API_KEY", ""),
            "ai_provider": cfg.get("AI_PROVIDER", "gemini"),
            "nvidia_model": cfg.get("NVIDIA_MODEL", "deepseek-v4-flash-0731"),
            "meta_access_token": cfg.get("META_ACCESS_TOKEN", ""),
            "meta_ad_account_id": cfg.get("META_AD_ACCOUNT_ID", "act_1397457568798633"),
            "meta_api_version": cfg.get("META_API_VERSION", "v20.0"),
            "has_gemini_key": bool(cfg.get("GEMINI_API_KEY")),
            "has_nvidia_key": bool(cfg.get("NVIDIA_NIM_API_KEY")),
            "has_meta_token": bool(cfg.get("META_ACCESS_TOKEN")),
        })
    except Exception as e:
        return JSONResponse(content={"status": "error", "message": str(e)})

@app.post("/api/chat")
@app.post("/chat")
def chat_endpoint(payload: ChatPayload):
    try:
        messages_dict = [msg.model_dump() for msg in payload.messages]
        response = get_active_chat_response(messages_dict, provider=payload.provider, model=payload.model)
        return JSONResponse(content=response)
    except Exception as e:
        return JSONResponse(content={"role": "assistant", "content": f"⚠️ Server Error: {str(e)}"})

@app.get("/api/meta/accounts")
@app.get("/meta/accounts")
def meta_accounts():
    return JSONResponse(content=meta_api.get_ad_accounts())

@app.get("/api/meta/insights")
@app.get("/meta/insights")
def meta_insights(date_preset: str = "last_30d"):
    return JSONResponse(content=meta_api.get_account_insights(date_preset=date_preset))

@app.get("/api/meta/campaigns")
@app.get("/meta/campaigns")
def meta_campaigns():
    return JSONResponse(content=meta_api.get_campaigns())

@app.get("/api/meta/page-followers")
@app.get("/meta/page-followers")
def meta_page_followers():
    return JSONResponse(content=meta_api.get_page_followers())

if not os.getenv("VERCEL") and not os.getenv("VERCEL_ENV"):
    FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
    if FRONTEND_DIST.exists():
        app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")
        @app.get("/{full_path:path}")
        def serve_frontend(full_path: str):
            file_path = FRONTEND_DIST / full_path
            if file_path.exists() and file_path.is_file():
                return FileResponse(file_path)
            return FileResponse(FRONTEND_DIST / "index.html")
