export const CHURCH_COORDS = { lat: 36.4475294, lng: 127.4236487 };

const AREA_COORDS = {
    '중리동 방향': { lat: 36.3635, lng: 127.4294 },
    '송강동 방향': { lat: 36.4361, lng: 127.3986 },
    '갈마동 방향': { lat: 36.3475, lng: 127.3718 },
    '신탄진 교회 주변': { lat: 36.4495, lng: 127.4270 }, // 교회가 아닌 주변 지역 핀을 위해 살짝 이격
    '목상동 방향': { lat: 36.4485, lng: 127.4087 }
};

export const shuttleSchedules = [
    {
        id: 'dawn',
        name: '새벽예배',
        routes: [
            { id: 'dawn-1', area: '중리동 방향', ...AREA_COORDS['중리동 방향'], carNum: '6937', time: '04:00~05:00', driver: '김정현' },
            { id: 'dawn-2', area: '송강동 방향', ...AREA_COORDS['송강동 방향'], carNum: '4922', time: '04:00~05:00', driver: '김윤섭' }
        ]
    },
    {
        id: 'sunday2',
        name: '주일2부예배',
        routes: [
            { id: 'sun2-1', area: '중리동 방향', ...AREA_COORDS['중리동 방향'], carNum: '6937', time: '09:20~09:40', driver: '배정관' },
            { id: 'sun2-2', area: '송강동 방향', ...AREA_COORDS['송강동 방향'], carNum: '3522', time: '09:20~09:40', driver: '박희우' },
            { id: 'sun2-3', area: '갈마동 방향', ...AREA_COORDS['갈마동 방향'], carNum: '9746', time: '09:20~09:40', driver: '허은준' },
            { id: 'sun2-4', area: '신탄진 교회 주변', ...AREA_COORDS['신탄진 교회 주변'], carNum: '4922', time: '09:20~09:40', driver: '안중열' }
        ]
    },
    {
        id: 'sundayAfternoon',
        name: '주일오후예배',
        routes: [
            { id: 'sunAft-1', area: '중리동 방향', ...AREA_COORDS['중리동 방향'], carNum: '3522', time: '15:00~16:30', driver: '허은준' },
            { id: 'sunAft-2', area: '송강동 방향', ...AREA_COORDS['송강동 방향'], carNum: '4922', time: '15:00~16:30', driver: '김윤섭' },
            { id: 'sunAft-3', area: '갈마동 방향', ...AREA_COORDS['갈마동 방향'], carNum: '6937', time: '15:00~16:30', driver: '이병구' }
        ]
    },
    {
        id: 'nextgen',
        name: '교회학교',
        routes: [
            { id: 'nextgen-1', area: '신탄진 교회 주변', ...AREA_COORDS['신탄진 교회 주변'], carNum: '6937', time: '08:20~09:00', driver: '정영봉' },
            { id: 'nextgen-2', area: '목상동 방향', ...AREA_COORDS['목상동 방향'], carNum: '9746', time: '08:20~09:00', driver: '안병은' },
            { id: 'nextgen-3', area: '송강동 방향', ...AREA_COORDS['송강동 방향'], carNum: '3522', time: '08:20~09:00', driver: '박찬명' }
        ]
    },
    {
        id: 'wednesday',
        name: '수요예배',
        routes: [
            { id: 'wed-1', area: '중리동 방향', ...AREA_COORDS['중리동 방향'], carNum: '6937', time: '17:30~18:20', driver: '김정현' },
            { id: 'wed-2', area: '송강동 방향', ...AREA_COORDS['송강동 방향'], carNum: '3522', time: '17:30~18:10', driver: '김윤섭' }
        ]
    }
];
