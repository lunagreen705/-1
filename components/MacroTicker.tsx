
import React from 'react';

const MacroTicker: React.FC = () => {
  // Mock data for the visual ticker - in a real app this could be fetched or updated by the AI
  const items = [
    { label: '加權指數 TWSE', val: '台股動向', color: 'text-rose-400' },
    { label: 'S&P 500', val: '觀察中', color: 'text-slate-400' },
    { label: 'VIX (恐慌)', val: '監控中', color: 'text-rose-400' },
    { label: '黃金 GOLD', val: '避險', color: 'text-amber-400' },
    { label: '原油 CRUDE', val: '供給面', color: 'text-slate-400' },
    { label: 'BTC/USD', val: '風險資產', color: 'text-indigo-400' },
    { label: '10年期美債', val: '利率政策', color: 'text-emerald-400' },
  ];

  return (
    <div className="w-full bg-slate-950 border-b border-slate-900 h-10 flex items-center overflow-hidden whitespace-nowrap relative">
      <div className="absolute left-0 h-full w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 h-full w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
      
      <div className="flex animate-marquee items-center gap-8 px-4">
        {[...items, ...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500 font-bold">{item.label}</span>
            <span className={`${item.color} opacity-80`}>• {item.val}</span>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MacroTicker;
