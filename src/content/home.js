// 메인 랜딩페이지 카피 (docs/home_spec.md §2)
// 문구는 여기서만 수정하면 됩니다.

export const hero = {
    // 방문 시각에 따라 바뀌는 인사. 각 줄은 한 박자 쉬고 차례로 나타남.
    // from: 시작 시각(0~23시). 해당 시각부터 다음 항목 시작 전까지 사용.
    headlines: [
        { from: 5, lines: ['오늘 하루도,', '천천히 시작해요.'] },
        { from: 11, lines: ['바쁜 하루 사이,', '잠깐 쉬어가요.'] },
        { from: 17, lines: ['오늘 하루,', '많이 애쓰셨죠.'] },
        { from: 22, lines: ['늦은 밤까지,', '수고 많으셨어요.'] },
    ],
    sub: '잠시 쉬어가도 괜찮은 곳이 있어요.\n아무것도 준비하지 않고, 그냥 오셔도 됩니다.',
    primaryCta: { label: '천천히 둘러보기', targetId: 'mind-rest' },
    secondaryCta: { label: '이번 주 예배 시간 보기', to: '/guide' },
};
