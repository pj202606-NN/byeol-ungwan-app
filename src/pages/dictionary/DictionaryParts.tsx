import type { ReactNode } from 'react';
import { Link } from 'react-router';
import Chevron from '../../components/Chevron.tsx';
import Icon from '../../components/Icon.tsx';
import type { Constellation, DictionaryTabId } from './dictionaryData.ts';
import { dictionaryTabs, glossary, searchPlaceholder } from './dictionaryData.ts';
import './DictionaryParts.css';

/**
 * 별자리 사전 공통 요소 — 08_04 사전 메인, 08_04_01 방위 상세, 08_04_02 별자리 상세(초안)에서 반복
 */

/** 상단 탭: 전체 / 청룡 / 현무 / 백호 / 주작 */
export function DictionaryTabs({ active, onSelect }: { active: DictionaryTabId; onSelect: (id: DictionaryTabId) => void }) {
  return (
    <div className="dict-tabs" role="tablist" aria-label="방위">
      {dictionaryTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className="dict-tabs__tab"
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** 위쪽 소개: 작은 제목 · 이름 + 한자 · 정보 줄 · 오른쪽 보조 (자세히 보기 / 기간 등) */
export function DictionaryHero({ label, name, hanja, meta, aside }: { label: string; name: string; hanja?: string; meta: string[]; aside?: ReactNode }) {
  return (
    <section className="dict-hero" aria-label={label}>
      <p className="dict-hero__label">{label}</p>
      <p className="dict-hero__name">
        {name}
        {hanja && <span>{hanja}</span>}
      </p>
      <div className="dict-hero__row">
        <p className="dict-hero__meta">{meta.join(' · ')}</p>
        {aside}
      </div>
    </section>
  );
}

/** 별자리 검색 (밑줄 입력칸 + 돋보기) — ⏳ 검색 동작 미확정 */
export function DictionarySearch() {
  return (
    <div className="dict-search">
      <input type="search" className="dict-search__input" placeholder={searchPlaceholder} aria-label="별자리 검색" enterKeyHint="search" />
      <Icon name="search" size={19} className="dict-search__icon" />
    </div>
  );
}

/**
 * 별자리 카드: 이미지 자리 + 이름 · 별칭
 * to 가 있으면(상세 데이터가 있는 별자리) 개별 별자리 상세(08_04_02)로 이동, 없으면 표시만
 */
export function ConstellationCard({ item, to, backTo }: { item: Constellation; to?: string; backTo?: string }) {
  const body = (
    <>
      {/* 카드 이미지 자리 — 에셋 미제공 */}
      <div className="dict-card__image" aria-hidden="true" />
      <p className="dict-card__name">
        {item.name}
        {item.alias && <span>{item.alias}</span>}
      </p>
    </>
  );
  if (to) {
    return (
      <Link to={to} state={{ backTo }} className="dict-card dict-card--link" data-constellation-id={item.id}>
        {body}
      </Link>
    );
  }
  return (
    <article className="dict-card" data-constellation-id={item.id}>
      {body}
    </article>
  );
}

/** 용어 사전 (2열 카드) — ⏳ 용어 설명 화면·이동 방식 미확정 */
export function DictionaryGlossary({ className }: { className?: string }) {
  return (
    <section className={`dictionary-section dictionary-glossary${className ? ` ${className}` : ''}`} aria-labelledby="dict-title-glossary">
      <h2 id="dict-title-glossary" className="dictionary-section__head dictionary-glossary__title">
        {glossary.title}
      </h2>
      <p className="dictionary-section__sub">{glossary.subtitle}</p>
      <ul className="dictionary-glossary__list">
        {glossary.items.map((g) => (
          <li key={g.id} className="dictionary-glossary__item">
            <span className="dictionary-glossary__term">{g.term}</span>
            <span className="dictionary-glossary__summary">{g.summary}</span>
            <Chevron direction="right" size={7} className="dictionary-glossary__chevron" />
          </li>
        ))}
      </ul>
    </section>
  );
}
