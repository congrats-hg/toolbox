/**
 * AI Agent - OpenRouter + Gemini 2.5 Flash
 * 경기대학교 사이트 리서치를 위한 AI 에이전트
 */

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { mcpClient } from './mcp-client.js';
import { KYONGGI_SITES } from '../shared/types.js';

// OpenRouter 클라이언트 생성
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

// Gemini 2.5 Flash 모델
const model = openrouter('google/gemini-2.5-flash');

// MCP Chrome 도구 정의
const browserTools = {
  // 페이지 이동
  navigate: tool({
    description: '특정 URL로 브라우저를 이동합니다. 경기대학교 관련 페이지 탐색에 사용합니다.',
    parameters: z.object({
      url: z.string().describe('이동할 URL'),
      tabId: z.number().optional().describe('대상 탭 ID (생략 시 현재 탭)'),
    }),
    execute: async ({ url, tabId }) => {
      await mcpClient.navigate(url, tabId);
      return { success: true, message: `${url}로 이동했습니다.` };
    },
  }),

  // 페이지 콘텐츠 가져오기
  getPageContent: tool({
    description: '현재 페이지의 텍스트 콘텐츠를 가져옵니다. 페이지 내용을 분석할 때 사용합니다.',
    parameters: z.object({
      tabId: z.number().describe('탭 ID'),
      format: z.enum(['text', 'html', 'markdown']).default('text').describe('콘텐츠 형식'),
    }),
    execute: async ({ tabId, format }) => {
      const content = await mcpClient.getWebContent(tabId, format);
      return { content: content.slice(0, 10000) }; // 토큰 절약을 위해 제한
    },
  }),

  // 클릭 가능한 요소 찾기
  findClickableElements: tool({
    description: '페이지에서 클릭 가능한 요소(링크, 버튼 등)를 찾습니다.',
    parameters: z.object({
      tabId: z.number().describe('탭 ID'),
    }),
    execute: async ({ tabId }) => {
      const elements = await mcpClient.getInteractiveElements(tabId);
      return { elements: elements.slice(0, 50) }; // 주요 요소만
    },
  }),

  // 요소 클릭
  clickElement: tool({
    description: '페이지의 특정 요소를 클릭합니다. 메뉴, 링크, 버튼 등을 클릭할 때 사용합니다.',
    parameters: z.object({
      tabId: z.number().describe('탭 ID'),
      selector: z.string().describe('클릭할 요소의 CSS 선택자'),
    }),
    execute: async ({ tabId, selector }) => {
      await mcpClient.clickElement(tabId, selector);
      return { success: true, message: `${selector} 요소를 클릭했습니다.` };
    },
  }),

  // 입력 필드에 텍스트 입력
  fillInput: tool({
    description: '검색창이나 입력 필드에 텍스트를 입력합니다.',
    parameters: z.object({
      tabId: z.number().describe('탭 ID'),
      selector: z.string().describe('입력 필드의 CSS 선택자'),
      value: z.string().describe('입력할 텍스트'),
    }),
    execute: async ({ tabId, selector, value }) => {
      await mcpClient.fillOrSelect(tabId, selector, value);
      return { success: true, message: `${selector}에 "${value}"를 입력했습니다.` };
    },
  }),

  // 키보드 입력
  pressKey: tool({
    description: '키보드 키를 누릅니다. Enter로 검색 실행, Tab으로 이동 등에 사용합니다.',
    parameters: z.object({
      tabId: z.number().describe('탭 ID'),
      key: z.string().describe('키 이름 (Enter, Tab, Escape 등)'),
    }),
    execute: async ({ tabId, key }) => {
      await mcpClient.keyboard(tabId, key);
      return { success: true, message: `${key} 키를 눌렀습니다.` };
    },
  }),

  // 열린 탭 목록
  listTabs: tool({
    description: '현재 열린 모든 브라우저 탭 목록을 가져옵니다.',
    parameters: z.object({}),
    execute: async () => {
      const tabs = await mcpClient.getTabs();
      return { tabs };
    },
  }),

  // 탭에서 검색
  searchTabs: tool({
    description: '열린 탭들의 내용에서 특정 키워드를 검색합니다.',
    parameters: z.object({
      query: z.string().describe('검색어'),
    }),
    execute: async ({ query }) => {
      const results = await mcpClient.searchTabsContent(query, 10);
      return { results };
    },
  }),

  // 스크린샷
  takeScreenshot: tool({
    description: '현재 페이지의 스크린샷을 찍습니다.',
    parameters: z.object({
      tabId: z.number().describe('탭 ID'),
      fullPage: z.boolean().default(false).describe('전체 페이지 캡처 여부'),
    }),
    execute: async ({ tabId, fullPage }) => {
      const dataUrl = await mcpClient.screenshot(tabId, { fullPage });
      return { screenshot: dataUrl.slice(0, 100) + '...' }; // 메타정보만
    },
  }),

  // JavaScript 실행
  executeScript: tool({
    description: '페이지에서 JavaScript 코드를 실행합니다. DOM 조작이나 정보 추출에 사용합니다.',
    parameters: z.object({
      tabId: z.number().describe('탭 ID'),
      code: z.string().describe('실행할 JavaScript 코드'),
    }),
    execute: async ({ tabId, code }) => {
      const result = await mcpClient.injectScript(tabId, code);
      return { result };
    },
  }),
};

// 시스템 프롬프트
const SYSTEM_PROMPT = `당신은 경기대학교(Kyonggi University) 웹사이트를 탐색하고 정보를 수집하는 리서치 에이전트입니다.

## 당신의 역할
- 사용자가 요청한 정보를 경기대학교 웹사이트에서 찾아 정리합니다
- 브라우저 도구를 사용하여 페이지를 탐색하고, 클릭하고, 검색합니다
- 찾은 정보를 명확하고 구조화된 형태로 제공합니다

## 경기대학교 주요 사이트
- 메인: ${KYONGGI_SITES.main}
- 입학처: ${KYONGGI_SITES.admission}
- 대학원: ${KYONGGI_SITES.graduate}
- 국제교류: ${KYONGGI_SITES.international}

## 탐색 전략
1. 먼저 listTabs로 현재 열린 탭 확인
2. 관련 사이트로 navigate
3. getPageContent로 페이지 내용 확인
4. 필요시 findClickableElements로 탐색 가능한 링크 확인
5. clickElement로 상세 페이지 이동
6. 검색이 필요하면 fillInput과 pressKey 사용

## 주의사항
- 한 번에 너무 많은 도구를 호출하지 마세요
- 페이지 로딩 후 내용을 확인하세요
- 한국어로 응답하세요
- 찾은 정보의 출처(URL)를 항상 포함하세요`;

export interface ResearchResponse {
  answer: string;
  sources: Array<{ url: string; title: string }>;
  toolCalls: Array<{ tool: string; params: unknown; result: unknown }>;
}

export async function researchKyonggi(query: string): Promise<ResearchResponse> {
  const toolCallHistory: Array<{ tool: string; params: unknown; result: unknown }> = [];
  const sources: Array<{ url: string; title: string }> = [];

  try {
    const { text, toolCalls } = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: query,
      tools: browserTools,
      maxSteps: 10, // 최대 10단계까지 도구 호출
      onStepFinish: ({ toolCalls: calls, toolResults }) => {
        if (calls) {
          calls.forEach((call, i) => {
            toolCallHistory.push({
              tool: call.toolName,
              params: call.args,
              result: toolResults?.[i]?.result,
            });
          });
        }
      },
    });

    // 탭 정보에서 소스 추출
    const tabs = await mcpClient.getTabs();
    tabs
      .filter((t) => t.url.includes('kyonggi.ac.kr'))
      .forEach((t) => {
        sources.push({ url: t.url, title: t.title });
      });

    return {
      answer: text,
      sources,
      toolCalls: toolCallHistory,
    };
  } catch (error) {
    console.error('Research failed:', error);
    throw error;
  }
}

// 대화형 리서치 세션
export class ResearchSession {
  private history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  async chat(message: string): Promise<ResearchResponse> {
    this.history.push({ role: 'user', content: message });

    const contextPrompt = this.history
      .map((m) => `${m.role === 'user' ? '사용자' : '어시스턴트'}: ${m.content}`)
      .join('\n\n');

    const response = await researchKyonggi(contextPrompt);

    this.history.push({ role: 'assistant', content: response.answer });

    return response;
  }

  clearHistory(): void {
    this.history = [];
  }
}
