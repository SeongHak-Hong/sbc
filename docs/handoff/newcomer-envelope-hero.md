# 새가족(/newcomer) 히어로: 열리는 편지 봉투

'영상, 이미지 기획' 세션에서 만든 인터랙션을 새가족 페이지(`WelcomePage`, 라우트 `/newcomer`) 히어로 섹션에 넣는 작업.

## 원본 데모 (사용자 확인 완료: "잘 나오네")
- `prototypes/newcomer-visual/envelope/index.html`
  - 보는 주소: http://localhost:5173/prototypes/newcomer-visual/envelope/index.html
- 조각 이미지는 같은 폴더에 있다:
  - `inside.webp`, `flap-open.webp`, `letter.webp`, `pocket.webp`, `flap-closed.webp`, `heart.webp`
- 사용자가 직접 잘라 준 원본 PNG는 `envelope/src/`에 있다.

## 구조
- 조각 6장을 한 좌표계(758×715)에 겹친다.
- 각 조각은 `left`·`top`·`width` %로 위치를 잡는다. 값은 데모 CSS를 그대로 쓸 것.
- 뒤에서 앞 순서: inside → flap-open → letter(overflow:hidden 래퍼 안) → pocket → flap-closed → heart.
- 열기 순서:
  1. 닫힌 덮개가 `rotateX(0 → -90deg)`로 젖혀진다 (가속).
  2. 덮개가 숨고, 열린 덮개가 `rotateX(90 → 0deg)`로 펼쳐진다 (감속).
  3. 편지가 `translateY(36% → 0)`로 함께 올라온다.
- 닫기는 그 역순이다. 이징·지연 값은 데모 CSS 변수 `--fold-in`, `--fold-out`, `--ease`를 그대로 쓴다.
  - 사용자가 "버벅임, 틈, 덮일 때 멈춤"을 지적해 고친 값이니 바꾸지 말 것.
- 사용자 지시로 정한 조건:
  - 열린 덮개는 `top: 0.42%`로 3px 겹쳐서 뒷면과 틈을 없앴다.
  - 회전하는 조각에 `filter`(drop-shadow) 금지. 매 프레임 다시 그려서 버벅인다.
- 조작:
  - 마우스를 올리면 열린다 (`@media (hover: hover)`).
  - 클릭이나 탭으로 `.is-open`을 토글한다.
  - 버튼에 `aria-pressed`와 aria-label을 단다.
  - `prefers-reduced-motion`이면 transition 없이 바로 바뀐다.

## 옮길 때 할 일
1. 이미지를 `src/assets/newcomer/` 같은 곳으로 옮긴다.
   - 파일명은 SEO 규칙(`shintanjin-baptist-church-newcomer-envelope-*.webp`)을 따른다.
   - import해서 쓴다.
2. 용량을 줄인다.
   - `inside.webp`(341KB)와 `letter.webp`(373KB)가 크다.
   - 화면에 보이는 크기의 2배 너비로 줄여 다시 인코딩한다 (q80, method 6). 그레인이 뭉개지지 않는지 눈으로 확인한다.
3. CSS Modules(`*.module.css`)로 옮긴다.
   - 페이지 토큰을 쓰고, 색 hex를 하드코딩하지 않는다. 데모의 `#ddefef` 배경과 `.hint` 문구는 데모용이다.
4. 히어로 배치와 문구는 서브페이지 기준(design.md '서브페이지 기준', `--sub-*` 토큰, `<PageTopGradient />`)을 따른다.
   - 바꾸기 전에 휴대폰·데스크톱 시안을 지금 화면과 나란히 먼저 보여 준다 (CLAUDE.md).
5. 휴대폰에는 hover가 없다.
   - 탭으로 열린다.
   - 처음 보일 때 한 번 자동으로 열어 줄지는 사용자에게 물어볼 것.
   - 2026-10-23 사용자 결정: 휴대폰(`(hover: none)`)에서는 봉투가 화면에 60% 이상 보이면 0.6초 뒤 한 번 저절로 연다. 그 전에 사용자가 눌렀으면 열지 않는다. 데스크톱은 그대로(올리기·클릭). 구현: `prototypes/newcomer-visual/index.html` 스크립트.

## 참고
- 이 페이지는 실사진 대신 일러스트로 간다. 새신자가 부담을 느끼지 않게 하려는 사용자의 결정이다.
- 단계 카드 일러스트: `prototypes/newcomer-visual/img/shintanjin-baptist-church-newcomer-step-0{1..5}-*.webp`
