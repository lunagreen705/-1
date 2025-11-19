import React from 'react';
import { Message, MessageRole } from '../types';
import { IconRobot, IconUser, IconLink } from './icons';
import { MarkdownRenderer } from '../utils/formatText';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-4`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600' : 'bg-emerald-600'
        } shadow-lg shadow-slate-900/50`}>
          {isUser ? <IconUser className="w-6 h-6 text-white" /> : <IconRobot className="w-6 h-6 text-white" />}
        </div>

        {/* Content Box */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`relative px-6 py-5 rounded-2xl ${
            isUser 
              ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700' 
              : 'bg-slate-900/80 text-slate-200 rounded-tl-none border border-slate-800 shadow-xl'
          }`}>
            
            {/* Name Label */}
            <span className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isUser ? 'text-indigo-400 text-right' : 'text-emerald-400'}`}>
              {isUser ? 'You' : 'MarketMind AI'}
            </span>

            {/* Loading State */}
            {message.isThinking ? (
              <div className="flex items-center space-x-2 h-6">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-500 ml-2 font-mono animate-pulse">Analyzing global markets...</span>
              </div>
            ) : (
               <MarkdownRenderer content={message.text} />
            )}
            
          </div>

          {/* Grounding Sources (Citations) */}
          {!isUser && !message.isThinking && message.groundingChunks && message.groundingChunks.length > 0 && (
             <div className="mt-3 ml-1 w-full">
               <div className="flex items-center gap-2 mb-2">
                 <span className="h-px flex-1 bg-slate-800"></span>
                 <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Sources Detected</span>
                 <span className="h-px flex-1 bg-slate-800"></span>
               </div>
               <div className="flex flex-wrap gap-2">
                 {message.groundingChunks.map((chunk, idx) => {
                   if (!chunk.web?.uri) return null;
                   return (
                     <a 
                       key={idx}
                       href={chunk.web.uri}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md hover:border-emerald-500/50 hover:bg-slate-800 transition-colors group"
                     >
                       <IconLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                       <span className="text-xs text-slate-400 truncate max-w-[150px] group-hover:text-slate-200">
                         {chunk.web.title || new URL(chunk.web.uri).hostname}
                       </span>
                     </a>
                   )
                 })}
               </div>
             </div>
          )}

          <span className="text-[10px] text-slate-600 mt-2 font-mono">
             {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;