import { useEffect, useId, useRef } from 'react';
import { useEntryFlow } from '../entry/entryFlow.tsx';
import './ResetExperienceDialog.css';

export default function ResetExperienceDialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { restartExperience } = useEntryFlow();

  useEffect(() => {
    const dialog = dialogRef.current!;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scroll = document.querySelector<HTMLElement>('.app-scroll');
    const overflow = scroll?.style.overflow;
    if (scroll) scroll.style.overflow = 'hidden';
    dialog.showModal(); // 네이티브 focus trap 및 배경 inert 처리
    return () => {
      dialog.close();
      if (scroll) scroll.style.overflow = overflow ?? '';
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="reset-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="reset-dialog__card">
        <h2 id={titleId}>처음부터 다시 시작하기</h2>
        <p id={descriptionId}>처음부터 다시 체험하시겠습니까? 입력한 정보는 초기화됩니다.</p>
        <div className="reset-dialog__actions">
          <button type="button" autoFocus onClick={onClose}>취소</button>
          <button type="button" className="reset-dialog__confirm" onClick={restartExperience}>처음부터 시작하기</button>
        </div>
      </div>
    </dialog>
  );
}
