import { useState } from 'react';
import { useRequiredEntryFlow } from '../entry/entryFlow.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import PageHeader from '../components/PageHeader.tsx';
import { formatFortuneDate, getDirectionRanking, rankingDirections, type FortuneDirection } from '../services/fortunes.ts';
import './RankingPage.css';

export default function RankingPage() {
  const { constellation, fortuneDate } = useRequiredEntryFlow();
  const [direction, setDirection] = useState<FortuneDirection>(constellation.direction);
  const ranking = getDirectionRanking(direction, fortuneDate);
  const selectedDirection = rankingDirections.find((item) => item.id === direction)!;
  return (
    <div className="ranking">
      <PageHeader title="오늘의 순위" right={<span className="ranking-logo" role="img" aria-label="별운관" />} />
      <div className="ranking-tabs" role="tablist" aria-label="방위">
        {rankingDirections.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={direction === tab.id} className="ranking-tabs__tab" onClick={() => setDirection(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ranking-info"><span>{selectedDirection.meta}</span><span>{formatFortuneDate(fortuneDate)}</span></div>
      <ol className="ranking-list">
        {ranking.map((item, index) => (
          <li key={item.id} className={'ranking-item' + (constellation.id === item.id ? ' is-mine' : '') + (index < 3 ? ' is-top' : '')}>
            <span className="ranking-item__rank">{item.rank}</span>
            <ConstellationFigure className="ranking-item__figure" graphicKey={item.graphicKey} viewBox="0 0 40 40"
              stars={[{ x: 5, y: 5, r: 1 }, { x: 35, y: 35, r: 1 }]} lines={[]} halo={false} />
            <div className="ranking-item__text">
              <p className="ranking-item__name">
                {item.name}<span className="ranking-item__hanja">{item.hanja}</span>
                {constellation.id === item.id && <span className="ranking-item__mine">· 나의 별자리</span>}
              </p>
              <p className="ranking-item__desc">{item.flow} · {item.compact}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
