import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** '더보기 +' 표시 여부 (이동 동작은 미확정) */
  showMore?: boolean;
}

/** 섹션 제목 + 부제 + 더보기 — 홈의 '지난 운세', '오늘의 운세 순위', '별자리 궁합' 등에서 공통 사용 */
export default function SectionHeader({ title, subtitle, showMore }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div className="section-header__text">
        <h2 className="section-header__title">{title}</h2>
        {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
      </div>
      {showMore && (
        <button type="button" className="section-header__more">
          더보기 <span aria-hidden="true">+</span>
        </button>
      )}
    </div>
  );
}
