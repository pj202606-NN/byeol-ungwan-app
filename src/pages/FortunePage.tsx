import { useState } from 'react';
import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import PageHeader from '../components/PageHeader.tsx';
import QuoteBlock from '../components/QuoteBlock.tsx';
import {
  adviceQuote,
  deepFortune,
  fortuneCategories,
  fortuneHero,
  fortuneTabs,
  luckySymbols,
  todayQuote,
} from './fortune/fortuneData.ts';
import { useSectionNav } from '../utils/useSectionNav.ts';
import './FortunePage.css';

const categoryKeys = fortuneCategories.map((c) => c.key);

/**
 * 06 운세 — figma-reference/06_fortune.png (393 × 2252)
 * 데이터는 디자인 시안 예시 값. 상단 기간 탭·설정 바로가기는 동작 미확정이라 표시만.
 * 분류 칩: 누르면 해당 섹션으로 이동, 스크롤 위치에 따라 선택 칩이 바뀜.
 */

export default function FortunePage() {
  // 분류별 섹션 펼침 상태 (디자인: 모두 펼친 상태 + ︿ 표시)
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(fortuneCategories.map((c) => [c.key, true])),
  );
  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  // 분류 칩: 누르면 섹션 이동 + 스크롤 위치에 따라 선택 (고정 영역 아래 24 기준)
  const { activeKey, goTo, rootRef, sectionRef, itemRef } = useSectionNav(categoryKeys, {
    stickySelectors: ['.page-header', '.fortune-tabs', '.fortune-chips'],
  });

  return (
    <div className="fortune" ref={rootRef}>
      <PageHeader title="별자리 운세" sticky />

      <div className="fortune-tabs" role="tablist" aria-label="운세 기간">
        {fortuneTabs.map((tab, i) => (
          <button key={tab} type="button" role="tab" aria-selected={i === 0} className="fortune-tabs__tab">
            {tab}
          </button>
        ))}
      </div>

      {/* ── 오늘의 별자리 띠 ── */}
      <section className="fortune-hero" aria-label="오늘의 별자리">
        <p className="fortune-hero__name">
          {fortuneHero.name} <span>{fortuneHero.hanja}</span>
        </p>
        <ConstellationFigure
          className="fortune-hero__figure"
          viewBox="105 225 185 180"
          stars={fortuneHero.stars}
          lines={fortuneHero.lines}
          lineWidth={1.6}
        />
        <p className="fortune-hero__meta">
          <span>{fortuneHero.alias}</span>
          <span className="fortune-hero__period">{fortuneHero.period}</span>
        </p>
      </section>

      {/* ── 본문 판 ── */}
      <div className="fortune-sheet">
        <QuoteBlock
          className="fortune-quote"
          label={todayQuote.label}
          lines={todayQuote.lines}
          footer={todayQuote.date}
        />

        <hr className="fortune-divider" />

        <nav className="fortune-chips" aria-label="운세 분류 바로가기">
          {fortuneCategories.map((c) => (
            <button
              key={c.key}
              ref={itemRef(c.key)}
              type="button"
              className="fortune-chips__chip"
              aria-current={activeKey === c.key ? 'true' : undefined}
              aria-controls={`fortune-section-${c.key}`}
              onClick={() => goTo(c.key)}
            >
              {c.label}
            </button>
          ))}
        </nav>

        <div className="fortune-categories">
          {fortuneCategories.map((c) => (
            <section
              key={c.key}
              id={`fortune-section-${c.key}`}
              ref={sectionRef(c.key)}
              className="fortune-category"
            >
              <h2 className="fortune-category__head">
                <button
                  type="button"
                  className="fortune-category__toggle"
                  aria-expanded={open[c.key]}
                  aria-controls={`fortune-${c.key}`}
                  onClick={() => toggle(c.key)}
                >
                  {c.label}
                  <Chevron direction={open[c.key] ? 'up' : 'down'} size={10} className="fortune-category__chevron" />
                </button>
              </h2>
              <p id={`fortune-${c.key}`} className="fortune-category__body" hidden={!open[c.key]}>
                {c.body.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </p>
            </section>
          ))}
        </div>

        <section className="fortune-lucky">
          <h2 className="fortune-lucky__title">행운의 상징</h2>
          <ul className="fortune-lucky__list">
            {luckySymbols.map((s) => (
              <li key={s.label}>
                {/* 상징 이미지 자리 (디자인 시안도 빈 원) */}
                <span className="fortune-lucky__image" aria-hidden="true" />
                <span className="fortune-lucky__label">{s.label}</span>
                <span className="fortune-lucky__value">{s.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="fortune-divider fortune-divider--lucky" />

        <QuoteBlock className="fortune-advice" label={adviceQuote.label} lines={adviceQuote.lines} />

        {/* ── 심화 운세 (출생 시각 입력 전: 흐리게 가림) ── */}
        <section className="fortune-deep" aria-label={deepFortune.title}>
          <div className="fortune-deep__blurred" aria-hidden="true">
            <p className="fortune-deep__blurred-title">{deepFortune.blurredTitle}</p>
            {deepFortune.blurredBody.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div className="fortune-deep__notice">
            <p className="fortune-deep__title">{deepFortune.title}</p>
            <p className="fortune-deep__desc">
              {deepFortune.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            {/* 이동 위치(마이 > 설정) 미구현 — 표시만 */}
            <button type="button" className="fortune-deep__link">
              {deepFortune.link} <Chevron direction="right" size={6} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
