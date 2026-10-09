import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import Icon from '../components/Icon.tsx';
import ObservationChart from '../components/ObservationChart.tsx';
import PageHeader from '../components/PageHeader.tsx';
import { chartLabel, exploreHero, observationRows, positionRows } from './explore/exploreData.ts';
import './ExplorePage.css';

/**
 * 08_03 별자리 탐색 — figma-reference/08_03_explore.png (393 × 1579)
 * 별자리 영역의 첫 화면 (기본 메뉴바 '별자리' → 이 화면 + 별자리 전용 메뉴바)
 * 데이터는 디자인 시안 예시 값. 미확정(표시만): 새로고침 동작, 겉보기 등급 ?, '내 위치 수정하기'
 */
export default function ExplorePage() {
  return (
    <div className="explore">
      <div className="explore-top">
        <ConstellationFigure
          className="explore-top__figure"
          viewBox="0 78 393 340"
          stars={exploreHero.stars}
          lines={exploreHero.lines}
        />
        <PageHeader title="별자리 탐색" />

        <section className="explore-where" aria-label="현재 위치">
          <p className="explore-where__label">
            <strong>{exploreHero.name}</strong>의 현재 위치
          </p>
          <p className="explore-where__direction">{exploreHero.direction}</p>
          <p className="explore-where__time">{exploreHero.datetime}</p>
          {/* 새로고침 — 실제 위치 다시 계산하는 동작은 미확정 (모양만) */}
          <button type="button" className="explore-where__ring" aria-label="현재 위치 새로고침">
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

        {/* 이동 위치(위치 설정) 미확정 — 표시만 */}
        <button type="button" className="explore-link">
          내 위치 수정하기 <Chevron direction="right" size={6} />
        </button>

        <section className="explore-map">
          <h2 className="explore-map__title">관측 지도</h2>
          <div className="explore-map__card">
            {/* 홈 관측 지도와 같은 좌표를 카드 비율(329×342)에 맞춰 크게: 중심 (210, 246) 기준 */}
            <ObservationChart
              className="explore-map__chart"
              label={chartLabel}
              viewBox="1 28.75 418 434.5"
              labelSize={17}
            />
          </div>
        </section>

        <dl className="explore-rows explore-rows--observe">
          {observationRows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>
                {row.value}
                {row.help && (
                  // 도움말 내용·동작 미확정 — 표시만
                  <span className="explore-help" aria-hidden="true">
                    ?
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
