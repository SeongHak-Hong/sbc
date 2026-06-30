import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// =======================
// 하드코딩 데이터
// =======================

const cellgroupData = {
    '1교구': {
        pastor: { name: '김정현', role: '목사', initials: '김' },
        zones: [
            { id: '101', leader: '김덕기 집사', teacher: '최옥자 집사' },
            { id: '102', leader: '정미숙 집사', teacher: '박찬명 집사' },
            { id: '103', leader: '이종금 명예집사', teacher: '이진숙 집사' },
            { id: '104', leader: '이점수 은퇴권사', teacher: '' },
            { id: '105', leader: '이계옥 시무권사', teacher: '한정남 시무권사' },
            { id: '106', leader: '안정희 시무권사', teacher: '정종우 명예집사' },
            { id: '107', leader: '황경란 집사', teacher: '' },
            { id: '108', leader: '이분희 은퇴권사', teacher: '' },
            { id: '109', leader: '김태식 원로장로', teacher: '' },
            { id: '110', leader: '지민숙 집사', teacher: '' },
            { id: '111', leader: '박경우 집사', teacher: '' },
        ]
    },
    '2교구': {
        pastor: { name: '김윤섭', role: '목사', initials: '김' },
        zones: [
            { id: '201', leader: '최영실 집사', teacher: '윤광식 시무장로' },
            { id: '202', leader: '이명애 집사', teacher: '' },
            { id: '203', leader: '서옥선 집사', teacher: '' },
            { id: '204', leader: '한경연 집사', teacher: '' },
            { id: '205', leader: '노옥선 은퇴권사', teacher: '' },
            { id: '206', leader: '정용미 집사', teacher: '' },
            { id: '207', leader: '김지아 집사', teacher: '박찬오 집사' },
            { id: '208', leader: '이양순 집사', teacher: '' },
            { id: '209', leader: '박동숙 은퇴권사', teacher: '한순희 집사' },
            { id: '210', leader: '박부덕 집사', teacher: '구윤산 집사' },
        ]
    }
};

const departmentsData = {
    kindergarten: {
        id: 'kindergarten',
        name: '유치부',
        color: '#4ADE80',
        schedule: '주일 오전 09:00',
        location: '유치부실',
        leader: { name: '이지은 전도사', role: '담당 교역자' },
        director: { name: '한순희 집사', role: '부장' },
        teamTitle: '교사팀',
        teachers: ['임동순', '김재량', '김신혜'],
        moreTeachersCount: 0,
        events: [
            { title: '어린이 주일 특별 파티', date: '5월 5일', status: '마감임박', img: 'https://images.pexels.com/photos/8612911/pexels-photo-8612911.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '아이들을 위한 특별한 간식과 재미있는 활동이 준비되어 있습니다.' },
            { title: '여름 성경학교', date: '7월 20-21일', status: '모집중', img: 'https://images.pexels.com/photos/8613071/pexels-photo-8613071.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '말씀과 찬양 속에서 예수님을 만나는 즐거운 여름 성경학교!' }
        ]
    },
    elementary: {
        id: 'elementary',
        name: '초등부',
        color: '#FBCB51',
        schedule: '주일 오전 09:00',
        location: '러브키즈예배실',
        extraEvents: [
            { label: '떡볶이 데이 시간', value: '매주 목요일 오후 1~4시' },
            { label: '떡볶이 데이 장소', value: '식당' }
        ],
        leader: { name: '김정현 목사', role: '담당 교역자' },
        director: { name: '이명애 집사', role: '부장' },
        teamTitle: '교사팀',
        teachers: ['오수경', '오영미', '이영미', '김선주', '홍성학', '정효정', '최대한', '오대영', '이예솔', '정기숙'],
        moreTeachersCount: 0,
        events: [
            { title: '가을 축제 & 게임 나이트', date: '10월 25일', status: '접수중', img: 'https://images.pexels.com/photos/8613071/pexels-photo-8613071.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '본당 앞마당에서 게임, 간식, 대형 에어바운스와 함께하는 즐거운 밤!' },
            { title: '2024 겨울 수련회', date: '11월 12-14일', status: '모집중', img: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '하나님을 예배하고 평생의 친구를 사귀는 특별한 주말 수련회입니다.' },
            { title: '성탄절 성가대 준비', date: '12월 10일', status: '오픈예정', img: 'https://images.pexels.com/photos/8089063/pexels-photo-8089063.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '초등부 성탄절 특별 공연에 함께할 성가대원을 곧 모집합니다.' }
        ]
    },
    youth: {
        id: 'youth',
        name: '중고등부',
        color: '#BA87ED',
        schedule: '주일 오전 09:00',
        location: '소예배실',
        extraEvents: [
            { label: '떡볶이 데이 시간', value: '매주 목요일 오후 1~4시' },
            { label: '떡볶이 데이 장소', value: '식당' }
        ],
        leader: { name: '김윤섭 목사', role: '담당 교역자' },
        director: { name: '박경우 집사', role: '부장' },
        teamTitle: '교사팀',
        teachers: ['안수빈', '장혁진', '최영실', '최우진', '박정민'],
        moreTeachersCount: 0,
        events: [
            { title: '청소년 비전 캠프', date: '8월 10-12일', status: '모집중', img: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '비전을 찾고 뜨겁게 기도하는 청소년 연합 여름 캠프.' },
            { title: '중간고사 응원 이벤트', date: '10월 15일', status: '진행중', img: 'https://images.pexels.com/photos/8612911/pexels-photo-8612911.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '시험 준비에 지친 친구들을 위해 깜짝 간식을 전달합니다.' }
        ]
    },
    youngadults: {
        id: 'youngadults',
        name: '청년부',
        color: '#FA7A55',
        schedule: '주일 오후 1:30',
        location: '소예배실',
        leader: { name: '강현수 전도사', role: '담당 교역자' },
        director: { name: '홍성문 집사', role: '부장' },
        teamTitle: '임원진',
        teachers: ['회장 박현지', '부회장 유현지', '총무 송재두', '회계 임동순', '서기 이예솔'],
        moreTeachersCount: 0,
        events: [
            { title: '청년부 단기선교', date: '1월 15-20일', status: '모집완료', img: 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '동남아시아 지역으로 사랑을 전하러 떠나는 청년부 단기선교.' },
            { title: '새내기 환영회', date: '3월 10일', status: '예정', img: 'https://images.pexels.com/photos/8613071/pexels-photo-8613071.jpeg?auto=compress&cs=tinysrgb&w=800', desc: '대학에 갓 입학한 새내기들을 진심으로 환영하는 시간!' }
        ]
    }
};

const missionData = {
    overseas: {
        id: 'overseas',
        name: '해외선교',
        type: 'table',
        list: [
            { name: '김용대', organization: 'FMB', region: '인도' },
            { name: '송장헌', organization: 'FMB', region: '카자흐스탄' },
            { name: '허미라', organization: 'FMB', region: '필리핀' },
            { name: '이천우', organization: 'FMB', region: '멕시코' },
            { name: '홍현기', organization: 'FMB', region: '잠비아' },
            { name: '정영섭', organization: '우즈벡인 교회 / FMB', region: '김해' },
            { name: '송창근', organization: '중국인 교회 / FMB', region: '대전' }
        ]
    },
    domestic: {
        id: 'domestic',
        name: '국내선교',
        type: 'table',
        list: [
            { name: '오관영', organization: '한 빛', region: '구리' },
            { name: '배완호', organization: '금란', region: '공주' },
            { name: '김갑선', organization: '임천제일', region: '부여' },
            { name: '이병리', organization: '늘사랑', region: '진도' },
            { name: '임동순', organization: 'DFC', region: '대전' }
        ]
    },
    evangelism: {
        id: 'evangelism',
        name: '목요전도팀',
        type: 'evangelism',
        teams: [
            { name: '떡볶이 팀', desc: '떡볶이 및 음료 준비, 출석체크, 안전관리' },
            { name: '어린이 전도팀', desc: '떡볶이데이에 참여한 어린이들과 관계를 맺고 복음을 제시하여 교회로 나올 수 있게 한다' },
            { name: '지역 전도팀', desc: '지역 주민들에게 복음을 전하고 교회를 알리는 역할을 한다' },
            { name: '중보 기도팀', desc: '전도팀을 통해 아름다운 열매가 맺히도록 기도로 돕는다' }
        ],
        schedule: [
            { time: '10:00 ~ 12:00', task: '점심식사 및 떡볶이(초등학생용) 준비' },
            { time: '12:00 ~ 13:00', task: '점심식사' },
            { time: '13:00 ~ 13:30', task: '식사 정리' },
            { time: '13:30 ~ 14:00', task: '전도팀 예배 및 기도회' },
            { time: '14:00 ~', task: '전도 시작(떡볶이 나눔, 어린이 전도, 지역 전도)' }
        ],
        contact: '김정현 목사 010-3358-3579'
    }
};

const seedDataToFirestore = async () => {
    try {
        // 1. Cellgroup (구역 안내)
        const cellgroupCol = collection(db, 'cellgroups');
        for (const [key, value] of Object.entries(cellgroupData)) {
            await setDoc(doc(cellgroupCol, key), value);
        }
        
        // 2. NextGen (다음세대)
        const nextgenCol = collection(db, 'nextgen');
        for (const [key, value] of Object.entries(departmentsData)) {
            await setDoc(doc(nextgenCol, key), value);
        }
        
        // 3. Missions (선교전도)
        const missionsCol = collection(db, 'missions');
        for (const [key, value] of Object.entries(missionData)) {
            await setDoc(doc(missionsCol, key), value);
        }

        console.log("Seeding completed!");
    } catch (error) {
        console.error("Error seeding data:", error);
        throw error;
    }
};

export default seedDataToFirestore;
