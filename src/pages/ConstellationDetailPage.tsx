import { useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { useRequiredEntryFlow } from '../entry/entryFlow.tsx';
import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import ConstellationCardArt from '../components/ConstellationCardArt.tsx';
import { constellationCardFocus } from '../components/constellationCardFocus.ts';
import PageHeader from '../components/PageHeader.tsx';
import { getLuckySymbols, luckyHanja } from './fortune/luckySymbols.ts';
import '../components/CircleBadge.css';
import { DictionaryGlossary, DictionaryHero, DictionaryTabs } from './dictionary/DictionaryParts.tsx';
import {
  constellationDetails,
  dictionaryPaths,
  directionDetails,
  directions,
  findConstellation,
  type DictionaryTabId,
  type InfoRow,
} from './dictionary/dictionaryData.ts';
import './ConstellationDetailPage.css';

/**
 * 08_04_02 개별 별자리 상세 — figma-reference/08_04_02_constellation-detail_draft.png (초안, 393 × 2961)
 * 별자리 ID(/constellations/dictionary/constellation/:id)에 따라 데이터만 바꿔 표시하는 공통 화면
 * 28개 고유 ID에 공통 상세 구조를 적용. 잘못된 ID → 사전 메인
 * ‹ : 들어온 화면(사전 메인 · 방위 상세)으로, 직접 접속이면 사전 메인으로
 * ⏳ 미확정(표시만): 겉보기 등급 ?, 용어
 */
export default function ConstellationDetailPage() {
  const { constellation } = useRequiredEntryFlow();
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const isOpen = (key: string) => open[key] !== false; // 초안: 모두 펼친 상태
  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !isOpen(key) }));

  const item = findConstellation(id);
  const detail = constellationDetails[id];
  if (!item || !detail) return <Navigate to={dictionaryPaths.main} replace />;

  const direction = directions.find((d) => d.id === item.direction)!;
  const isMine = item.id === constellation.id;

  // 들어온 화면(사전 메인 · 방위 상세)이 기록에 있으면 뒤로, 없으면(직접 접속) 사전 메인으로 교체
  const backTo = (location.state as { backTo?: string } | null)?.backTo;
  const goTo = (path: string) => {
    if (backTo === path) navigate(-1);
    else navigate(path, { replace: true });
  };
  const goBack = () => goTo(backTo ?? dictionaryPaths.main);

  // 탭: '전체' → 사전 메인, 방위 → 방위 상세(상세 데이터가 있는 방위만)
  const selectTab = (tab: DictionaryTabId) => {
    if (tab === 'all') goTo(dictionaryPaths.main);
    else if (directionDetails[tab]) goTo(dictionaryPaths.direction(tab));
  };

  return (
    <div className="constellation">
      <div className="constellation-top">
        <ConstellationFigure className="constellation-top__figure" graphicKey={item.id === 'yu' ? 'ryu' : item.id} scale={1.6} offsetY={-15} viewBox="0 41 393 360" stars={detail.stars} lines={detail.lines} />
        <PageHeader title="별자리 사전" onBack={goBack} />
        <DictionaryTabs active={item.direction} onSelect={selectTab} />

        <DictionaryHero
          // 내 별자리가 아닐 때의 작은 제목은 디자인 없음 — 방위 상세와 같은 '○방 7수' 를 임시로 사용
          label={isMine ? '내 별자리' : direction.moreLabel}
          name={item.name}
          hanja={item.hanja}
          meta={detail.meta}
          aside={<span className="constellation-period">{detail.period}</span>}
        />
      </div>

      {/* ── 본문 판 ── */}
      <div className="constellation-sheet">
        {/* 기본 정보 */}
        <Section id="basic" title="기본 정보" open={isOpen('basic')} onToggle={() => toggle('basic')}>
          {/* 이미지 자리 — 에셋 미제공 */}
          <div className="constellation-image">
            <ConstellationCardArt src={item.image} alt={`${item.name} · ${item.alias}`} position={`center ${constellationCardFocus[item.id]}%`} />
          </div>
          <InfoRows rows={detail.basicInfo} />
          <ul className="constellation-traits" aria-label="특징">
            {detail.traits.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {detail.zodiac.text && <>
            <p className="constellation-zodiac__title">{detail.zodiac.title}</p>
            <p className="constellation-zodiac__text">{detail.zodiac.text}</p>
          </>}
        </Section>

        {/* 설명 · 성격과 특징 · 전통적 의미 · 설화 */}
        {detail.sections.map((s) => (
          <Section key={s.key} id={s.key} title={s.title} open={isOpen(s.key)} onToggle={() => toggle(s.key)}>
            <div className="constellation-text">
              {s.paragraphs.map((lines, i) => (
                <p key={i}>
                  {lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              ))}
            </div>
          </Section>
        ))}

        {/* 관측 정보 */}
        <Section id="observation" title="관측 정보" open={isOpen('observation')} onToggle={() => toggle('observation')}>
          <InfoRows rows={detail.observation} />
          {isMine && (
            // 내 별자리의 현재 위치 = 08_03 탐색 (2026-10-10 결정)
            <Link to="/constellations/explore" className="constellation-location">
              내 별자리 관측 정보 보러 가기 <Chevron direction="right" size={7} />
            </Link>
          )}
        </Section>

        {/* 행운의 상징 */}
        <section className="constellation-lucky" aria-labelledby="constellation-lucky-title">
          <h2 id="constellation-lucky-title" className="constellation-lucky__title">
            행운의 상징
          </h2>
          <ul className="constellation-lucky__list">
            {getLuckySymbols(item.id).map((l) => (
              <li key={l.label}>
                <span className="constellation-lucky__image circle-badge" aria-hidden="true">{luckyHanja(l.kind, l.value)}</span>
                <span className="constellation-lucky__label">{l.label}</span>
                <span className="constellation-lucky__value">{l.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <DictionaryGlossary className="constellation-glossary" />
      </div>
    </div>
  );
}

/** 접고 펼치는 섹션 (제목 + ︿) */
function Section({ id, title, open, onToggle, children }: { id: string; title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className="constellation-section">
      <h2 className="constellation-section__head">
        <button type="button" className="constellation-section__toggle" aria-expanded={open} aria-controls={`constellation-${id}`} onClick={onToggle}>
          {title}
          <Chevron direction={open ? 'up' : 'down'} size={10} className="constellation-section__chevron" />
        </button>
      </h2>
      <div id={`constellation-${id}`} className="constellation-section__body" hidden={!open}>
        {children}
      </div>
    </section>
  );
}

/** 이름 / 값 표 (기본 정보 · 관측 정보) */
function InfoRows({ rows }: { rows: InfoRow[] }) {
  return (
    <dl className="constellation-rows">
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>
            {r.value}
            {/* 설명 내용·동작 미확정 */}
            {r.help && <span className="constellation-help" aria-hidden="true">?</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
