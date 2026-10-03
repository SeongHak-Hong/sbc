// 메인 시안 동작 (시안 전용, 저장 없음)

/* 글자 크게: 실제 기능으로 넣을 후보. 선택은 이 브라우저에만 기억 */
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
    await navigator.clipboard.writeText(document.getElementById('addr').textContent);
    copyBtn.textContent = '복사했어요';
  } catch {
    copyBtn.textContent = '복사가 안 돼요';
  }
  setTimeout(() => { copyBtn.textContent = '주소 복사'; }, 2000);
});

/* 시안 전용: 서체 비교 (?font=pretendard) */
const fontButtons = [...document.querySelectorAll('[data-set-font]')];
function setFont(key, push = true) {
  if (!['jayeon', 'pretendard'].includes(key)) key = 'jayeon';
  root.dataset.font = key;
  fontButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setFont === key)));
  if (push) {
    const url = new URL(location.href);
    url.searchParams.set('font', key);
    history.replaceState(null, '', url);
  }
}
setFont(new URLSearchParams(location.search).get('font'), false);
fontButtons.forEach((b) => b.addEventListener('click', () => setFont(b.dataset.setFont)));
