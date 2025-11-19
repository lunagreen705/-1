
import React from 'react';
import { Message, MessageRole, WatchlistItem, StockMetadata } from '../types';
import { IconRobot, IconUser, IconLink } from './icons';
import { MarkdownRenderer } from '../utils/formatText';
import ChartRenderer from './ChartRenderer';

interface MessageBubbleProps {
  message: Message;
  onActionClick?: (actionPrompt: string) => void;
  onToggleWatchlist?: (symbol: string, name: string) => void;
  watchlist?: WatchlistItem[];
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onActionClick, 
  onToggleWatchlist,
  watchlist = []
}) => {
  const isUser = message.role === MessageRole.USER;
  const isInWatchlist = message.relatedStock 
    ? watchlist.some(w => w.symbol === message.relatedStock!.symbol)
    : false;

  // Extract SVG if present
  const svgRegex = /```svg([\s\S]*?)```/;
  const svgMatch = message.text.match(svgRegex);
  const svgCode = svgMatch ? svgMatch[1] : null;
  
  // Remove SVG from text display to avoid duplication
  const displayText = message.text.replace(svgRegex, '').trim();

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[90%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3 md:gap-4`}>
        
        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-600' : 'bg-emerald-600'
        } shadow-lg shadow-slate-900/50 mt-1`}>
          {isUser ? <IconUser className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <IconRobot className="w-5 h-5 md:w-6 md:h-6 text-white" />}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full min-w-0`}>
          
          <div className={`relative px-5 py-4 md:px-6 md:py-5 rounded-2xl w-full ${
            isUser 
              ? 'bg-slate-800 text-slate-100 rounded-tr-none border border-slate-700' 
              : 'bg-slate-900/80 text-slate-200 rounded-tl-none border border-slate-800 shadow-xl backdrop-blur-sm'
          }`}>
            
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${isUser ? 'text-indigo-400' : 'text-emerald-400'}`}>
                {isUser ? '你' : 'MarketMind AI 軍師'}
              </span>
              {!isUser && message.relatedStock && (
                 <button 
                   onClick={() => onToggleWatchlist && onToggleWatchlist(message.relatedStock!.symbol, message.relatedStock!.name)}
                   className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border transition-all ${
                     isInWatchlist 
                       ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                       : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                   }`}
                 >
                   {isInWatchlist ? (
                     <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        <span>已追蹤</span>
                     </>
                   ) : (
                     <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        <span>加入自選</span>
                     </>
                   )}
                 </button>
              )}
            </div>

            {message.isThinking ? (
              <div className="flex items-center space-x-2 h-6">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-500 ml-2 font-mono animate-pulse">正在連接全球市場數據庫...</span>
              </div>
            ) : (
               <>
                 {displayText && <MarkdownRenderer content={displayText} />}
                 {svgCode && (
                    <ChartRenderer 
                      svgCode={svgCode} 
                      title={message.relatedStock?.name} 
                      symbol={message.relatedStock?.symbol}
                      onActionClick={onActionClick}
                    />
                 )}
               </>
            )}
            
          </div>

          {!isUser && !message.isThinking && message.groundingChunks && message.groundingChunks.length > 0 && (
             <div className="mt-3 ml-1 w-full">
               <div className="flex flex-wrap gap-2">
                 {message.groundingChunks.map((chunk, idx) => {
                   if (!chunk.web?.uri) return null;
                   return (
                     <a 
                       key={idx}
                       href={chunk.web.uri}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-md hover:border-emerald-500/50 hover:bg-slate-900 transition-colors group"
                     >
                       <IconLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                       <span className="text-xs text-slate-400 truncate max-w-[200px] group-hover:text-slate-200">
                         {chunk.web.title || new URL(chunk.web.uri).hostname}
                       </span>
                     </a>
                   )
                 })}
               </div>
             </div>
          )}

          {/* Stock Strategy Dashboard */}
          {!isUser && !message.isThinking && message.suggestedActions && message.suggestedActions.length > 0 && message.relatedStock && (
            <div className="mt-4 w-full bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">
               <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <span className="font-bold text-white">{message.relatedStock.name}</span>
                     <span className="font-mono text-emerald-400 text-sm bg-emerald-900/20 px-1.5 rounded">{message.relatedStock.symbol}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tracking-wider">AI 戰略儀表板</span>
               </div>
               
               <div className="grid grid-cols-5 divide-x divide-slate-800">
                 {message.suggestedActions.map((action, idx) => {
                   let textClass = "text-slate-400 hover:text-white";
                   let hoverBg = "hover:bg-slate-800";
                   
                   if (action.type === 'chart') textClass = "text-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/10 font-bold bg-emerald-900/5";
                   if (action.type === 'fundamental') textClass = "text-blue-400 hover:text-blue-200 hover:bg-blue-500/10";
                   if (action.type === 'technical') textClass = "text-purple-400 hover:text-purple-200 hover:bg-purple-500/10";
                   if (action.type === 'chips') textClass = "text-amber-400 hover:text-amber-200 hover:bg-amber-500/10";
                   if (action.type === 'news') textClass = "text-slate-300 hover:text-white hover:bg-slate-700/30";

                   return (
                     <button
                       key={idx}
                       onClick={() => onActionClick && onActionClick(action.actionPrompt)}
                       className={`flex flex-col items-center justify-center py-3 md:py-4 px-1 transition-all duration-200 ${textClass} ${hoverBg} group relative`}
                       title={action.label}
                     >
                       {/* Icons */}
                       {action.type === 'chart' && (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mb-1">
                           <path d="M15.5 2A1.5 1.5 0 0014 3.5v8a1.5 1.5 0 001.5 1.5h3.5a1.5 1.5 0 001.5-1.5v-8A1.5 1.5 0 0019 2h-3.5zM9.75 8.625a1.625 1.625 0 11-3.25 0 1.625 1.625 0 013.25 0z" />
                           <path fillRule="evenodd" d="M2 18.25a.25.25 0 00.25.25h16.5a.25.25 0 00.25-.25v-2.5a.25.25 0 00-.25-.25H15v-2.69a2.625 2.625 0 10-5.25 0V15.5H6v-4.69a2.625 2.625 0 10-5.25 0V18.25z" clipRule="evenodd" />
                         </svg>
                       )}
                       {action.type === 'fundamental' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mb-1">
                            <path fillRule="evenodd" d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 00-1.5 0v.784a.272.272 0 01-.35.25A49.043 49.043 0 001.75 14.5z" clipRule="evenodd" />
                          </svg>
                       )}
                       {action.type === 'technical' && (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mb-1">
                            <path fillRule="evenodd" d="M13.5 4.938a7 7 0 11-9.006 1.737c.202-.257.59-.218.793.013a5.995 5.995 0 011.168 1.168c.231.203.27.591.013.793a6.999 6.999 0 009.006-1.737 6.975 6.975 0 00-1.973-1.974zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                         </svg>
                       )}
                       {action.type === 'chips' && (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mb-1">
                           <path d="M13 11a1 1 0 11-2 0 1 1 0 012 0zm-1.75-2a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM11.25 7a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 13a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 9a.75.75 0 100-1.5.75.75 0 000 1.5zM8 11a1 1 0 11-2 0 1 1 0 012 0z" />
                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6.5 6.326a6.512 6.512 0 01-3 0V15a1 1 0 00-1-1H6a1 1 0 00-1 1v1.326a6.501 6.501 0 01-1.326-1.326H5a1 1 0 00-1-1V12a1 1 0 00-1-1H1.674a6.502 6.502 0 010-3H3a1 1 0 001-1V5.5a1 1 0 00-1-1H1.674a6.502 6.502 0 011.326-1.326H4.5a1 1 0 001-1V1.674a6.512 6.512 0 013 0V3a1 1 0 001 1h1.5a1 1 0 001-1V1.674a6.512 6.512 0 013 0V3a1 1 0 001 1h1.326a6.501 6.501 0 011.326 1.326H17a1 1 0 001 1V8a1 1 0 00-1 1h1.326a6.501 6.501 0 010 3H17a1 1 0 00-1 1v1.5a1 1 0 001 1h1.326a6.501 6.501 0 01-1.326 1.326H15.5a1 1 0 00-1 1v1.326z" clipRule="evenodd" />
                         </svg>
                       )}
                       {action.type === 'news' && (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mb-1">
                           <path d="M10 2a.75.75 0 01.75.75v1.5H18a.25.25 0 01.25.25v5.5a.25.25 0 01-.25.25h-7.25v1.5h3.75a.25.25 0 01.25.25v5.5a.25.25 0 01-.25.25H2a.25.25 0 01-.25-.25v-5.5a.25.25 0 01.25-.25h3.75v-1.5H2a.25.25 0 01-.25-.25v-5.5a.25.25 0 01.25-.25h7.25v-1.5A.75.75 0 0110 2z" />
                         </svg>
                       )}
                       
                       <span className="text-[10px] md:text-xs font-medium text-center leading-tight">{action.label}</span>
                     </button>
                   );
                 })}
               </div>
            </div>
          )}

          <span className="text-[10px] text-slate-600 mt-2 font-mono px-1 self-end md:self-start">
             {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
