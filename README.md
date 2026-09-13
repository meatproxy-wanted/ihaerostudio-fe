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

## 서버와 목 API

이 저장소에는 서버 코드가 없어요. AI와 API는 별도 서버 프로젝트가 맡아요.

- 화면은 `lib/api/types.ts`의 `ApiClient` 인터페이스만 사용하고, 응답은 `lib/domain`의 zod 스키마로 검증해요.
- 지금은 `lib/api/client.ts`가 `lib/mock`의 목 구현을 연결해요. 서버가 준비되면 같은 인터페이스의 HTTP 구현으로 바꾸고 `lib/mock`, `public/mock`, `scripts/generate-mock-illustrations.mjs`를 지우면 돼요.
- **데모 모드**: 어떤 판결문을 넣어도 가상의 샘플 사건(가온지방법원 임대차보증금 반환)으로 분석해요. 초안에는 검토 기능을 보여 주려고 일부러 넣은 문제가 있어요.
- 데이터는 브라우저 IndexedDB에 저장돼요. 작업함 맨 아래 [데모 데이터 초기화]로 지울 수 있어요.
- 오류 화면 확인: 주소에 `?mockFail=analyze,draft,save,assist,check,publish` 중 필요한 값을 붙이면 그 탭에서 해당 요청이 실패해요. `?mockFail=`로 끌 수 있어요.

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

| 위치           | 내용                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `lib/domain`   | zod 스키마와 순수 함수(단계 규칙, 구조·문서 편집, 어절 차이, 숫자 감지, 독자용 내용, 쪽 나누기). 테스트 seam |
| `lib/api`      | `ApiClient` 인터페이스, 응답 검증, 쿼리 키와 훅                                                              |
| `lib/mock`     | 목 서버(fixture, 단순 규칙, 저장소). 서버 연동 때 삭제                                                       |
| `lib/stores`   | 편집 화면 공용 자동 저장                                                                                     |
| `components/*` | 화면별 컴포넌트(`structure`, `editor`, `review`, `reader`, `print`, `preview`, `export` 등)와 공용 UI(`ui`)  |
| `app`          | App Router 경로. 독자·인쇄 화면은 `(paper)` 그룹                                                             |
