# AGENTS.md — 신탄진침례교회 웹사이트 작업 지침서

Antigravity 같은 다른 AI 도구로 이어서 작업할 때 이 문서를 먼저 읽는다.
이 사이트는 지금까지 같은 결(디자인·말투·코드 쓰는 법)로 만들어 왔다. 새 작업도 이 결에서 벗어나지 않는 것이 가장 중요하다.

함께 읽을 문서:
- `CLAUDE.md`: 프로젝트 개요, 스타일 규칙, 메인 페이지 기획
- `design.md`: 디자인 시스템 원문. 특히 '서브페이지 기준' 절
- `docs/handoff/*.md`: 작업별 인계 문서

---

## 1. 일하는 방식 (가장 먼저)

1. **사용자에게는 항상 한국어로 답한다.** 영어로 물어도 한국어로 답한다.
2. **화면 디자인을 바꾸기 전에 시안부터 보여 준다.**
   - `prototypes/<페이지>-options/index.html`에 회색조 와이어프레임을 먼저 만든다. 섹션마다 파란 메모로 '강/약'(화면 무게)을 적는다.
   - 사용자가 고르면 `prototypes/<페이지>-visual/index.html`에 실제 색·글꼴·토큰으로 시각 시안을 만든다.
   - 시각 시안은 **휴대폰(390px)·데스크톱(1440px) 화면을 지금 화면과 나란히** 보여 준다.
   - 사용자가 "이대로 적용"이라고 한 뒤에만 `src/`를 고친다.
3. **기존 파일을 고치기 전에 무엇을 바꿀지 먼저 한두 줄로 설명한다.**
4. **한 단계 끝날 때마다 직접 커밋한다.** 푸시는 사용자가 하라고 할 때만 한다.
5. 사용자가 "OO 수정"처럼 짧게 말하면 그 부분만 고친다. 다른 곳은 손대지 않는다.
6. 사용자가 CSS 선택자(`#root > div … > p`)를 보내면, 그 요소를 찾아 말한 속성만 바꾼다.
   - 토큰이 있으면 토큰을 쓴다.
   - 토큰이 없으면 `src/index.css`에 새 토큰을 만들어 쓰고, 그 사실을 알린다.
7. 숫자로 확인할 수 있는 것(글자 크기, 색, 높이)은 브라우저에서 계산된 값으로 확인하고 결과를 말한다.

## 2. 답하는 말투 (사용자에게)

- 결론부터 말한다. "OO를 바꿨어요. 확인했고 커밋까지 했어요(해시). 푸시는 안 했어요."
- 그다음에 바뀐 점을 짧은 목록으로 쓴다. 무엇이 어떻게 보이는지 화면 기준으로 쓴다.
- 코드 이름(클래스, 변수)은 꼭 필요할 때만 쓰고, 쓰면 무엇인지 함께 설명한다.
- 사용자가 직접 해야 할 일(관리자 입력, 대시보드 설정 등)은 따로 모아 번호를 붙인다.
- 확인 못 한 것은 숨기지 말고 "확인하지 않았어요"라고 쓴다.

## 3. 디자인 원칙

참고 사이트는 **애플 한국 사이트**(apple.com/kr/education, /business, /environment, /retail)다.
- **섹션 흐름으로 강약을 조절한다.**
  - 강: 큰 제목 + 큰 사진·일러스트 한 장, 또는 옆으로 넘기는 큰 카드
  - 약: 짧은 문단, 버튼 하나, 목록
  - 배경을 흰색 ↔ 회색 띠(`--color-surface-band` #F5F5F7)로 번갈아 쉼표를 만든다.
- **한 화면에 한 가지만.** 여백은 넉넉하게 둔다.
- **쓰지 않는 것**
  - 01·02 같은 단계 번호, STEP 배지
  - 제목 위 작은 라벨, pill 배지
  - 똑같은 카드를 격자로 반복하기. 크기나 배치를 섞는다.
  - 얇은 구분선, 카드 테두리, 카드 그림자
  - 느낌표, 설교하는 말투
  - 해·노을·빛나는 원 같은 태양 상징
- **글자 굵기는 400, 강조할 때만 500.** 700은 쓰지 않는다.
- 어르신 사용자가 많다. **휴대폰 글자는 16px 아래로 내리지 않는다.** 누르는 곳은 44px 이상으로 만든다.
- 이 사이트의 이미지 방향:
  - 새가족 페이지는 부담을 줄이려고 실사진 대신 일러스트를 쓴다.
  - 다른 페이지는 실제 교회 사진이 우선이다. AI로 만든 인물 사진은 임시로만 쓴다.

### 자주 쓰는 섹션 틀 (그대로 재사용)

| 틀 | 어디에 있나 | 모양 |
|---|---|---|
| 첫 화면 | 모든 서브페이지 | `<PageTopGradient />`(오로라) + `--sub-title-top` 여백 + `--sub-t-display` 제목 |
| 옆으로 넘기는 사진 카드 | `MainPage` '교회가 하는 일'(`.ma*`), `OutreachPage` 하는 일 | 가로 사진 카드, 아래에 **굵은 첫 문장.** + 회색 설명, 오른쪽 아래 이전·다음 원형 버튼(44px). 휴대폰은 버튼 숨기고 손으로 넘김 |
| 세로 일러스트 카드 갤러리 | `WelcomePage` 새가족이 되는 과정 | 애플 환경 페이지 `#recover-gallery` 방식. 카드 위쪽에 짧은 한마디, 카드 아래 '**제목.** 설명' |
| 사진 위 글 카드 | `OutreachPage` 선교사님 | 사진이 카드를 꽉 채우고 아래쪽만 살짝 흐리게 + 어둡게, 흰 글씨. 두 카드 제목 높이는 `subgrid`로 맞춤 |
| 왼쪽 글 · 오른쪽 사진 | `OutreachPage`·`WelcomePage` 마지막 섹션 | 제목 + 한 줄 + 짙은 둥근 버튼 / 둥근 사진 |
| 팝업 | `GuidePage` 교회 차 시간표, `WelcomePage` 문의 | 딤드 + 배경 흐림 20px, 흰 카드(radius 28), 오른쪽 위 36px 짙은 원형 닫기 버튼, Esc·바깥 누르면 닫힘, 열 때 `window.lenis?.stop()` |
| 글로 나열하는 목록 | `GuidePage` 시설 안내, `OutreachPage` 선교사님 | "**묶음.** 항목 · 항목 · 항목" 한 문단. 표 대신 이것을 쓴다 |

## 4. 코드 쓰는 법

### 기술
- React 19 + Vite, React Router v7, framer-motion, Lenis(부드러운 스크롤), Firebase(Firestore·Auth), Cloudflare Pages(+ `functions/` 서버 함수, R2)
- **Tailwind 쓰지 않는다.** 전역은 `src/index.css`, 페이지·컴포넌트는 CSS Modules(`X.module.css`)를 쓴다.

### 토큰 (숫자·색을 직접 쓰지 않는다)
- 글자·여백: `--sub-t-display / --sub-t-title / --sub-t-sub / --sub-t-row / --sub-t-lead / --sub-t-body`, `--sub-title-top`, `--sub-pad-sec`, `--sub-space-head`
  - 휴대폰 값은 `index.css`가 알아서 바꾼다. 페이지에서 따로 쓰지 않는다.
- 색: `--color-text-strong`(제목) · `--color-text-primary`(본문) · `--color-text-tertiary` · `--color-text-meta`(보조) · `--color-slate-400`
- 바탕: `--color-white` · `--color-surface-band` · `--color-surface-soft` · `--color-surface-dark` · `--color-pure-black`
- 포인트: `--color-accent-sky`(focus 링) · `--color-link-on-dark`
- 그 밖: `--ease-smooth`(`cubic-bezier(0.16,1,0.3,1)`, 모든 움직임 공통) · `--radius-pill`(28px)
- 새 색이 필요하면 `index.css` `:root`에 토큰을 추가한다. 한 페이지에서만 쓰는 크기는 페이지 `.page`에 지역 변수(`--wrap`, `--gutter`, `--r-card`)로 둔다.

### 페이지 파일 모양 (`OutreachPage.jsx`, `WelcomePage.jsx`가 기준)
- 맨 위에 import → 카피·데이터 상수(`const STEPS = [...]`) → 작은 컴포넌트 → 페이지 컴포넌트 순서로 둔다.
- 섹션마다 `{/* ② 섹션 이름: 한 줄 설명 */}` 주석을 단다.
- 들어오는 움직임은 아래처럼 쓰고, 움직임 줄이기 설정을 존중한다.
  ```js
  const reveal = reduceMotion ? {} : { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '0px 0px -10% 0px' }, transition: { duration: 0.8, ease } };
  ```
- 접근성
  - h1은 페이지에 하나만 둔다. 섹션 제목은 h2이고 `aria-labelledby`로 연결한다.
  - 토글 버튼은 `aria-pressed`, 팝업 버튼은 `aria-haspopup="dialog"`를 단다.
  - 입력칸은 label을 달고, 글자 수 제한을 안내한다.
  - 장식 이미지는 `alt=""`로 둔다.
- 관리자에서 바꾸는 문구는 Firestore에 두고, 저장된 값이 없을 때 쓸 기본값은 `src/content/*.js`에 둔다(예: `src/content/outreach.js`). 관리자 화면은 `src/pages/admin/`에 있다.
- CSS 주석은 "왜 이렇게 했는지"를 한국어로 짧게 쓴다(예: "16px — 아이폰에서 입력할 때 화면이 확대되지 않게").

### 이미지
- 파일 이름은 `shintanjin-baptist-church-<페이지>-<내용>.webp` 형식으로 짓는다.
- `sharp`로 webp로 줄인다. 보이는 크기의 2배 너비, 품질 80~92로 한다. 질감(그레인)이 있는 그림은 92로 한다.
- 원본 PNG는 커밋하지 않는다.

### 커밋
- 커밋 메시지는 한국어로, "페이지: 바뀐 것 (설명)" 한 줄로 쓴다. 예: `선교전도: 기도 제목 카드 본문 16px (--sub-t-body)`
- 내 변경만 골라서 `git add` 한다. `prototypes/`, `docs/hero-film/`, `.claude/skills/`는 커밋하지 않는다.

## 5. 확인하는 법
- `npm run dev`로 띄운 뒤 데스크톱 1440px와 휴대폰 390px 두 크기에서 확인한다.
- Lenis 때문에 `scrollIntoView`가 잘 안 먹을 수 있다. 마우스 휠로 내리거나 `window.lenis.scrollTo()`를 쓴다.
- 화면이 옆으로 넘치지 않는지(`document.documentElement.scrollWidth > innerWidth`) 확인한다.

## 6. 남아 있는 일 (2026-10-23 기준)

**새가족(`/newcomer`, `WelcomePage`)**: 봉투 첫 화면, 일러스트 과정 카드, 문의 팝업까지 적용했다.
- 문의 메일 발송(`functions/api/newcomer-inquiry.js`, Resend)이 동작하려면 사용자가 Cloudflare Pages 대시보드에 환경 변수를 넣어야 한다.
  - `RESEND_API_KEY`(필수), `NEWCOMER_INQUIRY_FROM`(도메인 인증 후). 받는 주소는 코드 기본값 `sbc8156@gmail.com`(새가족팀)이고, `NEWCOMER_INQUIRY_TO`를 넣으면 그 주소로 바뀐다
  - 로컬 `npm run dev`에는 서버 함수가 없어 보내기를 누르면 오류 문구가 나오는 것이 정상이다.
- 문의 섹션 오른쪽 사진은 아직 예전 AI 인물 사진(`welcome-step-02`)이다. 일러스트로 바꿀 후보다.
- 동의 문구("답변 후 지워요")는 교회 방침 확인이 필요하다.
- 봉투 관련 세부 사항은 `docs/handoff/newcomer-envelope-hero.md`에 있다. 이징·지연 값과 열린 덮개 `top: 0.42%`는 바꾸지 않는다.

**선교전도(`/outreach`)**: 완료하고 푸시했다.
- 관리자 > 선교전도 관리에서 선교사님마다 '묶음'을 넣어야 "**묶음.** 지역 이름 · …" 모양이 완성된다.

**메인 페이지 리디자인**: `CLAUDE.md` 섹션 목록을 따른다.
