# 이해로 스튜디오 (ihaerostudio-fe)

판결문을 발달장애가 있는 성인이 읽을 수 있는 **쉬운 설명자료**(쉬운 글 + 그림)로 만드는 제작 도구의 프론트엔드예요. AI가 만든 초안을 원문과 대조하고, 글과 그림을 고치고, 검토하고, 내보내는 과정을 한곳에서 돕습니다.

- 스펙: [`docs/specs/judgment-easy-read.md`](docs/specs/judgment-easy-read.md)
- 결정 기록(그릴링): [`docs/grilling/2026-09-13-judgment-easy-read.md`](docs/grilling/2026-09-13-judgment-easy-read.md)

## 흐름

1. **올리기** (`/new`): 판결문 PDF나 텍스트, 문체·호칭·그림 설정
2. **사건 구조 확인** (`/projects/[id]/structure`): 원문과 나란히 당사자의 주장과 법원의 판단·결정을 나눠 확인
3. **편집** (`/projects/[id]/edit`): 원문 | 쉬운 자료 | 문장 도구의 3단 편집기
4. **검토** (`/projects/[id]/review`): 자동 점검 항목 처리와 최종 확인 체크리스트
5. **미리보기** (`/projects/[id]/preview`): 기기별 읽기 화면과 A4 인쇄 쪽
6. **내보내기** (`/projects/[id]/export`): 게시본, PDF 저장, 읽기 화면 공개

독자용 읽기 화면은 `/read/[id]`, 인쇄 화면은 `/print/[id]?publication=...`이에요.

## 서버 연결

AI와 API는 별도 서버 프로젝트 `ihaerostudio-be`가 맡아요. 이 저장소에는 서버 코드가 없어요.

- 화면은 `lib/api/types.ts`의 `ApiClient` 인터페이스만 사용하고, 응답은 `lib/domain`의 zod 스키마로 검증해요.
- `lib/api/http-client.ts`가 이 인터페이스를 서버의 `/api/studio` HTTP API로 구현하고, `lib/api/client.ts`가 연결해요.
- 서버 주소와 토큰은 환경 변수로 정해요. `.env.example`을 `.env.local`로 복사해서 고쳐요.

| 변수                           | 기본값                  | 뜻                                                                          |
| ------------------------------ | ----------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_STUDIO_API_URL`   | `http://127.0.0.1:8100` | 서버 주소(origin)                                                           |
| `NEXT_PUBLIC_STUDIO_API_TOKEN` | (없음)                  | 선택. 서버 `API_KEYS`에 등록한 토큰을 넣으면 그 제작자의 고정 작업함을 써요 |

토큰을 비워 두면 브라우저가 처음 열릴 때 방문자 ID를 만들어 localStorage에 두고 그것을 토큰으로 보내요. 서버의 기본 모드(`AUTH_MODE=anonymous`)는 이런 토큰마다 따로 작업함을 만들어 주므로, 로그인 없이 누구나 자기 자료로 체험할 수 있어요. 브라우저를 바꾸거나 저장소를 지우면 새 작업함이 돼요. `NEXT_PUBLIC_` 값은 빌드 때 번들에 들어가고, 토큰은 로그인이 아니라 구분용이라 화면을 여는 사람이 볼 수 있어요.

### 서버 실행 (로컬)

두 저장소가 이웃 디렉터리에 있을 때:

```bash
cd ../ihaerostudio-be
python3 -m venv .venv && .venv/bin/pip install -e '.[test]'
AI_PROVIDER=demo .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8100
```

- 서버의 기본 CORS 허용 주소는 `http://localhost:3000`, `http://127.0.0.1:3000`이에요.
- `AI_PROVIDER=demo`: 실제 분석이 아니에요. 원문을 그대로 옮기고 "원고:", "법원 결정:"처럼 표시된 줄만 분류해요. 더 쉽게 바꾸기·용어 후보·용어 설명은 서버가 503으로 거절하고, 그림 후보는 올린 그림만 돌려줘요. 새 자료 화면 위에 데모 모드 안내가 떠요.
- 실제 분석: 서버에 `AI_PROVIDER=openai`, `OPENAI_API_KEY`, `OPENAI_MODEL`을 설정해요. 그림 생성은 `COMFY_CLOUD_API_KEY`도 필요해요.
- `.claude/launch.json`에 두 서버 실행 설정(`ihaerostudio-fe`, `ihaerostudio-be`)이 있어요.

### 샘플 판결문

`lib/sample-judgment.ts`의 가상 판결문(가온지방법원 임대차보증금 반환)은 작업함의 [샘플로 체험하기]와 새 자료 화면의 [샘플 판결문으로 체험하기]로 채워져요. 붙여 넣은 텍스트와 똑같이 서버로 보내 분석하므로, 결과는 서버의 AI 모드에 따라 달라요.

### 데모 데이터 초기화

작업함 맨 아래 [데모 데이터 초기화]는 서버가 데모 모드일 때만 보이고, 서버에 저장된 내 자료를 모두 지워요.

## 개발

```bash
pnpm install
pnpm dev
```

| 명령             | 하는 일                           |
| ---------------- | --------------------------------- |
| `pnpm dev`       | 개발 서버 (http://localhost:3000) |
| `pnpm test`      | 도메인 모듈 테스트 (Vitest)       |
| `pnpm typecheck` | 타입 검사                         |
| `pnpm lint`      | ESLint                            |
| `pnpm format`    | Prettier + Tailwind 클래스 정렬   |
| `pnpm build`     | 프로덕션 빌드                     |

## 구조

| 위치                     | 내용                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `lib/domain`             | zod 스키마와 순수 함수(단계 규칙, 구조·문서 편집, 어절 차이, 숫자 감지, 독자용 내용, 쪽 나누기). 테스트 seam |
| `lib/api`                | `ApiClient` 인터페이스, HTTP 구현, 방문자 ID, 응답 검증, 쿼리 키와 훅                                        |
| `lib/sample-judgment.ts` | 체험용 가상 판결문 텍스트                                                                                    |
| `lib/stores`             | 편집 화면 공용 자동 저장                                                                                     |
| `components/*`           | 화면별 컴포넌트(`structure`, `editor`, `review`, `reader`, `print`, `preview`, `export` 등)와 공용 UI(`ui`)  |
| `app`                    | App Router 경로. 독자·인쇄 화면은 `(paper)` 그룹                                                             |
