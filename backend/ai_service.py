from backend.config import get_config
from backend.gemini_service import generate_chat_response as generate_gemini_response
from backend.nvidia_service import generate_nvidia_chat_response

def get_active_chat_response(messages: list, provider: str = None, model: str = None):
    cfg = get_config()
    selected_provider = provider or cfg.get("AI_PROVIDER", "gemini")
    
    if selected_provider == "nvidia":
        return generate_nvidia_chat_response(messages, model_name=model)
    else:
        return generate_gemini_response(messages, model_name=model)
