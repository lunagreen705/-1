
import React, { useState } from 'react';
import { WatchlistItem } from '../types';
import { IconSearch } from './icons';

interface SidebarProps {
  watchlist: WatchlistItem[];
  onRemove: (id: string) => void;
  onSelect: (item: WatchlistItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ watchlist, onRemove, onSelect, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:relative z-50 h-full w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col
        transition-transform duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <h2 className="font-bold text-slate-100 flex items-center gap-2">
            <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
            自選戰情室
          </h2>
          <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
            {watchlist.length} 標的
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {watchlist.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center mb-3">
                <IconSearch className="text-slate-600 w-6 h-6" />
              </div>
              <p className="text-slate-500 text-sm">尚無追蹤標的</p>
              <p className="text-slate-600 text-xs mt-2">
                在對話中查詢股票後<br/>點擊 + 加入追蹤
              </p>
            </div>
          ) : (
            watchlist.map((item) => (
              <div 
                key={item.id}
                className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 rounded-xl p-3 transition-all cursor-pointer"
                onClick={() => {
                    onSelect(item);
                    if (window.innerWidth < 768) onClose();
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono font-bold text-emerald-400 text-sm">{item.symbol}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                    className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
                <div className="text-slate-300 text-sm font-medium truncate">{item.name}</div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/50">AI 監控中</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / API Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
             <span>Powered by</span>
             <span className="font-bold text-slate-400">Google Gemini</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
