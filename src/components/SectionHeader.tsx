import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** '더보기 +' 표시 여부. 이동은 onMore로 연결한다. */
  showMore?: boolean;
  onMore?: () => void;
}

/** 섹션 제목 + 부제 + 더보기 — 홈의 '지난 운세', '오늘의 운세 순위', '별자리 궁합' 등에서 공통 사용 */
export default function SectionHeader({ title, subtitle, showMore, onMore }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header__text">
        <h2 className="section-header__title">{title}</h2>
        {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
      </div>
      {showMore && (
        <button type="button" className="section-header__more" onClick={onMore}>
          더보기 <span aria-hidden="true">+</span>
        </button>
      )}
    </div>
  );
}
