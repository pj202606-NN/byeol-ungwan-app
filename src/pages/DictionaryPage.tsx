import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useRequiredEntryFlow } from '../entry/entryFlow.tsx';
import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import PageHeader from '../components/PageHeader.tsx';
import { ConstellationCard, DictionaryGlossary, DictionaryHero, DictionarySearch, DictionaryTabs } from './dictionary/DictionaryParts.tsx';
import {
  constellationDetails,
  constellationsOf,
  dictionaryPaths,
  directionDetails,
  directions,
  myConstellation as exampleMyConstellation,
  type DictionaryTabId,
} from './dictionary/dictionaryData.ts';
import './DictionaryPage.css';

/**
 * 08_04 별자리 사전 메인 — figma-reference/08_04_dictionary.png (393 × 2830)
 * 별자리 영역 화면 (별자리 전용 메뉴바 '사전')
 * 방위 탭·자세히 보기 → 해당 방위 상세. 카드 → 28개 공통 별자리 상세.
 * ⏳ 미확정(표시만): 검색, 용어
 */
export default function DictionaryPage() {
  const { constellation } = useRequiredEntryFlow();
  const myConstellation = { ...exampleMyConstellation, ...constellation };
  // 기존 상세 템플릿에 네 방위의 원본 데이터를 연결한다.
  const [tab, setTab] = useState<DictionaryTabId>('all');
  const navigate = useNavigate();
  const selectTab = (id: DictionaryTabId) => {
    if (id !== 'all' && directionDetails[id]) navigate(dictionaryPaths.direction(id), { state: { fromDictionary: true } });
    else setTab(id);
  };

  // 방위 섹션 접고 펼치기 (디자인: 모두 펼친 상태 + ︿ 표시)
  const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(directions.map((d) => [d.id, true])));
  const toggle = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="dictionary">
      <div className="dictionary-top">
        {/* 홈과 같은 별자리 좌표 — 보여 주는 영역만 위로 41 이동 */}
        <ConstellationFigure
          className="dictionary-top__figure"
          graphicKey={constellation.graphicKey}
          viewBox="0 41 393 360"
          stars={myConstellation.stars}
          lines={myConstellation.lines}
        />
        <PageHeader title="별자리 사전" />
        <DictionaryTabs active={tab} onSelect={selectTab} />

        <DictionaryHero
          label={myConstellation.label}
          name={myConstellation.name}
          hanja={myConstellation.hanja}
          meta={myConstellation.meta}
          aside={
            <Link to={dictionaryPaths.constellation(constellation.id)} state={{ backTo: dictionaryPaths.main }} className="dictionary-more">
              자세히 보기 <Chevron direction="right" size={6} />
            </Link>
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
                <ConstellationCard
                  key={c.id}
                  item={c}
                  to={constellationDetails[c.id] ? dictionaryPaths.constellation(c.id) : undefined}
                  backTo={dictionaryPaths.main}
                />
              ))}
              {/* 방위 상세(08_04_01) — 상세 데이터가 있는 방위만 연결 (현재 청룡) */}
              {directionDetails[d.id] ? (
                <Link
                  to={dictionaryPaths.direction(d.id)}
                  state={{ fromDictionary: true }}
                  className="dictionary-grid__more"
                  aria-label={`${d.moreLabel} 자세히 보러 가기`}
                >
                  <MoreLabel label={d.moreLabel} />
                </Link>
              ) : (
                <p className="dictionary-grid__more">
                  <MoreLabel label={d.moreLabel} />
                </p>
              )}
            </div>
          </section>
        ))}

        <DictionaryGlossary />
      </div>
    </div>
  );
}

/** 8번째 칸 글자: '동방 7수 / 자세히 / 보러 가기 ›' */
function MoreLabel({ label }: { label: string }) {
  return (
    <>
      <span>{label}</span>
      <span>자세히</span>
      <span>
        {/* 좁은 화면에서도 › 가 혼자 다음 줄로 내려가지 않도록 '가기 ›' 를 묶음 */}
        보러 <span className="dictionary-grid__more-last">가기<Chevron direction="right" size={9} className="dictionary-grid__more-chevron" /></span>
      </span>
    </>
  );
}
