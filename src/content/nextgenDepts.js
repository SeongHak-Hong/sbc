// 다음세대 부서 페이지(유치부·초등부·중고등부·청년부) 내용.
// 시안: prototypes/nextgen-depth/*.html. 그림 프롬프트: docs/nextgen-story.md '부서 페이지'
// 부서에 받은 자료만 쓴다. 지어내지 않는다 (청년부 예배·프로그램은 자료가 오면 넣는다)
import kMemory from '../assets/nextgen/shintanjin-baptist-church-nextgen-kindergarten-worship-memory-song.webp';
import kBible from '../assets/nextgen/shintanjin-baptist-church-nextgen-kindergarten-worship-bible-search.webp';
import kStory from '../assets/nextgen/shintanjin-baptist-church-nextgen-kindergarten-worship-bible-story-video.webp';
import kQuiz from '../assets/nextgen/shintanjin-baptist-church-nextgen-kindergarten-worship-review-quiz.webp';
import kCrafts from '../assets/nextgen/shintanjin-baptist-church-nextgen-kindergarten-worship-class-crafts.webp';
import kVideo from '../assets/nextgen/shintanjin-baptist-church-nextgen-kindergarten-worship-video-camera.webp';
import ePraise from '../assets/nextgen/shintanjin-baptist-church-nextgen-elementary-worship-praise-ukulele.webp';
import eSermon from '../assets/nextgen/shintanjin-baptist-church-nextgen-elementary-worship-sermon-bible-lectern.webp';
import eGroup from '../assets/nextgen/shintanjin-baptist-church-nextgen-elementary-worship-small-group-table.webp';
import yPraise from '../assets/nextgen/shintanjin-baptist-church-nextgen-youth-worship-praise-microphone.webp';
import ySermon from '../assets/nextgen/shintanjin-baptist-church-nextgen-youth-worship-sermon-highlighted-bible.webp';
import yGroup from '../assets/nextgen/shintanjin-baptist-church-nextgen-youth-worship-small-group-chairs-circle.webp';
import pFruit from '../assets/nextgen/shintanjin-baptist-church-nextgen-kindergarten-program-festival-worship-fruit-basket.webp';
import pTalent from '../assets/nextgen/shintanjin-baptist-church-nextgen-program-talent-feast-coin-pouch.webp';
import pTteok from '../assets/nextgen/shintanjin-baptist-church-nextgen-program-tteokbokki-day-cup.webp';
import pBadge from '../assets/nextgen/shintanjin-baptist-church-nextgen-elementary-program-bible-school-name-badge.webp';
import pLeaves from '../assets/nextgen/shintanjin-baptist-church-nextgen-elementary-program-autumn-picnic-leaves.webp';
import pTent from '../assets/nextgen/shintanjin-baptist-church-nextgen-youth-program-retreat-tent.webp';
import pPack from '../assets/nextgen/shintanjin-baptist-church-nextgen-youth-program-picnic-backpack.webp';
import pBalloons from '../assets/nextgen/shintanjin-baptist-church-nextgen-youth-program-welcome-balloons.webp';
import pLetter from '../assets/nextgen/shintanjin-baptist-church-nextgen-youth-program-parents-invitation-letter.webp';
import pExam from '../assets/nextgen/shintanjin-baptist-church-nextgen-youth-program-exam-cheer-marker-hand-warmer.webp';
import pTree from '../assets/nextgen/shintanjin-baptist-church-nextgen-youth-program-christmas-tree.webp';

// 초등부와 중고등부가 함께 하는 목요일 프로그램. 설명 끝에 목요전도 이야기로 가는 링크를 붙인다
const TTEOK = {
    n: '떡볶이데이',
    img: pTteok,
    d: '매주 목요일 오후, 수업을 마친 아이들과 교회 식당에서 떡볶이를 나눠요. 교회에 안 다니는 친구도 괜찮아요.',
    link: { to: '/outreach', text: '목요전도 이야기 보기' },
    events: 'tteokbokki',
};

// 그림이 아직 없는 프로그램은 img 없이 두고, 버튼을 누르면 설명만 바뀐다
export const NEXTGEN_DEPTS = {
    kindergarten: {
        key: 'kindergarten',
        name: '유치부',
        sky: '#F9E3A6',
        ink: '#2E2410',
        title: '느려도 괜찮아요.',
        story: '꼬물꼬물 작은 손으로 처음 성경을 펴요.',
        when: '주일 오전 9:00 · 유치부실',
        sundayTitle: '다음 주가 기다려지는\n주일 예배',
        sunday: [
            { n: '암송찬양', img: kMemory, d: '음원으로 즐겁게 찬양하며 말씀을 암송해요.' },
            { n: '성경 찾기', img: kBible, d: '느려도, 잘 못 찾아도 괜찮아요. 꼬물꼬물 작은 손으로 성경을 찾아요.' },
            { n: '성경스토리 영상', img: kStory, d: '오늘 배울 말씀을 캐릭터와 함께 영상으로 먼저 만나요.' },
            { n: '복습 퀴즈', img: kQuiz, d: '배운 말씀을 퀴즈로 놀이처럼 풀어요.' },
            { n: '분반공부', img: kCrafts, d: '만들기와 스티커 활동으로 재미있게 배워요.' },
            { n: '예배대장 영상', img: kVideo, d: '예배드리는 우리 모습을 담은 영상을 다 함께 봐요.' },
        ],
        items: [
            { n: '프렌드십 캠프', d: '상반기와 하반기, 친구를 초대해 하나님 말씀을 깊이 배워요.' },
            { n: '달란트 잔치', img: pTalent, d: '상반기와 하반기에 열어요. 예배에 즐겁게 나오도록 도와요.' },
            { n: '여름성경학교', d: '뜨거운 여름, 말씀을 집중해서 배우고 익혀요.' },
            { n: '절기예배', img: pFruit, d: '부활절, 어린이주일, 추수감사주일, 성탄절마다 체험활동과 함께 예배드려요.' },
        ],
    },
    elementary: {
        key: 'elementary',
        name: '초등부',
        sky: '#D3ECF7',
        ink: '#14323D',
        title: '쭈뼛거려도 괜찮아요.',
        story: '함께 부대끼다 보면 어느 날 먼저 손을 드는 아이가 돼 있어요.',
        when: '주일 오전 9:00 · 러브키즈예배실',
        sundayTitle: '친구들과 함께하는\n주일 예배',
        sunday: [
            { n: '준비찬양', img: ePraise, d: '친구들과 함께 목소리를 모아 찬양해요.' },
            { n: '설교', img: eSermon, d: '오늘의 성경 이야기를 듣고 함께 나눠요.' },
            { n: '분반공부', img: eGroup, d: '선생님, 친구들과 둘러앉아 말씀을 더 깊이 배워요.' },
        ],
        items: [
            { n: '성경학교', img: pBadge, d: '여름과 겨울, 말씀을 배우는 특별한 시간이에요.' },
            { n: '달란트 잔치', img: pTalent, d: '달란트를 들고 함께 잔치를 즐겨요.' },
            { n: '가을소풍', img: pLeaves, d: '가을이면 다 함께 소풍을 가요.' },
            TTEOK,
        ],
    },
    youth: {
        key: 'youth',
        name: '중고등부',
        sky: '#F8D6C6',
        ink: '#3A1B14',
        title: '말수가 줄어도 괜찮아요.',
        story: '아이 이름을 아는 선생님과 친구들이 있어요. 말이 없는 날에도 옆자리는 비어 있지 않아요.',
        when: '주일 오전 9:00 · 소예배실',
        sundayTitle: '말없이 앉아 있어도 괜찮은\n주일 예배',
        sunday: [
            { n: '준비찬양', img: yPraise, d: '주일 아침, 소예배실에서 함께 찬양해요.' },
            { n: '설교', img: ySermon, d: '지금 이 나이에 필요한 말씀을 함께 들어요.' },
            { n: '분반 모임', img: yGroup, d: '아이 이름을 아는 선생님, 친구들과 둘러앉아요. 말이 없는 날에도 괜찮아요.' },
        ],
        items: [
            { n: '수련회', img: pTent, d: '겨울과 여름, 함께 떠나 말씀 앞에 머물러요.' },
            { n: '소풍', img: pPack, d: '봄과 가을에 소풍을 가요.' },
            { n: '신입생 환영회', img: pBalloons, d: '새 학년이 되면 신입생을 따뜻하게 맞아요.' },
            { n: '부모초청예배', img: pLetter, d: '부모님을 예배에 초대하는 날이에요.' },
            { n: '수능 응원', img: pExam, d: '수능을 앞둔 친구들을 함께 응원해요.' },
            { n: '성탄절 행사', img: pTree, d: '성탄절 2부 행사를 함께 준비해요.' },
            TTEOK,
        ],
    },
    youngadults: {
        key: 'youngadults',
        name: '청년부',
        sky: '#D6F0EC',
        ink: '#12342F',
        title: '길을 찾는 중이어도 괜찮아요.',
        story: '이제 스스로 예배의 자리에 서요. 그리고 자기만의 길을 향해 페달을 밟아요.',
        when: '주일 오후 1:30 · 소예배실',
        // 예배 순서와 프로그램은 부서 자료를 받으면 넣는다
        pending: {
            title: '청년부 이야기는\n곧 들려드릴게요.',
            desc: '예배 시간에 소예배실로 편하게 오세요.',
        },
    },
};

export const NEXTGEN_DEPT_ORDER = ['kindergarten', 'elementary', 'youth', 'youngadults'];
