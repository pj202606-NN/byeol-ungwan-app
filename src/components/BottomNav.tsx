import './BottomNav.css';

/**
 * 하단 메뉴바 (임시)
 * 앱 프레임(.app-frame) 의 마지막 자식으로 배치되어 항상 프레임 하단에 붙습니다.
 * 실제 메뉴 항목·아이콘은 Figma 디자인 구현 단계에서 교체합니다.
 */
export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      <span className="bottom-nav__placeholder">하단 메뉴 영역 (임시)</span>
    </nav>
  );
}
