# 경기대학교 리서처 (Kyonggi Researcher)

MCP Chrome과 OpenRouter (Gemini 2.5 Flash)를 활용한 경기대학교 웹사이트 자동 리서치 도구입니다.

## 특징

- **AI 기반 브라우저 자동화**: Gemini 2.5 Flash가 MCP Chrome을 통해 브라우저를 직접 제어
- **대화형 인터페이스**: 자연어로 질문하면 AI가 웹사이트를 탐색하여 답변
- **실시간 브라우저 상태 확인**: 열린 탭 목록 실시간 조회
- **빠른 네비게이션**: 경기대학교 주요 사이트 원클릭 이동

## 아키텍처

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Frontend  │────▶│   Backend   │────▶│  MCP Chrome  │────▶│   Chrome   │
│   (React)   │◀────│  (Express)  │◀────│   (Bridge)   │◀────│  (Browser) │
└─────────────┘     └──────┬──────┘     └──────────────┘     └────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  OpenRouter │
                    │ (Gemini 2.5)│
                    └─────────────┘
```

## 사전 요구사항

1. **Node.js 18+**
2. **Chrome 브라우저**
3. **MCP Chrome 확장 프로그램** 설치 및 활성화
   - [설치 가이드](https://github.com/hangwin/mcp-chrome)
4. **mcp-chrome-bridge** 설치
   ```bash
   npm install -g mcp-chrome-bridge
   ```
5. **OpenRouter API 키**
   - [OpenRouter](https://openrouter.ai/keys)에서 발급

## 설치

```bash
# 저장소 클론 또는 디렉토리 이동
cd kyonggi-researcher

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 OPENROUTER_API_KEY 입력
```

## 실행

```bash
# 개발 모드 (프론트엔드 + 백엔드 동시 실행)
npm run dev

# 또는 개별 실행
npm run server  # 백엔드만
npm run client  # 프론트엔드만
```

## 사용 방법

1. MCP Chrome 확장 프로그램이 Chrome에서 실행 중인지 확인
2. `npm run dev`로 서버 시작
3. 브라우저에서 `http://localhost:3000` 접속
4. 채팅창에 질문 입력
   - 예: "2026학년도 입학 일정 알려줘"
   - 예: "컴퓨터공학과 교수진 정보 찾아줘"
   - 예: "장학금 종류가 뭐가 있어?"

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/status` | 서버 및 MCP 연결 상태 |
| GET | `/api/tabs` | 브라우저 탭 목록 |
| POST | `/api/navigate` | URL로 이동 |
| GET | `/api/content/:tabId` | 페이지 콘텐츠 |
| POST | `/api/research` | AI 리서치 요청 |
| POST | `/api/quick-navigate` | 경기대 사이트 빠른 이동 |

## 기술 스택

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Express, TypeScript
- **AI**: OpenRouter (Gemini 2.5 Flash), Vercel AI SDK
- **Browser Automation**: MCP Chrome

## 주의사항

- MCP Chrome 확장 프로그램이 실행 중이어야 합니다
- OpenRouter API 키가 필요합니다 (유료 서비스)
- 브라우저 자동화 시 개인정보가 포함된 페이지 접근에 주의하세요

## 라이선스

MIT
