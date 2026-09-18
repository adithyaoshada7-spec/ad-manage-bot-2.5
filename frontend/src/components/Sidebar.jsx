import React from 'react';
import { Plus, MessageSquare, Settings, Menu, Trash2, CheckCircle2, AlertCircle, Sparkles, Cpu } from 'lucide-react';

export default function Sidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  onNewChat, 
  onOpenSettings, 
  aiProvider,
  hasGeminiKey, 
  hasNvidiaKey,
  hasMetaToken,
  chatHistory,
  activeChatId,
  onSelectChat,
  onClearChats
}) {
  return (
    <aside 
      className={`h-screen bg-[#1e1f20] border-r border-[#282a2c] flex flex-col transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between">
        <button 
          onClick={onToggleCollapse}
          className="p-2 text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#282a2c] rounded-full transition"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>

        {!isCollapsed && (
          <div className="flex items-center space-x-1.5 pr-2">
            {aiProvider === 'nvidia' ? (
              <Cpu className="w-4 h-4 text-[#76b900]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#a8c7fa]" />
            )}
            <span className="text-sm font-semibold text-[#e3e3e3] tracking-wide">AdBot 2.5</span>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-2">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center bg-[#1a1b1e] hover:bg-[#282a2c] border border-[#333537] text-[#e3e3e3] font-medium text-sm rounded-full transition shadow-sm ${
            isCollapsed ? 'justify-center p-3' : 'px-4 py-3 space-x-3'
          }`}
          title="New Chat"
        >
          <Plus className="w-5 h-5 text-[#a8c7fa]" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Recent Chats */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-medium text-[#8e918f] uppercase tracking-wider">
            Recent Chats
          </div>
          {chatHistory.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-[#5e6164]">
              නවතම සංවාද මෙතැන පෙනෙනු ඇත.
            </div>
          ) : (
            chatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs text-left transition group ${
                  chat.id === activeChatId 
                    ? 'bg-[#004a77]/40 text-[#a8c7fa] font-medium border border-[#004a77]/60' 
                    : 'text-[#c4c7c5] hover:bg-[#282a2c] hover:text-[#e3e3e3]'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0 text-[#8e918f] group-hover:text-[#a8c7fa]" />
                <span className="truncate">{chat.title || 'New Conversation'}</span>
              </button>
            ))
          )}
        </div>
      )}

      {isCollapsed && <div className="flex-1" />}

      {/* Bottom Controls */}
      <div className="p-3 border-t border-[#282a2c] space-y-1.5">
        {!isCollapsed && (
          <div className="px-3 py-2 mb-1 bg-[#131314] border border-[#282a2c] rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#8e918f]">AI Provider</span>
              <span className="text-[11px] font-semibold text-[#a8c7fa] capitalize">{aiProvider}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8e918f]">
                {aiProvider === 'nvidia' ? 'NVIDIA NIM' : 'Google API'}
              </span>
              {(aiProvider === 'nvidia' ? hasNvidiaKey : hasGeminiKey) ? (
                <span className="flex items-center gap-1 text-[#a3f3c8] text-[11px]"><CheckCircle2 className="w-3 h-3" /> Active</span>
              ) : (
                <span className="flex items-center gap-1 text-[#f3a3a3] text-[11px]"><AlertCircle className="w-3 h-3" /> Missing</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8e918f]">Meta Token</span>
              {hasMetaToken ? (
                <span className="flex items-center gap-1 text-[#a3f3c8] text-[11px]"><CheckCircle2 className="w-3 h-3" /> Ready</span>
              ) : (
                <span className="flex items-center gap-1 text-[#f3a3a3] text-[11px]"><AlertCircle className="w-3 h-3" /> Missing</span>
              )}
            </div>
          </div>
        )}

        {!isCollapsed && chatHistory.length > 0 && (
          <button
            onClick={onClearChats}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs text-[#c4c7c5] hover:text-[#f3a3a3] hover:bg-[#3c1e1e]/40 transition"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Clear All Chats</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center text-[#c4c7c5] hover:text-[#e3e3e3] hover:bg-[#282a2c] rounded-xl transition ${
            isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 space-x-3 text-xs'
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4 text-[#a8c7fa] shrink-0" />
          {!isCollapsed && <span>API & AI Settings</span>}
        </button>
      </div>
    </aside>
  );
}
