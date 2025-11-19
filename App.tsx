
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from './services/geminiService';
import { Message, MessageRole, ViewState, SuggestedAction, WatchlistItem, StockMetadata } from './types';
import MessageBubble from './components/MessageBubble';
import { IconSend, IconTrendingUp, IconSearch } from './components/icons';
import MacroTicker from './components/MacroTicker';
import Sidebar from './components/Sidebar';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>(ViewState.WELCOME);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('mm_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('mm_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (symbol: string, name: string) => {
    setWatchlist(prev => {
      const exists = prev.find(i => i.symbol === symbol);
      if (exists) {
        return prev.filter(i => i.symbol !== symbol);
      } else {
        return [...prev, { id: Date.now().toString(), symbol, name, addedAt: Date.now() }];
      }
    });
  };

  const handleWatchlistSelect = (item: WatchlistItem) => {
    const prompt = `請幫我快速分析 ${item.name} (${item.symbol}) 目前的最新關鍵走勢與戰略建議。`;
    handleSend(prompt);
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    
    if (!textToSend.trim() || isLoading) return;

    if (!overrideText) setInputText('');
    setViewState(ViewState.CHAT);
    setIsSidebarOpen(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const thinkingMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: thinkingMsgId,
      role: MessageRole.MODEL,
      text: '',
      timestamp: Date.now(),
      isThinking: true
    }]);

    try {
      const result = await sendMessageToGemini(messages, textToSend);
      
      let finalText = result.text;
      let suggestedActions: SuggestedAction[] = [];
      let relatedStock: StockMetadata | undefined = undefined;

      // Parse for [[STOCK:CODE:NAME]] tag
      const stockTagRegex = /\[\[STOCK:(.+?):(.+?)\]\]/;
      const match = finalText.match(stockTagRegex);

      if (match) {
        finalText = finalText.replace(stockTagRegex, '').trim();
        const stockCode = match[1];
        const stockName = match[2];
        
        relatedStock = { symbol: stockCode, name: stockName };

        // Generate 5 dimension buttons (Categorized)
        suggestedActions = [
          {
            label: '基本面',
            actionPrompt: `請專注分析 ${stockName} (${stockCode}) 的基本面數據。包括 EPS、營收成長率、本益比河流圖位階，以及證券分析師評價。`,
            type: 'fundamental'
          },
          {
            label: '技術面',
            actionPrompt: `請對 ${stockName} (${stockCode}) 進行技術面診斷。綜合分析均線 (MA) 排列、KD/RSI 指標狀態、MACD 趨勢。`,
            type: 'technical'
          },
          {
            label: '籌碼面',
            actionPrompt: `請深度分析 ${stockName} (${stockCode}) 的籌碼面。重點關注外資、投信買賣超，與融資融券變化。`,
            type: 'chips'
          },
          {
            label: '繪製線圖',
            // Defaults to Daily Chart
            actionPrompt: `請為 ${stockName} (${stockCode}) 繪製「日線」技術分析示意圖 (SVG)。\n需求：\n1. 日線 K 線結構 (綠漲紅跌)\n2. 關鍵支撐與壓力線\n3. 20日與60日均線趨勢\nSVG Title 設定為 "Daily Chart"。`,
            type: 'chart'
          },
          {
            label: '消息面',
            actionPrompt: `搜集 ${stockName} (${stockCode}) 近期的市場消息、法說會重點，以及 PTT/社群論壇情緒。`,
            type: 'news'
          }
        ];
      }

      setMessages(prev => prev.map(msg => {
        if (msg.id === thinkingMsgId) {
          return {
            ...msg,
            text: finalText,
            isThinking: false,
            groundingChunks: result.groundingChunks,
            suggestedActions: suggestedActions,
            relatedStock: relatedStock
          };
        }
        return msg;
      }));
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => {
        if (msg.id === thinkingMsgId) {
          return {
            ...msg,
            text: "系統錯誤：無法連接全球市場數據流。請檢查您的網路連線或 API 金鑰。",
            isThinking: false
          };
        }
        return msg;
      }));
    } finally {
      setIsLoading(false);
      if (!overrideText) {
          setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "繪製 台積電 (2330) 的技術線圖",
    "分析 黃金 (Gold) 走勢",
    "查詢 NVDA 財報與籌碼",
    "比特幣 (BTC) 支撐位在哪？"
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      <Sidebar 
        watchlist={watchlist} 
        onRemove={(id) => setWatchlist(prev => prev.filter(i => i.id !== id))}
        onSelect={handleWatchlistSelect}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full relative min-w-0">
        
        <header className="flex-none h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 z-20 shadow-xl">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
            </button>

            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-emerald-900/20 shadow-lg">
               <IconTrendingUp className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-tight">MarketMind</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">AI 戰略軍師</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
             <div className="hidden md:flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>Online</span>
             </div>
          </div>
        </header>

        <MacroTicker />

        <main className="flex-1 flex flex-col relative overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth custom-scrollbar">
            
            {viewState === ViewState.WELCOME && (
              <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center space-y-8 fade-in-up pb-20">
                <div className="p-6 rounded-full bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-900/20 mb-4">
                  <IconSearch className="w-12 h-12 text-emerald-400" />
                </div>
                <h2 className="text-2xl md:text-4xl font-bold text-white">
                  全方位市場情報 <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AI 戰略指揮中心</span>
                </h2>
                <p className="text-slate-400 text-base md:text-lg max-w-xl leading-relaxed px-4">
                  我是您的投資軍師，由 <strong>Google Gemini</strong> 驅動。
                  <br className="hidden md:block"/>
                  具備 <span className="text-emerald-400 font-semibold">自動繪製技術線圖</span> 與多維度分析能力。
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-8 px-4">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => { setInputText(s); inputRef.current?.focus(); }}
                      className="p-4 text-sm text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all duration-200 group"
                    >
                      <span className="text-slate-400 group-hover:text-slate-200">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto w-full pb-4">
              {messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  onActionClick={(prompt) => handleSend(prompt)}
                  onToggleWatchlist={toggleWatchlist}
                  watchlist={watchlist}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="flex-none p-3 md:p-5 bg-slate-950 border-t border-slate-900 z-20">
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl pointer-events-none"></div>
              
              <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="輸入股票代號 (如: 2330) 或輸入「繪製線圖」..."
                  className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 px-4 md:px-6 py-3 md:py-4 focus:outline-none text-base min-w-0"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isLoading}
                  className={`p-3 mr-2 rounded-xl transition-all duration-200 flex-shrink-0 ${
                    inputText.trim() && !isLoading
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50' 
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <IconSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #334155;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
