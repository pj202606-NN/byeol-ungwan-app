import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router';
import { useRequiredEntryFlow } from '../entry/entryFlow.tsx';
import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import Icon from '../components/Icon.tsx';
import PageHeader from '../components/PageHeader.tsx';
import QuoteBlock from '../components/QuoteBlock.tsx';
import CompatibilitySelector from './compatibility/CompatibilitySelector.tsx';
import { COMPATIBILITY_READING_MS, lockedNotice, pairFigure } from './compatibility/compatibilityData.ts';
import { compatibilitySectionKeys, getCompatibility, type CompatibilityResult } from '../services/compatibility.ts';
import { useSectionNav } from '../utils/useSectionNav.ts';
import './CompatibilityPage.css';

export default function CompatibilityPage() {
  const { constellation } = useRequiredEntryFlow();
  const location = useLocation();
  const [selection, setSelection] = useState<{ id: number | null; turn: number }>(() => {
    const candidate = (location.state as { partnerId?: unknown } | null)?.partnerId;
    return { id: typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 1 && candidate <= 28 ? candidate : null, turn: 0 };
  });
  const [revealed, setRevealed] = useState<string | null>(null);
  const [frame, setFrame] = useState<Element | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const result = selection.id === null ? null : getCompatibility(constellation.starId, selection.id);
  const readingKey = constellation.starId + ':' + selection.id + ':' + selection.turn;
  const phase = !result ? 'idle' : revealed === readingKey ? 'ready' : 'connecting';

  useEffect(() => {
    if (selection.id === null) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setRevealed(readingKey), reduced ? 0 : COMPATIBILITY_READING_MS);
    return () => window.clearTimeout(timer);
  }, [readingKey, selection.id]);

  const select = (id: number) => {
    setSelection((current) => ({ id, turn: current.turn + 1 }));
    setFrame(null);
  };

  return (
    <div className="compat" data-phase={phase} style={{ '--compat-reading-duration': `${COMPATIBILITY_READING_MS}ms` } as CSSProperties}>
      <div className="compat-top">
        <PageHeader title="오늘의 궁합" showBack={false} />
        <p className="compat-question">오늘, <strong>두 별자리의 인연</strong>은 어떨까요?</p>
        <div className="compat-pair">
          <div className="compat-side">
            <p className="compat-side__label">나</p>
            <ConstellationFigure className="compat-side__figure" graphicKey={constellation.graphicKey}
              viewBox={pairFigure.viewBox} stars={pairFigure.stars} lines={pairFigure.lines} />
            <p className="compat-side__name">{constellation.name} <span>{constellation.hanja}</span></p>
            <p className="compat-side__sub">{constellation.alias}</p>
          </div>
          <Icon name="compatibility" size={20} className="compat-pair__icon" />
          {phase === 'connecting' && <CompatibilityWeave key={readingKey} />}
          <button ref={triggerRef} type="button" className="compat-side compat-side--partner"
            aria-haspopup="dialog" aria-expanded={frame !== null}
            aria-label={result ? result.partner.alias + ' 선택됨, 상대 별자리 변경' : '상대 별자리 선택'}
            disabled={phase === 'connecting'}
            onClick={() => setFrame(triggerRef.current?.closest('.app-frame') ?? null)}>
            <span className="compat-side__label">상대방</span>
            {result ? (
              <>
                <ConstellationFigure className="compat-side__figure" graphicKey={result.partner.graphicKey}
                  viewBox={pairFigure.viewBox} stars={pairFigure.stars} lines={pairFigure.lines} />
                <span className="compat-side__name">{result.partner.name} <span>{result.partner.hanja}</span></span>
                <span className="compat-side__sub">{result.partner.alias}</span>
              </>
            ) : (
              <>
                <span className="compat-side__ring" aria-hidden="true" />
                <span className="compat-side__select">상대 별자리 선택<Chevron direction="right" size={6} className="compat-side__chevron" /></span>
                <span className="compat-side__sub">탭하여 고르기</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="compat-sheet">
        {phase === 'ready' && result ? (
          <CompatibilityResultPanel key={readingKey} result={result} />
        ) : phase === 'connecting' ? (
          <div className="compat-reading" role="status" aria-live="polite">
            <p>두 별자리의 인연을 맺고 있어요.</p>
            <span>별과 별 사이, 인연을 살피는 중</span>
          </div>
        ) : (
          <>
            <p className="compat-guide">상대의 별자리를 선택해 <strong>궁합을 확인</strong>해 보세요!</p>
            <hr className="compat-divider" />
            <section className="compat-locked" aria-label={lockedNotice.title}>
              <div className="compat-locked__blurred" aria-hidden="true">
                <p className="compat-locked__blurred-title">상세 풀이</p>
                <p>두 별자리의 성향과 서로에게 필요한 배려를 살펴봅니다. 별자리마다 다른 인연의 이야기가 펼쳐집니다.</p>
              </div>
              <div className="compat-locked__notice">
                <p className="compat-locked__title">{lockedNotice.title}</p>
                <p className="compat-locked__desc">{lockedNotice.lines.map((line) => <span key={line}>{line}</span>)}</p>
              </div>
            </section>
          </>
        )}
      </div>
      {frame && <CompatibilitySelector container={frame} myName={constellation.name}
        selectedId={selection.id} onSelect={select} onClose={() => setFrame(null)} />}
    </div>
  );
}

function CompatibilityWeave() {
  const gradientId = useId();
  return (
    <svg className="compat-weave" viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor="#fff5d9" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fff5d9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="compat-weave__arrival">
        <circle cx="18" cy="120" r="2.4" fill="#dfd5bb" />
        <circle cx="222" cy="120" r="2.4" fill="#9cb7cd" />
        <path className="compat-weave__lead" pathLength="1" d="M18 120 Q31 111 44 120" />
        <path className="compat-weave__lead compat-weave__lead--blue" pathLength="1" d="M222 120 Q209 129 196 120" />
      </g>
      <g className="compat-weave__orbit">
        <circle className="compat-weave__guide" cx="120" cy="120" r="76" />
        <path className="compat-weave__arc" pathLength="1" d="M44 120 A76 76 0 0 1 196 120" />
        <path className="compat-weave__arc compat-weave__arc--blue" pathLength="1" d="M196 120 A76 76 0 0 1 44 120" />
        <circle className="compat-weave__mote" cx="120" cy="44" r="2" />
        <circle className="compat-weave__mote compat-weave__mote--blue" cx="120" cy="196" r="2" />
      </g>
      <g className="compat-weave__knot">
        <circle className="compat-weave__thread" pathLength="1" cx="120" cy="120" r="54" />
        <circle className="compat-weave__thread compat-weave__thread--blue" pathLength="1" cx="120" cy="120" r="43" />
      </g>
      <circle className="compat-weave__glow" cx="120" cy="120" r="37" fill={'url(#' + gradientId + ')'} />
      <circle className="compat-weave__star" cx="120" cy="120" r="2.5" />
    </svg>
  );
}

function CompatibilityResultPanel({ result }: { result: CompatibilityResult }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (key: string) => open[key] !== false;
  const { activeKey, goTo, rootRef, sectionRef, itemRef } = useSectionNav(compatibilitySectionKeys, { stickySelectors: [] });
  useEffect(() => { rootRef.current?.focus({ preventScroll: true }); }, [rootRef]);

  return (
    <div className="compat-result" ref={rootRef} tabIndex={-1} role="region" aria-label="궁합 결과">
      <QuoteBlock className="compat-quote" label={result.partner.alias + '와의 궁합'}
        lines={[result.title]} footer={result.relation + ' · 궁합도 ' + result.score + '점'} />
      <hr className="compat-divider compat-divider--result" />
      <nav className="compat-chips" aria-label="궁합 풀이 바로가기">
        {result.sections.map((section) => (
          <button key={section.key} ref={itemRef(section.key)} type="button" className="compat-chips__chip"
            aria-current={activeKey === section.key ? 'true' : undefined}
            aria-controls={'compat-section-' + section.key} onClick={() => goTo(section.key)}>
            {section.label}
          </button>
        ))}
      </nav>
      <div className="compat-sections">
        {result.sections.map((section) => (
          <section key={section.key} id={'compat-section-' + section.key} ref={sectionRef(section.key)} className="compat-section">
            <h2 className="compat-section__head">
              <button type="button" className="compat-section__toggle" aria-expanded={isOpen(section.key)}
                aria-controls={'compat-body-' + section.key}
                onClick={() => setOpen((current) => ({ ...current, [section.key]: !isOpen(section.key) }))}>
                {section.label}<Chevron direction={isOpen(section.key) ? 'up' : 'down'} size={10} className="compat-section__chevron" />
              </button>
            </h2>
            <div id={'compat-body-' + section.key} className="compat-section__body" hidden={!isOpen(section.key)}><p>{section.body}</p></div>
          </section>
        ))}
      </div>
    </div>
  );
}
