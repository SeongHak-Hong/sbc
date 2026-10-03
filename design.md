# SBC (신탄진침례교회) — Style Reference
> 따뜻한 동네 교회를 연상시키는 간결한 서브페이지 시스템. 파스텔 그라데이션 배경 위에 둥근 `#fafafa` 카드와 슬레이트 계열 텍스트를 올려 친근하면서도 정돈된 인상을 준다.

**Theme:** light

본 문서는 SBC 프로젝트의 **서브페이지** 디자인 시스템을 정의합니다. 메인 랜딩 페이지와 푸터는 별도 리디자인 예정이므로 이 문서의 범위에 포함하지 않습니다.

SBC 서브페이지는 고정된 파스텔 그라데이션 배경(`#E7F5FD → #FCEBE0`)을 공통 캔버스로 사용하고, 그 위에 `#fafafa` 카드를 배치하여 콘텐츠를 전달합니다. 모든 카드와 버튼은 `border-radius: 48px/28px`의 매우 둥근 모서리를 사용하여 부드럽고 귀여운 느낌을 연출합니다. 텍스트는 슬레이트(Slate) 계열의 자연스러운 색상 위계를 따르며, 테두리·그림자·그라데이션 장식 없이 플랫한 미니멀리즘을 유지합니다. 서체 `JayeonSans`(자연산스)가 전체 UI 톤을 지배하고, 강조 타이틀에 `YuhanKimberly`(유한킴벌리 푸른숲체) 캘리그라피 서체를 제한적으로 사용합니다.

---

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| White | `#ffffff` | `--color-white` | 메뉴 패널 배경, 글 상세(Drawer) 배경, 기본 서페이스 |
| Soft Gray | `#fafafa` | `--color-gray-50` | 카드 배경, 버튼 기본 배경, 비활성 서페이스 |
| Warm Cream | `#F0EEED` | `--color-background-beige` | 메뉴 항목 hover/active 배경, 탭 메뉴 active 배경 |
| Subpage Sky | `#E7F5FD` | (inline) | 서브페이지 그라데이션 시작점 (상단 하늘색) |
| Subpage Peach | `#FCEBE0` | (inline) | 서브페이지 그라데이션 종료점 (하단 복숭아색) |
| Hover Light | `#F1F5F9` | (inline) | 드롭다운 아이템 hover 배경 |
| Deep Teal | `#243B48` | `--color-text-primary` | 최상위 강조 텍스트, 페이지 타이틀 |
| Slate 700 | `#3B5462` | `--color-text-secondary` | 주요 강조 텍스트, 활성 탭, 헤더 로고 |
| Slate 600 | `#626C71` | `--color-text-tertiary` | 본문(body) 텍스트, 서브 타이틀, 일반 버튼 폰트 |
| Slate 500 | `#80898D` | `--color-text-muted` | 메타 정보(날짜, 부서명), 비활성 텍스트, 비활성 탭, 브레드크럼 텍스트 (`#fafafa` 위 3.4:1, 그라데이션 위 3.1:1 — 대비 하한 3:1) |
| Slate 400 | `#AEB4B7` | `--color-slate-400` | 장식 전용 (네비게이션 버튼 배경, 점, 스크롤 선). 텍스트에는 쓰지 않음 |
| Placeholder | `#94A3B8` | `--color-text-placeholder` | 입력 플레이스홀더 |
| Body Text | `#505050` | `--color-text-body` | 에디터(Toast UI) 본문 텍스트 전용 |

### RGB 변형 토큰 (투명도 조합용)

| Base Color | RGB Token | 사용 예시 |
|---|---|---|
| Deep Teal `#243B48` | `--color-text-primary-rgb: 36, 59, 72` | `rgba(var(--color-text-primary-rgb), 0.05)` — 페이지네이션 hover |
| Slate 700 `#3B5462` | `--color-text-secondary-rgb: 59, 84, 98` | `--color-text-inactive` = `rgba(var(--color-text-secondary-rgb), 0.65)` — 비활성 탭·페이지 번호 텍스트 (그라데이션 위 3.1:1) |
| Slate 600 `#626C71` | `--color-text-tertiary-rgb: 98, 108, 113` | (예비) |
| Slate 500 `#80898D` | `--color-text-muted-rgb: 128, 137, 141` | (예비) |
| Slate 400 `#AEB4B7` | `--color-slate-400-rgb: 174, 180, 183` | `rgba(var(--color-slate-400-rgb), 0.25)` — 둥근 네비게이션 버튼 배경 |
| Placeholder `#94A3B8` | `--color-text-placeholder-rgb: 148, 163, 184` | (예비) |

---

## Tokens — Typography

### JayeonSans (자연산스) — 사이트 전역 기본 서체. 따뜻하고 친근한 인상을 주는 전역 메인 폰트로, 제목·본문·버튼·네비게이션 모두에 사용된다. · `--font-title`, `--font-body`, `--font-btn`
- **Substitute:** sans-serif
- **Weights:** 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold)
- **Sizes:** 14px, 16px, 17px, 18px, 20px, 24px, 28px, 32px, 36px, 40px, 48px, 64px, 72px
- **Line height:** 1.6 (전역 기본)
- **Letter spacing:** -0.02em (전역 기본, 모든 텍스트에 적용)
- **Role:** 제목(h1~h4), 본문, 서브타이틀, 버튼 라벨, 카드 텍스트, 네비게이션 라벨 등 사이트 전역

### YuhanKimberly (유한킴벌리 푸른숲체) — 캘리그라피 느낌의 포인트 서체. 에디터 본문, 일부 강조 타이틀에 제한적으로 사용된다. · `--font-yuhan` (현재 JayeonSans로 매핑)
- **Substitute:** sans-serif
- **Weights:** 300 (Light), 400 (Medium), 500 (Medium), 700 (Bold)
- **Sizes:** 에디터 내 16px~36px
- **Line height:** 1.6
- **Letter spacing:** -0.02em
- **Role:** Toast UI 에디터 본문·헤딩, 특수 강조 타이틀

### 전역 기본 타이포그래피 규칙
- **`letter-spacing`**: `-0.02em` (-2%) — 자간을 살짝 좁혀 가독성과 한글 밀도감을 높인다
- **`line-height`**: `1.6` (160%) — 넉넉한 행간으로 답답함을 해소한다
- **`font-weight`**: `400` (Regular)을 기본 굵기로 사용한다
- **`word-break`**: `keep-all` — 한국어 단어 중간 줄바꿈을 방지한다

### Type Scale

| Role | Family | Weight | Size (PC) | Size (Mobile) | Line Height | Letter Spacing | Token |
|------|--------|--------|-----------|---------------|-------------|----------------|-------|
| page-h1 | JayeonSans | 400 | 72px | 48px | 1.6 | -0.02em | `--text-h1` |
| page-h2 | JayeonSans | 400 | 64px | 36px | 1.6 | -0.02em | `--text-h2` |
| page-h3 | JayeonSans | 400 | 48px | 28px | 1.6 | -0.02em | `--text-h3` |
| page-h4 | JayeonSans | 400 | 32px | 24px | 1.6 | -0.02em | `--text-h4` |
| page-title | JayeonSans | 400 | 40px | 24px | 1.6 | -0.02em | `--page-title-size-pc` / `--page-title-size-mobile` |
| body | JayeonSans | 400 | 28px | 20px | 1.6 | -0.02em | `--text-body` |
| body-card | JayeonSans | 400 | 24px | 18px | 1.6 | -0.02em | `--text-body-card` |
| sub-title | JayeonSans | 400 | 24px | 18px | 1.6 | -0.02em | `--text-sub-title` |
| list-title | JayeonSans | 500 | 20px | 17px | 1.6 | -0.02em | `--list-title-size-pc` / `--list-title-size-mobile` |
| list-meta | JayeonSans | 400 | 14px | 14px | 1.6 | -0.02em | `--list-meta-size-pc` / `--list-meta-size-mobile` |
| btn | JayeonSans | 400 | 18px | 16px | 1.6 | -0.02em | `--btn-font-size` |
| breadcrumb | JayeonSans | 400 | 16px | 14px | — | -0.02em | (Breadcrumb.module.css) |
| switch-tab | JayeonSans | 500 | 20px | 17px | — | -0.02em | (SwitchTabs.module.css) |

---

## Tokens — Spacing & Shapes

**Base unit:** 8px

**Density:** comfortable — 서브페이지는 넉넉한 여백으로 여유로운 호흡을 만든다.

### Layout

| Name | Value | Token | Role |
|------|-------|-------|------|
| Max Width | 1152px | `--max-width` | 기본 콘텐츠 컨테이너 최대폭 |
| Max Width Wide | 1440px | (inline) | 넓은 레이아웃 페이지(다음세대, 행사) |
| Max Width Narrow | 800px | (inline) | 좁은 레이아웃 페이지(소식, 구역 안내) |
| Grid Columns | 12 | `--grid-columns` | 그리드 시스템 컬럼 수 |
| Grid Margin (PC) | 48px | `--grid-margin` | 좌우 여백 |
| Grid Margin (Mobile) | 24px | `--grid-margin` | 좌우 여백 (모바일) |
| Grid Gutter | 24px | `--grid-gutter` | 컬럼 간 간격 |
| Section Padding Y | 180px | `--section-padding-y` | 섹션 세로 패딩 (PC) |
| Section Padding X | 48px | `--section-padding-x` | 섹션 가로 패딩 |
| Subpage Header Top | 160px | `--subpage-header-padding-top` | 서브페이지 헤더 상단 여백 |
| Card Gap | 16px | (BoardGrid) | 카드 간 간격 (PC) |
| Card Gap (Mobile) | 8px | (BoardGrid) | 카드 간 간격 (모바일) |

### Border Radius

| Element | Value (PC) | Value (Mobile) | 설명 |
|---------|-----------|----------------|------|
| cards | 48px | 24px | 매우 둥글고 귀여운 곡률 |
| select-buttons | 28px | 28px | 필 버튼 (Select, Naver 등) |
| dropdown | 20px | 20px | 드롭다운 메뉴 하단 모서리 |
| dropdown-items | 12px | 12px | 드롭다운 개별 아이템 |
| vertical-tabs | 24px (컨테이너) / 20px (개별) | 99px (가로 전환 시) | 시설안내 세로 탭 |
| toggle-btn | 99px | — | 헤더 메뉴 토글 pill 버튼 |
| social-link | 99px | 99px | 소셜 링크 원형 버튼 |
| drawer | 16px | 0 | 글 상세 Drawer 모달 |
| close-btn | 50% (원형) | 50% | 닫기 버튼 |
| pagination | 50% (원형) | 50% | 페이지 번호 버튼 |

### Shadows

원칙적으로 **box-shadow와 border를 사용하지 않는 플랫 디자인**을 지향합니다. 유일한 예외:

| 사용처 | Value | 설명 |
|--------|-------|------|
| Drawer 모달 | `0 10px 40px rgba(0, 0, 0, 0.1)` | 글 상세 모달의 배경 분리용 |
| 메뉴 백드롭 | `rgba(0, 0, 0, 0.6)` + `blur(8px)` | 오버레이 배경 |

---

## Components

### Header (스티키 헤더)
**Role:** 전역 내비게이션

fixed 포지션 헤더로, 스크롤 다운 시 숨기고 **위로 올릴 때만** 흰색 배경의 스티키 헤더를 노출한다. 로고 높이는 PC `30px`, 모바일 `20px`. 서브페이지에서 로고와 텍스트는 `--color-slate-700`. 메뉴 토글은 pill 형태(`border-radius: 99px`)로 PC에서 `--color-slate-700` 배경 + 흰색 텍스트("메뉴"), 모바일에서는 투명 배경의 아이콘 전용.

- **메뉴 패널:** 우측 슬라이드 인 (`width: 400px`, 모바일에서 100vw). `#ffffff` 배경. 메뉴 아이템은 `18px`, 패딩 `14px 24px`. hover·expanded 시 `--color-background-beige` 배경.
- **서브메뉴:** `--color-text-muted` 텍스트, hover 시 `--color-text-primary` + `--color-background-beige`.
- **소셜 링크:** `48px` 원형 버튼, `--color-slate-700` 배경 + 흰색 아이콘.
- **전환 애니메이션:** `transform 0.3s ease` (헤더 show/hide), `cubic-bezier(0.16, 1, 0.3, 1)` (메뉴 패널).

### SubPage Section (서브페이지 공통 래퍼)
**Role:** 모든 서브페이지 섹션의 공통 컨테이너

아이콘 + 타이틀로 구성된 상단 헤더와 하위 콘텐츠를 감싸는 래퍼. 타이틀은 `main-page-title` 클래스로 `--page-title-size-pc` (40px) / `--page-title-size-mobile` (24px), `--color-text-secondary`, 중앙 정렬. 패딩 `160px 24px` (PC) / `120px 16px` (모바일). 내부 요소 간격 `gap: 64px` (PC) / `40px` (모바일).

### Card (공통 카드)
**Role:** 리스트가 나열되는 전역 공간의 공통 카드

- **그리드:** PC 4단 (`grid-template-columns: repeat(4, 1fr)`), Gap `16px` → 태블릿 2단 → 모바일 1단, Gap `8px`
- **배경색:** `--color-gray-50` (`#fafafa`)
- **패딩:** PC `32px 28px` / 모바일 `16px 20px`
- **Border-radius:** PC `48px` / 모바일 `24px` — 매우 둥글고 귀여운 곡률
- **높이:** PC `240px` / 모바일 `auto` (내부 콘텐츠 hug)
- **Hover:** 그림자 없이 `transform: translateY(-2px)`, `transition: transform 0.2s ease`
- **Squircle 필터:** PC 브라우저에서 SVG 필터(`#SkiperSquiCircleFilterLayout`) 적용하여 iOS 스타일 squircle 곡률 연출. iOS Safari에서는 필터 비활성화 후 `border-radius: 16px` 폴백 (Safari가 자체적으로 squircle 렌더링).

### Select Button (필 선택 버튼)
**Role:** 서브페이지 내 드롭다운 트리거, 필터 선택, 네비게이션 링크 버튼

- **배경:** `--color-gray-50`
- **텍스트:** `--color-text-tertiary`, 16~18px
- **패딩:** PC `14px 28px` / 모바일 `10px 24px`
- **Border-radius:** `28px`
- **Border:** 없음
- **Hover:** `transform: translateY(-2px)`
- **드롭다운 열림 시:** 하단 모서리 `0`으로 전환하여 드롭다운과 이어짐

### Switch Tabs (텍스트 스위치 탭)
**Role:** 섹션 내 콘텐츠 전환 (소식·주보, 설교·찬양 등)

- **스타일:** 배경 없음, 테두리 없음. 여백(`gap: 24px`)을 넓게 준 텍스트 위주의 간결한 미니멀 UI.
- **비활성:** `--color-text-inactive` (`rgba(var(--color-text-secondary-rgb), 0.65)`), 20px, weight 500
- **활성:** `--color-text-secondary`, 동일 사이즈
- **모바일:** gap `12px`, 폰트 `17px`

### Tab Menu (테두리 탭)
**Role:** 하단 테두리선 기반 탭 전환

- **컨테이너:** `border-bottom: 1px solid rgba(var(--color-text-primary-rgb), 0.2)`, flex 균등 분배
- **비활성:** 투명 배경, `--color-text-muted` 텍스트
- **활성:** `--color-text-primary` 텍스트, `--color-background-beige` 배경, 하단 `2px` indicator (`--color-text-primary`)
- **전환:** `transition: all 0.3s ease`

### Vertical Tab (세로 세그먼트 컨트롤)
**Role:** 시설안내 등 세로 방향 탭 전환

- **컨테이너:** `--color-gray-50` 배경, `border-radius: 24px`, 패딩 `6px`
- **비활성:** 투명 배경, `--color-text-tertiary`
- **활성:** `--color-slate-700` 배경 (motion.div), `--color-white` 텍스트, `border-radius: 20px`
- **모바일 전환:** 세로 → 가로 배치, `border-radius: 99px`, 가로 스크롤 snap, 하단 고정 (`position: fixed`, `bottom: 16px`)

### Breadcrumb (경로 표시)
**Role:** 서브페이지 내비게이션 경로

- **형식:** 반드시 `1depth 메뉴명 - 2depth 메뉴명` (예: `공동체 - 새가족`, `나눔터 - 소식·주보`)
- **텍스트:** `--color-text-muted`, 16px / 모바일 14px
- **하단 여백:** 16px / 모바일 8px
- **centered 옵션:** 중앙 정렬 가능

### Pagination (페이지네이션)
**Role:** 게시판 페이지 이동

- **버튼 크기:** 32px × 32px 원형 (`border-radius: 50%`)
- **비활성 텍스트:** `--color-text-inactive`, 18px, weight 500
- **활성 텍스트:** `--color-text-secondary`, 투명 배경
- **Hover 배경:** `rgba(var(--color-text-primary-rgb), 0.05)`
- **비활성화:** `opacity: 0.2`, `cursor: default`
- **화살표:** 24px 아이콘

### Post Detail Drawer (글 상세 모달)
**Role:** 게시글 상세 보기

- **Overlay:** `rgba(0, 0, 0, 0.6)` + `backdrop-filter: blur(8px)`, 화면 중앙 배치
- **Drawer:** `#ffffff` 배경, `border-radius: 16px`, `box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1)`
- **크기:** 이미지+텍스트 `1308×854px`, 텍스트만 `654px` 폭
- **내부 패딩:** 64px
- **닫기 버튼:** `--color-gray-50` 배경 원형, `--color-text-secondary` 아이콘
- **모바일:** 전체 화면(fullscreen) 전환, `border-radius: 0`

### ScrollFadeText (스크롤 페이드 텍스트)
**Role:** 타이틀의 스크롤 진입 애니메이션

GSAP ScrollTrigger 기반. 단어 단위로 분리하여 blur(10px) + opacity 0.1 → 선명하게 등장. stagger `0.08s`, duration `0.8s`. `once` 옵션으로 최초 1회만 재생 가능.

---

## Do's and Don'ts

### Do
- 서브페이지 배경으로 `linear-gradient(to bottom, #E7F5FD, #FCEBE0)` + `background-attachment: fixed`를 사용할 것.
- 카드와 버튼에 `48px` / `28px` 수준의 넉넉한 border-radius를 줄 것.
- 호버 인터랙션은 `transform: translateY(-2px)`, `transition: transform 0.2s ease`로 통일할 것.
- 텍스트 위계는 Deep Teal → Slate 700 → Slate 600 → Slate 500 순서를 따를 것. 텍스트 대비는 배경 대비 3:1 아래로 내리지 말 것.
- 모든 텍스트에 `letter-spacing: -0.02em`을 적용할 것.
- 한국어 텍스트에 `word-break: keep-all`을 적용할 것.
- 헤더는 스크롤 **위로 올릴 때만** 노출할 것.
- 브레드크럼은 `1depth 메뉴명 - 2depth 메뉴명` 형식을 따를 것.
- 카드 배경은 `--color-gray-50` (`#fafafa`)를 사용할 것.
- 비활성 UI에는 `rgba()` 투명도 조합으로 시각적 위계를 만들 것.

### Don't
- 카드, 버튼, 탭에 `box-shadow`를 넣지 말 것 (Drawer 모달 예외).
- 카드, 버튼에 `border`를 넣지 말 것.
- 8px, 12px 같은 작은 border-radius를 카드에 쓰지 말 것.
- `font-weight: 700` (Bold)을 일반 제목에 쓰지 말 것. 기본 `400`, 필요시 `500` 사용.
- 느낌표 남발, 설교 톤의 강한 문체를 사용하지 말 것.
- 순수 검정(`#000000`)을 텍스트에 쓰지 말 것. 슬레이트 계열을 사용할 것.
- 그라데이션을 카드 내부, 버튼 내부, 텍스트에 넣지 말 것. 그라데이션은 페이지 배경에만 사용.
- 복잡한 장식(패턴, 뚜렷한 아이콘 배경 등)을 사이트 전역에 과도하게 넣지 말 것.

---

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Subpage Gradient | `#E7F5FD → #FCEBE0` | 서브페이지 공통 배경 캔버스, `background-attachment: fixed` |
| 1 | White | `#ffffff` | 메뉴 패널, 글 상세 Drawer, 기본 서페이스 |
| 2 | Soft Gray | `#fafafa` | 카드 배경, 버튼 기본 배경, 드롭다운 배경 |
| 3 | Warm Cream | `#F0EEED` | hover/active 배경 (메뉴 아이템, 탭 active) |

---

## Elevation

서페이스는 `#fafafa` 카드가 파스텔 그라데이션 배경 위에 올려지는 구조로 자연스럽게 구분된다. 카드와 버튼에는 그림자를 사용하지 않으며, 48px의 둥근 모서리가 시각적 분리를 담당한다. 메뉴 패널과 글 상세 Drawer에서만 예외적으로 `rgba(0,0,0,0.6)` 백드롭 + `blur(8px)`과 `0 10px 40px rgba(0,0,0,0.1)` 그림자를 사용하여 모달 수준의 계층 분리를 만든다.

---

## Imagery

서브페이지에서 이미지는 주로 카드 내부 또는 Drawer 좌측 패널에 배치된다. 카드 이미지는 카드의 둥근 곡률(48px/24px)을 따르며, Drawer의 이미지 섹션은 좌측 654px 고정폭에 검정 배경으로 감싸진다. 시설안내 등의 지도/도면 이미지는 `object-fit: contain`으로 비율을 유지한다. 별도의 이미지 테두리나 그림자는 사용하지 않는다.

---

## Layout

서브페이지는 고정 헤더 → 브레드크럼 → 페이지 타이틀(ScrollFadeText) → 콘텐츠 섹션의 순서로 구성된다. 콘텐츠 영역은 `max-width`로 제한되며 페이지 성격에 따라 `800px` (좁은 리스트), `1152px` (기본), `1440px` (넓은 그리드)를 선택한다. 카드 그리드는 PC 4단 → 태블릿 2단 → 모바일 1단으로 반응형 전환된다. 모바일에서 가변 콘텐츠가 찌그러지지 않도록 부모 컨테이너에 `width: 100%`를 명시한다.

---

## Interactions & Motion

| 요소 | 트리거 | 효과 | 속도 |
|------|--------|------|------|
| 카드 hover | mouseenter | `translateY(-2px)` | `0.2s ease` |
| 버튼 hover | mouseenter | `translateY(-2px)` | `0.2s ease` |
| 소셜 링크 hover | mouseenter | `scale(1.05)` | `0.2s` |
| 헤더 show/hide | scroll direction | `translateY(0/-100%)` | `0.3s ease` |
| 메뉴 패널 | toggle | `translateX(100%/0)` | `0.4s cubic-bezier(0.16, 1, 0.3, 1)` |
| 백드롭 | toggle | `opacity 0→1` | `0.4s cubic-bezier(0.16, 1, 0.3, 1)` |
| 서브메뉴 | toggle | `grid-template-rows 0fr→1fr` | `0.3s cubic-bezier(0.16, 1, 0.3, 1)` |
| 탭 전환 | click | `color, background-color` | `0.3s ease` / `0.2s ease` |
| ScrollFadeText | scroll enter | `blur(10px)→0`, `opacity 0.1→1` | `0.8s`, stagger `0.08s` |
| 드롭다운 | click | `fadeIn` (opacity + translateY) | CSS keyframes |

---

## Agent Prompt Guide

### Quick Color Reference
- White: #ffffff — 메뉴 패널, Drawer, 기본 서페이스
- Soft Gray: #fafafa — 카드, 버튼, 드롭다운 배경
- Warm Cream: #F0EEED — hover/active 배경
- Subpage Sky: #E7F5FD — 서브페이지 배경 그라데이션 시작
- Subpage Peach: #FCEBE0 — 서브페이지 배경 그라데이션 종료
- Deep Teal: #243B48 — 최상위 강조 텍스트
- Slate 700: #3B5462 — 주요 타이틀, 활성 탭, 헤더 로고
- Slate 600: #626C71 — 본문, 서브 타이틀, 일반 버튼
- Slate 500: #80898D — 메타정보, 비활성 텍스트, 브레드크럼 (텍스트 대비 하한 3:1)
- Slate 400: #AEB4B7 — 장식 전용 (텍스트 금지)
- Placeholder: #94A3B8 — 입력 플레이스홀더

### 프롬프트 예시

`linear-gradient(to bottom, #E7F5FD, #FCEBE0)` 고정 배경의 서브페이지를 만들어라. 상단에 `--color-text-muted` 색의 브레드크럼(예: `교회소개 - 인사말·비전`)을 배치하고, ScrollFadeText로 `--color-text-secondary` 색 40px 페이지 타이틀을 중앙 정렬하라.

`#fafafa` 배경, `border-radius: 48px`, `padding: 32px 28px`의 카드를 4단 그리드로 배치하라. border와 shadow 없이 hover 시 `translateY(-2px)`만 적용. 모바일에서는 1단, `border-radius: 24px`, `padding: 16px 20px`으로 전환.

`--color-gray-50` 배경, `border-radius: 28px`의 Select Button을 만들어라. 텍스트는 `--color-text-tertiary`, 18px. hover 시 `translateY(-2px)`. 드롭다운 열림 시 하단 모서리를 0으로 전환하여 20px radius 드롭다운 메뉴와 자연스럽게 연결.

탭 메뉴를 만들어라. 배경 없음, border 없음, gap 24px의 텍스트 위주 미니멀 스타일. 비활성은 `--color-text-inactive` 20px, 활성은 `--color-text-secondary` 동일 사이즈. 모바일에서 17px, gap 12px.

우측 슬라이드 인 메뉴 패널을 만들어라. `#ffffff` 배경, 폭 400px(모바일 100vw). 메뉴 아이템은 18px, padding 14px 24px. hover/expanded 시 `--color-background-beige` 배경. 전환은 `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## CSS Custom Properties

```css
:root {
  /* Layout */
  --max-width: 1152px;
  --grid-columns: 12;
  --grid-margin: 48px;
  --grid-gutter: 24px;

  /* Typography — Font Families */
  --font-title: 'JayeonSans', sans-serif;
  --font-body: 'JayeonSans', sans-serif;
  --font-letter: 'JayeonSans', sans-serif;
  --font-btn: 'JayeonSans', sans-serif;
  --font-yuhan: 'JayeonSans', sans-serif;

  /* Typography — Heading Scale (PC) */
  --pc-text-h1: 72px;
  --pc-text-h2: 64px;
  --pc-text-h3: 48px;
  --pc-text-h4: 32px;
  --pc-text-body: 28px;
  --pc-text-body-card: 24px;
  --pc-text-sub-title: 24px;

  /* Typography — Responsive Aliases */
  --text-h1: var(--pc-text-h1);
  --text-h2: var(--pc-text-h2);
  --text-h3: var(--pc-text-h3);
  --text-h4: var(--pc-text-h4);
  --text-body: var(--pc-text-body);
  --text-body-card: var(--pc-text-body-card);
  --text-sub-title: var(--pc-text-sub-title);

  /* Typography — Page Title */
  --page-title-size-pc: 40px;
  --page-title-size-mobile: 24px;

  /* Typography — List Items */
  --list-title-size-pc: 20px;
  --list-title-size-mobile: 17px;
  --list-meta-size-pc: 14px;
  --list-meta-size-mobile: 14px;

  /* Typography — Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Typography — Line Heights */
  --line-height-base: 1.6;
  --line-height-loose: 1.75;
  --line-height-heading: 1.6;

  /* Colors — Primitive */
  --color-white: #ffffff;
  --color-gray-50: #fafafa;
  --color-black: #1a1a1a;
  --color-slate-400: #AEB4B7;
  --color-slate-400-rgb: 174, 180, 183;
  --color-slate-500: #80898D;
  --color-slate-600: #626C71;
  --color-slate-700: #3B5462;

  /* Colors — Semantic (Text) */
  --color-background-beige: #F0EEED;
  --color-text-primary: #243B48;
  --color-text-primary-rgb: 36, 59, 72;
  --color-text-secondary: var(--color-slate-700);
  --color-text-secondary-rgb: 59, 84, 98;
  --color-text-tertiary: var(--color-slate-600);
  --color-text-tertiary-rgb: 98, 108, 113;
  --color-text-body: #505050;
  --color-text-muted: var(--color-slate-500);
  --color-text-muted-rgb: 128, 137, 141;
  --color-text-inactive: rgba(var(--color-text-secondary-rgb), 0.65);
  --color-text-placeholder: #94A3B8;
  --color-text-placeholder-rgb: 148, 163, 184;

  /* Spacing — Sections */
  --section-padding-y: 180px;
  --section-padding-x: 48px;

  /* Spacing — Buttons */
  --btn-padding-y: 8px;
  --btn-padding-x: 32px;
  --btn-gap: 8px;
  --btn-font-size: 18px;
  --btn-radius: 0;
  --btn-icon-size: 18px;

  /* Spacing — Header */
  --header-padding-y: 20px;
  --header-padding-x: var(--grid-margin);
  --header-logo-height: 30px;
  --subpage-header-padding-top: 160px;
}

/* Mobile Overrides */
@media (max-width: 767px) {
  :root {
    --grid-margin: 24px;
    --text-h1: 48px;
    --text-h2: 36px;
    --text-h3: 28px;
    --text-h4: 24px;
    --text-body: 20px;
    --text-body-card: 18px;
    --text-sub-title: 18px;
    --btn-font-size: 16px;
    --btn-padding-y: 6px;
    --btn-padding-x: 24px;
    --btn-icon-size: 16px;
    --header-padding-y: 8px;
    --header-padding-right: 8px;
    --header-padding-left: 16px;
    --header-logo-height: 20px;
  }
}
```
