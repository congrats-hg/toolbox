import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, TabInfo, ResearchResult } from '../shared/types';

// API 함수들
const api = {
  async getStatus() {
    const res = await fetch('/api/status');
    return res.json();
  },
  async getTabs() {
    const res = await fetch('/api/tabs');
    return res.json();
  },
  async research(query: string) {
    const res = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return res.json();
  },
  async navigate(url: string) {
    const res = await fetch('/api/navigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return res.json();
  },
  async quickNavigate(site: string) {
    const res = await fetch('/api/quick-navigate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site }),
    });
    return res.json();
  },
  async getKyonggiSites() {
    const res = await fetch('/api/kyonggi-sites');
    return res.json();
  },
};

// 상태 배지 컴포넌트
function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      <span
        className={`w-2 h-2 mr-1.5 rounded-full ${
          connected ? 'bg-green-400 animate-pulse-dot' : 'bg-red-400'
        }`}
      />
      {connected ? '연결됨' : '연결 안됨'}
    </span>
  );
}

// 빠른 네비게이션 버튼
function QuickNavButtons({
  sites,
  onNavigate,
}: {
  sites: Record<string, string>;
  onNavigate: (site: string) => void;
}) {
  const siteLabels: Record<string, string> = {
    main: '메인',
    admission: '입학처',
    graduate: '대학원',
    international: '국제교류',
    library: '도서관',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.keys(sites).map((site) => (
        <button
          key={site}
          onClick={() => onNavigate(site)}
          className="px-3 py-1.5 text-sm bg-kyonggi-primary text-white rounded-lg hover:bg-kyonggi-secondary transition-colors"
        >
          {siteLabels[site] || site}
        </button>
      ))}
    </div>
  );
}

// 채팅 메시지 컴포넌트
function ChatMessageItem({
  message,
  isUser,
}: {
  message: { content: string; toolCalls?: Array<{ tool: string }> };
  isUser: boolean;
}) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] p-4 rounded-2xl ${
          isUser
            ? 'bg-kyonggi-primary text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200/30">
            <div className="text-xs opacity-70">
              사용된 도구: {message.toolCalls.map((t) => t.tool).join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 탭 목록 컴포넌트
function TabList({ tabs, onRefresh }: { tabs: TabInfo[]; onRefresh: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">열린 탭</h3>
        <button
          onClick={onRefresh}
          className="text-sm text-kyonggi-secondary hover:underline"
        >
          새로고침
        </button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {tabs.length === 0 ? (
          <p className="text-gray-500 text-sm">탭 정보를 불러올 수 없습니다</p>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={`p-2 rounded text-sm ${
                tab.active ? 'bg-kyonggi-primary/10 border-l-2 border-kyonggi-primary' : 'bg-gray-50'
              }`}
            >
              <div className="font-medium truncate">{tab.title || '제목 없음'}</div>
              <div className="text-xs text-gray-500 truncate">{tab.url}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 메인 앱 컴포넌트
export default function App() {
  const [status, setStatus] = useState<{ server: string; mcpChrome: string } | null>(null);
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [sites, setSites] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<
    Array<{ id: string; content: string; isUser: boolean; toolCalls?: Array<{ tool: string }> }>
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadInitialData() {
    try {
      const [statusData, tabsData, sitesData] = await Promise.all([
        api.getStatus(),
        api.getTabs().catch(() => ({ tabs: [] })),
        api.getKyonggiSites(),
      ]);
      setStatus(statusData);
      setTabs(tabsData.tabs || []);
      setSites(sitesData);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  async function refreshTabs() {
    try {
      const data = await api.getTabs();
      setTabs(data.tabs || []);
    } catch (error) {
      console.error('Failed to refresh tabs:', error);
    }
  }

  async function handleQuickNavigate(site: string) {
    try {
      await api.quickNavigate(site);
      setTimeout(refreshTabs, 1000);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), content: userMessage, isUser: true },
    ]);
    setLoading(true);

    try {
      const result = await api.research(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: result.answer || result.error || '응답을 받지 못했습니다.',
          isUser: false,
          toolCalls: result.toolCalls,
        },
      ]);
      refreshTabs();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: '오류가 발생했습니다. 다시 시도해주세요.',
          isUser: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-kyonggi-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">경기대학교 리서처</h1>
              <p className="text-sm text-blue-200">MCP Chrome + Gemini 2.5 Flash</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-blue-200">MCP Chrome: </span>
                <StatusBadge connected={status?.mcpChrome === 'connected'} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 빠른 네비게이션 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-700 mb-3">빠른 이동</h3>
              <QuickNavButtons sites={sites} onNavigate={handleQuickNavigate} />
            </div>

            {/* 탭 목록 */}
            <TabList tabs={tabs} onRefresh={refreshTabs} />

            {/* 사용 팁 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">사용 팁</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>- "입학 일정 알려줘"</li>
                <li>- "장학금 종류 찾아줘"</li>
                <li>- "컴퓨터공학과 교수진 정보"</li>
                <li>- "기숙사 신청 방법"</li>
                <li>- "2026학년도 등록금"</li>
              </ul>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow h-[calc(100vh-200px)] flex flex-col">
              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <svg
                      className="w-16 h-16 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-lg">경기대학교에 대해 무엇이든 물어보세요!</p>
                    <p className="text-sm mt-2">AI가 브라우저를 제어하여 정보를 찾아드립니다</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <ChatMessageItem key={msg.id} message={msg} isUser={msg.isUser} />
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-kyonggi-primary rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-kyonggi-primary rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        />
                        <div
                          className="w-2 h-2 bg-kyonggi-primary rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        />
                        <span className="ml-2 text-sm text-gray-500">탐색 중...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 폼 */}
              <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="경기대학교에 대해 질문하세요..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kyonggi-primary focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-kyonggi-primary text-white rounded-lg hover:bg-kyonggi-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '탐색 중...' : '검색'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-100 border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          MCP Chrome + OpenRouter (Gemini 2.5 Flash) 기반 경기대학교 리서치 도구
        </div>
      </footer>
    </div>
  );
}
