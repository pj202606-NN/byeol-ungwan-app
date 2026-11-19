import { useLayoutEffect, useState } from 'react';
import { useRequiredEntryFlow } from '../entry/entryFlow.tsx';
import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import PageHeader from '../components/PageHeader.tsx';
import QuoteBlock from '../components/QuoteBlock.tsx';
import { deepFortune, fortuneHero } from './fortune/fortuneData.ts';
import { getLuckySymbols, luckyHanja } from './fortune/luckySymbols.ts';
import '../components/CircleBadge.css';
import '../components/FeatureLocked.css';
import { fortunePeriods, getFortuneContent, type FortunePeriod } from '../services/fortunes.ts';
import { useSectionNav } from '../utils/useSectionNav.ts';
import './FortunePage.css';

export default function FortunePage() {
  const { constellation, fortuneDate } = useRequiredEntryFlow();
  const [period, setPeriod] = useState<FortunePeriod>('today');
  // 기간·날짜·사용자가 바뀌면 섹션 메뉴와 펼침·스크롤 상태를 함께 초기화한다.
  return <FortunePane key={period + ':' + fortuneDate + ':' + constellation.starId} period={period} onPeriodChange={setPeriod} />;
}

function FortunePane({ period, onPeriodChange }: { period: FortunePeriod; onPeriodChange: (period: FortunePeriod) => void }) {
  const { constellation, fortuneDate } = useRequiredEntryFlow();
  const hero = constellation;
  const luckySymbols = getLuckySymbols(constellation.id);
  const content = getFortuneContent(constellation.starId, fortuneDate, period);
  const analysis = period === 'analysis';
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (key: string) => open[key] !== false;
  const { activeKey, goTo, rootRef, sectionRef, itemRef } = useSectionNav(content.sections.map((section) => section.key), {
    stickySelectors: ['.page-header', '.fortune-tabs', '.fortune-chips'],
  });
  useLayoutEffect(() => {
    rootRef.current?.closest('.app-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
  }, [rootRef]);

  return (
    <div className={analysis ? 'fortune fortune--analysis' : 'fortune'} ref={rootRef}>
      <PageHeader title="별자리 운세" sticky />
      <div className="fortune-tabs" role="tablist" aria-label="운세 기간">
        {fortunePeriods.map((tab) => (
          <button key={tab.key} type="button" role="tab" aria-selected={period === tab.key} className="fortune-tabs__tab" onClick={() => onPeriodChange(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <section className="fortune-hero" aria-label="나의 별자리">
        <p className="fortune-hero__name">{hero.name} <span>{hero.hanja}</span></p>
        <ConstellationFigure className="fortune-hero__figure" graphicKey={constellation.graphicKey}
          viewBox="105 225 185 180" stars={fortuneHero.stars} lines={fortuneHero.lines} lineWidth={1.6} />
        <p className="fortune-hero__meta">
          <span>{hero.alias}</span>
          <span className="fortune-hero__period">{hero.period}</span>
        </p>
      </section>

      <div className="fortune-sheet">
        <QuoteBlock className="fortune-quote" label={content.label} lines={[content.summary]} footer={content.footer} />
        <hr className="fortune-divider" />
        <nav className="fortune-chips" aria-label={analysis ? '별자리 분석 항목 바로가기' : '운세 분류 바로가기'}>
          {content.sections.map((section) => (
            <button key={section.key} ref={itemRef(section.key)} type="button" className="fortune-chips__chip"
              aria-current={activeKey === section.key ? 'true' : undefined}
              aria-controls={'fortune-section-' + section.key} onClick={() => goTo(section.key)}>
              {section.label}
            </button>
          ))}
        </nav>
        <div className="fortune-categories">
          {content.sections.map((section) => (
            <section key={section.key} id={'fortune-section-' + section.key} ref={sectionRef(section.key)} className="fortune-category">
              <h2 className="fortune-category__head">
                <button type="button" className="fortune-category__toggle" aria-expanded={isOpen(section.key)}
                  aria-controls={'fortune-' + section.key} onClick={() => setOpen((previous) => ({ ...previous, [section.key]: !isOpen(section.key) }))}>
                  {section.label}
                  <Chevron direction={isOpen(section.key) ? 'up' : 'down'} size={10} className="fortune-category__chevron" />
                </button>
              </h2>
              <p id={'fortune-' + section.key} className="fortune-category__body" hidden={!isOpen(section.key)}>{section.body}</p>
            </section>
          ))}
        </div>

        {!analysis && (
          <>
            {/* 별자리별 기본 데이터의 행운 상징을 사전과 공유한다. */}
            <section className="fortune-lucky">
              <h2 className="fortune-lucky__title">행운의 상징</h2>
              <ul className="fortune-lucky__list">
                {luckySymbols.map((symbol) => (
                  <li key={symbol.label}>
                    <span className="fortune-lucky__image circle-badge" aria-hidden="true">{luckyHanja(symbol.kind, symbol.value)}</span>
                    <span className="fortune-lucky__label">{symbol.label}</span>
                    <span className="fortune-lucky__value">{symbol.value || '—'}</span>
                  </li>
                ))}
              </ul>
            </section>
            <hr className="fortune-divider fortune-divider--lucky" />
            <QuoteBlock className="fortune-advice" label={period === 'today' ? '오늘의 조언' : period === 'month' ? '이달의 조언' : '올해의 조언'} lines={[content.advice]} />

            {/* 심화 영역은 기존의 흐린 잠금 표시 그대로 유지한다. */}
            <section className="fortune-deep feature-locked" aria-label={deepFortune.title}>
              <div className="fortune-deep__blurred feature-locked__content" aria-hidden="true">
                <p className="fortune-deep__blurred-title">{deepFortune.blurredTitle}</p>
                {deepFortune.blurredBody.map((line, index) => <p key={index}>{line}</p>)}
              </div>
              <div className="fortune-deep__notice feature-locked__notice">
                <p className="fortune-deep__title">{deepFortune.title}</p>
                <p className="fortune-deep__desc">{deepFortune.lines.map((line) => <span key={line}>{line}</span>)}</p>
                <button type="button" className="fortune-deep__link">{deepFortune.link} <Chevron direction="right" size={6} /></button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
