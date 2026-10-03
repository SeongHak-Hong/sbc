# 인수인계: 메인 Hero 배경 이미지 작업 (2026-10-01, 구름 텍스처 교체까지 반영)

새 세션에서 이 문서를 먼저 읽고 이어서 작업한다.
프로젝트 전체 규칙은 `CLAUDE.md`, 섹션별 카피와 와이어프레임은 `docs/home_spec.md`에 있다.

## 1. 지금까지의 흐름

1. **Hero 1차 구현 완료.** 파일은 `src/pages/Home/sections/HeroSection.jsx`와 `HeroSection.module.css`.
   - 방문 시각별 헤드라인 4종(`src/content/home.js`의 `hero.headlines`), 단어 단위 blur 등장, CTA 2개, 스크롤 안내.
   - 배경은 헤드라인 뒤에서 "숨 쉬는" 큰 원(#fafafa, 10초 주기 scale)이다.
2. **숨 쉬는 원은 사용자가 강하게 싫어했다.** 옅은 색 위에 옅은 원이라 흐릿하고 임시 화면처럼 보였다.
   - 그래서 디자인 방향을 바꿀 때는 코드보다 시안 2~3개를 먼저 보여주고 고르게 하기로 했다.
   - 이 원은 `CLAUDE.md`의 금지 항목과도 충돌한다. 해당 항목은 "명상·호흡 연상"과 "빛나는 원형 등 태양을 중심 상징으로 쓰는 이미지"다. 코드 주석에도 "마음 쉼표 호흡"이라고 적혀 있다.
3. **새 방향: 실제 교회 건물 사진 + 구름 하늘 배경.**
   - 참고 사진은 `src/assets/reference/sbc-church.png`다.
   - 건물은 그대로 두고 주변만 구름 위 풍경으로 바꾼 이미지를 생성해 Hero 배경으로 쓰는 방향이다.
   - 생성 도구는 Higgsfield(힉스필드)다.
4. **도구 연결 문제는 해결됐다.**
   - Higgsfield CLI(`@higgsfield/cli`)는 Windows Defender가 `hf.exe`를 위협으로 판단해 실행을 막았다. CLI 대신 MCP로 연결했다.
   - C 드라이브가 꽉 차서 Claude Code CLI 설치가 깨져 있었다. 그래서 npm 설치 위치와 캐시, TEMP를 D 드라이브로 옮겼다.
     - npm 설치 위치: `D:\me\npm-global`
     - npm 캐시: `D:\me\npm-cache`
     - TEMP: `D:\me\Temp`
   - Higgsfield MCP(`https://mcp.higgsfield.ai/mcp`)는 연결과 로그인까지 끝났다. 로그인이 다시 필요하면 사용자가 직접 한다.
   - Higgsfield 안에 이 작업용 프로젝트 "SBC Hero 구름 텍스처"를 만들어 생성물을 모아 두었다.
     - project_id·default_folder_id: `ccdd89f1-d35a-4570-80fc-3dd056eec9fb`
5. **구름 텍스처를 Higgsfield 사진풍 구름으로 교체했다.** 자세한 내용은 5번 '구름 텍스처'에 있다.

> 위 3번에서 "Hero 배경으로 쓴다"는 부분은 앞 대화 일부가 요약된 상태에서 정리한 것이다. 이미지를 넣을 위치와 방식이 다르면 사용자에게 먼저 확인한다.

## 2. 이미지 생성 프롬프트 초안

```
The same church building from the reference photo, preserved exactly (white twin towers, red brick facade, three arched windows, gold cross), standing on a soft hill above a calm sea of clouds. Early morning, pale sky blue (#E7F5FD) sky, gentle peach (#FCEBE0) haze in the lower clouds, no visible sun, diffused soft light, quiet and peaceful, slight mist around the base, photorealistic, wide 16:9 composition with empty sky above the building for a headline.
```

- **색:** 하늘색 #E7F5FD와 피치색 #FCEBE0은 사이트 배경 그라데이션과 같은 값이다.
- **해 금지:** 해·노을·빛나는 원은 금지 상징이라 `no visible sun`을 넣었다.
- **헤드라인 자리:** 건물 위쪽 하늘을 비워 헤드라인이 들어갈 자리를 남긴다.

## 3. 사용자에게 아직 확인받지 못한 것

- **건물 아래쪽:** 간판·담장·도로·주차장은 구름으로 덮을 생각이다. 간판 "신탄진교회"는 AI가 글자를 뭉개기 쉬워서 가리는 쪽을 권했다.
- **고증 범위:** 생성 결과에서 건물이 실제와 달라질 수 있다. 오른쪽 날개나 창문 개수처럼 꼭 맞아야 할 부분이 있는지 묻는다.
- **시안 장수:** 장마다 크레딧이 차감되니 몇 장까지 만들지 정해야 한다.
  - 사용자는 생성 전에 프롬프트와 장수를 먼저 보여 달라고 했다. 비용은 `get_cost`로 미리 조회해 함께 보여준다.
  - 참고로 GPT Image 2.5, high, 1024px 정사각형은 4장에 1.5크레딧이었다.
  - 텍스처 작업 중에 사용자는 "새로 뽑는 게 과정이 더 순탄하다고 판단하면 크레딧을 써도 된다"고 했다. 이 허락은 그 작업에 대한 것이었다. 교회 이미지는 다시 확인한다.

## 4. 디자인 레퍼런스 (사용자 선택)

- **Above the Clouds — 111 W 57** (https://quadplex80.com/)
  - 사용자 반응은 "너무 좋다"였다. Hero 연출의 기준 레퍼런스로 삼는다.
  - 연한 하늘색 하늘, 화면을 채우는 구름 바다, 해 없이 흐린 빛이 특징이다.
  - 스크롤하면 구름을 지나 위로 올라가고, 얇은 자간의 세리프 타이틀이 떠오른다.
  - 구현은 Nuxt와 WebGL2 캔버스로 되어 있다. 영상이 아니라 실시간 렌더링이다.
- **보조 레퍼런스:** Through Sliding Doors (https://through-sliding-doors.rosiesplace.org.au/)
  - "문"을 은유로 쓴 조용한 서사형 사이트다.
- **맞지 않았던 것**
  - 대형 교회 스타일 사이트: 어두운 배경에 공연 사진이 중심이다.
  - 노을 중심 사이트: 태양 상징 금지에 걸린다.

## 5. 3D 구름 시안 현황 (구현 방식 C: WebGL 선택)

- **위치:** `prototypes/hero-clouds/`, 주소는 http://localhost:5173/prototypes/hero-clouds/
  - 사이트 코드와 분리되어 있고, 배포 빌드에는 포함되지 않는다.
- **연출:** 스크롤하면 카메라가 S자 경로로 구름 사이를 앞으로 통과한 뒤, 탁 트인 구름 바다 위로 나온다.
  - 이동 중에는 화각을 46°에서 66°로 넓혀 '빨려 들어가는' 느낌을 낸다.
  - 사용자는 레퍼런스처럼 입체감 있게 빨려 들어가는 느낌을 원했다.
- **로딩:** 로딩 화면은 두지 않는다. 하늘과 헤드라인이 먼저 보이고, 구름은 준비되는 대로 나타난다.
- **구성:** @react-three/fiber, drei `Clouds`, GSAP ScrollTrigger, Lenis.
  - Canvas는 `flat`(톤매핑 끔)으로 둔다. 조명 세기 합은 약 3 이상이어야 구름이 회색으로 죽지 않는다.
  - 조명은 텍스처별로 `HeroClouds.jsx`의 `TEXTURES[*].light`에 있다. 지금은 둘 다 ambient 2.2, hemisphere 0.9, directional 1.4다.
    - ambient를 1.9로 낮춰 보니 구름이 회색으로 탁해졌다.
  - drei 스프라이트는 늘 카메라를 향한다. 그래서 조명은 조각 전체에 고르게 들고, 입체감은 거의 텍스처에서 나온다.
- **구름 형태와 배치:** `cloudLayout.js`에 있다. 사용자가 "다 동글동글한 주먹밥 같다"고 해서 다시 짰다.
  - 원인은 drei 기본 분포였다. 상자 안 무작위 배치에 가운데 조각이 가장 커서 덩어리가 공처럼 보였다.
  - 지금은 형태별 직접 분포를 쓴다. 적운은 바닥이 평평하고 봉우리가 2~3개 솟는다. 운해는 넓은 층에 윗면이 물결친다. 새털구름은 옅은 줄이다.
  - 배치는 손으로 구성했다. 좌우 덩어리의 크기·거리·높이를 번갈아 리듬을 만들고, 도착 장면은 가운데(교회 자리)를 비우고 양옆 적운이 액자처럼 감싼다.
  - 조각 크기는 덩어리 높이 정도로 크게 겹친다. 그래야 조각 하나하나가 공처럼 보이지 않는다.
  - 카메라에 가까운 조각은 `fade=12`로 투명하게 처리한다.
- **구름 텍스처: Higgsfield로 만든 사진풍 구름으로 교체 완료.**
  - **비교 방법:** 오른쪽 위 토글(사진풍 / drei 기본 / 나란히 비교)을 쓰거나, 주소 뒤에 아래 값을 붙인다.
    - `?tex=drei`: drei 텍스처만 본다.
    - `?compare=1`: 왼쪽은 새 텍스처, 오른쪽은 drei로 나눠 본다. 같은 카메라로 두 장면을 그려 화면을 나누므로 구도가 완전히 같다. 가운데 경계선은 끌거나 좌우 방향키로 옮긴다.
    - 토글과 비교 모드는 시안 전용이다. Hero에 옮길 때는 뺀다.
  - **지금 텍스처:** `textures/cloud.png`(512px)다.
    - 원본 `textures/source/cloud-puffy-1.jpg`를 `tools/key-cloud-photo.mjs` 기본값으로 가공했다.
    - 다시 만들려면 `node prototypes/hero-clouds/tools/key-cloud-photo.mjs prototypes/hero-clouds/textures/source/cloud-puffy-1.jpg`를 실행한다.
  - **원본 (GPT Image 2.5, high, 1024px, 검정 배경)**
    - `cloud-puffy-1~4.jpg`: 2차 생성본이고 채택했다. 큰 봉우리 몇 개에 오른쪽 위에서 오는 부드러운 빛이 들어 있다.
    - `cloud-photo-1~4.jpg`: 1차 생성본이고 쓰지 않는다. 잔 봉우리가 많고 고르게 밝은 공 모양이라 겹치면 팝콘·주먹밥처럼 보였다. 1차 프롬프트가 "고르게 밝은 조명, 잔 봉우리"를 요청한 탓이다.
    - 2차 프롬프트:
      ```
      Photorealistic soft fluffy cumulus cloud, a single isolated cloud on a pure solid black background (#000000), like a VFX stock cloud element. Made of a few large, smooth, rounded, plump puffy lobes — soft like cotton, gentle and cozy — not many small detailed puffs, no crunchy fractal detail. Irregular organic silhouette, not a perfect circle, no flat base. Soft gradual density: bright dense core, edges fading softly into translucent mist. Soft diffused daylight from the upper right, smooth gentle gray shading on the lower left side of each lobe, soft highlights on top, no harsh shadows, no rim light, no sun, no sky, no horizon, no other clouds. The cloud fills about 85% of the frame, nothing touching the borders. High detail, square.
      ```
  - **가공 원리:** drei 텍스처를 색과 투명도로 나눠 보면 아래 구조다. 같은 구조로 만든다.
    - 투명도: 구름 사진의 밝기 그대로다. 봉우리와 골짜기 같은 디테일은 전부 여기에 담는다.
    - 색: 거의 흰색이다. 아주 큰 명암만 있다(빛 받는 쪽은 희고 반대쪽은 옅은 회색). 디테일은 없다.
    - 색에 골짜기 명암을 넣거나 속을 불투명하게 만들면, 장면에서 조각마다 회색 줄과 겉 테두리가 보인다. drei 텍스처는 완전 불투명한 부분이 8%뿐이다.
    - 배경 제거 도구 대신 밝기를 투명도로 쓴다. 배경 제거를 하면 구름 윤곽이 칼로 자른 듯 딱딱해진다.
    - 지금 값은 평균 투명도 0.36, 평균 색 밝기 241/255다. drei는 0.37, 241이다.
  - **사용자 판단:** 전체 무드가 기준이다.
    - 봉우리와 그늘이 또렷한 버전(B)은 "겉 테두리가 너무 잘 보인다"며 거절했다.
    - 부드러운 버전(A)을 고른 뒤, 위 구조로 테두리를 없앴다.
    - drei보다 아래쪽 푸른 회색 그늘이 조금 옅다. 그늘을 더 원하면 `shadeMin`을 낮춘다.
  - **작업할 때 주의할 점**
    - sharp는 1채널 이미지를 `blur`·`resize`하면 3채널로 내보낸다. `extractChannel(0)`로 되돌리지 않으면 위치가 어긋나 가로줄이 생긴다. 그래서 흐림은 직접 만든 `blurMap`(실수 배열)으로 한다.
    - RGBA를 한 번에 줄이면 완전 투명한 픽셀의 색이 검정이 된다. three.js가 이 검정을 섞어 가장자리가 어둡게 번진다. 색과 투명도를 따로 줄여서 합친다.
    - 텍스처를 정지 화면으로 합성해 본 시트는 장면과 다르게 보인다. 판단은 반드시 `?compare=1` 장면에서 한다.
    - 미리보기 창에서 구름 페이드인(1.8초)이 멈춘 것처럼 보일 때가 있다. 확인할 때는 `.canvasWrap`의 transition을 끄고 opacity를 1로 둔다.
  - **이전 텍스처:** `textures/cloud-noise.png`는 Perlin 노이즈로 만든 1차 텍스처이고 쓰지 않는다. 생성 스크립트는 `tools/make-cloud-texture.mjs`다.
  - **drei 기본 텍스처:** 라이선스가 명시되지 않아 운영 사이트에는 쓰지 않는다. 비교 전용이며 jsDelivr CDN에서 불러온다.
- **교회 자리:** 흰 사각형 placeholder로 비워 두었다. 위치는 `ChurchPlaceholder`다.

## 6. 다음 단계

1. ~~Higgsfield MCP 연결과 로그인 확인~~ (완료)
2. ~~구름 텍스처 교체~~ (완료. 5번 '구름 텍스처' 참고)
3. 2번 프롬프트와 참고 사진으로 교회 이미지를 **먼저 1장** 만들어 보여준다.
   - 생성 전에 3번의 미확인 항목(건물 아래쪽, 고증 범위, 장수)을 먼저 묻는다.
4. 사용자가 고르면 이미지를 프로젝트 안(예: `src/assets/home/`)에 저장하고, 시안의 `ChurchPlaceholder` 자리에 넣어 본다.
5. Hero에 적용하기 전에 적용 방식을 2~3개 시안으로 보여주고 고르게 한다. 예를 들면 전체 배경, 하단 페이드, 헤드라인 대비 처리 같은 것들이다.
   - 고른 뒤에 숨 쉬는 원을 제거한다.
   - 기존 파일을 고치기 전에는 변경 내용을 먼저 설명한다.
   - 시안 전용 코드(텍스처 토글, 비교 모드, drei 텍스처)는 옮기지 않는다.
6. 헤드라인 가독성(Deep Teal #243B48 텍스트 대비), 모바일 크롭, `prefers-reduced-motion`을 확인한다.
