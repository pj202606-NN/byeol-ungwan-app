import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../components/Icon.tsx';
import { selectorGroups } from './compatibilityData.ts';
import { getCompatibilityStar } from '../../services/compatibility.ts';
import './CompatibilitySelector.css';

interface CompatibilitySelectorProps {
  /** 시트를 띄울 앱 프레임 (메뉴바까지 덮도록 .app-frame 안에 표시) */
  container: Element;
  myName: string;
  /** 같은 이름의 위수도 숫자 ID로 구분 */
  selectedId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 08_02_01 상대 별자리 선택 — 같은 페이지 위에 열리는 하단 시트
 * 닫기: 배경 누르기 · Esc · 위쪽 손잡이 버튼 · 별자리 선택
 * 열려 있는 동안 뒤쪽 화면(본문·메뉴바)은 조작되지 않음(inert), 키보드 포커스는 시트 안에서만 이동
 */
export default function CompatibilitySelector({ container, myName, selectedId, onSelect, onClose }: CompatibilitySelectorProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');

  // 열릴 때: 뒤쪽 화면 비활성 + 시트로 포커스 / 닫힐 때: 원래 상태로 되돌리고 포커스 복귀
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const siblings = Array.from(container.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && !el.classList.contains('compat-selector'),
    );
    siblings.forEach((el) => el.setAttribute('inert', ''));
    sheetRef.current?.focus();
    return () => {
      siblings.forEach((el) => el.removeAttribute('inert'));
      previous?.focus();
    };
  }, [container]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    // Tab 이 시트 밖으로 나가지 않도록
    if (e.key === 'Tab' && sheetRef.current) {
      const nodes = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  // 검색: 별자리 이름에 입력한 글자가 들어 있는 항목만 표시 (동작 미확정 — 기본 동작으로 구현)
  const keyword = query.trim();
  const groups = selectorGroups
    .map((g) => ({ ...g, items: keyword ? g.items.filter((star) => `${star.name} ${star.hanja} ${star.alias}`.includes(keyword)) : g.items }))
    .filter((g) => g.items.length > 0);

  const selectedName = selectedId ? getCompatibilityStar(selectedId).name : undefined;

  return createPortal(
    <div className="compat-selector" onKeyDown={onKeyDown}>
      <div className="compat-selector__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        className="compat-selector__sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button type="button" className="compat-selector__handle" onClick={onClose} aria-label="닫기" />

        <div className="compat-selector__head">
          <h2 id={titleId} className="compat-selector__title">상대 별자리 선택</h2>
          {selectedName && (
            <p className="compat-selector__pair">
              {myName} × {selectedName}
            </p>
          )}
        </div>

        <label className="compat-selector__search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="별자리 이름 검색"
            aria-label="별자리 이름 검색"
            enterKeyHint="search"
          />
          <Icon name="search" size={16} className="compat-selector__search-icon" />
        </label>

        <div className="compat-selector__list">
          {groups.map((g) => (
            <section key={g.key} className="compat-selector__group" aria-label={g.label}>
              <h3 className="compat-selector__group-label">{g.label}</h3>
              <div className="compat-selector__grid">
                {g.items.map((star) => {
                  const id = star.starId;
                  return (
                    <button
                      key={id}
                      type="button"
                      className="compat-selector__option"
                      aria-pressed={selectedId === id}
                      aria-label={`${star.name} ${star.hanja} · ${star.alias}`}
                      data-star-id={id}
                      onClick={() => onSelect(id)}
                    >
                      <span>{star.name}</span>
                      <small>{star.alias}</small>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {groups.length === 0 && <p className="compat-selector__empty">일치하는 별자리가 없습니다.</p>}
        </div>
      </div>
    </div>,
    container,
  );
}
