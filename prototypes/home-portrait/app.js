// 메인 시안 동작. 실제 저장은 하지 않음 (시안 전용).

const MOODS = {
  cloudy: {
    empathy: '흐린 날도 하루의 일부예요. 오늘은 조금 천천히 가도 괜찮아요.',
    verse: '수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라',
    ref: '마태복음 11:28',
    action: 'prayer',
    bridge: { text: '혼자 견디지 않아도 돼요. 이런 곳이 있어요.', label: '어떤 곳인지 보기', target: 'values' },
  },
  rain: {
    empathy: '마음에 비가 오는 날이네요. 억지로 괜찮아지지 않아도 돼요.',
    verse: '여호와는 마음이 상한 자를 가까이 하시고 충심으로 통회하는 자를 구원하시는도다',
    ref: '시편 34:18',
    action: 'prayer',
    bridge: { text: '혼자 견디지 않아도 돼요. 이런 곳이 있어요.', label: '어떤 곳인지 보기', target: 'values' },
  },
  clearing: {
    empathy: '조금씩 나아지고 있군요. 그 걸음을 저희도 함께 응원할게요.',
    verse: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요 달음박질하여도 곤비하지 아니하겠고 걸어가도 피곤하지 아니하리로다',
    ref: '이사야 40:31',
    action: null,
    bridge: { text: '함께 걸어갈 사람들이 있어요.', label: '작은 모임 보기', target: 'activities', tab: 'tab-small' },
  },
  sunny: {
    empathy: '좋은 하루를 보내고 계시네요. 그 마음, 저희도 반가워요.',
    verse: '항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라',
    ref: '데살로니가전서 5:16-18',
    action: 'gratitude',
    bridge: { text: '기쁨은 나눌수록 커져요. 함께 밥 먹을 식탁이 있어요.', label: '모임 둘러보기', target: 'activities' },
  },
  unsure: {
    empathy: '마음을 다 알지 못해도 괜찮아요. 모르는 채로 와도 되는 곳이에요.',
    verse: '그리하면 여호와 그가 네 앞에서 가시며 너와 함께 하사 너를 떠나지 아니하시며 버리지 아니하시리니 너는 두려워하지 말라 놀라지 말라',
    ref: '신명기 31:8',
    action: null,
    bridge: { text: '처음 오시는 날이 어떤지 먼저 보여드릴게요.', label: '첫 방문 안내 보기', target: 'first-visit' },
  },
};

const FAQ = [
  ['교회를 한 번도 안 가봤는데 괜찮을까요?', '그럼요. 처음인 분들이 생각보다 많아요. 앉아 계시기만 해도 충분해요.'],
  ['한 번 가면 계속 연락이 오나요?', '연락처를 남기지 않으시면 연락드리지 않아요. 남기셔도 원하지 않으시면 언제든 멈출 수 있어요.'],
  ['믿음이 없어도 모임에 참여할 수 있나요?', '네. 책과 차 모임이나 문화행사는 비신자분들도 많이 오세요.'],
  ['뭘 입고 가야 하나요?', '평소 입는 옷이면 돼요.'],
  ['아이와 함께 가도 되나요?', '환영해요. 연령별 공간과 선생님이 준비되어 있어요.'],
  ['이전 교회에서 옮겨오려면 어떻게 하나요?', '서두르지 않으셔도 돼요. 몇 주 편하게 다니신 뒤, 원하실 때 새가족 담당자에게 말씀해 주세요.'],
  ['남긴 기도 부탁은 누가 보나요?', '이름 없이 저장되고, 교회 기도 담당자만 확인해요. 다른 사람에게 공개되지 않아요.'],
];

const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') node.textContent = v;
    else if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) if (c) node.append(c);
  return node;
};

/* ---------- 마음 나누기 ---------- */
const response = document.getElementById('mindResponse');
const moodButtons = [...document.querySelectorAll('.mood')];
let current = null;

function noteForm(type) {
  const isPrayer = type === 'prayer';
  const max = isPrayer ? 300 : 100;
  const wrap = el('div', { class: 'note-slot' });
  const open = el('button', { class: 'btn btn-line', type: 'button', text: isPrayer ? '기도를 부탁해도 될까요' : '오늘의 감사 한 줄 남기기' });
  wrap.append(open);

  open.addEventListener('click', () => {
    const id = isPrayer ? 'prayerText' : 'thanksText';
    const field = isPrayer
      ? el('textarea', { id, rows: '3', maxlength: String(max), placeholder: '비워두셔도 괜찮아요.' })
      : el('input', { id, type: 'text', maxlength: String(max), placeholder: '오늘 감사한 일을 한 줄로 적어주세요.' });
    const count = el('span', { class: 'meta', 'aria-live': 'polite', text: `0 / ${max}자` });
    field.addEventListener('input', () => { count.textContent = `${field.value.length} / ${max}자`; });
    const submit = el('button', { class: 'btn btn-ink btn-sm', type: 'submit', text: '남기기' });
    const form = el('form', { class: 'note-form' }, [
      el('label', { for: id, text: isPrayer ? '어떤 마음인지 적어주셔도 좋고, 비워두셔도 괜찮아요.' : '오늘 감사한 일' }),
      field,
      el('div', { class: 'note-row' }, [el('span', { class: 'meta', text: '이름 없이 남겨져요. (시안이라 실제로 저장되지 않아요)' }), count]),
      el('div', {}, [submit]),
    ]);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const done = el('p', { class: 'done' }, [
        el('span', { class: 'icon', 'aria-hidden': 'true', text: 'check_circle' }),
        el('span', { text: isPrayer ? '마음을 맡겨주셔서 고마워요. 함께 기도할게요.' : '나눠주셔서 고마워요. 그 감사, 저희도 함께 기뻐할게요.' }),
      ]);
      wrap.replaceChildren(done);
    });
    wrap.replaceChildren(form);
    field.focus();
  });
  return wrap;
}

function renderMood(key) {
  const m = MOODS[key];
  const bridgeBtn = el('a', { class: 'btn btn-ink btn-sm', href: `#${m.bridge.target}`, text: m.bridge.label });
  if (m.bridge.tab) bridgeBtn.addEventListener('click', () => selectTab(document.getElementById(m.bridge.tab)));

  const block = el('div', { class: 'resp' }, [
    el('p', { class: 'empathy', text: m.empathy }),
    el('blockquote', { class: 'verse' }, [el('p', { text: m.verse }), el('cite', { text: `${m.ref} (개역개정)` })]),
    m.action ? noteForm(m.action) : null,
    el('div', { class: 'bridge' }, [el('p', { text: m.bridge.text }), bridgeBtn]),
  ]);
  response.replaceChildren(block);
}

moodButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.mood;
    moodButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    if (current !== key) { current = key; renderMood(key); }
  });
});

/* ---------- 탭 ---------- */
const tabs = [...document.querySelectorAll('.tab')];
function selectTab(tab, focus = false) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    panel.hidden = !on;
    if (on) { panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering'); }
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length], true);
    if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
  });
});

/* ---------- FAQ ---------- */
const acc = document.getElementById('accordion');
FAQ.forEach(([q, a], i) => {
  const qid = `faq-q-${i}`, aid = `faq-a-${i}`;
  const btn = el('button', { class: 'acc-q', id: qid, 'aria-expanded': 'false', 'aria-controls': aid, type: 'button' }, [
    el('span', { text: q }),
    el('span', { class: 'icon', 'aria-hidden': 'true', text: 'add' }),
  ]);
  const panel = el('div', { class: 'acc-a', id: aid, role: 'region', 'aria-labelledby': qid }, [el('div', {}, [el('p', { text: a })])]);
  btn.addEventListener('click', () => btn.setAttribute('aria-expanded', String(btn.getAttribute('aria-expanded') !== 'true')));
  acc.append(el('div', { class: 'acc' }, [btn, panel]));
});

/* ---------- 주소 복사 ---------- */
const copyBtn = document.getElementById('copyAddr');
copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(document.getElementById('addr').textContent);
    copyBtn.textContent = '복사했어요';
  } catch {
    copyBtn.textContent = '복사가 안 돼요';
  }
  setTimeout(() => { copyBtn.textContent = '주소 복사'; }, 1800);
});

/* ---------- 시안 전용: Hero A/B/C 전환 (?hero=a|b|c, 기본 b) ---------- */
const heroButtons = [...document.querySelectorAll('[data-set-hero]')];
function setHero(key, push = true) {
  if (!['a', 'b', 'c'].includes(key)) key = 'b';
  document.documentElement.dataset.hero = key;
  heroButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setHero === key)));
  if (push) {
    const url = new URL(location.href);
    url.searchParams.set('hero', key);
    history.replaceState(null, '', url);
  }
}
setHero(new URLSearchParams(location.search).get('hero'), false);
heroButtons.forEach((b) => b.addEventListener('click', () => setHero(b.dataset.setHero)));

/* ---------- 모바일 하단 바: Hero를 지나면 노출 ---------- */
const bar = document.getElementById('bottomBar');
new IntersectionObserver(([entry]) => {
  bar.classList.toggle('is-visible', !entry.isIntersecting);
}, { threshold: 0.05 }).observe(document.getElementById('top'));
