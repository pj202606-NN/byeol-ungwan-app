const cardImages = import.meta.glob<string>('../assets/images/constellations/cards/*/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** 기존 앱 ID yu는 카드 파일명 ryu와 연결한다. 두 위수는 방위까지 구분한다. */
export function getConstellationCard(direction: string, graphicKey: string): string {
  const path = `../assets/images/constellations/cards/${direction}/${graphicKey}.webp`;
  const image = cardImages[path];
  if (!image) throw new Error(`별자리 카드 이미지가 없습니다: ${direction}/${graphicKey}`);
  return image;
}
