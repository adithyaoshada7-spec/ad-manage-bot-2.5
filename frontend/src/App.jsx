import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsModal from './components/SettingsModal';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [aiProvider, setAiProvider] = useState('gemini');
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasNvidiaKey, setHasNvidiaKey] = useState(false);
  const [hasMetaToken, setHasMetaToken] = useState(false);
  
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('adbot_chat_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSettings();
  }, []);

  useEffect(() => {
    localStorage.setItem('adbot_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    if (activeChatId) {
      const active = chatHistory.find(c => c.id === activeChatId);
      if (active) {
        setMessages(active.messages || []);
      }
    } else {
      setMessages([]);
    }
  }, [activeChatId, chatHistory]);

  const checkSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      const text = await res.text();
      if (!text || text.trim() === '') return;
      const data = JSON.parse(text);
      setAiProvider(data.ai_provider || 'gemini');
      setHasGeminiKey(data.has_gemini_key);
      setHasNvidiaKey(data.has_nvidia_key);
      setHasMetaToken(data.has_meta_token);
    } catch (err) {
      console.error("Settings fetch failed", err);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const handleSendMessage = async (text) => {
    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    let currentChatId = activeChatId;

    if (!currentChatId) {
      currentChatId = 'chat_' + Date.now();
      const newChatObj = {
        id: currentChatId,
        title: text.length > 25 ? text.substring(0, 25) + '...' : text,
        messages: updatedMessages
      };
      setChatHistory(prev => [newChatObj, ...prev]);
      setActiveChatId(currentChatId);
    } else {
      setChatHistory(prev => prev.map(c => 
        c.id === currentChatId ? { ...c, messages: updatedMessages } : c
      ));
    }

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          provider: aiProvider
        })
      });
      const text = await res.text();
      if (!text || text.trim() === '') {
        throw new Error('Server returned empty response.');
      }
      const data = JSON.parse(text);
      const botMsg = { role: 'assistant', content: data.content };
      
      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      setChatHistory(prev => prev.map(c => 
        c.id === currentChatId ? { ...c, messages: finalMessages } : c
      ));

    } catch (err) {
      const errorMsg = { 
        role: 'assistant', 
        content: `⚠️ Server Error: ${err.message}. කරුණාකර Backend එක ක්‍රියාත්මක වන බවට තහවුරු කරගන්න.` 
      };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChats = () => {
    setChatHistory([]);
    setActiveChatId(null);
    setMessages([]);
  };

  return (
    <div className="flex h-screen w-screen bg-[#131314] overflow-hidden">
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        aiProvider={aiProvider}
        hasGeminiKey={hasGeminiKey}
        hasNvidiaKey={hasNvidiaKey}
        hasMetaToken={hasMetaToken}
        chatHistory={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={(id) => setActiveChatId(id)}
        onClearChats={handleClearChats}
      />

      <ChatWindow 
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={loading}
        onOpenSettings={() => setIsSettingsOpen(true)}
        aiProvider={aiProvider}
        hasGeminiKey={hasGeminiKey}
        hasNvidiaKey={hasNvidiaKey}
        hasMetaToken={hasMetaToken}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={checkSettings}
      />
    </div>
  );
}
