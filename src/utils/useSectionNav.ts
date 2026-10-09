import { useCallback, useEffect, useRef, useState } from 'react';

interface SectionNavOptions {
  /** 페이지 안의 고정(sticky) 요소 선택자 — 이 요소들의 아래 끝을 기준으로 현재 섹션을 판단 */
  stickySelectors: string[];
  /** 고정 영역 아래로 남기는 여백 (CSS scroll-margin-top 의 여백과 같은 값) */
  gap?: number;
}

/**
 * 섹션 바로가기 메뉴 (홈 상단 메뉴, 운세 분류 버튼 등)
 * - goTo(key): 해당 섹션으로 부드럽게 스크롤 (섹션의 CSS scroll-margin-top 만큼 띄움)
 * - activeKey: 스크롤 위치에 따라 현재 보고 있는 섹션
 * - 선택된 버튼이 버튼 줄 밖에 있으면 버튼 줄만 가로로 스크롤 (세로 스크롤은 건드리지 않음)
 */
export function useSectionNav<K extends string>(keys: readonly K[], { stickySelectors, gap = 24 }: SectionNavOptions) {
  const [activeKey, setActiveKey] = useState<K>(keys[0]);
  const rootRef = useRef<HTMLDivElement>(null);
  const sections = useRef<Partial<Record<K, HTMLElement | null>>>({});
  const items = useRef<Partial<Record<K, HTMLElement | null>>>({});
  const lockUntil = useRef(0); // 버튼으로 이동하는 동안에는 스크롤 위치로 선택을 바꾸지 않음

  const sectionRef = useCallback((key: K) => (el: HTMLElement | null) => {
    sections.current[key] = el;
  }, []);
  const itemRef = useCallback((key: K) => (el: HTMLElement | null) => {
    items.current[key] = el;
  }, []);

  const goTo = useCallback((key: K) => {
    setActiveKey(key);
    lockUntil.current = Date.now() + 900;
    sections.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // 스크롤할 때 고정 영역 바로 아래에 걸린 섹션을 선택
  useEffect(() => {
    const scroller = rootRef.current?.closest('.app-scroll');
    if (!scroller) return;
    const onScroll = () => {
      if (Date.now() < lockUntil.current) return;
      const stickyBottom = Math.max(
        scroller.getBoundingClientRect().top,
        ...stickySelectors.map((s) => rootRef.current?.querySelector(s)?.getBoundingClientRect().bottom ?? 0),
      );
      // 섹션 제목이 고정 영역 근처(여백 + 48)까지 올라오면 그 섹션으로 판단
      const line = stickyBottom + gap + 48;
      let current = keys[0];
      for (const key of keys) {
        const el = sections.current[key];
        if (el && el.getBoundingClientRect().top <= line) current = key;
      }
      // 페이지 끝에 닿으면 (마지막 섹션이 위까지 못 올라오는 경우) 화면에 보이는 마지막 섹션을 선택
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) {
        const last = keys[keys.length - 1];
        const el = sections.current[last];
        if (el && el.getBoundingClientRect().top < scroller.getBoundingClientRect().bottom) current = last;
      }
      setActiveKey(current);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
    // 선택자·키 목록은 페이지마다 고정 값이라 처음 한 번만 등록
  }, []);

  // 선택된 버튼이 버튼 줄 밖에 있으면 버튼 줄만 가로로 스크롤
  useEffect(() => {
    const item = items.current[activeKey];
    const row = item?.parentElement;
    if (!item || !row) return;
    const c = item.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    if (c.left < r.left) row.scrollBy({ left: c.left - r.left - 20, behavior: 'smooth' });
    else if (c.right > r.right) row.scrollBy({ left: c.right - r.right + 20, behavior: 'smooth' });
  }, [activeKey]);

  return { activeKey, goTo, rootRef, sectionRef, itemRef };
}
