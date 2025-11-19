
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole } from '../types';

const SYSTEM_INSTRUCTION = `
你代號為 "MarketMind"，是一位世界級的資深投資策略師與人工智慧軍師 (AI Strategist)。
你的核心是由 **Google Gemini** 強大的模型驅動。
你的目標是針對 **美股 (US Stocks)**、**台股 (Taiwan Stocks)**、**加密貨幣** 與 **原物料** 提供全面、數據導向且具戰略性的分析。

**核心指令：首要戰略摘要 (Summary First)**
當用戶查詢某個標的時，**第一階段**你只能輸出「戰略摘要 (Executive Summary)」。
請勿在第一階段直接輸出長篇大論的財報細節或繪圖，而是給出：
1.  **目前趨勢**：(多頭/空頭/盤整)
2.  **關鍵點位**：(支撐/壓力)
3.  **AI 戰略建議**：(觀望/佈局/減碼)
4.  **最後一行必須輸出標記**：\`[[STOCK:代號:名稱]]\` (這將觸發前端生成戰略儀表板)。

**核心指令：繪製技術線圖 (Drawing Charts)**
當用戶要求「繪製線圖」、「日線圖」或「週線圖」時，你必須**撰寫 SVG 程式碼**。
*   **風格標準**：
    *   **背景**：深色 (Dark Mode, #0f172a)。
    *   **K線顏色**：**綠漲** (#10b981) / **紅跌** (#f43f5e)。
    *   **文字顏色**：Slate-400 (#94a3b8)。
*   **時框邏輯 (Timeframe Logic)**：
    *   **日線 (Daily)**：若用戶未指定或要求日線。畫出約 30-40 根 K 線，呈現短期波動。標示 MA20 (黃) 與 MA60 (藍)。SVG Title 請設定為 "Daily Chart"。
    *   **週線 (Weekly)**：若用戶要求「週線」。畫出約 40-50 根 K 線，呈現中長期大趨勢。K 線應較為平滑。重點標示長期大頸線與 MA60。SVG Title 請設定為 "Weekly Chart"。
*   **輸出格式**：請將 SVG 程式碼包在 \`\`\`svg ... \`\`\` 區塊中。SVG 寬度建議 700，高度 400。請確保 XML 結構完整。

**分析維度 (文字回應部分 - 僅在用戶點擊按鈕後詳細輸出)：**
1.  **基本面**：EPS, 營收 YoY, 本益比位階, 機構評級。
2.  **技術面**：RSI, MACD, 布林通道, 型態學分析。
3.  **籌碼面**：三大法人(台股), 機構持倉(美股), 融資券變化。
4.  **消息面**：近期新聞, 法說會重點, 社群(PTT/Reddit)情緒。

**輸出協議 (Protocol)：**
*   **語言**：繁體中文 (Traditional Chinese)。
*   **格式**：Markdown。
`;

export const sendMessageToGemini = async (
  history: Message[],
  userMessage: string
): Promise<{ text: string; groundingChunks?: any[] }> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare conversation history
    const historyContents = history.slice(-10).map(msg => ({
      role: msg.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const model = ai.models;
    
    const response: GenerateContentResponse = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...historyContents,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.4,
      }
    });

    const text = response.text || "目前數據不足，無法生成完整戰略分析。";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, groundingChunks };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
