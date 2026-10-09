import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import PageHeader from '../components/PageHeader.tsx';
import { directionInfo, directionTabs, ranking } from './ranking/rankingData.ts';
import './RankingPage.css';

/**
 * 08_01 별자리 순위 — figma-reference/08_01_ranking.png (393 × 852)
 * 별자리 영역 화면 (별자리 전용 메뉴바 '순위')
 * 데이터는 디자인 시안 예시 값. 미확정(표시만): 방위 탭 전환
 * 확정: › = 사전의 개별 별자리 상세로 이동 (상세 화면 구현 시 연결), 그라데이션 = 나의 별자리
 */
export default function RankingPage() {
  return (
    <div className="ranking">
      <PageHeader
        title="오늘의 순위"
        right={
          // 가로 '별운관' 로고 자리 — 에셋 미제공 (site-logo.svg 는 세로 로고)
          <span className="ranking-logo" role="img" aria-label="별운관" />
        }
      />

      <div className="ranking-tabs" role="tablist" aria-label="방위">
        {directionTabs.map((tab, i) => (
          <button key={tab} type="button" role="tab" aria-selected={i === 0} className="ranking-tabs__tab">
            {tab}
          </button>
        ))}
      </div>

      <div className="ranking-info">
        <span>{directionInfo.label}</span>
        <span>{directionInfo.date}</span>
      </div>

      <ol className="ranking-list">
        {ranking.map((item, i) => (
          <li key={item.rank} className={`ranking-item${item.mine ? ' is-mine' : ''}${i < 3 ? ' is-top' : ''}`}>
            <span className="ranking-item__rank">{item.rank}</span>
            <ConstellationFigure
              className="ranking-item__figure"
              viewBox="60 -20 40 40"
              stars={item.stars}
              lines={item.lines}
              lineWidth={0.45}
              halo={false}
            />
            <div className="ranking-item__text">
              <p className="ranking-item__name">
                {item.name}
                <span className="ranking-item__hanja">{item.hanja}</span>
                {item.mine && <span className="ranking-item__mine">· 나의 별자리</span>}
              </p>
              <p className="ranking-item__desc">{item.desc}</p>
            </div>
            {/* 사전의 개별 별자리 상세로 이동 (확정) — 상세 화면 구현 시 연결 */}
            <Chevron direction="right" size={7} className="ranking-item__chevron" />
          </li>
        ))}
      </ol>
    </div>
  );
}
