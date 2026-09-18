import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User, Copy, Check } from 'lucide-react';

export default function MessageItem({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`py-6 px-4 md:px-8 transition-colors ${
      isUser ? 'bg-[#131314]' : 'bg-[#1e1f20]/50 border-y border-[#282a2c]/50'
    }`}>
      <div className="max-w-4xl mx-auto flex items-start space-x-4">
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-md ${
          isUser 
            ? 'bg-[#282a2c] text-[#e3e3e3] border border-[#333537]' 
            : 'bg-gradient-to-tr from-[#4285f4] via-[#9b72cb] to-[#d96570] text-white'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2 overflow-hidden text-[#e3e3e3] text-sm md:text-base leading-relaxed">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8e918f]">
              {isUser ? 'You' : 'Gemini Ad Assistant'}
            </span>

            {!isUser && (
              <button
                onClick={handleCopy}
                className="text-[#8e918f] hover:text-[#e3e3e3] p-1 rounded-md transition hover:bg-[#282a2c]"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#a3f3c8]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Markdown Output */}
          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#131314] prose-pre:border prose-pre:border-[#333537] prose-table:border prose-table:border-[#333537] prose-th:bg-[#282a2c] prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
}
