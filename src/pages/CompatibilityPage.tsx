import { useRef, useState } from 'react';
import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import Icon from '../components/Icon.tsx';
import PageHeader from '../components/PageHeader.tsx';
import QuoteBlock from '../components/QuoteBlock.tsx';
import CompatibilitySelector from './compatibility/CompatibilitySelector.tsx';
import {
  exampleResults,
  lockedNotice,
  myConstellation,
  resultSectionKeys,
} from './compatibility/compatibilityData.ts';
import { useSectionNav } from '../utils/useSectionNav.ts';
import './CompatibilityPage.css';

/**
 * 08_02 오늘의 궁합 — 한 페이지 안의 세 가지 상태
 *  1) 선택 전 (08_02_compatibility.png)
 *  2) 상대 별자리 선택 하단 시트 (08_02_01_compatibility-selector.png)
 *  3) 선택 후 결과 (08_02_02_compatibility-result.png)
 * 결과는 디자인 시안의 예시('항수')만 있음 — 다른 별자리는 이름만 표시하고 결과는 만들지 않음
 */
export default function CompatibilityPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [frame, setFrame] = useState<Element | null>(null); // 시트가 열려 있으면 시트를 띄울 앱 프레임
  const triggerRef = useRef<HTMLButtonElement>(null);

  const result = selectedId ? exampleResults[selectedId] : undefined;
  const selectedName = selectedId?.split(':')[1];

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(resultSectionKeys.map((k) => [k, true])),
  );
  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const { activeKey, goTo, rootRef, sectionRef, itemRef } = useSectionNav(resultSectionKeys, { stickySelectors: [] });

  const openSelector = () => setFrame(triggerRef.current?.closest('.app-frame') ?? null);
  const closeSelector = () => setFrame(null);
  const select = (id: string) => {
    setSelectedId(id);
    closeSelector();
  };

  return (
    <div className="compat" ref={rootRef}>
      <div className="compat-top">
        {/* 디자인 시안에 ‹ 없음 — 별자리 메뉴바의 ← 로 홈 이동 */}
        <PageHeader title="오늘의 궁합" showBack={false} />

        <p className="compat-question">
          오늘, <strong>두 별자리의 인연</strong>은 어떨까요?
        </p>

        <div className="compat-pair">
          {/* 나 */}
          <div className="compat-side">
            <p className="compat-side__label">나</p>
            <ConstellationFigure
              className="compat-side__figure"
              viewBox="50 148 96 96"
              stars={myConstellation.stars}
              lines={myConstellation.lines}
              lineWidth={0.6}
            />
            <p className="compat-side__name">
              {myConstellation.name} <span>{myConstellation.hanja}</span>
            </p>
            <p className="compat-side__sub">{myConstellation.alias}</p>
          </div>

          <Icon name="compatibility" size={20} className="compat-pair__icon" />

          {/* 상대방 — 누르면 선택 시트 */}
          <button
            ref={triggerRef}
            type="button"
            className="compat-side compat-side--partner"
            aria-haspopup="dialog"
            aria-expanded={frame !== null}
            onClick={openSelector}
          >
            <span className="compat-side__label">상대방</span>
            {result ? (
              <>
                <ConstellationFigure
                  className="compat-side__figure"
                  viewBox="248 148 96 96"
                  stars={result.partner.stars}
                  lines={result.partner.lines}
                  lineWidth={0.6}
                />
                <span className="compat-side__name">
                  {result.partner.name} <span>{result.partner.hanja}</span>
                </span>
                <span className="compat-side__sub">{result.partner.alias}</span>
              </>
            ) : (
              <>
                <span className="compat-side__ring" aria-hidden="true" />
                <span className="compat-side__select">
                  {selectedName ?? '상대 별자리 선택'}
                  <Chevron direction="right" size={6} className="compat-side__chevron" />
                </span>
                <span className="compat-side__sub">탭하여 고르기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 본문 판 ── */}
      <div className="compat-sheet">
        {result ? (
          <>
            <QuoteBlock
              className="compat-quote"
              label={result.quote.label}
              lines={result.quote.lines}
              footer={result.quote.date}
            />

            <hr className="compat-divider compat-divider--result" />

            <nav className="compat-chips" aria-label="궁합 풀이 바로가기">
              {result.sections.map((s) => (
                <button
                  key={s.key}
                  ref={itemRef(s.key as (typeof resultSectionKeys)[number])}
                  type="button"
                  className="compat-chips__chip"
                  aria-current={activeKey === s.key ? 'true' : undefined}
                  aria-controls={`compat-section-${s.key}`}
                  onClick={() => goTo(s.key as (typeof resultSectionKeys)[number])}
                >
                  {s.label}
                </button>
              ))}
            </nav>

            <div className="compat-sections">
              {result.sections.map((s) => (
                <section
                  key={s.key}
                  id={`compat-section-${s.key}`}
                  ref={sectionRef(s.key as (typeof resultSectionKeys)[number])}
                  className="compat-section"
                >
                  <h2 className="compat-section__head">
                    <button
                      type="button"
                      className="compat-section__toggle"
                      aria-expanded={open[s.key]}
                      aria-controls={`compat-body-${s.key}`}
                      onClick={() => toggle(s.key)}
                    >
                      {s.label}
                      <Chevron direction={open[s.key] ? 'up' : 'down'} size={10} className="compat-section__chevron" />
                    </button>
                  </h2>
                  <div id={`compat-body-${s.key}`} className="compat-section__body" hidden={!open[s.key]}>
                    {s.body && <p>{s.body}</p>}
                    {s.bullets && (
                      <ul>
                        {s.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="compat-guide">
              상대의 별자리를 선택해 <strong>궁합을 확인</strong>해 보세요!
            </p>

            <hr className="compat-divider" />

            {/* 선택 전: 흐리게 가린 풀이 + 안내 */}
            <section className="compat-locked" aria-label={lockedNotice.title}>
              <div className="compat-locked__blurred" aria-hidden="true">
                <p className="compat-locked__blurred-title">상세 풀이</p>
                <p>계절이 이웃한 별자리끼리의 만남입니다. 변화의 시기를 함께 통과하는 인연으로, 각자의 시간을 인정할 때 관계가 깊어집니다.</p>
              </div>
              <div className="compat-locked__notice">
                <p className="compat-locked__title">{lockedNotice.title}</p>
                <p className="compat-locked__desc">
                  {lockedNotice.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              </div>
            </section>
          </>
        )}
      </div>

      {frame && (
        <CompatibilitySelector
          container={frame}
          myName={myConstellation.name}
          selectedId={selectedId}
          onSelect={select}
          onClose={closeSelector}
        />
      )}
    </div>
  );
}
