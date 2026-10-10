import { Link } from 'react-router';
import Chevron from '../components/Chevron.tsx';
import ConstellationFigure from '../components/ConstellationFigure.tsx';
import Icon from '../components/Icon.tsx';
import PageHeader from '../components/PageHeader.tsx';
import {
  exampleMyConstellation,
  exampleUser,
  formatBirthDate,
  myMenuSections,
  profileFigure,
  settings,
  todayFortuneLines,
  type UserProfile,
} from './my/myData.ts';
import './MyPage.css';

/**
 * 09 마이 — figma-reference/09_my-page.png (393 × 1373)
 * 기본 메뉴바 '마이'. 사용자 정보는 예시(exampleUser) — 회원가입·저장 연결 전까지 표시만
 * 실제 동작: 별자리·운세 메뉴 → 각 화면, '사전 보기' → 사전 메인
 * ⏳ 표시만(동작 미확정): 프로필 ›(계정 설정 · 출생 시각 추가 예정), 화면 모드, 알림, 공지사항, 약관, 재설정
 */
export default function MyPage({ user = exampleUser }: { user?: UserProfile }) {
  // 출생 시각은 선택 항목 — 없으면 줄에서 뺌
  const profileLine = [formatBirthDate(user.birthDate), user.birthTime, exampleMyConstellation.guardian].filter(Boolean).join(' · ');

  return (
    <div className="my">
      <PageHeader title="마이페이지" showBack={false} />

      {/* ── 프로필 (⏳ › : 계정 설정 — 화면 미구현) ── */}
      <section className="my-profile" aria-label="프로필">
        <ConstellationFigure
          className="my-profile__figure"
          viewBox="26 86 52 48"
          stars={profileFigure.stars}
          lines={profileFigure.lines}
          lineWidth={0.5}
          halo={false}
        />
        <div className="my-profile__text">
          <p className="my-profile__name">{user.name} 님</p>
          <p className="my-profile__line">{profileLine}</p>
        </div>
        <Chevron direction="right" size={7} className="my-chevron" />
      </section>

      {/* ── 나의 별자리 ── */}
      <section className="my-block my-constellation" aria-labelledby="my-constellation-title">
        <div>
          <h2 id="my-constellation-title" className="my-label">
            나의 별자리
          </h2>
          <p className="my-constellation__name">
            {exampleMyConstellation.name}
            <span>{exampleMyConstellation.hanja}</span>
          </p>
        </div>
        <Link to="/constellations/dictionary" className="my-constellation__link">
          사전 보기
        </Link>
      </section>

      <hr className="my-divider" />

      {/* ── 오늘의 운세 한 줄 ── */}
      <section className="my-block my-fortune" aria-labelledby="my-fortune-title">
        <h2 id="my-fortune-title" className="my-label">
          오늘의 운세 한 줄
        </h2>
        <p className="my-fortune__text">
          {todayFortuneLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
      </section>

      {/* ── 별자리 · 운세 바로가기 ── */}
      {myMenuSections.map((section) => (
        <section key={section.title} className="my-section" aria-labelledby={`my-section-${section.title}`}>
          <hr className="my-divider" />
          <h2 id={`my-section-${section.title}`} className="my-label my-section__title">
            {section.title}
          </h2>
          <ul className="my-list">
            {section.items.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="my-row">
                  <span className="my-row__icon">
                    <Icon name={item.icon} />
                  </span>
                  <span className="my-row__title">{item.label}</span>
                  <Chevron direction="right" size={7} className="my-chevron" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* ── 설정 (⏳ 모두 표시만) ── */}
      <section className="my-section" aria-labelledby="my-section-settings">
        <hr className="my-divider" />
        <h2 id="my-section-settings" className="my-label my-section__title">
          설정
        </h2>
        <ul className="my-list my-list--settings">
          <li className="my-row">
            {/* 아이콘 자리 — 화면 모드 아이콘 에셋 없음 */}
            <span className="my-row__icon" aria-hidden="true" />
            <span className="my-row__text">
              <span className="my-row__title">{settings.theme.title}</span>
              <span className="my-row__desc">{settings.theme.desc}</span>
            </span>
            <span className="my-segment" role="img" aria-label={`현재 ${settings.theme.current} 모드`}>
              {settings.theme.options.map((o) => (
                <span key={o} className={o === settings.theme.current ? 'is-current' : undefined}>
                  {o}
                </span>
              ))}
            </span>
          </li>
          <li className="my-row">
            {/* 아이콘 자리 — 알림 아이콘 에셋 없음 */}
            <span className="my-row__icon" aria-hidden="true" />
            <span className="my-row__text">
              <span className="my-row__title">{settings.notification.title}</span>
              <span className="my-row__desc">{settings.notification.desc}</span>
            </span>
            <span
              className={`my-switch${settings.notification.on ? ' is-on' : ''}`}
              role="img"
              aria-label={`알림 ${settings.notification.on ? '켜짐' : '꺼짐'}`}
            />
          </li>
          {settings.links.map((label) => (
            <li key={label} className="my-row">
              {/* 아이콘 자리 — 시안의 회색 원 그대로 (에셋 없음) */}
              <span className="my-row__icon my-row__icon--placeholder" aria-hidden="true" />
              <span className="my-row__title">{label}</span>
              <Chevron direction="right" size={7} className="my-chevron" />
            </li>
          ))}
        </ul>
      </section>

      {/* ── 초기화 (⏳ 표시만 — 삭제 기능 없음) ── */}
      <section className="my-section" aria-labelledby="my-section-reset">
        <hr className="my-divider" />
        <h2 id="my-section-reset" className="my-label my-section__title">
          초기화
        </h2>
        <div className="my-reset">
          <div>
            <p className="my-reset__title">{settings.reset.title}</p>
            <p className="my-row__desc">{settings.reset.desc}</p>
          </div>
          <span className="my-reset__button">{settings.reset.button}</span>
        </div>
      </section>

      {/* 아래쪽 자리 — 시안의 회색 막대·사각형 그대로 (문구·로고 미제공) */}
      <div className="my-footer" aria-hidden="true">
        <span className="my-footer__bar" />
        <span className="my-footer__bar my-footer__bar--short" />
        <span className="my-footer__logo" />
      </div>
    </div>
  );
}
