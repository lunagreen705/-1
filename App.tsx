import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from './services/geminiService';
import { Message, MessageRole, ViewState } from './types';
import MessageBubble from './components/MessageBubble';
import { IconSend, IconTrendingUp, IconGlobe, IconSearch } from './components/icons';
import MacroTicker from './components/MacroTicker';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>(ViewState.WELCOME);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText;
    setInputText('');
    setViewState(ViewState.CHAT);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: userText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Add temp thinking message
    const thinkingMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: thinkingMsgId,
      role: MessageRole.MODEL,
      text: '',
      timestamp: Date.now(),
      isThinking: true
    }]);

    try {
      const result = await sendMessageToGemini(messages, userText);
      
      // Replace thinking message with actual response
      setMessages(prev => prev.map(msg => {
        if (msg.id === thinkingMsgId) {
          return {
            ...msg,
            text: result.text,
            isThinking: false,
            groundingChunks: result.groundingChunks
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
            text: "System Error: Unable to connect to global market data streams. Please check your connection or API key.",
            isThinking: false
          };
        }
        return msg;
      }));
    } finally {
      setIsLoading(false);
      // Focus input again for rapid fire
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Analyze NVIDIA's supply chain risks and recent insider trading.",
    "What is the sentiment on Reddit regarding Tesla given the recent oil price drop?",
    "Compare Gold vs. Bitcoin as an inflation hedge right now.",
    "Give me a strategic outlook on the Semiconductor industry."
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header */}
      <header className="flex-none h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-20 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-emerald-900/20 shadow-lg">
             <IconTrendingUp className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">MarketMind <span className="text-emerald-500">AI</span></h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Strategic Intelligence Unit</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
           <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>SYSTEM ONLINE</span>
           </div>
           <div className="hidden md:flex items-center gap-1.5">
              <IconGlobe className="w-3 h-3" />
              <span>WEB GROUNDING: ENABLED</span>
           </div>
        </div>
      </header>

      <MacroTicker />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          
          {/* Welcome Screen Overlay */}
          {viewState === ViewState.WELCOME && (
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center space-y-8 fade-in-up">
              <div className="p-6 rounded-full bg-slate-900 border border-slate-800 shadow-2xl shadow-indigo-900/20 mb-4">
                <IconSearch className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Institutional-Grade <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Market Intelligence</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
                I act as your digital hedge fund strategist. I synthesize real-time web data, social sentiment, 
                macro trends (Gold, Oil, Crypto), and fundamental analysis to provide clear investment verdicts.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
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

          {/* Message Stream */}
          <div className="max-w-4xl mx-auto w-full pb-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-none p-4 md:p-6 bg-slate-950 border-t border-slate-900">
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl pointer-events-none"></div>
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl focus-within:ring-2 focus-within:ring-emerald-500/50 focus-within:border-emerald-500/50 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about a stock, sector, or global event..."
                className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 px-6 py-4 focus:outline-none text-base"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading}
                className={`p-3 mr-2 rounded-xl transition-all duration-200 ${
                  inputText.trim() && !isLoading
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50' 
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }`}
              >
                <IconSend className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 text-center">
               <p className="text-[10px] text-slate-600 font-mono">
                 AI-generated analysis based on real-time data. Not financial advice. Do your own due diligence.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}