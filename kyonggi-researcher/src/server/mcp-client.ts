/**
 * MCP Chrome 클라이언트
 * Chrome MCP Server와 HTTP로 통신하여 브라우저 제어
 */

import type { MCPToolCall, MCPToolResult, TabInfo } from '../shared/types.js';

const MCP_SERVER_URL = process.env.MCP_CHROME_URL || 'http://127.0.0.1:12306';

interface MCPRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface MCPResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string };
}

let requestId = 0;

async function callMCP(method: string, params?: Record<string, unknown>): Promise<unknown> {
  const request: MCPRequest = {
    jsonrpc: '2.0',
    id: ++requestId,
    method,
    params,
  };

  try {
    const response = await fetch(`${MCP_SERVER_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.statusText}`);
    }

    const data = (await response.json()) as MCPResponse;

    if (data.error) {
      throw new Error(`MCP error: ${data.error.message}`);
    }

    return data.result;
  } catch (error) {
    console.error('MCP call failed:', error);
    throw error;
  }
}

export class MCPChromeClient {
  private connected = false;

  async connect(): Promise<boolean> {
    try {
      // 연결 테스트 - 탭 목록 조회
      await this.getTabs();
      this.connected = true;
      console.log('MCP Chrome 연결 성공');
      return true;
    } catch (error) {
      console.error('MCP Chrome 연결 실패:', error);
      this.connected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // 브라우저 관리
  async getTabs(): Promise<TabInfo[]> {
    const result = await callMCP('tools/call', {
      name: 'get_windows_and_tabs',
      arguments: {},
    });

    const data = result as { windows: Array<{ tabs: TabInfo[] }> };
    return data.windows.flatMap((w) => w.tabs);
  }

  async navigate(url: string, tabId?: number): Promise<void> {
    await callMCP('tools/call', {
      name: 'chrome_navigate',
      arguments: { url, tabId },
    });
  }

  async switchTab(tabId: number): Promise<void> {
    await callMCP('tools/call', {
      name: 'chrome_switch_tab',
      arguments: { tabId },
    });
  }

  async goBackOrForward(direction: 'back' | 'forward', tabId?: number): Promise<void> {
    await callMCP('tools/call', {
      name: 'chrome_go_back_or_forward',
      arguments: { direction, tabId },
    });
  }

  // 콘텐츠 분석
  async getWebContent(tabId: number, format: 'html' | 'text' | 'markdown' = 'text'): Promise<string> {
    const result = await callMCP('tools/call', {
      name: 'chrome_get_web_content',
      arguments: { tabId, format },
    });
    return (result as { content: string }).content;
  }

  async getInteractiveElements(tabId: number): Promise<Array<{
    selector: string;
    text: string;
    type: string;
  }>> {
    const result = await callMCP('tools/call', {
      name: 'chrome_get_interactive_elements',
      arguments: { tabId },
    });
    return (result as { elements: Array<{ selector: string; text: string; type: string }> }).elements;
  }

  async searchTabsContent(query: string, limit = 10): Promise<Array<{
    tabId: number;
    title: string;
    url: string;
    relevance: number;
    snippet: string;
  }>> {
    const result = await callMCP('tools/call', {
      name: 'search_tabs_content',
      arguments: { query, limit },
    });
    return result as Array<{
      tabId: number;
      title: string;
      url: string;
      relevance: number;
      snippet: string;
    }>;
  }

  // 인터랙션
  async clickElement(tabId: number, selector: string): Promise<void> {
    await callMCP('tools/call', {
      name: 'chrome_click_element',
      arguments: { tabId, selector },
    });
  }

  async fillOrSelect(tabId: number, selector: string, value: string): Promise<void> {
    await callMCP('tools/call', {
      name: 'chrome_fill_or_select',
      arguments: { tabId, selector, value },
    });
  }

  async keyboard(tabId: number, key: string, modifiers?: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
  }): Promise<void> {
    await callMCP('tools/call', {
      name: 'chrome_keyboard',
      arguments: { tabId, key, modifiers },
    });
  }

  // 스크린샷
  async screenshot(tabId: number, options?: {
    selector?: string;
    fullPage?: boolean;
    format?: 'png' | 'jpeg';
  }): Promise<string> {
    const result = await callMCP('tools/call', {
      name: 'chrome_screenshot',
      arguments: { tabId, ...options },
    });
    return (result as { dataUrl: string }).dataUrl;
  }

  // 스크립트 실행
  async injectScript(tabId: number, code: string): Promise<unknown> {
    const result = await callMCP('tools/call', {
      name: 'chrome_inject_script',
      arguments: { tabId, code },
    });
    return result;
  }

  // 일반 도구 호출
  async callTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    try {
      const result = await callMCP('tools/call', {
        name: toolCall.tool,
        arguments: toolCall.params,
      });
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const mcpClient = new MCPChromeClient();
