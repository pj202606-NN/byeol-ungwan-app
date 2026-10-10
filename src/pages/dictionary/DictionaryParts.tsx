import type { ReactNode } from 'react';
import Icon from '../../components/Icon.tsx';
import type { Constellation, DictionaryTabId } from './dictionaryData.ts';
import { dictionaryTabs, searchPlaceholder } from './dictionaryData.ts';
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
 * ⏳ 누르면 개별 별자리 상세(08_04_02)로 이동 예정 — 상세 화면이 생기면 dictionaryPaths.constellation(id) 로 연결
 */
export function ConstellationCard({ item }: { item: Constellation }) {
  return (
    <article className="dict-card" data-constellation-id={item.id}>
      {/* 카드 이미지 자리 — 에셋 미제공 */}
      <div className="dict-card__image" aria-hidden="true" />
      <p className="dict-card__name">
        {item.name}
        {item.alias && <span>{item.alias}</span>}
      </p>
    </article>
  );
}
