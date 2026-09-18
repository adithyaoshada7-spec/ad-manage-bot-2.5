import React, { useState, useEffect } from 'react';
import { X, Key, Database, Check, AlertCircle, Save, ExternalLink, Cpu, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const PRESET_MODELS = [
  "deepseek-v4-flash-0731",
  "meta/llama-3.3-70b-instruct",
  "meta/llama-3.1-70b-instruct",
  "deepseek-ai/deepseek-r1",
  "mistralai/mistral-7b-instruct-v0.3"
];

const DEFAULT_AD_ACCOUNT = "act_1397457568798633";

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [aiProvider, setAiProvider] = useState('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [nvidiaNimApiKey, setNvidiaNimApiKey] = useState('');
  const [nvidiaModel, setNvidiaModel] = useState('deepseek-v4-flash-0731');
  const [customModel, setCustomModel] = useState('');

  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaAdAccountId, setMetaAdAccountId] = useState(DEFAULT_AD_ACCOUNT);
  const [metaApiVersion, setMetaApiVersion] = useState('v20.0');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      const text = await res.text();
      if (!text || text.trim() === '') return;

      const data = JSON.parse(text);
      setAiProvider(data.ai_provider || 'gemini');
      setGeminiApiKey(data.gemini_api_key || '');
      setNvidiaNimApiKey(data.nvidia_nim_api_key || '');
      const savedModel = data.nvidia_model || 'deepseek-v4-flash-0731';
      setNvidiaModel(savedModel);
      setCustomModel(savedModel);
      setMetaAccessToken(data.meta_access_token || '');
      setMetaAdAccountId(data.meta_ad_account_id || DEFAULT_AD_ACCOUNT);
      setMetaApiVersion(data.meta_api_version || 'v20.0');
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const finalNvidiaModel = customModel.trim() || nvidiaModel;
      const finalAdAccountId = metaAdAccountId.trim() || DEFAULT_AD_ACCOUNT;
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_provider: aiProvider,
          gemini_api_key: geminiApiKey,
          nvidia_nim_api_key: nvidiaNimApiKey,
          nvidia_model: finalNvidiaModel,
          meta_access_token: metaAccessToken,
          meta_ad_account_id: finalAdAccountId,
          meta_api_version: metaApiVersion,
        })
      });

      const text = await res.text();
      if (!text || text.trim() === '') {
        throw new Error('Server returned an empty response. Verify backend is running.');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Invalid response format from server (${res.status}).`);
      }

      if (data.status === 'success') {
        setMessage({ type: 'success', text: 'API Settings & Ad Account ID සාර්ථකව සුරක්ෂිත කරන ලදී!' });
        if (onSettingsUpdated) onSettingsUpdated();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: 'Settings සුරක්ෂිත කිරීමට නොහැකි විය.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#1e1f20] border border-[#333537] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282a2c] bg-[#1e1f20]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#282a2c] text-[#a8c7fa]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#e3e3e3]">AI & API Credentials</h2>
              <p className="text-xs text-[#c4c7c5]">Google Gemini, NVIDIA NIM & Meta Graph API</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#282a2c] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {message && (
            <div className={`p-3.5 rounded-xl flex items-center space-x-3 text-sm ${
              message.type === 'success' ? 'bg-[#14382c] border border-[#21704e] text-[#a3f3c8]' : 'bg-[#3c1e1e] border border-[#702121] text-[#f3a3a3]'
            }`}>
              {message.type === 'success' ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#c4c7c5] uppercase tracking-wider">Active AI Provider</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAiProvider('gemini')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-medium transition ${
                  aiProvider === 'gemini' 
                    ? 'bg-[#004a77]/50 border-[#a8c7fa] text-[#a8c7fa]' 
                    : 'bg-[#131314] border-[#333537] text-[#8e918f] hover:text-[#e3e3e3]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Google Gemini</span>
              </button>

              <button
                type="button"
                onClick={() => setAiProvider('nvidia')}
                className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-medium transition ${
                  aiProvider === 'nvidia' 
                    ? 'bg-[#1a3a2a]/60 border-[#76b900] text-[#76b900]' 
                    : 'bg-[#131314] border-[#333537] text-[#8e918f] hover:text-[#e3e3e3]'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>NVIDIA NIM</span>
              </button>
            </div>
          </div>

          {aiProvider === 'gemini' && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#e3e3e3] flex items-center gap-2">
                  <span className="text-[#a8c7fa]">✨</span> Google Gemini API Key
                </label>
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-[#a8c7fa] hover:underline flex items-center gap-1"
                >
                  Get Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 bg-[#131314] border border-[#333537] rounded-xl text-[#e3e3e3] text-sm focus:outline-none focus:border-[#a8c7fa] transition placeholder-[#5e6164]"
              />
            </div>
          )}

          {aiProvider === 'nvidia' && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#e3e3e3] flex items-center gap-2">
                  <span className="text-[#76b900]">🟢</span> NVIDIA NIM API Key
                </label>
                <a 
                  href="https://build.nvidia.com/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-[#76b900] hover:underline flex items-center gap-1"
                >
                  NVIDIA Build <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={nvidiaNimApiKey}
                onChange={(e) => setNvidiaNimApiKey(e.target.value)}
                placeholder="nvapi-..."
                className="w-full px-4 py-2.5 bg-[#131314] border border-[#333537] rounded-xl text-[#e3e3e3] text-sm focus:outline-none focus:border-[#76b900] transition placeholder-[#5e6164]"
              />
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c4c7c5]">NVIDIA Model Name</label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="deepseek-v4-flash-0731"
                  className="w-full px-4 py-2.5 bg-[#131314] border border-[#333537] rounded-xl text-[#e3e3e3] text-xs focus:outline-none focus:border-[#76b900] transition font-mono"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_MODELS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setCustomModel(m); setNvidiaModel(m); }}
                      className="px-2.5 py-1 bg-[#282a2c] hover:bg-[#333537] text-[10px] text-[#c4c7c5] rounded-md transition"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-[#282a2c] pt-4 space-y-3">
            <div className="flex items-center space-x-2 text-sm font-medium text-[#e3e3e3]">
              <Database className="w-4 h-4 text-[#7cacf8]" />
              <span>Meta Graph API Settings</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#c4c7c5]">Meta System Access Token</label>
                <a 
                  href="https://developers.facebook.com/tools/explorer/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-[#a8c7fa] hover:underline flex items-center gap-1"
                >
                  Meta Explorer <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <textarea
                rows={2}
                value={metaAccessToken}
                onChange={(e) => setMetaAccessToken(e.target.value)}
                placeholder="EAA..."
                className="w-full px-4 py-2 bg-[#131314] border border-[#333537] rounded-xl text-[#e3e3e3] text-xs font-mono focus:outline-none focus:border-[#a8c7fa] transition placeholder-[#5e6164] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#c4c7c5]">Ad Account ID</label>
                <input
                  type="text"
                  value={metaAdAccountId}
                  onChange={(e) => setMetaAdAccountId(e.target.value)}
                  placeholder="act_1397457568798633"
                  className="w-full px-3 py-2 bg-[#131314] border border-[#333537] rounded-xl text-[#e3e3e3] text-xs focus:outline-none focus:border-[#a8c7fa] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#c4c7c5]">API Version</label>
                <input
                  type="text"
                  value={metaApiVersion}
                  onChange={(e) => setMetaApiVersion(e.target.value)}
                  placeholder="v20.0"
                  className="w-full px-3 py-2 bg-[#131314] border border-[#333537] rounded-xl text-[#e3e3e3] text-xs focus:outline-none focus:border-[#a8c7fa] transition"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#282a2c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#282a2c] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-[#131314] bg-[#a8c7fa] hover:bg-[#b8d2fb] disabled:opacity-50 rounded-xl flex items-center space-x-2 transition shadow-lg shadow-[#a8c7fa]/10"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
