import catalog from '../data/constellations/catalog.json';

type CatalogObservation = (typeof catalog)[number]['observation'];
export type ObservationInformation = Omit<CatalogObservation, 'rightAscension' | 'declination' | 'apparentMagnitude'> & {
  starId: number; id: string; name: string; hanja: string; sashin: string; animal: string;
  rightAscension: number | null; declination: number | null; apparentMagnitude: number | null;
};

/** Stage 1: source-backed project information, independent of coordinate calculations. */
export const observationInformation: ObservationInformation[] = catalog.map(({ starId, id, name, hanja, sashin, animal, observation }) => ({
  starId, id, name, hanja, sashin, animal, ...observation,
}));

export function getObservationInformation(starId: number) {
  const info = observationInformation.find(row => row.starId === starId);
  if (!info) throw new RangeError('관측 정보의 별자리 ID를 확인해 주세요.');
  return info;
}

/** Dashboard calls this apparent magnitude; its astronomical definition is unverified. */
export function observationInfoRows(starId: number) {
  const info = getObservationInformation(starId);
  return [
    { label: '거성', value: info.representativeStar ?? '자료 준비 중' },
    { label: '대표 관측 계절', value: info.observationSeason ?? '자료 준비 중' },
    { label: '최적 관측 시기', value: info.recommendedMonth ?? '자료 준비 중' },
    { label: '관련 서양 별자리', value: info.verificationStatus.westernConstellation === 'source-conflict-needs-review' ? '자료 확인 중' : info.westernConstellation ?? '자료 준비 중' },
    { label: '밝기 안내 등급', value: info.dashboardMagnitude == null ? '자료 준비 중' : `${info.dashboardMagnitude}등급 · 대시보드 기준` },
    { label: '관측 설명', value: info.observationDescription ?? '자료 준비 중' },
    { label: '관측 계절 안내', value: info.verificationStatus.westernConstellation === 'source-conflict-needs-review' ? '원문 자료의 서양 별자리 표기를 확인하고 있습니다.' : info.keyringObservationDescription },
    { label: '자료 안내', value: '프로젝트 자료와 대시보드의 관측 안내입니다. 거성·등급의 천문학적 검증 및 현재 위치 계산은 별도로 진행합니다.' },
  ];
}
