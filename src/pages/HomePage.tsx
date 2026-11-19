import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRequiredEntryFlow } from '../entry/entryFlow.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import Icon from '../components/Icon.tsx';
import ProfileAvatar from '../components/ProfileAvatar.tsx';
import HomeMessage from '../components/HomeMessage.tsx';
import ConstellationCardArt from '../components/ConstellationCardArt.tsx';
import '../components/CircleBadge.css';
import ObservationChart from '../components/ObservationChart.tsx';
import SectionHeader from '../components/SectionHeader.tsx';
import FortuneDateStrip from '../components/FortuneDateStrip.tsx';
import { formatFortuneDate, getDailyFortune, getDirectionRanking } from '../services/fortunes.ts';
import { getFeaturedCompatibility } from '../services/compatibility.ts';
import { constellationsOf, directions, type DirectionId } from './dictionary/dictionaryData.ts';
import {
  compatibilityLegend,
  homeTabs,
  todayHero,
} from './home/homeData.ts';
import { useSectionNav } from '../utils/useSectionNav.ts';
import { useWheelToHorizontal } from '../utils/useWheelToHorizontal.ts';
import { useReferenceTime } from '../utils/useReferenceTime.ts';
import { getExplorationGuide } from '../services/explorationGuide.ts';
import './HomePage.css';

const sectionKeys = homeTabs.map((t) => t.key);

/**
 * 05 홈 — figma-reference/05_home.png (393 × 2569)
 * 운세·순위·궁합은 확정 JSON, 탐색은 시안의 체험용 위치 예시를 사용한다.
 */
export default function HomePage() {
  const { profile, constellation, fortuneDate, fortuneToday, selectFortuneDate } = useRequiredEntryFlow();
  const daily = getDailyFortune(constellation.starId, fortuneDate);
  const ranking = getDirectionRanking(constellation.direction, fortuneDate).slice(0, 3);
  const hero = constellation;
  const observation = useReferenceTime(60000);
  const guide = getExplorationGuide(constellation.starId);
  const observationRows = [
    { label: '기준 시각 · 한국 시간', value: observation.datetime },
    { label: '방위각', value: `${guide.position.azimuth} · 예시` },
    { label: '고도', value: `${guide.position.altitude} · ${guide.position.status}` },
  ];
  const compatibilityPicks = getFeaturedCompatibility(constellation.starId);
  const navigate = useNavigate();
  // 별자리 사전 카드 줄: PC 는 페이지 끝에서 마우스 휠로 넘기기 (모바일·태블릿은 손가락 슬라이드)
  const dictCardsRef = useRef<HTMLUListElement>(null);
  const [dictionaryDirection, setDictionaryDirection] = useState<DirectionId>('east');
  const dictionaryCards = constellationsOf(dictionaryDirection);
  useWheelToHorizontal(dictCardsRef);
  // 상단 바로가기 메뉴: 누르면 섹션 이동 + 스크롤 위치에 따라 선택
  const { activeKey, goTo, rootRef, sectionRef, itemRef } = useSectionNav(sectionKeys, {
    stickySelectors: ['.home-tabs'],
  });

  return (
    <div className="home" ref={rootRef}>
      {/* ── 상단: 오늘의 별자리 ── */}
      <section className="home-hero" aria-label="오늘의 별자리">
        <div className="home-hero__dome" aria-hidden="true" />
        <ConstellationFigure
          className="home-hero__figure"
          scale={1.9}
          graphicKey={constellation.graphicKey}
          viewBox="0 0 393 494"
          stars={todayHero.stars}
          lines={todayHero.lines}
        />

        <header className="home-hero__bar">
          {/* 공유 기능은 미확정 — 아이콘·배치만 */}
          <button type="button" className="home-hero__share" aria-label="공유하기">
            <Icon name="share" size={18} />
          </button>
          <HomeMessage name={profile.name} />
          {/* 제공된 공통 프로필 이미지 */}
          <ProfileAvatar />
        </header>

        <div className="home-hero__title">
          <h1 className="home-hero__name">
            {hero.name} <span className="home-hero__hanja">{hero.hanja}</span>
          </h1>
          <p className="home-hero__meta">{hero.meta.join(' · ')}</p>
        </div>
      </section>

      {/* ── 오늘의 운세 한 줄 ── */}
      <section className="home-today" aria-label="오늘의 운세">
        <p className="home-today__lead">{fortuneDate === fortuneToday ? '오늘은,' : `${formatFortuneDate(fortuneDate)}은,`}</p>
        <p className="home-today__text" aria-live="polite">{daily.compact}</p>
        <button type="button" className="home-today__link" onClick={() => navigate('/fortune')}>
          운세 자세히 보러 가기 &gt;
        </button>
      </section>

      <hr className="home-divider" />

      {/* ── 지난 운세 ── */}
      <section className="home-section home-past">
        <SectionHeader title="지난 운세" subtitle="날짜를 누르거나 좌우로 밀어 확인하세요" />
        <FortuneDateStrip today={fortuneToday} date={fortuneDate} onSelect={selectFortuneDate} />
      </section>

      <div className="home-band" aria-hidden="true" />

      {/* ── 상단 바로가기 메뉴 (이 위치에 오면 화면 위에 고정) ── */}
      <nav className="home-tabs" aria-label="홈 섹션 바로가기">
        {homeTabs.map((tab) => (
          <button
            key={tab.key}
            ref={itemRef(tab.key)}
            type="button"
            className="home-tabs__tab"
            aria-current={activeKey === tab.key ? 'true' : undefined}
            aria-controls={`home-section-${tab.key}`}
            onClick={() => goTo(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ── 오늘의 운세 순위 ── */}
      <section id="home-section-ranking" ref={sectionRef('ranking')} className="home-section home-ranking">
        <SectionHeader title="오늘의 운세 순위" subtitle={`${constellation.guardian} · ${formatFortuneDate(fortuneDate)}`} showMore onMore={() => navigate('/constellations/ranking')} />
        <ol className="home-ranking__list">
          {ranking.map((r, i) => (
            <li key={r.rank} className={`home-ranking__row${i === 0 ? ' is-first' : ''}`}>
              <span className="home-ranking__rank">{r.rank}</span>
              <span className="home-ranking__name">
                {r.name} <span className="home-ranking__hanja">{r.hanja}</span>
              </span>
              <span className="home-ranking__score">{r.flow}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 별자리 궁합 ── */}
      <section id="home-section-compat" ref={sectionRef('compat')} className="home-section home-compat">
        <SectionHeader title="별자리 궁합" subtitle="어떤 별자리가 당신과 가장 잘 맞을까요?" showMore onMore={() => navigate('/constellations/compatibility')} />
        <div className="home-compat__body">
          <ul className="home-compat__legend">
            {compatibilityLegend.map((label) => (
              <li key={label}>
                <span className="home-compat__dot" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
          <ul className="home-compat__picks">
            {compatibilityPicks.map((pick) => (
              <li key={pick.partner.starId}>
                <button type="button" className="home-compat__pick" title={pick.cardText}
                  aria-label={`${pick.partner.alias} · ${pick.type} ${pick.score}점 궁합 보기`}
                  onClick={() => navigate('/constellations/compatibility', { state: { partnerId: pick.partner.starId } })}>
                  <ConstellationFigure className="home-compat__image circle-badge" graphicKey={pick.partner.graphicKey} viewBox="0 0 100 100"
                    stars={[{ x: 5, y: 5, r: 1 }, { x: 95, y: 95, r: 1 }]} lines={[]} />
                  <span className="home-compat__name">{pick.partner.name}</span>
                  <span className="home-compat__type">{pick.type}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 별자리 탐색 ── */}
      <section id="home-section-explore" ref={sectionRef('explore')} className="home-section home-explore">
        <SectionHeader title="별자리 탐색" subtitle="당신의 별자리는 지금 어느 곳에 있을까요?" />
        <div className="home-explore__body">
          <div className="home-explore__card profile-image">
            <ObservationChart className="home-explore__chart" label={constellation.name} point={guide.position.point} />
          </div>
          <div className="home-explore__info">
            <p className="home-explore__name">
              {constellation.name} <span>{constellation.hanja}</span>
            </p>
            <dl className="home-explore__rows">
              {observationRows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="home-explore__basis">체험용 위치 예시</p>
            <button type="button" className="home-explore__more" onClick={() => navigate('/constellations/explore')}>
              더보기 <span className="home-explore__chevron" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 별자리 사전 ── */}
      <section id="home-section-dict" ref={sectionRef('dict')} className="home-section home-dict">
        <SectionHeader title="별자리 사전" />
        <div className="home-dict__directions" role="tablist" aria-label="방위">
          {directions.map((d) => (
            <button key={d.id} type="button" role="tab" aria-selected={dictionaryDirection === d.id} className="home-dict__direction"
              onClick={() => { setDictionaryDirection(d.id); dictCardsRef.current?.scrollTo({ left: 0 }); }}>
              {d.name}
            </button>
          ))}
        </div>
        <ul className="home-dict__cards" ref={dictCardsRef}>
          {dictionaryCards.map((c) => (
            <li key={c.id} className="home-dict__item" data-constellation-id={c.id}>
              <div className="home-dict__card">
                <ConstellationCardArt src={c.image} alt={`${c.name} · ${c.alias}`} />
                <span>{c.period?.replace('~', ' – ')}</span>
              </div>
              <p className="home-dict__name">
                {c.name} {c.alias && <span>{c.alias}</span>}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
