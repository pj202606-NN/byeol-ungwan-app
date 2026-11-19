import { useEffect, useState } from 'react';
import { homeMessages } from '../utils/homeGreeting.ts';
import './HomeMessage.css';

/** Timer updates remain inside this small component, independent of home scrolling. */
export default function HomeMessage({ name }: { name?: string }) {
  const [state, setState] = useState(() => ({ cycle: 0, now: new Date() }));
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) setState((old) => ({ ...old, now: new Date() }));
    };
    const timer = window.setInterval(() => {
      if (!document.hidden) setState((old) => ({ cycle: old.cycle + 1, now: new Date() }));
    }, 4500);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  const messages = homeMessages(name, state.now);
  const index = state.cycle % messages.length;
  return (
    <p className="home-hero__date home-message" aria-label={messages[index]}>
      <span key={state.cycle} className={`home-message__track${state.cycle ? ' is-switching' : ''}`} aria-hidden="true">
        {state.cycle > 0 && <span className="home-message__line">{messages[(index + 2) % 3]}</span>}
        <span className="home-message__line">{messages[index]}</span>
      </span>
    </p>
  );
}
