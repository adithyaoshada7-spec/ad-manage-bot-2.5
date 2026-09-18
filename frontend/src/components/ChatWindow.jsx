import React, { useState, useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { Send, Sparkles, TrendingUp, BarChart3, PauseCircle, Layers } from 'lucide-react';

const SUGGESTIONS = [
  {
    icon: BarChart3,
    title: "Meta Ads Overall Performance",
    subtitle: "පසුගිය දින 30 තුළ මාගේ Ads Spend, Clicks සහ CTR පෙන්වන්න"
  },
  {
    icon: TrendingUp,
    title: "Campaign Performance Breakdown",
    subtitle: "මාගේ සාර්ථකම සහ වැඩිපුර වියදම් වූ Meta Campaigns මොනවාද?"
  },
  {
    icon: PauseCircle,
    title: "Pause Underperforming Ad",
    subtitle: "අඩු ප්‍රතිඵල ලබාදෙන Campaign එකක් Pause කරන්නේ කෙසේද?"
  },
  {
    icon: Layers,
    title: "Ad Strategy Advice",
    subtitle: "මාගේ ROI වැඩි කර ගැනීමට ලබාදිය හැකි උපදෙස් මොනවාද?"
  }
];

export default function ChatWindow({ 
  messages, 
  onSendMessage, 
  loading,
  onOpenSettings,
  hasGeminiKey,
  hasMetaToken
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (text) => {
    if (loading) return;
    onSendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#131314] relative overflow-hidden">
      
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pb-32">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto px-4 pt-16 md:pt-24 space-y-8 animate-in fade-in duration-300">
            {/* Greeting */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                <span className="gemini-gradient-text">Hello, Marketer</span>
              </h1>
              <h2 className="text-2xl md:text-3xl text-[#5e6164] font-medium">
                Meta Ads සහ Marketing queries පිළිබඳව මගෙන් විමසන්න.
              </h2>
            </div>

            {/* Warning banner if API keys missing */}
            {(!hasGeminiKey || !hasMetaToken) && (
              <div className="p-4 rounded-2xl bg-[#1e1f20] border border-[#333537] flex items-center justify-between shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-[#282a2c] text-[#a8c7fa]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#e3e3e3]">Setup API Keys</h3>
                    <p className="text-xs text-[#8e918f]">
                      {!hasGeminiKey && !hasMetaToken 
                        ? 'Gemini API Key සහ Meta Access Token සකස් කර නොමැත.' 
                        : !hasGeminiKey 
                        ? 'Google Gemini API Key එක සකස් කර නොමැත.' 
                        : 'Meta Access Token එක සකස් කර නොමැත.'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenSettings}
                  className="px-4 py-2 bg-[#a8c7fa] hover:bg-[#b8d2fb] text-[#131314] text-xs font-semibold rounded-xl transition"
                >
                  Open Settings
                </button>
              </div>
            )}

            {/* Prompt Suggestion Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4">
              {SUGGESTIONS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item.subtitle)}
                    className="p-4 rounded-2xl bg-[#1e1f20] hover:bg-[#282a2c] border border-[#282a2c] hover:border-[#333537] text-left transition duration-200 group flex flex-col justify-between h-32"
                  >
                    <p className="text-sm font-medium text-[#c4c7c5] group-hover:text-[#e3e3e3] line-clamp-2">
                      {item.subtitle}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] font-semibold text-[#8e918f] group-hover:text-[#a8c7fa]">
                        {item.title}
                      </span>
                      <div className="p-2 rounded-full bg-[#131314] text-[#8e918f] group-hover:text-[#a8c7fa] group-hover:scale-110 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#282a2c]/30">
            {messages.map((msg, idx) => (
              <MessageItem key={idx} message={msg} />
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="py-6 px-4 md:px-8 bg-[#1e1f20]/50 border-y border-[#282a2c]/50">
                <div className="max-w-4xl mx-auto flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[#8e918f]">
                    <span className="animate-pulse">Meta Ads දත්ත විශ්ලේෂණය කරමින් පවතී...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Input Container */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#131314] via-[#131314]/90 to-transparent">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your Meta Ads or marketing campaigns..."
              className="w-full pl-5 pr-14 py-4 bg-[#1e1f20] border border-[#333537] focus:border-[#a8c7fa] rounded-full text-[#e3e3e3] text-sm md:text-base focus:outline-none transition shadow-2xl placeholder-[#5e6164]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2.5 text-[#131314] bg-[#a8c7fa] hover:bg-[#b8d2fb] disabled:opacity-40 disabled:bg-[#333537] disabled:text-[#8e918f] rounded-full transition shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[11px] text-[#5e6164]">
              AdBot 2.5 uses Gemini AI and Meta Graph API v20.0. Verify critical campaign budgets.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
