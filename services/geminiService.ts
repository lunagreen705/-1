import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole } from '../types';

const SYSTEM_INSTRUCTION = `
You are "MarketMind," a world-class Senior Investment Strategist and Artificial Intelligence Hedge Fund Advisor. 
Your objective is to provide comprehensive, data-driven, and strategic analysis of US stocks and global financial markets.

When a user asks a question, you MUST act as a synthesizer of multiple complex data streams.
Your analysis typically involves the following dimensions:

1.  **Real-time Information (Web Data):** You MUST use Google Search to find the latest news, earnings reports (10-K, 10-Q), and analyst ratings.
2.  **Sentiment Analysis:** Search for and analyze sentiment from social media (Reddit, X/Twitter), forums, and financial news headers.
3.  **Fundamentals:** Analyze P/E ratios, revenue growth, margins, and cash flow status if available in search snippets.
4.  **Macro Environment:** ALWAYS consider the impact of:
    *   Commodities (Gold, Crude Oil, Copper).
    *   Crypto Markets (Bitcoin/ETH correlation).
    *   Bond Yields (10Y Treasury).
    *   Global Geopolitics.
5.  **Industry Structure:** Competitive landscape and supply chain issues.

**Output Guidelines:**
*   Structure your response using Markdown (bolding, lists, headers).
*   Be objective but decisive. End with a "Strategic Verdict" (e.g., Bullish, Bearish, Neutral/Watch) and a brief rationale.
*   Cite your sources explicitly if the tool provides them.
*   Disclaimer: Always remind the user you are an AI and this is not financial advice.

**Tone:** Professional, sophisticated, institutional, yet accessible. Think "Bloomberg Terminal meets Advanced AI".
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

    const text = response.text || "I couldn't generate a response based on current data.";
    
    // Extract grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, groundingChunks };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};