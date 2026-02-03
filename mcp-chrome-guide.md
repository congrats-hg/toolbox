# MCP Chrome 완벽 가이드

## 🎯 MCP Chrome이란?

**MCP Chrome**은 AI 어시스턴트(Claude 등)가 여러분의 Chrome 브라우저를 직접 제어할 수 있게 해주는 Chrome 확장 프로그램입니다.

### 기존 브라우저 자동화 도구와의 차이점

| 구분 | MCP Chrome | Playwright/Selenium |
|------|-----------|---------------------|
| 브라우저 | 기존 Chrome 사용 | 새 브라우저 인스턴스 생성 |
| 로그인 상태 | **유지됨** ✅ | 매번 새로 로그인 필요 |
| 리소스 사용 | 가벼움 | 무거움 |
| 속도 | 빠름 | 상대적으로 느림 |
| 쿠키/설정 | 그대로 사용 | 초기화됨 |

> 💡 **핵심 장점**: 이미 로그인된 사이트들(Gmail, GitHub, 회사 시스템 등)을 그대로 AI가 제어할 수 있습니다!

---

## 📦 설치 방법

### 1단계: Chrome 확장 프로그램 다운로드

1. [GitHub Releases 페이지](https://github.com/hangwin/mcp-chrome/releases)로 이동
2. 최신 버전의 확장 프로그램 파일(`.zip`) 다운로드
3. 압축 해제

### 2단계: Bridge 설치

터미널에서 다음 명령어 실행:

```bash
# npm 사용 시
npm install -g mcp-chrome-bridge

# 또는 pnpm 사용 시
pnpm install -g mcp-chrome-bridge
```

### 3단계: Chrome에 확장 프로그램 로드

1. Chrome 주소창에 `chrome://extensions/` 입력
2. 우측 상단의 **"개발자 모드"** 활성화
3. **"압축해제된 확장 프로그램을 로드합니다"** 클릭
4. 압축 해제한 폴더 선택

### 4단계: MCP 설정 확인

1. Chrome 툴바에서 확장 프로그램 아이콘 클릭
2. 표시되는 MCP 설정 정보 메모

---

## ⚙️ Claude Desktop 연동 설정

### 방법 1: Streamable HTTP (권장)

`claude_desktop_config.json` 파일에 다음 내용 추가:

```json
{
  "mcpServers": {
    "chrome-mcp-server": {
      "type": "streamableHttp",
      "url": "http://127.0.0.1:12306/mcp"
    }
  }
}
```

**설정 파일 위치:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 방법 2: STDIO 방식

```json
{
  "mcpServers": {
    "chrome-mcp-server": {
      "command": "node",
      "args": ["/path/to/mcp-chrome-bridge/mcp-server-stdio.js"]
    }
  }
}
```

> ⚠️ `/path/to/` 부분은 실제 설치 경로로 변경해야 합니다.

---

## 🛠️ 제공 기능 (20개 이상의 도구)

### 1. 브라우저 관리
| 기능 | 설명 |
|------|------|
| URL 이동 | 특정 웹페이지로 이동 |
| 탭 전환 | 열린 탭 간 이동 |
| 창 닫기 | 브라우저 창/탭 닫기 |
| 스크립트 삽입 | JavaScript 코드 실행 |
| 뒤로/앞으로 | 탐색 히스토리 제어 |

### 2. 화면 캡처
| 기능 | 설명 |
|------|------|
| 요소 스크린샷 | 특정 HTML 요소만 캡처 |
| 전체 페이지 | 스크롤 포함 전체 캡처 |
| 커스텀 크기 | 원하는 영역만 캡처 |

### 3. 네트워크 모니터링
| 기능 | 설명 |
|------|------|
| 요청 캡처 | API 호출 모니터링 |
| 응답 분석 | 서버 응답 데이터 확인 |
| 트래픽 로깅 | 네트워크 활동 기록 |

### 4. 콘텐츠 분석
| 기능 | 설명 |
|------|------|
| 시맨틱 검색 | 탭 내용 의미 기반 검색 |
| HTML 추출 | 페이지 구조 가져오기 |
| 텍스트 추출 | 순수 텍스트만 추출 |
| 인터랙티브 요소 | 클릭 가능한 요소 찾기 |
| 콘솔 출력 | 개발자 콘솔 로그 확인 |

### 5. 상호작용
| 기능 | 설명 |
|------|------|
| 클릭 | 버튼/링크 클릭 |
| 폼 입력 | 텍스트 필드 채우기 |
| 선택 | 드롭다운 옵션 선택 |
| 키보드 입력 | 단축키, 특수키 입력 |

### 6. 데이터 관리
| 기능 | 설명 |
|------|------|
| 히스토리 검색 | 방문 기록 조회 |
| 북마크 검색 | 저장된 북마크 찾기 |
| 북마크 추가/삭제 | 북마크 관리 |
| 폴더 정리 | 북마크 폴더 구성 |

---

## 💡 실제 활용 예시

### 예시 1: 웹페이지 요약
```
"현재 열린 탭의 내용을 요약해줘"
```

### 예시 2: 자동 폼 작성
```
"이 회원가입 폼에 다음 정보로 입력해줘: 이름은 홍길동, 이메일은 test@example.com"
```

### 예시 3: API 분석
```
"이 페이지가 호출하는 API 엔드포인트들을 분석해줘"
```

### 예시 4: 스크린샷 저장
```
"현재 페이지의 전체 스크린샷을 찍어줘"
```

### 예시 5: 히스토리 분석
```
"지난 일주일간 내가 방문한 개발 관련 사이트를 정리해줘"
```

### 예시 6: 멀티탭 작업
```
"열린 모든 탭의 제목과 URL을 정리해줘"
```

### 예시 7: 콘텐츠 수정
```
"이 페이지의 배경색을 파란색으로 바꿔줘"
```

---

## 🔧 문제 해결

### 연결이 안 될 때

1. **확장 프로그램 활성화 확인**
   - `chrome://extensions/`에서 MCP Chrome이 활성화되어 있는지 확인

2. **Bridge 실행 확인**
   ```bash
   # Bridge가 제대로 설치되었는지 확인
   which mcp-chrome-bridge
   ```

3. **포트 확인**
   - 기본 포트 `12306`이 다른 프로그램에서 사용 중인지 확인
   ```bash
   lsof -i :12306
   ```

4. **Claude Desktop 재시작**
   - 설정 파일 수정 후 Claude Desktop을 완전히 종료하고 다시 시작

### 권한 오류 발생 시

- 확장 프로그램에 필요한 권한이 모두 부여되었는지 확인
- Chrome을 관리자 권한으로 실행해보기

---

## 📌 주의사항

1. **보안**: 민감한 정보가 있는 페이지에서는 주의해서 사용
2. **리소스**: 네트워크 모니터링을 오래 켜두면 메모리 사용량 증가 가능
3. **호환성**: 일부 보안이 강화된 사이트에서는 동작하지 않을 수 있음

---

## 🔗 참고 링크

- [GitHub 저장소](https://github.com/hangwin/mcp-chrome)
- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [Claude Desktop 다운로드](https://claude.ai/download)

---

## 🏗️ 아키텍처 분석 (코드 구조)

### 전체 시스템 구조

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   AI Assistant  │────▶│   Native Bridge  │────▶│ Chrome Extension│
│  (Claude 등)    │◀────│ (mcp-chrome-     │◀────│  (Background +  │
│                 │     │    bridge)       │     │  Content Script)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        │    MCP Protocol       │   Native Messaging     │   Chrome APIs
        │    (HTTP/STDIO)       │                        │
        ▼                       ▼                        ▼
   Tool 호출 요청          메시지 중계              브라우저 제어
```

### 핵심 컴포넌트

#### 1. Chrome Extension (확장 프로그램)

**Background Service Worker** (`background.js`)
- 확장 프로그램의 핵심 로직 담당
- Native Messaging을 통해 Bridge와 통신
- 각 Tool 요청을 처리하고 Chrome API 호출

**Content Scripts** (`content.js`)
- 웹페이지 DOM에 직접 접근
- 클릭, 폼 입력 등 인터랙션 수행
- `chrome.scripting.executeScript`로 동적 주입

**Inject Bridge** (`inject-bridge.js`)
- ISOLATED world에서 실행
- 페이지 컨텍스트와 확장 프로그램 간 브릿지 역할

#### 2. Native Bridge (`mcp-chrome-bridge`)

```
┌─────────────────────────────────────────────┐
│            mcp-chrome-bridge                │
├─────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │ HTTP Server     │  │ STDIO Server    │   │
│  │ (Port 12306)    │  │ (표준 입출력)   │   │
│  └────────┬────────┘  └────────┬────────┘   │
│           │                    │            │
│           ▼                    ▼            │
│  ┌─────────────────────────────────────┐    │
│  │        MCP Protocol Handler         │    │
│  └─────────────────────────────────────┘    │
│                    │                        │
│                    ▼                        │
│  ┌─────────────────────────────────────┐    │
│  │   Native Messaging (Chrome과 통신)   │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Native Messaging Manifest** (`com.chromemcp.nativehost.json`)
- Chrome과 Node.js 프로세스 연결
- 위치: `~/.config/google-chrome/NativeMessagingHosts/`

#### 3. 메시지 흐름

```
1. Claude → "chrome_navigate" Tool 호출
                  ↓
2. Native Bridge → MCP 요청 수신
                  ↓
3. Native Messaging → Chrome Extension으로 전달
                  ↓
4. Background Worker → chrome.tabs.update() API 호출
                  ↓
5. 결과 반환 (역순)
```

---

## 🔧 상세 Tool API 레퍼런스

### 브라우저 관리 Tools

#### `get_windows_and_tabs`
현재 열린 모든 윈도우와 탭 정보 조회

```typescript
// 반환 예시
{
  windows: [
    {
      id: 1,
      tabs: [
        { id: 101, url: "https://google.com", title: "Google" },
        { id: 102, url: "https://github.com", title: "GitHub" }
      ]
    }
  ]
}
```

#### `chrome_navigate`
URL로 이동하거나 뷰포트 제어

```typescript
// 파라미터
{
  url: string,        // 이동할 URL
  tabId?: number,     // 대상 탭 ID (선택)
  newTab?: boolean    // 새 탭에서 열기
}
```

#### `chrome_switch_tab`
탭 전환

```typescript
// 파라미터
{
  tabId: number       // 전환할 탭 ID
}
```

#### `chrome_close_tabs`
탭 닫기

```typescript
// 파라미터
{
  tabIds: number[]    // 닫을 탭 ID 배열
}
```

#### `chrome_go_back_or_forward`
탐색 히스토리 이동

```typescript
// 파라미터
{
  direction: "back" | "forward",
  tabId?: number
}
```

#### `chrome_inject_script`
JavaScript 코드 실행

```typescript
// 파라미터
{
  tabId: number,
  code: string,       // 실행할 JS 코드
  world?: "MAIN" | "ISOLATED"  // 실행 컨텍스트
}
```

---

### 스크린샷 Tools

#### `chrome_screenshot`
고급 스크린샷 캡처

```typescript
// 파라미터
{
  tabId?: number,
  selector?: string,      // CSS 셀렉터로 특정 요소만 캡처
  fullPage?: boolean,     // 전체 페이지 캡처
  format?: "png" | "jpeg" | "webp",
  quality?: number,       // JPEG 품질 (0-100)
  width?: number,         // 커스텀 너비
  height?: number         // 커스텀 높이
}
```

---

### 네트워크 모니터링 Tools

#### `chrome_network_capture_start`
네트워크 캡처 시작

```typescript
// 파라미터
{
  tabId: number,
  filters?: {
    urls?: string[],      // URL 패턴 필터
    types?: string[]      // 요청 타입 필터
  }
}
```

#### `chrome_network_capture_stop`
네트워크 캡처 중지 및 결과 반환

```typescript
// 반환 예시
{
  requests: [
    {
      url: "https://api.example.com/data",
      method: "GET",
      status: 200,
      responseBody: "...",
      headers: {...}
    }
  ]
}
```

---

### 콘텐츠 분석 Tools

#### `chrome_get_web_content`
페이지 콘텐츠 추출

```typescript
// 파라미터
{
  tabId: number,
  format?: "html" | "text" | "markdown"
}
```

#### `chrome_get_interactive_elements`
인터랙티브 요소 목록 조회

```typescript
// 반환 예시
{
  elements: [
    {
      selector: "button.submit-btn",
      text: "제출",
      type: "button",
      isVisible: true
    }
  ]
}
```

#### `chrome_console`
브라우저 콘솔 로그 캡처

```typescript
// 파라미터
{
  tabId: number,
  clear?: boolean     // 캡처 후 콘솔 클리어
}

// 반환
{
  logs: [
    { level: "log", message: "Hello", timestamp: 1234567890 },
    { level: "error", message: "Error!", timestamp: 1234567891 }
  ]
}
```

#### `search_tabs_content`
시맨틱 검색 (의미 기반 탭 검색)

```typescript
// 파라미터
{
  query: string,      // 검색 쿼리
  limit?: number      // 결과 개수 제한
}

// 내부적으로 WebAssembly SIMD 벡터 연산 사용
// 4-8배 빠른 유사도 계산
```

---

### 인터랙션 Tools

#### `chrome_click_element`
요소 클릭

```typescript
// 파라미터
{
  tabId: number,
  selector: string,   // CSS 셀렉터
  clickType?: "left" | "right" | "double"
}
```

#### `chrome_fill_or_select`
폼 입력 및 선택

```typescript
// 파라미터
{
  tabId: number,
  selector: string,
  value: string,      // 입력할 값
  type?: "fill" | "select"  // input vs select 요소
}
```

#### `chrome_keyboard`
키보드 입력 시뮬레이션

```typescript
// 파라미터
{
  tabId: number,
  key: string,        // 키 이름 (예: "Enter", "Tab", "a")
  modifiers?: {
    ctrl?: boolean,
    alt?: boolean,
    shift?: boolean,
    meta?: boolean
  }
}
```

---

### 데이터 관리 Tools

#### `chrome_history`
방문 기록 검색

```typescript
// 파라미터
{
  query: string,
  startTime?: number,   // Unix timestamp
  endTime?: number,
  maxResults?: number
}
```

#### `chrome_bookmark_search`
북마크 검색

```typescript
// 파라미터
{
  query: string
}
```

#### `chrome_bookmark_add`
북마크 추가

```typescript
// 파라미터
{
  url: string,
  title: string,
  parentId?: string   // 폴더 ID
}
```

---

## 🔬 내부 동작 원리

### 1. Native Messaging 통신

```javascript
// Chrome Extension (background.js)
chrome.runtime.connectNative('com.chromemcp.nativehost');

// 메시지 송신
port.postMessage({ type: 'tool_call', tool: 'chrome_navigate', params: {...} });

// 메시지 수신
port.onMessage.addListener((response) => {
  // 결과 처리
});
```

### 2. Content Script 주입

```javascript
// Background → Content Script 주입
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['inject-bridge.js'],
  world: 'ISOLATED'
});

// 또는 코드 직접 실행
chrome.scripting.executeScript({
  target: { tabId: tabId },
  func: (selector) => document.querySelector(selector).click(),
  args: ['.submit-button'],
  world: 'MAIN'
});
```

### 3. 메시지 패싱

```javascript
// Background → Content Script
chrome.tabs.sendMessage(tabId, {
  type: 'chrome-mcp:click',
  selector: '.button'
});

// Content Script → Background
chrome.runtime.sendMessage({
  type: 'chrome-mcp:result',
  success: true
});
```

### 4. 시맨틱 검색 (벡터 DB)

```
1. 탭 내용 추출
        ↓
2. 텍스트 임베딩 생성 (WebAssembly SIMD)
        ↓
3. 로컬 벡터 DB에 저장
        ↓
4. 쿼리 임베딩과 코사인 유사도 계산
        ↓
5. 상위 N개 결과 반환
```

---

## 📂 프로젝트 구조 (추정)

```
mcp-chrome/
├── extension/                 # Chrome 확장 프로그램
│   ├── manifest.json          # 확장 프로그램 설정
│   ├── background.js          # Service Worker
│   ├── content.js             # Content Script
│   ├── inject-bridge.js       # 페이지 브릿지
│   ├── sidepanel/             # 사이드패널 UI
│   └── popup/                 # 팝업 UI
│
├── bridge/                    # Native Bridge
│   ├── mcp-server-stdio.js    # STDIO 서버
│   ├── mcp-server-http.js     # HTTP 서버
│   └── native-messaging.js    # Chrome 통신
│
├── shared/                    # 공유 타입/유틸
│   └── types.ts               # TypeScript 타입 정의
│
└── docs/                      # 문서
    └── ARCHITECTURE_zh.md     # 아키텍처 문서
```

---

## 🔗 참고 링크

- [GitHub 저장소](https://github.com/hangwin/mcp-chrome)
- [GitHub Releases](https://github.com/hangwin/mcp-chrome/releases)
- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [Claude Desktop 다운로드](https://claude.ai/download)
- [DeepWiki 문서](https://deepwiki.com/hangwin/mcp-chrome)
- [아키텍처 문서 (중국어)](https://github.com/hangwin/mcp-chrome/blob/master/docs/ARCHITECTURE_zh.md)

---

*이 가이드는 2026년 2월 기준으로 작성되었습니다. 최신 정보는 공식 GitHub 저장소를 참고하세요.*
