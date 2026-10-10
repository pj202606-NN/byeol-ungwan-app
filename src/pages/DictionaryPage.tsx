import { useState } from 'react';
import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import PageHeader from '../components/PageHeader.tsx';
import { ConstellationCard, DictionaryHero, DictionarySearch, DictionaryTabs } from './dictionary/DictionaryParts.tsx';
import {
  constellationsOf,
  directions,
  glossary,
  myConstellation,
  type DictionaryTabId,
} from './dictionary/dictionaryData.ts';
import './DictionaryPage.css';

/**
 * 08_04 별자리 사전 메인 — figma-reference/08_04_dictionary.png (393 × 2830)
 * 별자리 영역 화면 (별자리 전용 메뉴바 '사전')
 * ⏳ 미확정(표시만): 방위 탭 선택 후 화면 변화, 검색, 자세히 보기·카드·용어 → 상세 화면 이동
 */
export default function DictionaryPage() {
  // 방위 탭: 선택 표시만 (선택 후 화면 변화는 미확정 — 초안상 방위 상세 08_04_01 로 이어질 가능성)
  const [tab, setTab] = useState<DictionaryTabId>('all');

  // 방위 섹션 접고 펼치기 (디자인: 모두 펼친 상태 + ︿ 표시)
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(directions.map((d) => [d.id, true])));
  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="dictionary">
      <div className="dictionary-top">
        {/* 홈과 같은 별자리 좌표 — 보여 주는 영역만 위로 41 이동 */}
        <ConstellationFigure
          className="dictionary-top__figure"
          viewBox="0 41 393 360"
          stars={myConstellation.stars}
          lines={myConstellation.lines}
        />
        <PageHeader title="별자리 사전" />
        <DictionaryTabs active={tab} onSelect={setTab} />

        <DictionaryHero
          label={myConstellation.label}
          name={myConstellation.name}
          hanja={myConstellation.hanja}
          meta={myConstellation.meta}
          aside={
            // ⏳ 내 별자리 상세(08_04_02)로 이동 예정 — 상세 화면 구현 시 연결
            <span className="dictionary-more">
              자세히 보기 <Chevron direction="right" size={6} />
            </span>
          }
        />
      </div>

      {/* ── 본문 판 ── */}
      <div className="dictionary-sheet">
        <DictionarySearch />

        {directions.map((d) => (
          <section key={d.id} className="dictionary-section" aria-labelledby={`dict-title-${d.id}`}>
            <h2 className="dictionary-section__head">
              <button
                type="button"
                id={`dict-title-${d.id}`}
                className="dictionary-section__toggle"
                aria-expanded={open[d.id]}
                aria-controls={`dict-grid-${d.id}`}
                onClick={() => toggle(d.id)}
              >
                {d.title}
                <Chevron direction={open[d.id] ? 'up' : 'down'} size={10} className="dictionary-section__chevron" />
              </button>
            </h2>
            <p className="dictionary-section__sub">{d.subtitle}</p>

            <div id={`dict-grid-${d.id}`} className="dictionary-grid" hidden={!open[d.id]}>
              {constellationsOf(d.id).map((c) => (
                <ConstellationCard key={c.id} item={c} />
              ))}
              {/* ⏳ 방위 상세(08_04_01)로 이동 예정 — dictionaryPaths.direction(id) */}
              <p className="dictionary-grid__more">
                <span>{d.moreLabel}</span>
                <span>자세히</span>
                <span>
                  {/* 좁은 화면에서도 › 가 혼자 다음 줄로 내려가지 않도록 '가기 ›' 를 묶음 */}
                  보러 <span className="dictionary-grid__more-last">가기<Chevron direction="right" size={9} className="dictionary-grid__more-chevron" /></span>
                </span>
              </p>
            </div>
          </section>
        ))}

        {/* ── 용어 사전 ── */}
        <section className="dictionary-section dictionary-glossary" aria-labelledby="dict-title-glossary">
          <h2 id="dict-title-glossary" className="dictionary-section__head dictionary-glossary__title">
            {glossary.title}
          </h2>
          <p className="dictionary-section__sub">{glossary.subtitle}</p>
          <ul className="dictionary-glossary__list">
            {glossary.items.map((g) => (
              // ⏳ 용어 설명 화면·이동 방식 미확정
              <li key={g.id} className="dictionary-glossary__item">
                <span className="dictionary-glossary__term">{g.term}</span>
                <span className="dictionary-glossary__summary">{g.summary}</span>
                <Chevron direction="right" size={7} className="dictionary-glossary__chevron" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
