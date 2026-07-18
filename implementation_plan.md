# 메인페이지 랜딩 기획안 — 최종 확정본 (v3)

> [!NOTE]
> Shopify Editions Winter 2026("RenAIssance") 사이트의 **스크롤 기반 캔버스 애니메이션 기법을 분석**한 결과를 반영하고, **설교 쇼츠 섹션**을 추가한 최종 기획안입니다.

---

## 0. Shopify Editions 기술 분석 요약

Shopify의 핵심 기법을 분석하여, 우리 프로젝트에 **현실적으로 적용 가능한 기술 스택**으로 변환했습니다.

| Shopify 원본 기법 | 우리 프로젝트 적용 방식 | 이유 |
|---|---|---|
| WebGL/WebGPU Canvas + GLSL 셰이더 | **고해상도 명화 이미지 + CSS Transform(scale/translate) + GSAP ScrollTrigger** | 교회 사이트에 WebGL은 과도한 리소스. CSS Transform 기반이 충분히 동급 효과를 냄 |
| Lenis 스무스 스크롤 | **Lenis** (또는 기존 프로젝트의 스크롤 방식 유지) | 부드러운 스크롤은 캔버스 연출의 핵심 |
| GSAP ScrollTrigger (scrub) | **GSAP ScrollTrigger** `scrub: true` | 이미 프로젝트에서 GSAP + ScrollTrigger 사용 중 ([VerseSection](file:///d:/me/design/sbc-site/src/components/VerseSection.jsx), [YoutubeSection](file:///d:/me/design/sbc-site/src/components/YoutubeSection.jsx)) |
| 풀스크린 `<canvas>` 렌더링 | **풀스크린 `<div>` + overflow:hidden + 초대형 이미지 CSS Transform** | DOM 기반으로도 GPU 가속 transform을 활용하면 60fps 유지 가능 |

### 핵심 구현 원리: "가상 카메라" 패턴
```
┌─ 뷰포트(100vw × 100vh, overflow: hidden) ──────────────────┐
│                                                              │
│   ┌─ 초대형 명화 이미지 (예: 300vw × 200vh) ──────────────┐ │
│   │                                                        │ │
│   │   스크롤에 따라 CSS transform 변경:                     │ │
│   │   • scale(1) → scale(2.5)  → 줌인 (카메라 접근)        │ │
│   │   • translateX/Y            → 패닝 (카메라 이동)        │ │
│   │   • filter: brightness()    → 조명 변화                 │ │
│   │                                                        │ │
│   └────────────────────────────────────────────────────────┘ │
│                                                              │
│   ┌─ 텍스트 오버레이 (position: absolute, z-index 위) ───┐  │
│   │   스크롤에 따라 opacity, y, blur 변화                  │  │
│   └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**스크롤 → CSS Transform 매핑 = "카메라 이동" 착시 효과**

---

## 1. 전체 구조 요약 (8 Scenes)

```
┌─────────────────────────────────────────────┐
│  Scene 1: 올해의 표어 (Hero)                │  ■ 강 · dark · 명화 캔버스 (줌인)
├─────────────────────────────────────────────┤
│  Scene 2: 올해의 말씀 (Verse)               │  □ 약 · beige · 타이포그래피 only
├─────────────────────────────────────────────┤
│  Scene 3: Our Story (환영·비전)             │  ◧ 중 · white · 텍스트 + 포인트 이미지
├─────────────────────────────────────────────┤
│  Scene 4: The Gathering (예배·다음세대)      │  ■ 강 · dark · 명화 캔버스 (패닝)
├─────────────────────────────────────────────┤
│  Scene 5: 설교 쇼츠 → 풀영상 유도 [NEW]     │  ◧ 중 · white · iPhone 프레임
├─────────────────────────────────────────────┤
│  Scene 6: Life Together (공동체·사역)        │  □ 약 · beige · 플랫 그리드
├─────────────────────────────────────────────┤
│  Scene 7: The Guides (목회자 소개)           │  ◧ 중 · white · 깔끔한 카드
├─────────────────────────────────────────────┤
│  Scene 8: Next Step (새신자 초대·CTA)        │  ■ 중강 · dark · 명화 캔버스 (줌아웃)
├─────────────────────────────────────────────┤
│  Footer                                     │
└─────────────────────────────────────────────┘
```

**배경색 리듬:** dark → beige → white → dark → white → beige → white → dark  
**비주얼 리듬:** 캔버스(강) → 텍스트(약) → 포인트(중) → 캔버스(강) → iPhone(중) → 플랫(약) → 카드(중) → 캔버스(중강)

---

## 2. 각 Scene 상세 기획 + 캔버스 카메라 연출

---

### Scene 1: 올해의 표어 (Hero) — 🎬 캔버스 줌인

**디자인 강도:** ■ 강 | **배경:** `--color-background-dark`  
**컴포넌트:** `[대폭 수정]` [HeroSection.jsx](file:///d:/me/design/sbc-site/src/components/HeroSection.jsx)  
**이미지:** 렘브란트 풍 유화 — 거친 바다 위를 걸어가는 인물 (초대형 고해상도)

#### 🎥 카메라 시퀀스 (스크롤 0% → 100%)

```
[0%]  와이드 숏                    [50%] 미디엄 숏                 [100%] 클로즈업
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│                  │           │    ┌────────┐    │           │  ┌────────────┐  │
│   ┌──────────┐   │           │    │ 인물의 │    │           │  │            │  │
│   │ 전체 명화 │   │     →     │    │ 상반신 │    │     →     │  │  인물의    │  │
│   │ scale(1) │   │           │    │scale(2)│    │           │  │  발걸음    │  │
│   └──────────┘   │           │    └────────┘    │           │  │ scale(3)  │  │
│                  │           │                  │           │  └────────────┘  │
└──────────────────┘           └──────────────────┘           └──────────────────┘

 표어 텍스트: 선명 → 유지        표어 fade out                   다음 섹션으로 전환
 LightRays: 은은히 빛남           밝기 증가                       완전 밝아지며 전환
```

**GSAP ScrollTrigger 설정:**
```javascript
// 의사코드 — 실제 코드 아님
ScrollTrigger.create({
  trigger: heroSection,
  start: "top top",
  end: "+=300%",      // 스크롤 3배 길이만큼 핀
  pin: true,
  scrub: 1,           // 부드러운 보간
});

timeline
  .to(paintingImg, { scale: 3, x: "-30%", y: "-20%" })   // 줌인 + 시선 이동
  .to(heroText, { opacity: 0, y: -100 }, "<0.3")         // 텍스트 페이드아웃
  .to(overlay, { opacity: 1 })                            // 화이트 페이드로 전환
```

**레이아웃 (PC):**
```
┌──────────────────────────────────────────────────────┐
│  [overflow: hidden, 100vh, position: sticky]         │
│                                                      │
│  ┌─ 명화 이미지 (will-change: transform) ─────────┐ │
│  │  초대형 (200vw × 150vh 이상)                     │ │
│  │  transform: scale(1→3) translate(0→-30%, 0→-20%)│ │
│  │  transition: GPU-accelerated CSS Transform       │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ 텍스트 오버레이 (z-index: 20) ─────────────────┐ │
│  │  Playfair 160px  "The Living    Word"            │ │
│  │  SUIT 32px  "올해의 표어 텍스트"                   │ │
│  │  opacity: 1→0, y: 0→-100                        │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ LightRays (z-index: 15) ───────────────────────┐ │
│  │  기존 LightRays 컴포넌트 유지                     │ │
│  └──────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ 그래디언트 오버레이 (전환용) ──────────────────┐  │
│  │  opacity: 0→1 (밝은 베이지로 다음 섹션 연결)     │  │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

### Scene 2: 올해의 말씀 (Verse) — 텍스트 Only

**디자인 강도:** □ 약 | **배경:** `--color-background-beige`  
**컴포넌트:** `[재사용]` [VerseSection.jsx](file:///d:/me/design/sbc-site/src/components/VerseSection.jsx)  
**캔버스:** 없음 (의도적 비주얼 휴식)

*(기존 계획과 동일 — 변경 없음. 단어별 blur 애니메이션 유지, 텍스트만 올해의 말씀으로 교체)*

---

### Scene 3: Our Story (환영·비전) — 포인트 이미지

**디자인 강도:** ◧ 중 | **배경:** `--color-white`  
**컴포넌트:** `[신규]` `StorySection.jsx`  
**이미지:** 엠마오로 가는 두 제자 (포인트 오브제, 캔버스 연출 없음)

*(기존 계획과 동일 — 12그리드 좌우 배치, 텍스트 5col + 이미지 6col)*

---

### Scene 4: The Gathering (예배·다음세대) — 🎬 캔버스 패닝

**디자인 강도:** ■ 강 | **배경:** `--color-background-dark`  
**컴포넌트:** `[신규]` `GatheringSection.jsx`  
**이미지:** 예수님이 어린아이를 안아주시는 르네상스 풍 (초대형 고해상도, 파노라마형 가로 비율)

#### 🎥 카메라 시퀀스 (스크롤 0% → 100%)

```
[0%]  좌측 초점 (예배)              [50%] 중앙 (전환)              [100%] 우측 초점 (다음세대)
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│ ┌─────┐          │           │     ┌─────┐      │           │          ┌─────┐ │
│ │예배 │          │           │     │중앙  │      │           │          │다음 │ │
│ │안내 │ ← 카메라 │     →     │     │구역  │      │     →     │ 카메라 → │세대 │ │
│ │카드 │  여기    │           │     │      │      │           │  여기    │카드 │ │
│ └─────┘          │           │     └─────┘      │           │          └─────┘ │
└──────────────────┘           └──────────────────┘           └──────────────────┘

 scale(1.5)                      scale(1.3)                     scale(1.5)
 translateX(20%)                 translateX(0%)                 translateX(-20%)
 
 [예배안내 글래스 카드 표시]       [두 카드 모두 사라짐]           [다음세대 글래스 카드 표시]
```

**GSAP ScrollTrigger 설정:**
```javascript
// 의사코드 — 카메라가 명화의 좌측 → 우측으로 천천히 패닝
timeline
  .fromTo(paintingImg, 
    { scale: 1.5, x: "20%" },              // 좌측에서 시작 (줌인)
    { scale: 1.5, x: "-20%", ease: "none" } // 우측으로 패닝
  )
  .fromTo(worshipCard, { opacity: 1 }, { opacity: 0 }, "<")  // 예배카드 사라짐
  .fromTo(nextgenCard, { opacity: 0 }, { opacity: 1 }, ">")  // 다음세대카드 등장
```

**글래스모피즘 정보 카드:**
- `background: rgba(255, 255, 255, 0.08)`
- `backdrop-filter: blur(16px)`
- `border: 1px solid rgba(255, 255, 255, 0.15)`
- `box-shadow: none` ← 프로젝트 규칙

---

### Scene 5: 설교 쇼츠 → 풀영상 유도 [NEW] — iPhone 프레임

**디자인 강도:** ◧ 중 | **배경:** `--color-white`  
**컴포넌트:** `[수정 기반]` 기존 [YoutubeSection.jsx](file:///d:/me/design/sbc-site/src/components/YoutubeSection.jsx) 구조 활용  
**캔버스:** 없음 (iPhone 프레임 + 유튜브 임베드)

#### 💡 컨셉
> **"1분 안에 전해지는 은혜"** — 설교의 하이라이트를 쇼츠(세로 영상)로 먼저 보여주고, 감동받은 방문자가 자연스럽게 풀 설교 영상으로 이어지게 유도합니다.

#### 🎥 스크롤 시퀀스

```
[Phase 1: 쇼츠 등장]                        [Phase 2: 풀영상 전환]
┌──────────────────────────────┐         ┌──────────────────────────────┐
│                              │         │                              │
│  "우리의 인생,"   ┌────┐ "예수로│         │  "그 말씀이 당신의 삶을       │
│               │쇼츠│ "부터." │   →     │    변화시킵니다."              │
│               │영상│        │ fade    │                              │
│               │    │        │         │  [풀 설교 보러가기] 버튼       │
│               └────┘        │         │  [유튜브 채널 가기] 버튼       │
│                              │         │                              │
└──────────────────────────────┘         └──────────────────────────────┘
```

**레이아웃 (PC):**
```
┌──────────────────────────────────────────────────────┐
│  배경: --color-white                                 │
│  min-height: 100vh, pin: true, scrub                 │
│                                                      │
│  [Phase 1] — GSAP pin 고정 상태                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │  좌측 텍스트      iPhone 프레임     우측 텍스트│   │
│  │  "우리의 인생,"   ┌──────────┐   "예수로부터."│   │
│  │  SUIT 48px       │ 유튜브    │   SUIT 48px  │   │
│  │                  │ 쇼츠 임베드│              │   │
│  │                  │ (9:16)    │              │   │
│  │                  │ + 재생버튼 │              │   │
│  │                  └──────────┘              │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Phase 2] — Phase 1이 fade out 후                   │
│  ┌──────────────────────────────────────────────┐   │
│  │  text-align: center                          │   │
│  │                                              │   │
│  │  SUIT 48px                                   │   │
│  │  "그 말씀이 당신의                             │   │
│  │   삶을 변화시킵니다."                           │   │
│  │                                              │   │
│  │  [이번 주 설교 보기]  [유튜브 채널 가기]        │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**기존 코드 활용:** [YoutubeSection.jsx](file:///d:/me/design/sbc-site/src/components/YoutubeSection.jsx)의 iPhone 프레임, GSAP pin+scrub 2단 전환 구조를 거의 그대로 재활용. 쇼츠 영상 ID만 교체하고 Phase 2의 CTA 버튼을 "풀 설교 보기"로 변경.

---

### Scene 6: Life Together (공동체·사역) — 플랫 그리드

**디자인 강도:** □ 약 | **배경:** `--color-background-beige`  
**컴포넌트:** `[신규]` `LifeSection.jsx`  
**캔버스:** 없음

*(기존 계획과 동일 — 3등분 그리드, 아이콘 + 텍스트, border만 사용)*

---

### Scene 7: The Guides (목회자·리더십) — 깔끔한 카드

**디자인 강도:** ◧ 중 | **배경:** `--color-white`  
**컴포넌트:** `[신규]` `GuidesSection.jsx`  
**캔버스:** 없음

*(기존 계획과 동일 — 12그리드 좌우 배치, 실제 목회자 사진 사용)*

---

### Scene 8: Next Step (새신자 초대·CTA) — 🎬 캔버스 줌아웃

**디자인 강도:** ■ 중강 | **배경:** `--color-background-dark`  
**컴포넌트:** `[수정]` [NewcomerSection.jsx](file:///d:/me/design/sbc-site/src/components/NewcomerSection.jsx) 확장  
**이미지:** 탕자를 맞이하는 아버지 (유화, 초대형)

#### 🎥 카메라 시퀀스 (Scene 1과 반대)

```
[0%]  클로즈업 (아버지의 품)        [100%] 와이드 숏 (전체 장면)
┌──────────────────┐           ┌──────────────────┐
│  ┌────────────┐  │           │                  │
│  │  아버지가   │  │           │   ┌──────────┐   │
│  │  안아주는   │  │     →     │   │ 전체 명화 │   │
│  │  손 클로즈업│  │  줌아웃    │   │ + CTA    │   │
│  │  scale(3)  │  │           │   │ scale(1) │   │
│  └────────────┘  │           │   └──────────┘   │
│                  │           │                  │
└──────────────────┘           └──────────────────┘

 텍스트: 숨김                     텍스트 + 버튼 fade in
 감정적 몰입 → 클로즈업           전체 그림 → 행동 유도(CTA)
```

**의도:** Scene 1이 "줌인"으로 시작했다면, 마지막 Scene 8은 "줌아웃"으로 끝나며 대칭적 구조를 완성합니다. 클로즈업에서 시작하여 와이드 숏으로 빠지면서 CTA 텍스트와 버튼이 나타나 — **"이 이야기의 주인공은 바로 당신입니다"**라는 메시지를 전달합니다.

---

## 3. 캔버스 연출이 있는 3개 Scene의 기술 비교표

| | Scene 1 (Hero) | Scene 4 (Gathering) | Scene 8 (Next Step) |
|---|---|---|---|
| **카메라 동작** | 줌인 (와이드→클로즈업) | 좌→우 패닝 | 줌아웃 (클로즈업→와이드) |
| **scale** | 1 → 3 | 1.5 (고정) | 3 → 1 |
| **translate** | (0,0) → (-30%,-20%) | (20%,0) → (-20%,0) | (-30%,-20%) → (0,0) |
| **brightness** | 1 → 1.3 (밝아지며 전환) | 1 (유지) | 0.7 → 1 (어둠→밝음) |
| **pin 길이** | +=300% | +=250% | +=200% |
| **텍스트 연출** | fade out → 다음 섹션 | 카드 A out → 카드 B in | fade in → CTA 강조 |
| **전환 방식** | 밝은 오버레이로 beige 연결 | 어두운 오버레이로 white 연결 | 자연스럽게 Footer 연결 |

---

## 4. 메인에서 제외/흡수되는 기존 섹션

| 기존 섹션 | 처리 | 이유 |
|-----------|------|------|
| [YoutubeSection](file:///d:/me/design/sbc-site/src/components/YoutubeSection.jsx) | **Scene 5로 흡수** | 구조 재활용하여 "설교 쇼츠→풀영상" 섹션으로 전환 |
| [GallerySection](file:///d:/me/design/sbc-site/src/components/GallerySection.jsx) | 제거 | Scene 3에서 교회 역사 링크로 대체 |
| [PrayerSection](file:///d:/me/design/sbc-site/src/components/PrayerSection.jsx) | 제거 | Scene 6 코이노니아 카드에서 링크 연결 |
| [EventSection](file:///d:/me/design/sbc-site/src/components/EventSection.jsx) | 제거 | 헤더 메뉴에서 접근 |
| [ServiceInfoSection](file:///d:/me/design/sbc-site/src/components/ServiceInfoSection.jsx) | **Scene 4/8에 흡수** | 예배 시간 정보를 글래스카드/CTA에 포함 |

> [!WARNING]
> 기존 컴포넌트 파일들은 **삭제하지 않고 유지**합니다.

---

## 5. 명화 이미지 필요 목록 (총 4장)

| Scene | 컨셉 | 사용 방식 | 해상도 요구 | 카메라 |
|-------|------|----------|------------|--------|
| 1 (Hero) | 거친 바다 위 베드로 | 풀스크린 캔버스 | **초고해상도 (4K+)** — 줌인 시 깨지지 않아야 함 | 줌인 |
| 3 (Our Story) | 엠마오 두 제자 | 포인트 오브제 | 일반 해상도 충분 | 없음 |
| 4 (Gathering) | 어린아이를 안아주시는 예수님 | 풀스크린 캔버스 (가로 파노라마) | **초고해상도 (4K+)** — 패닝 시 선명해야 함 | 좌→우 패닝 |
| 8 (Next Step) | 탕자를 맞이하는 아버지 | 풀스크린 캔버스 | **초고해상도 (4K+)** — 줌아웃 시작이 클로즈업 | 줌아웃 |

---

## 6. 컴포넌트 생성/수정 요약

| 작업 | 파일 | 핵심 변경 |
|------|------|----------|
| `[대폭 수정]` | [HeroSection.jsx](file:///d:/me/design/sbc-site/src/components/HeroSection.jsx) | video→명화img, GSAP pin+scrub 줌인 캔버스 |
| `[텍스트만 수정]` | [VerseSection.jsx](file:///d:/me/design/sbc-site/src/components/VerseSection.jsx) | 올해의 말씀 텍스트 교체 |
| `[신규]` | StorySection.jsx | 환영·비전 (이미지+텍스트 좌우 배치) |
| `[신규]` | GatheringSection.jsx | GSAP pin+scrub 패닝 캔버스 + 글래스카드 |
| `[대폭 수정]` | YoutubeSection.jsx → **SermonShortsSection.jsx** | iPhone 쇼츠→풀영상 유도 전환 |
| `[신규]` | LifeSection.jsx | 공동체·사역 3등분 그리드 |
| `[신규]` | GuidesSection.jsx | 목회자 소개 |
| `[대폭 수정]` | [NewcomerSection.jsx](file:///d:/me/design/sbc-site/src/components/NewcomerSection.jsx) | GSAP pin+scrub 줌아웃 캔버스 + CTA |
| `[수정]` | [MainPage.jsx](file:///d:/me/design/sbc-site/src/pages/MainPage.jsx) | 8개 Scene 순서 재배치 |

---

> [!IMPORTANT]
> ## User Review Required
> 1. **올해의 표어**와 **올해의 말씀** 정확한 텍스트를 알려주세요.
> 2. **3개의 캔버스 Scene(줌인 → 패닝 → 줌아웃)** 카메라 연출 구성이 마음에 드시나요?
> 3. **설교 쇼츠 섹션**(Scene 5)이 기존 YoutubeSection의 iPhone 구조를 재활용하는 방식이 괜찮으신가요?
> 4. 승인 + 표어/말씀 텍스트를 주시면 바로 코드 구현을 시작하겠습니다!
