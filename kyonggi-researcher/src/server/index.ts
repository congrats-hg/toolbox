/**
 * 경기대학교 리서치 서버
 * Express + MCP Chrome + OpenRouter
 */

import express from 'express';
import cors from 'cors';
import { mcpClient } from './mcp-client.js';
import { researchKyonggi, ResearchSession } from './ai-agent.js';
import { KYONGGI_SITES } from '../shared/types.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 세션 저장소
const sessions = new Map<string, ResearchSession>();

// 상태 확인
app.get('/api/status', async (_req, res) => {
  const connected = await mcpClient.connect();
  res.json({
    server: 'running',
    mcpChrome: connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// 브라우저 탭 목록
app.get('/api/tabs', async (_req, res) => {
  try {
    const tabs = await mcpClient.getTabs();
    res.json({ tabs });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get tabs',
    });
  }
});

// 페이지 이동
app.post('/api/navigate', async (req, res) => {
  const { url, tabId } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    await mcpClient.navigate(url, tabId);
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Navigation failed',
    });
  }
});

// 페이지 콘텐츠 가져오기
app.get('/api/content/:tabId', async (req, res) => {
  const tabId = parseInt(req.params.tabId, 10);
  const format = (req.query.format as 'text' | 'html' | 'markdown') || 'text';

  try {
    const content = await mcpClient.getWebContent(tabId, format);
    res.json({ content });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get content',
    });
  }
});

// 스크린샷
app.get('/api/screenshot/:tabId', async (req, res) => {
  const tabId = parseInt(req.params.tabId, 10);
  const fullPage = req.query.fullPage === 'true';

  try {
    const dataUrl = await mcpClient.screenshot(tabId, { fullPage });
    res.json({ screenshot: dataUrl });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Screenshot failed',
    });
  }
});

// AI 리서치 (단일 쿼리)
app.post('/api/research', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    console.log(`[Research] 쿼리: ${query}`);
    const result = await researchKyonggi(query);
    console.log(`[Research] 완료: ${result.toolCalls.length}개 도구 호출`);
    res.json(result);
  } catch (error) {
    console.error('[Research] 오류:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Research failed',
    });
  }
});

// 대화형 세션 생성
app.post('/api/session', (_req, res) => {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, new ResearchSession());
  res.json({ sessionId });
});

// 대화형 채팅
app.post('/api/session/:sessionId/chat', async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await session.chat(message);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Chat failed',
    });
  }
});

// 세션 삭제
app.delete('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  sessions.delete(sessionId);
  res.json({ success: true });
});

// 경기대학교 사이트 목록
app.get('/api/kyonggi-sites', (_req, res) => {
  res.json(KYONGGI_SITES);
});

// 빠른 탐색 - 경기대학교 메인 사이트로 이동
app.post('/api/quick-navigate', async (req, res) => {
  const { site } = req.body as { site: keyof typeof KYONGGI_SITES };

  const url = KYONGGI_SITES[site];
  if (!url) {
    return res.status(400).json({
      error: 'Invalid site',
      validSites: Object.keys(KYONGGI_SITES),
    });
  }

  try {
    await mcpClient.navigate(url);
    res.json({ success: true, url, site });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Navigation failed',
    });
  }
});

// 서버 시작
async function start() {
  // MCP Chrome 연결 시도
  const connected = await mcpClient.connect();

  if (!connected) {
    console.warn('MCP Chrome에 연결할 수 없습니다. Chrome 확장 프로그램이 실행 중인지 확인하세요.');
  }

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         경기대학교 리서치 서버 (Kyonggi Researcher)          ║
╠════════════════════════════════════════════════════════════╣
║  서버: http://localhost:${PORT}                              ║
║  MCP Chrome: ${connected ? '연결됨' : '연결 안됨'}                               ║
║  AI 모델: Gemini 2.5 Flash (via OpenRouter)                ║
╚════════════════════════════════════════════════════════════╝

API 엔드포인트:
  GET  /api/status           - 서버 상태 확인
  GET  /api/tabs             - 브라우저 탭 목록
  POST /api/navigate         - 페이지 이동
  GET  /api/content/:tabId   - 페이지 콘텐츠
  GET  /api/screenshot/:tabId - 스크린샷
  POST /api/research         - AI 리서치 (단일 쿼리)
  POST /api/session          - 대화형 세션 생성
  POST /api/session/:id/chat - 대화형 채팅
  GET  /api/kyonggi-sites    - 경기대학교 사이트 목록
  POST /api/quick-navigate   - 빠른 사이트 이동
`);
  });
}

start();
