import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import Chevron from './Chevron.tsx';
import ProfileAvatar from './ProfileAvatar.tsx';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  /** 왼쪽 ← 버튼 표시 */
  showBack?: boolean;
  /** 스크롤 중에도 화면 위에 고정 */
  sticky?: boolean;
  /** 오른쪽 영역 (생략 시 프로필 원) — 08_01 순위는 '별운관' 로고 */
  right?: ReactNode;
  /** ‹ 동작을 바꿀 때 (예: 사전 방위 상세 → 사전 메인). 생략 시 아래 기본 동작 */
  onBack?: () => void;
}

/**
 * 하위 화면 공통 헤더: ← · 제목 · 프로필 원
 * (06 운세, 08_03 탐색, 07 기록·09 마이(← 없음) 에서 반복)
 * ← : 앱 안에서 이전 화면이 있으면 뒤로, 없으면(직접 접속 등) 홈으로
 */
export default function PageHeader({ title, showBack = true, sticky = false, right, onBack }: PageHeaderProps) {
  const navigate = useNavigate();

  const goBack = () => {
    if (onBack) return onBack();
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate('/', { replace: true });
  };

  return (
    <header className={sticky ? 'page-header page-header--sticky' : 'page-header'}>
      {showBack && (
        <button type="button" className="page-header__back" onClick={goBack} aria-label="뒤로 가기">
          <Chevron direction="left" size={14} />
        </button>
      )}
      {/* 제목이 없는 화면(03 회원가입 등)은 ‹ 만 */}
      {title && <h1 className="page-header__title">{title}</h1>}
      {right ?? (
        <ProfileAvatar />
      )}
    </header>
  );
}
