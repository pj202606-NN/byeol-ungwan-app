import { useRequiredEntryFlow } from '../entry/entryFlow.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import Icon from '../components/Icon.tsx';
import ObservationChart from '../components/ObservationChart.tsx';
import PageHeader from '../components/PageHeader.tsx';
import { exploreHero } from './explore/exploreData.ts';
import { useReferenceTime } from '../utils/useReferenceTime.ts';
import { getExplorationGuide } from '../services/explorationGuide.ts';
import { useMapReveal } from '../utils/useMapReveal.ts';
import '../components/ProfileAvatar.css';
import './ExplorePage.css';

/**
 * 08_03 별자리 탐색 — figma-reference/08_03_explore.png (393 × 1579)
 * 별자리 영역의 첫 화면 (기본 메뉴바 '별자리' → 이 화면 + 별자리 전용 메뉴바)
 * 시안의 체험용 위치 예시와 별자리별 안내값을 보여 주며 새로고침은 시각만 갱신한다.
 */
export default function ExplorePage() {
  const { constellation } = useRequiredEntryFlow();
  const observation = useReferenceTime();
  const guide = getExplorationGuide(constellation.starId);
  const mapRef = useMapReveal();
  const positionRows = [
    { label: '방위각', value: guide.position.azimuth },
    { label: '고도', value: guide.position.altitude },
    { label: '관측 상태', value: guide.position.status },
    { label: '기준 위치', value: guide.position.location },
  ];
  const observationRows = [
    { label: '기준 시각', value: observation.datetime },
    { label: '겉보기 등급', value: guide.magnitude.value },
    { label: '최적 관측 시기', value: guide.timing.value },
    { label: '관측 권장 위치', value: guide.recommendedLocation.value },
    { label: '관측 구역', value: guide.area.value },
  ];
  return (
    <div className="explore">
      <div className="explore-top">
        <ConstellationFigure
          className="explore-top__figure"
          graphicKey={constellation.graphicKey}
          scale={1.6}
          offsetY={-40}
          viewBox="0 78 393 340"
          stars={exploreHero.stars}
          lines={exploreHero.lines}
        />
        <PageHeader title="별자리 탐색" />

        <section className="explore-where" aria-label="현재 위치">
          <p className="explore-where__label">
            <strong>{constellation.name}</strong>의 관측 안내
          </p>
          <p className="explore-where__direction">{guide.position.direction}</p>
          <p className="explore-where__time">{observation.datetime}</p>
          {/* Stage 1 refresh updates the clock, never a simulated position. */}
          <button type="button" className="explore-where__ring" aria-label="기준 시각 새로고침" onClick={observation.refresh}>
            <Icon name="refresh" size={15} />
          </button>
        </section>
      </div>

      <div className="explore-sheet">
        <dl className="explore-rows">
          {positionRows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>

        <section className="explore-map">
          <h2 className="explore-map__title">관측 지도</h2>
          <div className="explore-map__card" ref={mapRef}>
            <div className="explore-map__content profile-image">
            {/* 홈 관측 지도와 같은 좌표를 카드 비율(329×342)에 맞춰 크게: 중심 (210, 246) 기준 */}
            <ObservationChart
              className="explore-map__chart"
              label={constellation.name}
              point={guide.position.point}
              viewBox="1 28.75 418 434.5"
              labelSize={17}
            />
            </div>
          </div>
        </section>

        <p className="explore-example-note">위치와 지도는 체험용 예시이며, 밝기와 시기는 관측 안내값입니다.</p>

        <dl className="explore-rows explore-rows--observe">
          {observationRows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
