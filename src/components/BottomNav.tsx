import type React from 'react';
import { Link, useLocation } from 'react-router';
import Icon from './Icon.tsx';
import {
  CONSTELLATION_BACK_TO,
  CONSTELLATION_NAV,
  CONSTELLATION_PREFIX,
  MAIN_NAV,
  isActive,
  type NavItem,
} from './navConfig.ts';
import './BottomNav.css';

/**
 * 공통 하단 메뉴바 — AppShell 에서 한 번만 배치 (페이지마다 중복 구현하지 않음)
 * 현재 주소가 /constellations 아래이면 별자리 전용 메뉴바, 그 외에는 기본 메뉴바
 * 디자인 기준: figma-reference/nav_main.png, nav_constellations.png (393×72)
 */
export default function BottomNav() {
  const { pathname } = useLocation();
  const isConstellation = pathname.startsWith(CONSTELLATION_PREFIX);

  // 메뉴바는 본문 위에 겹쳐 있으므로, 메뉴바 위에서 굴린 마우스 휠도 본문 스크롤로 전달 (PC)
  const forwardWheel = (e: React.WheelEvent<HTMLElement>) => {
    e.currentTarget.closest('.app-frame')?.querySelector('.app-scroll')?.scrollBy({ top: e.deltaY, left: 0 });
  };

  return (
    <div className="bottom-nav-area">
      <nav
        onWheel={forwardWheel}
        className={`bottom-nav ${isConstellation ? 'bottom-nav--constellation' : 'bottom-nav--main'}`}
        aria-label={isConstellation ? '별자리 메뉴' : '주 메뉴'}
      >
        <div className="bottom-nav__panel bottom-nav__panel--main" aria-hidden={isConstellation} inert={isConstellation}>
          <ul className="bottom-nav__list">
            {MAIN_NAV.map((item) => (
              <NavButton key={item.key} item={item} active={isActive(item, pathname)} />
            ))}
          </ul>
        </div>
        <div className="bottom-nav__panel bottom-nav__panel--constellation" aria-hidden={!isConstellation} inert={!isConstellation}>
          <Link to={CONSTELLATION_BACK_TO} className="bottom-nav__back" aria-label="홈으로 돌아가기">
            <Icon name="back" className="bottom-nav__icon" />
          </Link>
        <ul className="bottom-nav__list">
          {CONSTELLATION_NAV.map((item) => (
            <NavButton key={item.key} item={item} active={isActive(item, pathname)} />
          ))}
        </ul>
        </div>
      </nav>
    </div>
  );
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <li className="bottom-nav__item">
      <Link
        to={item.to}
        className="bottom-nav__link"
        aria-current={active ? 'page' : undefined}
        data-active={active || undefined}
      >
        <Icon name={item.icon} className="bottom-nav__icon" />
        <span className="bottom-nav__label">{item.label}</span>
      </Link>
    </li>
  );
}
