import json
from google import genai
from google.genai import types
from backend.config import get_config
import backend.meta_api as meta_api

SYSTEM_INSTRUCTION = """
You are an expert Meta Ads & Digital Marketing AI Assistant.
You help users manage, analyze, and optimize their Meta Ads (Facebook & Instagram Ads) campaigns and answer marketing queries.
You have access to tools to query real-time data from Meta Graph API:
- `get_ad_accounts`: List accessible ad accounts.
- `get_account_insights`: Get overall account performance (spend, impressions, clicks, CTR, CPC, CPM, reach, Page Likes & Followers).
- `get_campaigns`: List campaigns, their status, objectives, and budgets.
- `get_campaign_insights`: Get per-campaign performance metrics (including Page Likes & Followers per campaign).
- `get_page_followers`: Get total Page Followers, Page Likes (fan_count), and details for connected Facebook Pages.
- `update_campaign_status`: Pause or activate a campaign.

When answering, be helpful, concise, accurate, and format financial values ($ or local currency), CTR (%), and CPC cleanly using Markdown tables or bullet points.
If Meta tokens or API keys are missing or report errors, politely instruct the user to update their credentials in the Settings section.
Respond in clear, natural language (Sinhala or English based on the user's language).
"""

def generate_chat_response(messages: list, model_name: str = "gemini-3.6-flash"):
    cfg = get_config()
    api_key = cfg.get("GEMINI_API_KEY", "")
    
    if not api_key:
        return {
            "role": "assistant",
            "content": "⚠️ **Google Gemini API Key හමුවුණේ නැත.**\n\nChat Bot සක්‍රීය කිරීමට කරුණාකර දකුණු පස ඇති **Settings (⚙️)** Icon එක ක්ලික් කර ඔබගේ Google Gemini API Key එක සහ Meta Access Token එක ලබා දෙන්න."
        }
    
    # Models to try in order of preference if selected model is deprecated
    models_to_try = [model_name, "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.5-flash"]
    # De-duplicate while preserving order
    models_to_try = list(dict.fromkeys(models_to_try))

    last_error = None

    for target_model in models_to_try:
        try:
            client = genai.Client(api_key=api_key)
            
            contents = []
            for msg in messages:
                role = "user" if msg.get("role") == "user" else "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg.get("content", ""))]
                    )
                )

            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                tools=[
                    meta_api.get_ad_accounts,
                    meta_api.get_account_insights,
                    meta_api.get_campaigns,
                    meta_api.get_campaign_insights,
                    meta_api.get_page_followers,
                    meta_api.update_campaign_status
                ],
                temperature=0.7
            )

            response = client.models.generate_content(
                model=target_model,
                contents=contents,
                config=config
            )

            output_text = response.text or "තොරතුරු සැකසීමට නොහැකි විය."
            return {
                "role": "assistant",
                "content": output_text
            }

        except Exception as e:
            last_error = e
            err_str = str(e)
            # If 404 error, try next model in loop
            if "404" in err_str or "NOT_FOUND" in err_str:
                continue
            else:
                break

    # If all models failed
    err_msg = str(last_error) if last_error else "Unknown error"
    if "API_KEY_INVALID" in err_msg or "400" in err_msg:
        return {
            "role": "assistant",
            "content": f"⚠️ **Google API Key Error**: ඔබ ඇතුළත් කළ API Key එක වලංගු නොවේ (`{err_msg}`). කරුණාකර Settings එකෙන් නිවැරදි API Key එක ඇතුළත් කරන්න."
        }
    return {
        "role": "assistant",
        "content": f"⚠️ **Gemini API Error**: {err_msg}"
    }
