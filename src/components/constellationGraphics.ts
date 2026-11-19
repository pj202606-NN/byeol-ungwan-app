const sources = import.meta.glob<string>('../assets/images/constellations/graphics/**/*.svg', {
  eager: true, query: '?raw', import: 'default',
});

/** 원본 파일을 바꾸지 않고 연결선과 별 좌표를 분리해 공통 효과를 입힌다. */
export const constellationGraphics = Object.fromEntries(Object.entries(sources).map(([path, source]) => {
  const attribute = (tag: string, name: string) => new RegExp(`\\b${name}="([^"]+)"`).exec(tag)?.[1];
  const key = path.split('/').pop()!.replace('.svg', '');
  const viewBox = /viewBox="([^"]+)"/.exec(source)![1];
  const stars = Array.from(source.matchAll(/<circle\b[^>]*>/g), ([tag]) => ({
    x: Number(attribute(tag, 'cx')),
    y: Number(attribute(tag, 'cy')),
    r: Number(attribute(tag, 'r')),
  }));
  const lines = source.replace(/<circle\b[^>]*\/>/g, '');
  const linesUrl = `data:image/svg+xml,${encodeURIComponent(lines)}`;
  return [key, { linesUrl, viewBox, stars }];
}));
