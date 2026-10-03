// 메인 시안 동작 (시안 전용)

/* 글자 크게 (이 브라우저에만 기억) */
const root = document.documentElement;
const sizeBtn = document.getElementById('sizeToggle');
const sizeLabel = sizeBtn.querySelector('.size-label');
function applySize(large) {
  root.dataset.size = large ? 'large' : 'normal';
  sizeBtn.setAttribute('aria-pressed', String(large));
  sizeLabel.textContent = large ? '글자 보통' : '글자 크게';
}
try { applySize(localStorage.getItem('sbc-text-size') === 'large'); } catch { applySize(false); }
sizeBtn.addEventListener('click', () => {
  const large = root.dataset.size !== 'large';
  applySize(large);
  try { localStorage.setItem('sbc-text-size', large ? 'large' : 'normal'); } catch {}
});

/* 주소 복사 */
const copyBtn = document.getElementById('copyAddr');
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('대전 대덕구 석봉로 17');
    copyBtn.textContent = '복사했어요';
  } catch {
    copyBtn.textContent = '복사가 안 돼요';
  }
  setTimeout(() => { copyBtn.textContent = '주소 복사'; }, 2000);
});

/* 설교 쇼츠: 기존 YoutubeSection과 같은 채널·같은 API 키로 최신 4개 */
const CHANNEL_ID = 'UCj3wg1t2u2eiMQxWIgT2OeQ';
const FALLBACK = [{ id: 'bQ8ybnIaKDY', title: '신탄진침례교회 말씀 쇼츠' }];
const CACHE_KEY = 'sbc_proto_shorts';
const CACHE_MS = 6 * 60 * 60 * 1000;

async function loadShorts() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.time < CACHE_MS) return cached.items;
  } catch {}
  const key = import.meta.env?.VITE_YOUTUBE_API_KEY;
  if (!key) return FALLBACK;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=4&order=date&type=video&videoDuration=short&key=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const items = (data.items || []).map((it) => ({ id: it.id.videoId, title: decodeEntities(it.snippet.title) }));
    if (!items.length) return FALLBACK;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), items })); } catch {}
    return items;
  } catch {
    return FALLBACK;
  }
}

function decodeEntities(s) {
  const t = document.createElement('textarea');
  t.innerHTML = s;
  return t.value.replace(/#\S+/g, '').replace(/\s{2,}/g, ' ').trim();
}

function shortItem({ id, title }) {
  const li = document.createElement('li');
  li.className = 'short';
  const a = document.createElement('a');
  a.href = `https://www.youtube.com/shorts/${id}`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', `${title} (유튜브에서 재생)`);
  const thumb = document.createElement('div');
  thumb.className = 'short-thumb';
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  img.src = `https://i.ytimg.com/vi/${id}/oar2.jpg`;
  // 세로 썸네일이 없으면 유튜브가 404 또는 120x90 회색 이미지를 줌 → 일반 썸네일로 교체
  const fallback = () => { img.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`; };
  img.addEventListener('error', fallback, { once: true });
  img.addEventListener('load', () => { if (img.naturalWidth <= 120 && img.src.includes('oar2')) fallback(); });
  const play = document.createElement('span');
  play.className = 'short-play';
  play.innerHTML = '<span class="icon" aria-hidden="true">play_arrow</span>';
  thumb.append(img, play);
  const cap = document.createElement('p');
  cap.className = 'short-title';
  cap.textContent = title;
  a.append(thumb, cap);
  li.append(a);
  return li;
}

loadShorts().then((items) => {
  const list = document.getElementById('shortsList');
  list.replaceChildren(...items.slice(0, 4).map(shortItem));
});
