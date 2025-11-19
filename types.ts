
export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface SuggestedAction {
  label: string;
  actionPrompt: string;
  type: 'fundamental' | 'technical' | 'chips' | 'news' | 'chart';
}

export interface StockMetadata {
  symbol: string;
  name: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isThinking?: boolean;
  groundingChunks?: GroundingChunk[];
  suggestedActions?: SuggestedAction[];
  relatedStock?: StockMetadata; // New field to link a message to a specific stock
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  addedAt: number;
}

export enum ViewState {
  WELCOME = 'WELCOME',
  CHAT = 'CHAT'
}
