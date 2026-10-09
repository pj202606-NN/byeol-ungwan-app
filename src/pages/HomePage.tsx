import { useRef } from 'react';
import { useNavigate } from 'react-router';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import Icon from '../components/Icon.tsx';
import ObservationChart from '../components/ObservationChart.tsx';
import SectionHeader from '../components/SectionHeader.tsx';
import {
  compatibilityLegend,
  compatibilityPicks,
  dictionaryCards,
  directions,
  exploreInfo,
  homeTabs,
  pastDays,
  ranking,
  todayFortune,
  todayHero,
} from './home/homeData.ts';
import { useSectionNav } from '../utils/useSectionNav.ts';
import { useWheelToHorizontal } from '../utils/useWheelToHorizontal.ts';
import './HomePage.css';

const sectionKeys = homeTabs.map((t) => t.key);

/**
 * 05 홈 — figma-reference/05_home.png (393 × 2569)
 * 데이터는 디자인 시안 예시 값(home/homeData.ts). 버튼·탭의 이동 동작은 미확정이라 연결하지 않음.
 */
export default function HomePage() {
  const navigate = useNavigate();
  // 별자리 사전 카드 줄: PC 는 페이지 끝에서 마우스 휠로 넘기기 (모바일·태블릿은 손가락 슬라이드)
  const dictCardsRef = useRef<HTMLUListElement>(null);
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
          viewBox="0 0 393 494"
          stars={todayHero.stars}
          lines={todayHero.lines}
        />

        <header className="home-hero__bar">
          {/* 프로필 이미지 자리 (디자인 시안도 단색 원) */}
          <span className="home-hero__avatar" aria-hidden="true" />
          <p className="home-hero__date">{todayHero.dateLabel}</p>
          {/* 공유 기능은 미확정 — 아이콘·배치만 */}
          <button type="button" className="home-hero__share" aria-label="공유하기">
            <Icon name="share" size={18} />
          </button>
        </header>

        <div className="home-hero__title">
          <h1 className="home-hero__name">
            {todayHero.name} <span className="home-hero__hanja">{todayHero.hanja}</span>
          </h1>
          <p className="home-hero__meta">{todayHero.meta.join(' · ')}</p>
        </div>
      </section>

      {/* ── 오늘의 운세 한 줄 ── */}
      <section className="home-today" aria-label="오늘의 운세">
        <p className="home-today__lead">{todayFortune.lead}</p>
        <p className="home-today__text">
          {todayFortune.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <button type="button" className="home-today__link" onClick={() => navigate('/fortune')}>
          운세 자세히 보러 가기 &gt;
        </button>
      </section>

      <hr className="home-divider" />

      {/* ── 지난 운세 ── */}
      <section className="home-section home-past">
        <SectionHeader title="지난 운세" subtitle="날짜를 눌러 기록을 확인하세요" />
        <ol className="home-past__days">
          {pastDays.map((d) => (
            <li key={d.day}>
              <button type="button" className={`home-past__day home-past__day--${d.tone}`}>
                <span className="home-past__weekday">{d.weekday}</span>
                <span className="home-past__num">{d.day}</span>
              </button>
            </li>
          ))}
        </ol>
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
        <SectionHeader title="오늘의 운세 순위" showMore />
        <ol className="home-ranking__list">
          {ranking.map((r, i) => (
            <li key={r.rank} className={`home-ranking__row${i === 0 ? ' is-first' : ''}`}>
              <span className="home-ranking__rank">{r.rank}</span>
              <span className="home-ranking__name">
                {r.name} <span className="home-ranking__hanja">{r.hanja}</span>
              </span>
              <span className="home-ranking__score">{r.score}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 별자리 궁합 ── */}
      <section id="home-section-compat" ref={sectionRef('compat')} className="home-section home-compat">
        <SectionHeader title="별자리 궁합" subtitle="어떤 별자리가 당신과 가장 잘 맞을까요?" showMore />
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
            {compatibilityPicks.map((name, i) => (
              <li key={i}>
                {/* 별자리 이미지 자리 (디자인 시안도 빈 원) */}
                <span className="home-compat__image" aria-hidden="true" />
                <span className="home-compat__name">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 별자리 탐색 ── */}
      <section id="home-section-explore" ref={sectionRef('explore')} className="home-section home-explore">
        <SectionHeader title="별자리 탐색" subtitle="당신의 별자리는 지금 어느 곳에 있을까요?" />
        <div className="home-explore__body">
          <div className="home-explore__card">
            <ObservationChart className="home-explore__chart" label={exploreInfo.chartLabel} />
          </div>
          <div className="home-explore__info">
            <p className="home-explore__name">
              {exploreInfo.name} <span>{exploreInfo.hanja}</span>
            </p>
            <dl className="home-explore__rows">
              {exploreInfo.rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
            <button type="button" className="home-explore__more">
              더보기 <span className="home-explore__chevron" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* ── 별자리 사전 ── */}
      <section id="home-section-dict" ref={sectionRef('dict')} className="home-section home-dict">
        <SectionHeader title="별자리 사전" />
        <div className="home-dict__directions" role="tablist" aria-label="방위">
          {directions.map((d, i) => (
            <button key={d} type="button" role="tab" aria-selected={i === 0} className="home-dict__direction">
              {d}
            </button>
          ))}
        </div>
        <ul className="home-dict__cards" ref={dictCardsRef}>
          {dictionaryCards.map((c, i) => (
            <li key={`${c.name}-${i}`} className="home-dict__item">
              {/* 별자리 카드 이미지 자리 (디자인 시안도 빈 카드) */}
              <div className="home-dict__card">{c.period && <span>{c.period}</span>}</div>
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
