import { useEffect, type RefObject } from 'react';

/**
 * PC 전용: 마우스 휠(세로)로 가로 카드 줄을 넘기기
 * - 페이지(.app-scroll)가 끝에 닿은 뒤 아래로 휠 → 카드가 오른쪽으로 넘어감
 * - 위로 휠 → 넘긴 카드가 먼저 처음으로 돌아오고, 그다음 페이지가 위로 스크롤
 * - 모바일·태블릿(<html data-device> 가 pc 가 아님)은 손가락 슬라이드 그대로
 * - 트랙패드의 가로 스크롤(deltaX)은 브라우저 기본 동작 그대로
 */
export function useWheelToHorizontal(rowRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const row = rowRef.current;
    const scroller = row?.closest('.app-scroll');
    if (!row || !scroller) return;

    const onWheel = (e: WheelEvent) => {
      if (document.documentElement.dataset.device !== 'pc') return;
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return; // 가로 입력은 기본 동작

      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; // 줄 단위(Firefox) → px
      const maxLeft = row.scrollWidth - row.clientWidth;
      const pageAtEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;

      if (dy > 0 && pageAtEnd && row.scrollLeft < maxLeft - 1) {
        e.preventDefault();
        row.scrollLeft += dy;
      } else if (dy < 0 && row.scrollLeft > 0) {
        e.preventDefault();
        row.scrollLeft += dy;
      }
    };

    row.addEventListener('wheel', onWheel, { passive: false });
    return () => row.removeEventListener('wheel', onWheel);
  }, [rowRef]);
}
