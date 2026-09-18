import os
from pathlib import Path
from dotenv import load_dotenv, set_key

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

if not ENV_PATH.exists():
    try:
        ENV_PATH.touch()
    except Exception:
        pass

try:
    load_dotenv(dotenv_path=ENV_PATH, override=True)
except Exception:
    pass

DEFAULT_AD_ACCOUNT_ID = "act_1397457568798633"

def clean_val(val: str) -> str:
    if val is None:
        return ""
    return str(val).strip().replace("\r", "").replace("\n", "")

def get_config():
    try:
        load_dotenv(dotenv_path=ENV_PATH, override=True)
    except Exception:
        pass
    return {
        "GEMINI_API_KEY": os.getenv("GEMINI_API_KEY", ""),
        "NVIDIA_NIM_API_KEY": os.getenv("NVIDIA_NIM_API_KEY", ""),
        "AI_PROVIDER": os.getenv("AI_PROVIDER", "gemini"),
        "NVIDIA_MODEL": os.getenv("NVIDIA_MODEL", "deepseek-v4-flash-0731"),
        "META_ACCESS_TOKEN": os.getenv("META_ACCESS_TOKEN", ""),
        "META_AD_ACCOUNT_ID": os.getenv("META_AD_ACCOUNT_ID", DEFAULT_AD_ACCOUNT_ID) or DEFAULT_AD_ACCOUNT_ID,
        "META_API_VERSION": os.getenv("META_API_VERSION", "v20.0")
    }

def update_config(
    gemini_api_key: str = None, 
    nvidia_nim_api_key: str = None,
    ai_provider: str = None,
    nvidia_model: str = None,
    meta_access_token: str = None, 
    meta_ad_account_id: str = None, 
    meta_api_version: str = None
):
    if gemini_api_key is not None:
        v = clean_val(gemini_api_key)
        os.environ["GEMINI_API_KEY"] = v
        try:
            set_key(dotenv_path=ENV_PATH, key_to_set="GEMINI_API_KEY", value_to_set=v)
        except Exception:
            pass

    if nvidia_nim_api_key is not None:
        v = clean_val(nvidia_nim_api_key)
        os.environ["NVIDIA_NIM_API_KEY"] = v
        try:
            set_key(dotenv_path=ENV_PATH, key_to_set="NVIDIA_NIM_API_KEY", value_to_set=v)
        except Exception:
            pass

    if ai_provider is not None:
        v = clean_val(ai_provider)
        os.environ["AI_PROVIDER"] = v
        try:
            set_key(dotenv_path=ENV_PATH, key_to_set="AI_PROVIDER", value_to_set=v)
        except Exception:
            pass

    if nvidia_model is not None:
        v = clean_val(nvidia_model)
        os.environ["NVIDIA_MODEL"] = v
        try:
            set_key(dotenv_path=ENV_PATH, key_to_set="NVIDIA_MODEL", value_to_set=v)
        except Exception:
            pass

    if meta_access_token is not None:
        v = clean_val(meta_access_token)
        os.environ["META_ACCESS_TOKEN"] = v
        try:
            set_key(dotenv_path=ENV_PATH, key_to_set="META_ACCESS_TOKEN", value_to_set=v)
        except Exception:
            pass

    if meta_ad_account_id is not None:
        v = clean_val(meta_ad_account_id) or DEFAULT_AD_ACCOUNT_ID
        os.environ["META_AD_ACCOUNT_ID"] = v
        try:
            set_key(dotenv_path=ENV_PATH, key_to_set="META_AD_ACCOUNT_ID", value_to_set=v)
        except Exception:
            pass

    if meta_api_version is not None:
        v = clean_val(meta_api_version) or "v20.0"
        os.environ["META_API_VERSION"] = v
        try:
            set_key(dotenv_path=ENV_PATH, key_to_set="META_API_VERSION", value_to_set=v)
        except Exception:
            pass

    return get_config()
