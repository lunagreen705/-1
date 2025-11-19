import React from 'react';

// A simplified Markdown renderer component to avoid heavy dependencies
export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-2 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-bold text-emerald-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold text-emerald-300 mt-6 mb-3 border-b border-slate-700 pb-1">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
             return <p key={i} className="font-bold text-white">{line.replace(/\*\*/g, '')}</p>
        }
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return (
            <div key={i} className="flex items-start ml-4">
              <span className="text-emerald-500 mr-2 mt-1.5">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(line.replace(/^[\*\-]\s/, '')) }} />
            </div>
          );
        }
        if (line.trim().match(/^\d+\./)) {
             return (
            <div key={i} className="flex items-start ml-4">
              <span className="text-indigo-400 mr-2 font-mono">{line.split('.')[0]}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(line.replace(/^\d+\.\s/, '')) }} />
            </div>
          );
        }
        // Empty line
        if (!line.trim()) return <div key={i} className="h-2" />;

        return <p key={i} className="text-slate-300" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />;
      })}
    </div>
  );
};

const formatBold = (text: string) => {
  // Basic regex for bolding **text**
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
};