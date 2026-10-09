import homeSvg from '../assets/icons/icon-home.svg?raw';
import fortuneSvg from '../assets/icons/icon-fortune.svg?raw';
import recordSvg from '../assets/icons/icon-record.svg?raw';
import constellationSvg from '../assets/icons/icon-constellation.svg?raw';
import mySvg from '../assets/icons/icon-my.svg?raw';
import backSvg from '../assets/icons/icon-back.svg?raw';
import rankingSvg from '../assets/icons/icon-ranking.svg?raw';
import compatibilitySvg from '../assets/icons/icon-compatibility.svg?raw';
import exploreSvg from '../assets/icons/icon-explore.svg?raw';
import dictionarySvg from '../assets/icons/icon-dictionary.svg?raw';
import shareSvg from '../assets/icons/icon-share.svg?raw';
import refreshSvg from '../assets/icons/icon-refresh.svg?raw';
import './Icon.css';

/**
 * 별운관 아이콘 (src/assets/icons/icon-*.svg)
 * SVG 를 문서에 직접 넣어(inline) currentColor 가 CSS color 를 따르도록 함.
 * 크기: CSS 변수 --icon-size (기본 24px) 또는 size prop
 */
const ICONS = {
  home: homeSvg,
  fortune: fortuneSvg,
  record: recordSvg,
  constellation: constellationSvg,
  my: mySvg,
  back: backSvg,
  ranking: rankingSvg,
  compatibility: compatibilitySvg,
  explore: exploreSvg,
  dictionary: dictionarySvg,
  share: shareSvg,
  refresh: refreshSvg,
} as const;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  /** px 크기 (생략 시 --icon-size) */
  size?: number;
  className?: string;
}

export default function Icon({ name, size, className }: IconProps) {
  return (
    <span
      className={className ? `icon ${className}` : 'icon'}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
      // 프로젝트 내부의 고정 SVG 파일만 사용 (외부 입력 아님)
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
