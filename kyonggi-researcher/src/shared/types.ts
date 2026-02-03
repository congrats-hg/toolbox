// 리서치 요청 타입
export interface ResearchRequest {
  query: string;
  searchDepth?: 'shallow' | 'medium' | 'deep';
  targetSites?: string[];
}

// 리서치 결과 타입
export interface ResearchResult {
  id: string;
  query: string;
  findings: Finding[];
  summary: string;
  sources: Source[];
  timestamp: string;
}

export interface Finding {
  title: string;
  content: string;
  relevance: number;
  sourceUrl: string;
}

export interface Source {
  url: string;
  title: string;
  visitedAt: string;
}

// MCP Chrome Tool 타입
export interface MCPToolCall {
  tool: string;
  params: Record<string, unknown>;
}

export interface MCPToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// 채팅 메시지 타입
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCallInfo[];
  timestamp: string;
}

export interface ToolCallInfo {
  tool: string;
  params: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'success' | 'error';
}

// 브라우저 상태 타입
export interface BrowserState {
  connected: boolean;
  currentTab?: TabInfo;
  tabs: TabInfo[];
}

export interface TabInfo {
  id: number;
  url: string;
  title: string;
  active: boolean;
}

// 경기대학교 관련 상수
export const KYONGGI_SITES = {
  main: 'https://www.kyonggi.ac.kr',
  admission: 'https://enter.kyonggi.ac.kr',
  graduate: 'https://www.kyonggi.ac.kr/kgraduate',
  international: 'https://www.kyonggi.ac.kr/international_kgu',
  library: 'https://lib.kyonggi.ac.kr',
} as const;

export type KyonggiSiteKey = keyof typeof KYONGGI_SITES;
