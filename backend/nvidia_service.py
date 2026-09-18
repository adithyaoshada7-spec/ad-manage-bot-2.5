import requests
import json
import re
from backend.config import get_config
import backend.meta_api as meta_api

SYSTEM_INSTRUCTION = """You are an expert Meta Ads & Digital Marketing AI Assistant powered by NVIDIA NIM microservices.
You help users manage, analyze, and optimize their Meta Ads (Facebook & Instagram Ads) campaigns and answer marketing queries.

When answering, be helpful, concise, accurate, and format financial values ($ or local currency), CTR (%), and CPC cleanly using Markdown tables or bullet points.
If Meta tokens or API keys are missing or report errors, politely instruct the user to update their credentials in the Settings section.
Respond in clear, natural language (Sinhala or English based on the user's language).
"""

NVIDIA_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_ad_accounts",
            "description": "Lists all accessible Meta Ad Accounts for the user.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_account_insights",
            "description": "Fetches overall performance metrics (Spend, Impressions, Clicks, CTR, CPC, CPM, Reach, Page Likes & Followers) for the configured Ad Account.",
            "parameters": {
                "type": "object",
                "properties": {
                    "date_preset": {"type": "string", "description": "Date range e.g. 'last_30d', 'last_7d', 'today', 'yesterday'"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_campaigns",
            "description": "Lists campaigns under the Meta Ad Account including name, status, objective, daily budget, lifetime budget.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_campaign_insights",
            "description": "Fetches per-campaign performance insights (spend, clicks, impressions, ctr, cpc, page likes, followers).",
            "parameters": {
                "type": "object",
                "properties": {
                    "date_preset": {"type": "string", "description": "Date range e.g. 'last_30d', 'last_7d'"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_page_followers",
            "description": "Fetches total Page Followers, Page Likes (fan_count), and details for connected Facebook Pages.",
            "parameters": {"type": "object", "properties": {}, "required": []}
        }
    }
]

TOOL_EXEC_MAP = {
    "get_ad_accounts": lambda args: meta_api.get_ad_accounts(),
    "get_account_insights": lambda args: meta_api.get_account_insights(date_preset=args.get("date_preset", "last_30d")),
    "get_campaigns": lambda args: meta_api.get_campaigns(),
    "get_campaign_insights": lambda args: meta_api.get_campaign_insights(date_preset=args.get("date_preset", "last_30d")),
    "get_page_followers": lambda args: meta_api.get_page_followers(),
    "update_campaign_status": lambda args: meta_api.update_campaign_status(args.get("campaign_id", ""), args.get("status", "")),
}

def fetch_contextual_meta_data(last_user_query: str):
    """Pre-fetches relevant Meta Ads & Page Followers data if user query is related to ad performance, campaigns, or followers."""
    query_lower = last_user_query.lower()
    keywords = ["ad", "ads", "spend", "ctr", "cpc", "campaign", "performance", "clicks", "impressions", "roi", "meta", "facebook", "follower", "followers", "like", "likes", "page"]
    
    if any(kw in query_lower for kw in keywords):
        try:
            insights = meta_api.get_account_insights(date_preset="last_30d")
            campaigns = meta_api.get_campaigns()
            page_followers = meta_api.get_page_followers()
            return f"\n\n[LIVE META ADS & PAGE DATA CONTEXT]\nPage Followers Data: {json.dumps(page_followers)}\nAccount Performance (Last 30d): {json.dumps(insights)}\nCampaigns: {json.dumps(campaigns)}\n"
        except Exception:
            return ""
    return ""

def safe_parse_json(text: str):
    """Cleanly extracts and parses JSON object from model output string."""
    try:
        return json.loads(text)
    except Exception:
        # Try finding json bracket pattern {}
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
    return None

def generate_nvidia_chat_response(messages: list, model_name: str = None):
    cfg = get_config()
    api_key = cfg.get("NVIDIA_NIM_API_KEY", "")
    
    if not api_key:
        return {
            "role": "assistant",
            "content": "⚠️ **NVIDIA NIM API Key හමුවුණේ නැත.**\n\nChat Bot සක්‍රීය කිරීමට කරුණාකර දකුණු පස ඇති **Settings (⚙️)** Icon එක ක්ලික් කර ඔබගේ NVIDIA NIM API Key එක ඇතුළත් කරන්න."
        }

    selected_model = model_name or cfg.get("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct")
    
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    last_user_msg = ""
    formatted_msgs = []
    for msg in messages:
        role = "user" if msg.get("role") == "user" else "assistant"
        content = msg.get("content", "")
        if role == "user":
            last_user_msg = content
        formatted_msgs.append({"role": role, "content": content})

    # Prepare system instruction with potential contextual data
    meta_context = fetch_contextual_meta_data(last_user_msg)
    sys_content = SYSTEM_INSTRUCTION + meta_context
    formatted_msgs.insert(0, {"role": "system", "content": sys_content})

    payload = {
        "model": selected_model,
        "messages": formatted_msgs,
        "temperature": 0.6,
        "top_p": 1,
        "max_tokens": 2048
    }

    # First attempt: Try with tools if supported
    payload_with_tools = dict(payload)
    payload_with_tools["tools"] = NVIDIA_TOOLS
    payload_with_tools["tool_choice"] = "auto"

    try:
        resp = requests.post(url, headers=headers, json=payload_with_tools, timeout=30)
        
        # Check if model/endpoint rejected tools parameter
        if resp.status_code != 200:
            # Retry without tools parameter
            resp = requests.post(url, headers=headers, json=payload, timeout=30)

        # Parse JSON response safely
        try:
            data = resp.json()
        except Exception as json_err:
            raw = resp.text
            clean_text = raw.split("\n\n")[0] if "data:" in raw else raw
            return {
                "role": "assistant",
                "content": f"⚠️ **NVIDIA NIM Response Format Error**: ({resp.status_code}) `{clean_text[:250]}`"
            }

        if "error" in data:
            # Retry without tools if error was due to tool schema
            if "tools" in payload_with_tools:
                resp = requests.post(url, headers=headers, json=payload, timeout=30)
                try:
                    data = resp.json()
                except Exception:
                    pass

        if "error" in data:
            err_msg = data["error"].get("message", str(data["error"]))
            return {
                "role": "assistant",
                "content": f"⚠️ **NVIDIA NIM API Error**: `{err_msg}`\n\nකරුණාකර Model Name (`{selected_model}`) එක හෝ API Key එක පරීක්ෂා කරන්න."
            }

        choices = data.get("choices", [])
        if not choices:
            return {"role": "assistant", "content": "තොරතුරු සැකසීමට නොහැකි විය."}

        first_choice = choices[0]["message"]

        # If tool call executed
        if "tool_calls" in first_choice and first_choice["tool_calls"]:
            tool_call = first_choice["tool_calls"][0]
            func_name = tool_call["function"]["name"]
            raw_args = tool_call["function"].get("arguments", "{}")
            
            func_args = safe_parse_json(raw_args) if isinstance(raw_args, str) else raw_args
            if not isinstance(func_args, dict):
                func_args = {}

            if func_name in TOOL_EXEC_MAP:
                tool_result = TOOL_EXEC_MAP[func_name](func_args)
                
                formatted_msgs.append(first_choice)
                formatted_msgs.append({
                    "role": "tool",
                    "tool_call_id": tool_call.get("id", "call_1"),
                    "name": func_name,
                    "content": json.dumps(tool_result)
                })

                payload["messages"] = formatted_msgs

                second_resp = requests.post(url, headers=headers, json=payload, timeout=30)
                try:
                    second_data = second_resp.json()
                    if "choices" in second_data and second_data["choices"]:
                        final_text = second_data["choices"][0]["message"].get("content", "")
                        return {"role": "assistant", "content": final_text}
                except Exception:
                    pass

        final_content = first_choice.get("content", "තොරතුරු සැකසීමට නොහැකි විය.")
        return {"role": "assistant", "content": final_content}

    except Exception as e:
        return {
            "role": "assistant",
            "content": f"⚠️ **NVIDIA NIM Request Error**: {str(e)}"
        }
