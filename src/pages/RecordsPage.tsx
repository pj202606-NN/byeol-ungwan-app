import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRequiredEntryFlow } from '../entry/entryFlow.tsx';
import Chevron from '../components/Chevron.tsx';
import MonthCalendar from '../components/MonthCalendar.tsx';
import { dateKey, type CalendarDate } from '../components/MonthCalendar.tsx';
import PageHeader from '../components/PageHeader.tsx';
import QuoteBlock from '../components/QuoteBlock.tsx';
import {
  moods,
  recordsToday,
  RECORDS_TODAY,
  type MoodKey,
  selectionLegend,
  shortRecordPlaceholder,
} from './records/recordsData.ts';
import './RecordsPage.css';
import { readRecords, recordFortune, recordStorageKey, saveRecords } from '../services/records.ts';

const moodColor = Object.fromEntries(moods.map((m) => [m.key, m.color]));

/**
 * 07 기록 — figma-reference/07_records.png (393 × 1364)
 * 전시 미리보기 오늘은 2026-11-20. 과거 예시 기록 + 사용자별 탭 세션 저장.
 * 금색 원 = 선택한 날짜, 테두리 원 = 오늘. 날짜별 기분 1개·메모·운세를 복원한다.
 */
export default function RecordsPage() {
  const navigate = useNavigate();
  const { profile, constellation, selectFortuneDate } = useRequiredEntryFlow();
  const storageKey = recordStorageKey(profile.name, profile.birthDate);
  const [records, setRecords] = useState(() => readRecords(storageKey, constellation.starId));
  const [selected, setSelected] = useState<CalendarDate>(recordsToday);
  const selectedKey = dateKey(selected.year, selected.month, selected.day);
  const [mood, setMood] = useState<MoodKey | null>(() => records[RECORDS_TODAY]?.mood ?? null);
  const [note, setNote] = useState(() => records[RECORDS_TODAY]?.note ?? '');
  const [message, setMessage] = useState('');
  const [view, setView] = useState({ year: recordsToday.year, month: recordsToday.month });
  const calendarMarks = Object.fromEntries(Object.entries(records).map(([date, record]) => [date, moodColor[record.mood]]));
  const saved = records[selectedKey];
  const fortune = saved ? { text: saved.fortune, example: saved.example } : recordFortune(constellation.starId, selectedKey);
  const selectDay = (date: CalendarDate) => {
    const record = records[dateKey(date.year, date.month, date.day)];
    setSelected(date); setMood(record?.mood ?? null); setNote(record?.note ?? ''); setMessage('');
  };
  const save = () => {
    if (!mood) { setMessage('오늘의 기분을 하나 골라 주세요.'); return; }
    const next = { ...records, [selectedKey]: { mood, note: note.trim(), fortune: fortune.text, example: fortune.example } };
    setRecords(next);
    setMessage(saveRecords(storageKey, next) ? '기록을 저장했어요.' : '현재 화면에 기록했어요. 브라우저 저장소를 사용할 수 없어 새로고침하면 사라집니다.');
  };
  const moveMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(year, month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

  const recordCount = Object.keys(records).length;

  return (
    <div className="records">
      <div className="records-top">
        <PageHeader title="운세 기록" showBack={false} />
        <p className="records-intro">오늘의 운세를 기록하고 지난 운세도 다시 살펴보세요!</p>

        <MonthCalendar
          year={view.year}
          month={view.month}
          marks={calendarMarks}
          today={recordsToday}
          highlighted={selected}
          onSelect={selectDay}
          onPrev={() => moveMonth(-1)}
          onNext={() => moveMonth(1)}
        />

        <ul className="records-moods" aria-label="기분 색 안내">
          {moods.map((m) => (
            <li key={m.key}>
              <span className="records-moods__dot" style={{ background: m.color }} aria-hidden="true" />
              {m.label}
            </li>
          ))}
        </ul>

        <hr className="records-divider" />

        <div className="records-summary">
          <p className="records-summary__count">
            총 <strong>{recordCount}일</strong>의 하늘 기록
          </p>
          <ul className="records-summary__legend">
            <li>
              <span className="records-summary__mark records-summary__mark--filled" aria-hidden="true" />
              {selectionLegend[0]}
            </li>
            <li>
              <span className="records-summary__mark records-summary__mark--ring" aria-hidden="true" />
              {selectionLegend[1]}
            </li>
          </ul>
        </div>
      </div>

      {/* ── 선택한 날의 기록 ── */}
      <div className="records-sheet">
        <p className="records-day__weekday">
          {new Intl.DateTimeFormat('ko-KR', { weekday: 'long', timeZone: 'Asia/Seoul' }).format(new Date(selectedKey + 'T12:00:00+09:00'))}
          {selectedKey === RECORDS_TODAY && <> · 오늘</>}
        </p>
        <h2 className="records-day__date">{selected.year}년 {selected.month}월 {selected.day}일</h2>

        <QuoteBlock className="records-quote" lines={[fortune.text]} footer={`${constellation.name} · ${constellation.alias} · ${constellation.hanja}`} />

        {selectedKey >= '2026-11-19' && <button type="button" className="records-link" onClick={() => { selectFortuneDate(selectedKey); navigate('/fortune'); }}>
          오늘의 운세 보러 가기 <Chevron direction="right" size={6} />
        </button>}

        <section className="records-block">
          <h2 className="records-block__title">오늘의 기분</h2>
          {/* 하루에 기분 하나를 선택하여 저장한다. */}
          <div className="records-chips" role="group" aria-label="오늘의 기분">
            {moods.map((m) => (
              <button key={m.key} type="button" className="records-chips__chip" aria-pressed={mood === m.key}
                onClick={() => { setMood(m.key); setMessage(''); }}>
                {m.label}
              </button>
            ))}
          </div>
        </section>

        <section className="records-block records-block--note">
          <h2 className="records-block__title">짧은 기록</h2>
          <textarea className="records-note" value={note} onChange={(e) => { setNote(e.target.value); setMessage(''); }} placeholder={shortRecordPlaceholder} aria-label="짧은 기록" rows={4} maxLength={500} />
          <button type="button" className="records-save" onClick={save}>
            {saved ? '기록 수정하기' : '기록 남기기'}
          </button>
          <p className="records-status" role="status">{message}</p>
        </section>
      </div>
    </div>
  );
}
