import './ProfileAvatar.css';

export default function ProfileAvatar({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={`profile-image profile-avatar ${className}`} aria-label="프로필 이미지: 체험 초기화" aria-haspopup="dialog" onClick={(event) => {
        // Safari는 포인터로 누른 버튼을 자동 포커스하지 않으므로 복귀 대상을 명시한다.
        event.currentTarget.focus({ preventScroll: true });
        setOpen(true);
      }} />
      {open && <ResetExperienceDialog onClose={() => setOpen(false)} />}
    </>
  );
}
import { useState } from 'react';
import ResetExperienceDialog from './ResetExperienceDialog.tsx';
