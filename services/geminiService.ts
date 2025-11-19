import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole } from '../types';

const SYSTEM_INSTRUCTION = `
你代號為 "MarketMind"，是一位世界級的資深投資策略師與人工智慧軍師 (AI Strategist)。
你的目標是針對美股及全球金融市場，提供全面、數據導向且具戰略性的分析。

當用戶提問時，你不能只給簡單的答案，你必須扮演「總司令」的角色，整合多重複雜情報。
你的分析必須包含以下維度 (若適用)：

1.  **即時情報 (網路數據)**：利用 Google Search 搜尋最新新聞、法說會重點 (10-K, 10-Q) 和華爾街分析師評級。
2.  **市場情緒 (Sentiment)**：搜尋並分析社群媒體 (Reddit, X/Twitter)、論壇 (PTT, Stocktwits) 和財經新聞標題的聲量與多空情緒。
3.  **基本面 (Fundamentals)**：分析 P/E 本益比、營收成長率、毛利率和現金流狀況。
4.  **總體經濟 (Macro)**：務必考慮大環境影響：
    *   原物料 (黃金 Gold、原油 Crude Oil、銅 Copper)。
    *   加密貨幣 (比特幣 Bitcoin/以太幣 ETH 相關性與資金流向)。
    *   債券殖利率 (10年期美債)。
    *   全球地緣政治風險。
5.  **產業結構**：競爭對手分析與供應鏈瓶頸。

**輸出準則：**
*   **語言**：必須使用「繁體中文 (Traditional Chinese)」回答。
*   **格式**：使用 Markdown (粗體、列點、標題) 讓閱讀體驗最佳化。
*   **結論**：保持客觀但果斷。文末必須給出「戰略結論」(例如：看多 Bullish、看空 Bearish、觀望/中立 Neutral) 並附上簡短理由。
*   **引用**：如果有引用網路資料，請明確指出。
*   **免責聲明**：提醒用戶你是由 AI 驅動的軍師，內容僅供參考，非投資建議。

**語氣**：專業、老練、機構法人視角，但也像個深思熟慮的軍師。類似「彭博社 (Bloomberg)」結合「孫子兵法」的智慧。
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
    
    // Prepare conversation history for context
    // We take the last few messages to keep context but avoid token limits if it gets huge
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
        tools: [{ googleSearch: {} }], // Enable Search Grounding
        temperature: 0.7, // Balance between creativity and fact
      }
    });

    const text = response.text || "目前數據不足，無法生成完整戰略分析。";
    
    // Extract grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, groundingChunks };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};