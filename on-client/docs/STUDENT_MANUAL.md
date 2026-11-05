# 학생 실행 안내서 — 검증 중

이 문서는 학생 구현과 로컬에서 확인한 범위를 설명합니다. 공식 통과 및 실제 원천 연결 성공을 인증하지 않습니다.

## 설치·실행

Windows PowerShell, Git, Node.js가 필요합니다. package.json의 고정 기준은 24.19.0이며 이번 로컬 검증은 v24.22.1에서 수행했습니다. 외부 npm 의존성이 없는 제공 런타임이므로 npm install은 실행하지 않았습니다. 저장소를 내려받은 뒤 on-client 폴더에서 실행합니다.

```powershell
node --version
npm run check
$env:ON_PORT='5197'
npm run demo
```

http://127.0.0.1:5197 에서 예제 자료를 확인합니다. 실행을 종료하려면 해당 창에서 Ctrl+C를 누릅니다. 예제 자료는 실제 서버 연결 증거가 아닙니다. 실제 인증 정보를 넣지 않는 기본 연결 확인 실행은 다음과 같습니다.

```powershell
$env:ON_PORT='5198'
npm start
```

http://127.0.0.1:5198 에서 화면을 엽니다. 위 두 실행과 루트 HTML, /api/me, /api/events, /api/diagnostics 응답을 직접 확인했습니다. 기본 모드의 me/events는 HTTP 503 ENGINE_NOT_CONNECTED였습니다. 현재 복사본에는 실제 연결 설정이 없으므로 정상 계정·기기 데이터를 기대하면 안 됩니다. 화면 클릭에 의한 전체 동작은 미확인입니다.

실제 앱 승인과 원천 연결 실행은 제공 문서 STUDENT_LAUNCH_GUIDE.md, AI_SETUP_GUIDE.md, SDP_HOST_CONNECTION.md를 따릅니다. tools/start-alekov.ps1을 통한 이번 복사본의 실제 승인 실행은 미실행입니다. 개인 자격 파일은 프로젝트 밖에 두며 키·토큰·개인키를 Git이나 제출물에 넣지 않습니다.

## 구성도와 실제 파일

```text
[브라우저: http://127.0.0.1:5197 또는 :5198]
 public/app.js → student/extension.mjs (학생 DOM 표시)
                 │ HTTP /api/*
[앱 서버: src/server.mjs]
 ├─ src/engine.mjs → student/engine-adapter.mjs
 │                     │ 승인된 host capability
 │  [기존 접속·XDR 서버: src/engine/sdp-host.mjs가 연결 담당]
 │   실제 운영 주소·개인 설정 미지정 → 이번 검증에서는 연결 없음
 └─ src/ai/service.mjs → vendor/clco-http.mjs
     [CLCO 수업용 AI: docs/AI_SETUP_GUIDE.md의 앱 승인 연결]
      실제 서비스 요청 미검증, 비밀 주소·자격은 문서에 기록하지 않음
```

브라우저는 제공 서버를 호출하며 비밀값을 보유하지 않습니다. AI 설명 실패가 접속 판정과 원본 기록을 지우지 않습니다. 연결 점검의 모델 수는 사건 설명 성공이나 조치 효과가 아닙니다.

## 제공 코드와 학생 구현 경계

.on-starter-manifest.json의 sourceHashes가 제공 파일 원본 기준입니다. 이번 검증에서 student 파일을 제외한 73개 파일의 SHA-256 일치를 확인했습니다. public/, src/, tools/, vendor/, 제공 문서, manifest는 수정하지 않았습니다.

학생 코드 student/extension.mjs는 입력을 표시하며 권한 발급·모델 호출·조치 집행을 하지 않습니다. 학생 문서는 docs/STUDENT_MANUAL.md와 docs/NEW_ENV_RUN.md입니다.

| 함수 | 학생 화면의 역할 |
|---|---|
| renderIdentity | 로그인한 사용자·기기·세션 및 오류·loading, 확인 불가 상태 |
| renderDecision | allow/deny/challenge/unknown과 요청 실패 구분 |
| renderEvents | 기록 목록, 필터, 선택한 기록의 근거와 규칙 |
| renderStatus | 기기·세션·알림·진단의 실패와 복구 안내 |
| renderAiConnection | 연결 점검·모델 수·권한·한도·취소·시간 초과 구분 |
| renderExplanation | 사건별 근거·규칙·unknown·미실행 제안, 잘못된 설명 거절 |
| renderAction | 준비·사람 확인·전달·ACK·원천 관측·결과 불명 구분 |
| renderVulnerabilities | 정확한 설치 버전·잠금 해시·OSV 출처·시각·부분 결과 |

제공 화면에서 메뉴 선택 → 다시 불러오기 → 업무 앱 요청 → 보안 기록 선택 → AI 설명 요청 순으로 진행합니다. 현재 지원 조치가 빈 배열이면 조치 준비 버튼이 없는 것이 정상입니다. 학생 함수는 버튼이나 확인 티켓을 만들지 않습니다. pending은 ACK이며 실제 효과가 아닙니다. succeeded도 observation.effectApplied가 true일 때만 효과 확인으로 표시합니다.

## 실패 안내

| 표시/코드 | 의미 | 확인할 것 |
|---|---|---|
| 연결 실패 / ENGINE_NOT_CONNECTED | 원천 연결 미구성 또는 확인 불가 | 제공 연결 안내와 담당자가 발급한 설정을 확인. demo와 혼동하지 않기 |
| ON_AI_PROVISIONING_PENDING / MODEL_NOT_CONFIGURED | 앱 권한 또는 모델 준비 중 | 담당자에게 계정·프로젝트 승인 확인 요청 |
| WB_CLCO_AUTH_REQUIRED / WB_CLCO_ACCESS_BLOCKED | 로그인 또는 접근 제한 | 현재 계정·앱 연결 확인 |
| WB_CLCO_LIMIT_REACHED / WB_CLCO_COHORT_BUDGET_EXHAUSTED | 사용 한도 | 담당자에게 한도·재개 시점 확인. 우회 발급 금지 |
| WB_CLCO_SESSION_CLOSED | 이용 시간 밖 | 허용된 시간 확인 |
| TIMEOUT / REQUEST_CANCELLED | 시간 초과 또는 취소 | 이전 결과를 현재 성공으로 보지 않고 제공 버튼으로 수동 재시도 |
| 쓸 수 없는 설명(unusable) | 근거 불일치·입력 형태 오류·이미 실행 주장 | 원본 기록 유지, 사건을 다시 선택하고 담당자에게 확인 |
| 결과 불명(unknown) | 효과 확인 불가 | 실행 반복 대신 원천 결과만 재조회 |
| 확인 기한 지남(expired) | 사람 확인 기한 만료 | 현재 대상을 다시 확인하고 준비 |
| not_configured / not_checked | 조회 준비 없음 / 미조회 | 프로젝트 잠금 파일과 담당자 공개 패키지 승인 목록 확인 |
| unverifiable / partial | 확인 불가 / 일부 조회 실패 | 받은 취약점 ID 보존, 실패를 취약점 없음으로 쓰지 않기 |

## 확인 범위와 기다림(UNV)

문법 검사, 27개 가상 DOM 상태 검사, 제공 파일 해시, 기본/예제 서버의 HTTP 응답을 확인했습니다. 가상 DOM은 실제 브라우저 표시나 공식 심판 검사가 아닙니다. 브라우저 전체 클릭 재현, 실제 SDP·XDR 데이터, 이번 복사본의 AI 설명, 실제 조치 효과, 승인된 OSV 조회는 UNV입니다. 포털의 공식 통과 여부는 포털 결과를 따릅니다. 학생 문서에는 실제로 실행하지 않은 인증·조치·취약점 조회를 성공으로 기록하지 않습니다.
