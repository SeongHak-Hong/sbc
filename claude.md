# CLAUDE.md — SBC(신탄진침례교회) 웹사이트

## 프로젝트 개요
- 신탄진침례교회 공식 웹사이트. 현재 **메인 랜딩페이지 리디자인** 진행 중.
- 배포: Cloudflare Pages
- 로컬 확인: `npm run dev` (http://localhost:5173)

## 기술 스택
- React 19 (react, react-dom v19.2.0) + Vite 6 — 순수 SPA (Next.js 아님)
- React Router v7 (`react-router-dom` v7.18.0)
- 애니메이션: framer-motion, gsap (ScrollTrigger), lenis (부드러운 스크롤)
- 3D: @react-three/fiber, @react-three/drei, three.js
- 백엔드: firebase / 에디터: @toast-ui/editor

## 스타일링 규칙 (반드시 준수)
- 전역: `src/index.css`, `src/App.css` — @font-face, `:root` 디자인 토큰, reset, 전역 태그 스타일
- 컴포넌트별: CSS Modules (`*.module.css`), `import styles from './X.module.css'` → `className={styles.x}`
- **Tailwind 사용하지 않음.** 새 색상·크기는 하드코딩하지 말고 `:root` 토큰을 사용할 것.
- 디자인 시스템 원문: `design.md` (서브페이지 기준). 메인 페이지는 아래 "메인 확장 규칙"을 추가로 따름.

### design.md 핵심 요약
- 배경: `linear-gradient(to bottom, #E7F5FD, #FCEBE0)` + `background-attachment: fixed`
- 카드: `#fafafa`, radius 48px(모바일 24px), **border·box-shadow 금지** (Drawer만 예외)
- 버튼: radius 28px, hover는 `translateY(-2px)` + `transition: transform 0.2s ease`로 통일
- 텍스트 위계: Deep Teal `#243B48` → Slate 700 `#3B5462` → Slate 600 `#626C71` → Slate 400 `#AEB4B7`
- 서체: JayeonSans 전역, 굵기 400 기본(필요시 500), **700 금지**
- 모든 텍스트 `letter-spacing: -0.02em`, `word-break: keep-all`, line-height 1.6
- 순수 검정 금지, 그라데이션은 페이지 배경에만, 느낌표·설교 톤 금지

### 메인 페이지 확장 규칙
- 포인트 컬러 추가: `--color-accent-sky: #37ABEA` (다음세대 페이지 시계 숫자 색). 말씀 인용 표시, 단계 번호, focus 링, 스크롤 안내에만 사용.
- Hero·Closing 헤드라인 2곳에만 `--font-yuhan` 사용 (현재 JayeonSans로 매핑됨)
- 타이틀 스케일: Hero `--text-h1`, 섹션 타이틀 `--text-h3`
- 섹션 패딩 `--section-padding-y`(180px)
- 브레드크럼 사용 안 함
- 마음 나누기 카드는 대형 squircle 허용 (다음세대 페이지 예배시간 카드와 동일 패턴), 응답 길이에 따라 높이 auto

## 메인 랜딩페이지 기획 요약 (spec v2)
- 컨셉: "문은 늘 열려 있는 교회" — 설득하는 곳이 아니라 머물러도 되는 곳. 핵심 은유는 **열린 문**과 **식탁**.
- 목적: 번아웃·외로움을 느끼는 비신자, 이사 온 새신자에게 **정서적 안정감, 건강한 소속감, 따뜻한 환대**를 서사적으로 전달
- 톤: 따뜻하고 담백함, 공감 중심, 강요하지 않음. "~요" 구어체, 짧은 문장.
- 원칙: 등록 요구 금지 / CTA는 "보기·알아보기" 수준 / 개인정보 입력은 모두 선택 사항 / 영적 경험은 명상이 아닌 **말씀과 기도, 공동체**로 전한다
- 금지 표현·이미지: 명상·호흡·마음 비우기 등 타 종교 수행 연상 표현 / 해·노을·빛나는 원형 등 태양을 중심 상징으로 쓰는 이미지 (마음 날씨 '맑음' 아이콘만 예외)
- 상세 카피·와이어프레임: `docs/home_spec.md` 참고

### 섹션 순서
1. Hero — 공감 ("오늘 하루, 많이 애쓰셨죠.")
2. 마음 나누기 (`id="mind-rest"`) — 마음 날씨 5종 선택 → 공감 문구 → 말씀 한 구절(개역개정) → 선택 행동(흐림·비: 기도 부탁하기 / 맑음: 감사 한 줄 남기기) → 브릿지 문구 + 다음 섹션 버튼
   - 다른 날씨를 누르면 응답만 교체 (처음으로 돌아가지 않음), 제출 후엔 완료 문구로 교체하되 다음 섹션 버튼 유지
   - '조금 갬' → 활동 소개로 넘어갈 때 `소그룹` 탭이 선택된 상태로 전달 (상위 상태 또는 이벤트, URL 쿼리 X)
3. 가치 제안 — 쉼 / 안정감 / 소속감 / 환대 4카드 (4단 그리드)
4. 활동 소개 (`id="activities"`) — "작은 모임, 따뜻한 식탁", SwitchTabs(소그룹 / 문화행사 / 다음세대) + 카드
5. 첫 방문 가이드 (`id="first-visit"`) — 4단계 타임라인, "등록하지 않으셔도 됩니다" 배지, 01 '도착해요'에 오시는 길 지도(주소 복사·지도 앱 열기), 동행 요청 폼(Drawer 재사용)
6. FAQ — 아코디언 (데스크톱 2단: 좌 타이틀+문의 / 우 아코디언)
7. Closing CTA — "문은 늘 열려 있어요."
8. 빠른 링크 — 기존 성도용 4카드 (예배 안내 / 설교·말씀 영상 / 소식·주보 / 오시는 길). 말씀 쇼츠 영상은 새 방문자 흐름에 넣지 않고 여기로 연결

### 데이터 원칙 (마음 나누기)
- 날씨 선택값은 **저장·전송하지 않음** (로컬 상태만)
- 기도 부탁·감사 한 줄은 사용자가 **제출 버튼을 누른 경우에만** 익명 저장 (`src/lib/notes.js`)
- 저장 필드: `type`(prayer | gratitude), `weather`, `text`, `createdAt`만. 이름·연락처·기기 정보 저장 금지
- Firestore 규칙: 쓰기만 허용, 읽기는 관리자만. 스팸 대응(App Check 또는 제출 간격 제한)
- 말씀 본문은 게시 전 개역개정 원문과 대조 확인 필요
- 모바일: Hero 통과 후 하단 고정 pill 바 (`bottom: 16px`, 예배 시간 · 오시는 길)
- Header·Footer는 기존 것 유지 (Footer는 별도 리디자인 예정, 범위 외)

## 파일 구조
```
src/pages/Home/
├─ HomePage.jsx
└─ sections/
   ├─ HeroSection.jsx + .module.css      ✅ 완료
   ├─ MindRestSection.jsx               ⬜ 다음 작업 (마음 나누기)
   ├─ ValueSection.jsx                  ⬜
   ├─ ActivitySection.jsx               ⬜
   ├─ FirstVisitSection.jsx             ⬜
   ├─ FaqSection.jsx                    ⬜
   ├─ ClosingSection.jsx                ⬜
   └─ QuickLinkSection.jsx              ⬜
src/content/home.js                     ⬜ 모든 카피·말씀·FAQ·활동 데이터 분리
src/lib/notes.js                        ⬜ 기도 부탁·감사 한 줄 Firestore 저장
src/hooks/useScrollPast.js              ⬜ 하단 바 노출 판단
```
- 기존 컴포넌트 재사용 우선: Header, Card, SelectButton, SwitchTabs, ScrollFadeText, Drawer
- 신규 컴포넌트: MoodPicker, VerseCard, AnonymousNoteForm, StepTimeline, Accordion, MobileBottomBar, CompanionForm
  - `AnonymousNoteForm`은 `type: 'prayer' | 'gratitude'` prop 하나로 처리. 기도 부탁은 Drawer(300자, 비워도 제출 가능), 감사 한 줄은 카드 안 인라인(100자)
  - `VerseCard`: 배경 없음, 좌측 2px accent-sky 세로선, 본문 Slate 700, 출처 Slate 400 14px

## 구현 메모
- HeroSection: 헤드라인 단어 단위 blur(10px)→0 / opacity 0.1→1, stagger 0.08s, duration 0.8s (ScrollFadeText 스펙과 동일, 페이지 로드 시 재생)
- 마음 나누기 응답 교체: opacity + translateY(8px) 0.4s (과한 연출 금지)
- 이징 `cubic-bezier(0.16, 1, 0.3, 1)` 공통 사용
- Lenis가 네이티브 scrollIntoView를 가로챌 수 있음 → `onExplore={(id) => lenis.scrollTo('#' + id)}` 방식 권장
- `prefers-reduced-motion` 대응 필수 (framer-motion `useReducedMotion`)
- 접근성: h1은 Hero에 하나만, 이후 섹션은 h2 / 토글 버튼은 aria-pressed·aria-expanded / 마음 나누기 응답 영역 `aria-live="polite"` / 입력창은 label 또는 aria-label + 글자 수 제한 안내

## 작업 방식
- 섹션 하나씩 구현하고, 사용자가 `npm run dev`로 확인한 뒤 다음 섹션으로 진행
- 기존 파일을 수정하기 전에 변경 내용을 먼저 설명할 것
