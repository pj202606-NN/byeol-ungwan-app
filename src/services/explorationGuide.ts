import { getObservationInformation } from './observationInformation.ts';

/** Fixed experiential examples from exploreData.ts, never calculated sky positions. */
export const explorationPosition = {
  kind: 'example' as const,
  source: 'src/pages/explore/exploreData.ts · 기존 탐색 시안',
  azimuth: '243°', altitude: '31°', status: '지평선 위',
  direction: '남서쪽 하늘', location: '충청북도 청주시 청원구 우암동',
  recommendedLocation: '남쪽 하늘',
  point: [113, 290] as [number, number],
};

export function getExplorationGuide(starId: number) {
  const info = getObservationInformation(starId);
  const western = info.verificationStatus.westernConstellation === 'source-conflict-needs-review' ? null : info.westernConstellation;
  return {
    position: explorationPosition,
    magnitude: { kind: 'static' as const, value: `${info.dashboardMagnitude}등급`, source: info.dataSource.dashboardMagnitude },
    timing: { kind: 'static' as const, value: info.recommendedMonth, source: info.dataSource.recommendedMonth },
    recommendedLocation: { kind: 'example' as const, value: explorationPosition.recommendedLocation, source: explorationPosition.source },
    area: { kind: 'static' as const, value: [western, info.representativeStar].filter(Boolean).join(' · '), source: info.dataSource.representativeStar },
  };
}
