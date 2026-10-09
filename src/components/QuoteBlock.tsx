import type { ReactNode } from 'react';
import './QuoteBlock.css';

interface QuoteBlockProps {
  /** 위쪽 작은 제목 (예: 오늘의 운세) */
  label?: string;
  /** 본문 줄 (포인트 폰트) */
  lines: string[];
  /** 아래쪽 보조 정보 (예: 9월 26일 · 토) */
  footer?: ReactNode;
  className?: string;
}

/**
 * 왼쪽 세로선이 있는 인용 블록
 * 06 운세(오늘의 운세·오늘의 조언), 07 기록 등에서 반복되는 형태
 */
export default function QuoteBlock({ label, lines, footer, className }: QuoteBlockProps) {
  return (
    <blockquote className={className ? `quote-block ${className}` : 'quote-block'}>
      {label && <p className="quote-block__label">{label}</p>}
      <p className="quote-block__text">
        {lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
      {footer && <p className="quote-block__footer">{footer}</p>}
    </blockquote>
  );
}
