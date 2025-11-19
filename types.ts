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

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  isThinking?: boolean;
  groundingChunks?: GroundingChunk[];
}

export interface MacroIndicator {
  name: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
}

export enum ViewState {
  WELCOME = 'WELCOME',
  CHAT = 'CHAT'
}