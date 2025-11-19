
import React from 'react';

interface ChartRendererProps {
  svgCode: string;
  title?: string;
  symbol?: string;
  onActionClick?: (prompt: string) => void;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ svgCode, title, symbol, onActionClick }) => {
  // Cleanup the SVG code string
  const cleanSvg = svgCode
    .replace(/```svg/g, '')
    .replace(/```/g, '')
    .trim();

  // Attempt to detect if it's a weekly chart from the content (simple heuristic)
  const isWeekly = cleanSvg.includes('Weekly Chart') || cleanSvg.includes('週線');
  const currentTimeframe = isWeekly ? '1W' : '1D';

  const handleTimeframeChange = (tf: '1D' | '1W') => {
    if (!onActionClick || !symbol) return;
    
    if (tf === '1D') {
      onActionClick(`請為 ${symbol} ${title || ''} 繪製「日線」技術分析圖 (Daily Chart)，包含 MA20/60 與關鍵支撐壓力。`);
    } else {
      onActionClick(`請為 ${symbol} ${title || ''} 繪製「週線」技術分析圖 (Weekly Chart)，展示中長期趨勢結構。`);
    }
  };

  return (
    <div className="w-full mt-4 mb-6 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-800/50">
      {/* TradingView-like Header */}
      <div className="px-4 py-3 bg-[#1e293b]/50 border-b border-slate-800 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-2">
             <span className="font-bold text-slate-200 text-sm md:text-base">{symbol || 'STOCK'}</span>
             <span className="text-xs text-slate-500 hidden md:inline">{title}</span>
          </div>
          
          {/* Timeframe Toggles */}
          <div className="flex bg-slate-800 rounded-md p-0.5 ml-2">
            <button 
              onClick={() => handleTimeframeChange('1D')}
              className={`px-3 py-1 text-[10px] md:text-xs font-medium rounded transition-all ${
                currentTimeframe === '1D' 
                  ? 'bg-slate-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              1D
            </button>
            <button 
              onClick={() => handleTimeframeChange('1W')}
              className={`px-3 py-1 text-[10px] md:text-xs font-medium rounded transition-all ${
                currentTimeframe === '1W' 
                  ? 'bg-slate-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              1W
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded border border-slate-700">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] text-slate-400 font-mono">AI GENERATED</span>
           </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative p-4 overflow-x-auto flex justify-center bg-[#0f172a] min-h-[300px]">
        {/* Grid Background Pattern (CSS) */}
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{ 
               backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>

        <div 
          dangerouslySetInnerHTML={{ __html: cleanSvg }} 
          className="min-w-[300px] w-full max-w-[800px] z-10"
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>Strategy View • {currentTimeframe === '1D' ? 'Daily' : 'Weekly'}</span>
        <span>Vol: Analysis Only</span>
      </div>
    </div>
  );
};

export default ChartRenderer;
