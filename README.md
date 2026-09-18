# Meta Ads & AI Chatbot (AdBot 2.5)

A modern full-stack Chatbot application styled after Google Gemini's web interface, powered by **Google Gemini API** and **NVIDIA NIM API** microservices, integrated with **Meta Graph API v20.0** to analyze, manage, and optimize Meta Ads (Facebook & Instagram Ads) campaigns.

---

## 🌟 Key Features

- **Gemini Chatbot Web UI**: Built with React 19, Vite, Tailwind CSS, and Lucide Icons.
- **Dual AI Provider**: Seamlessly switch between **Google Gemini** (`gemini-3.6-flash`) and **NVIDIA NIM** (`deepseek-v4-flash-0731`, `meta/llama-3.3-70b-instruct`, `deepseek-r1`).
- **Meta Ads Integration**: Live Meta Ads data fetching (spend, CTR, CPC, impressions, reach, campaign status) via Meta Graph API v20.0.
- **Dynamic API Credentials Settings**: Manage Gemini API Key, NVIDIA NIM API Key, Meta Access Token, and Ad Account ID directly from the UI.
- **Vercel & One-Click Ready**: Deployable to Vercel or run locally via `run.bat`.

---

## 🚀 Quick Start (Local)

1. Clone the repository:
   ```bash
   git clone https://github.com/adithyaoshada7-spec/ad-manage-bot-2.5.git
   cd ad-manage-bot-2.5
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Double-click `run.bat` or run:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```

4. Open `http://localhost:8000` in your browser.

---

## ⚡ Deployment to Vercel

1. Import this repository into **Vercel**.
2. Set Environment Variables:
   - `GEMINI_API_KEY`
   - `NVIDIA_NIM_API_KEY`
   - `AI_PROVIDER` (`gemini` or `nvidia`)
   - `META_ACCESS_TOKEN`
   - `META_AD_ACCOUNT_ID`
3. Deploy!
