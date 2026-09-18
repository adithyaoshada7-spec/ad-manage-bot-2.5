import requests
from backend.config import get_config

def get_meta_headers_and_url(endpoint: str):
    cfg = get_config()
    token = cfg["META_ACCESS_TOKEN"]
    version = cfg.get("META_API_VERSION", "v20.0")
    url = f"https://graph.facebook.com/{version}/{endpoint}"
    return url, token

def get_ad_accounts():
    """Lists all accessible Meta Ad Accounts for the configured Access Token."""
    cfg = get_config()
    token = cfg["META_ACCESS_TOKEN"]
    version = cfg.get("META_API_VERSION", "v20.0")
    if not token:
        return {"error": "Meta Access Token is missing. Please set it in the Settings panel."}
    
    url = f"https://graph.facebook.com/{version}/me/adaccounts"
    params = {
        "access_token": token,
        "fields": "id,name,account_status,currency,amount_spent,business"
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if "error" in data:
            return {"error": data["error"].get("message", "Failed to fetch ad accounts")}
        return data.get("data", [])
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

def get_page_followers():
    """Fetches total Page Followers, Page Likes (fan_count), and details for connected Facebook Pages."""
    cfg = get_config()
    token = cfg["META_ACCESS_TOKEN"]
    version = cfg.get("META_API_VERSION", "v20.0")
    
    if not token:
        return {"error": "Meta Access Token is missing. Please set it in Settings."}

    url = f"https://graph.facebook.com/{version}/me/accounts"
    params = {
        "access_token": token,
        "fields": "id,name,followers_count,fan_count,category,link,verification_status"
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if "error" in data:
            return {"error": data["error"].get("message", "Failed to fetch page followers")}
        pages = data.get("data", [])
        
        formatted_pages = []
        for p in pages:
            formatted_pages.append({
                "page_id": p.get("id"),
                "page_name": p.get("name"),
                "followers_count": p.get("followers_count", 0),
                "page_likes_count": p.get("fan_count", 0),
                "category": p.get("category", "")
            })
        return formatted_pages
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

def parse_ad_actions(item: dict):
    """Helper to extract Page Likes, Engagements, Leads, and Messaging conversions from Meta Ad actions array."""
    actions = item.get("actions", [])
    cost_per_actions = item.get("cost_per_action_type", [])
    
    summary = {
        "page_likes": 0,
        "post_engagement": 0,
        "page_engagement": 0,
        "link_clicks": 0,
        "leads": 0,
        "messaging_conversations": 0,
        "cost_per_page_like": 0.0
    }
    
    for act in actions:
        atype = act.get("action_type")
        val = float(act.get("value", 0))
        if atype in ["like", "page_like"]:
            summary["page_likes"] += int(val)
        elif atype == "post_engagement":
            summary["post_engagement"] += int(val)
        elif atype == "page_engagement":
            summary["page_engagement"] += int(val)
        elif atype == "link_click":
            summary["link_clicks"] += int(val)
        elif atype in ["lead", "onsite_conversion.lead_grouped"]:
            summary["leads"] += int(val)
        elif "messaging" in atype:
            summary["messaging_conversations"] += int(val)

    for cpa in cost_per_actions:
        if cpa.get("action_type") in ["like", "page_like"]:
            summary["cost_per_page_like"] = round(float(cpa.get("value", 0)), 4)

    return summary

def get_account_insights(date_preset: str = "last_30d"):
    """Fetches overall performance metrics (Spend, Impressions, Clicks, CTR, CPC, CPM, Reach, Page Likes, Followers Growth) for the Ad Account."""
    cfg = get_config()
    token = cfg["META_ACCESS_TOKEN"]
    account_id = cfg["META_AD_ACCOUNT_ID"]
    version = cfg.get("META_API_VERSION", "v20.0")
    
    if not token:
        return {"error": "Meta Access Token is missing. Please set it in Settings."}
    if not account_id:
        return {"error": "Meta Ad Account ID is missing. Please set it in Settings."}
    
    clean_account_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    
    url = f"https://graph.facebook.com/{version}/{clean_account_id}/insights"
    params = {
        "access_token": token,
        "date_preset": date_preset,
        "fields": "spend,impressions,clicks,ctr,cpc,cpm,reach,conversions,actions,cost_per_action_type"
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if "error" in data:
            return {"error": data["error"].get("message", "Failed to fetch account insights")}
        
        raw_insights = data.get("data", [])
        if raw_insights:
            for item in raw_insights:
                item["action_summary"] = parse_ad_actions(item)
        return raw_insights
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

def get_campaigns():
    """Lists campaigns under the configured Meta Ad Account including name, status, objective, daily budget, lifetime budget."""
    cfg = get_config()
    token = cfg["META_ACCESS_TOKEN"]
    account_id = cfg["META_AD_ACCOUNT_ID"]
    version = cfg.get("META_API_VERSION", "v20.0")
    
    if not token:
        return {"error": "Meta Access Token is missing. Please set it in Settings."}
    if not account_id:
        return {"error": "Meta Ad Account ID is missing. Please set it in Settings."}

    clean_account_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    
    url = f"https://graph.facebook.com/{version}/{clean_account_id}/campaigns"
    params = {
        "access_token": token,
        "fields": "id,name,status,effective_status,objective,daily_budget,lifetime_budget,created_time,start_time,stop_time"
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if "error" in data:
            return {"error": data["error"].get("message", "Failed to fetch campaigns")}
        return data.get("data", [])
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

def get_campaign_insights(date_preset: str = "last_30d"):
    """Fetches performance insights broken down per campaign, including Page Likes and Engagement generated per campaign."""
    cfg = get_config()
    token = cfg["META_ACCESS_TOKEN"]
    account_id = cfg["META_AD_ACCOUNT_ID"]
    version = cfg.get("META_API_VERSION", "v20.0")
    
    if not token or not account_id:
        return {"error": "Meta Access Token or Ad Account ID missing in Settings."}

    clean_account_id = account_id if account_id.startswith("act_") else f"act_{account_id}"
    
    url = f"https://graph.facebook.com/{version}/{clean_account_id}/insights"
    params = {
        "access_token": token,
        "date_preset": date_preset,
        "level": "campaign",
        "fields": "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,reach,conversions,actions,cost_per_action_type"
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        if "error" in data:
            return {"error": data["error"].get("message", "Failed to fetch campaign insights")}
        
        raw_insights = data.get("data", [])
        if raw_insights:
            for item in raw_insights:
                item["action_summary"] = parse_ad_actions(item)
        return raw_insights
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}

def update_campaign_status(campaign_id: str, status: str):
    """Updates campaign status to 'ACTIVE' or 'PAUSED'."""
    cfg = get_config()
    token = cfg["META_ACCESS_TOKEN"]
    version = cfg.get("META_API_VERSION", "v20.0")

    if not token:
        return {"error": "Meta Access Token missing in Settings."}
    
    valid_statuses = ["ACTIVE", "PAUSED"]
    status_upper = status.upper()
    if status_upper not in valid_statuses:
        return {"error": f"Invalid status '{status}'. Must be 'ACTIVE' or 'PAUSED'."}

    url = f"https://graph.facebook.com/{version}/{campaign_id}"
    data = {
        "access_token": token,
        "status": status_upper
    }
    try:
        resp = requests.post(url, data=data, timeout=10)
        result = resp.json()
        if "error" in result:
            return {"error": result["error"].get("message", "Failed to update campaign status")}
        return {"success": True, "campaign_id": campaign_id, "new_status": status_upper}
    except Exception as e:
        return {"error": f"Request failed: {str(e)}"}
