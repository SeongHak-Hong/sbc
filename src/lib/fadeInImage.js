// 큰 배경 사진은 다 받은 뒤 한 번에 나타나게 한다.
// (느린 회선에서 위에서부터 띠 모양으로 그려지는 '블라인드' 현상을 가린다. 스타일은 src/index.css 의 img[data-fade-in])
// 사용: <img {...fadeInImage} src={...} />
export const fadeInImage = {
    'data-fade-in': '',
    onLoad: (event) => {
        event.currentTarget.dataset.loaded = '';
    },
};
