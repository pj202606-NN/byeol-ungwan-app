import './Chevron.css';

interface ChevronProps {
  direction: 'up' | 'down' | 'left' | 'right';
  /** 한 변 길이(px) */
  size?: number;
  className?: string;
}

/** 얇은 꺾쇠 (︿ ﹀ 〈 〉) — 테두리 두 변을 회전해 그림. 색은 currentColor */
export default function Chevron({ direction, size = 8, className }: ChevronProps) {
  return (
    <span
      className={`chevron chevron--${direction}${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
