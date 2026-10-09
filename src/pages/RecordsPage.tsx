import { useState } from 'react';
import { useNavigate } from 'react-router';
import Chevron from '../components/Chevron.tsx';
import MonthCalendar from '../components/MonthCalendar.tsx';
import PageHeader from '../components/PageHeader.tsx';
import QuoteBlock from '../components/QuoteBlock.tsx';
import {
  moods,
  sampleDayDetail,
  sampleHighlighted,
  sampleRecords,
  sampleToday,
  selectionLegend,
  shortRecordPlaceholder,
} from './records/recordsData.ts';
import './RecordsPage.css';

const moodColor = Object.fromEntries(moods.map((m) => [m.key, m.color]));
const calendarMarks = Object.fromEntries(Object.entries(sampleRecords).map(([date, mood]) => [date, moodColor[mood]]));

/**
 * 07 기록 — figma-reference/07_records.png (393 × 1364)
 * 데이터는 디자인 시안 예시 값 (저장 기능 없음).
 * 동작: 이전·다음 달 넘기기, '오늘의 운세 보러 가기' → 운세, 짧은 기록 입력(저장 안 함)
 * 확정: 금색 원 = 선택한 날짜, 테두리 원 = 오늘, 기분은 하루 1개
 * 추후 구현(지금은 표시만): 날짜 선택, 기분 선택, '기록 남기기' 저장
 */
export default function RecordsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState({ year: sampleToday.year, month: sampleToday.month });
  const moveMonth = (delta: number) =>
    setView(({ year, month }) => {
      const d = new Date(year, month - 1 + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });

  const recordCount = Object.keys(sampleRecords).length;

  return (
    <div className="records">
      <div className="records-top">
        <PageHeader title="운세 기록" showBack={false} />
        <p className="records-intro">오늘의 운세를 기록하고 지난 운세도 다시 살펴보세요!</p>

        <MonthCalendar
          year={view.year}
          month={view.month}
          marks={calendarMarks}
          today={sampleToday}
          highlighted={sampleHighlighted}
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
          {sampleDayDetail.weekday}
          {sampleDayDetail.isToday && <> · 오늘</>}
        </p>
        <h2 className="records-day__date">{sampleDayDetail.dateLabel}</h2>

        <QuoteBlock className="records-quote" lines={sampleDayDetail.quote} footer={sampleDayDetail.source} />

        <button type="button" className="records-link" onClick={() => navigate('/fortune')}>
          오늘의 운세 보러 가기 <Chevron direction="right" size={6} />
        </button>

        <section className="records-block">
          <h2 className="records-block__title">오늘의 기분</h2>
          {/* 하루 1개 선택 (확정) — 선택·저장 기능은 추후 구현, 지금은 표시만 */}
          <div className="records-chips" role="group" aria-label="오늘의 기분">
            {moods.map((m) => (
              <button key={m.key} type="button" className="records-chips__chip">
                {m.label}
              </button>
            ))}
          </div>
        </section>

        <section className="records-block records-block--note">
          <h2 className="records-block__title">짧은 기록</h2>
          <textarea className="records-note" placeholder={shortRecordPlaceholder} aria-label="짧은 기록" rows={4} />
          {/* 저장 기능은 추후 구현 — 지금은 동작 없음 (저장되는 것처럼 보이지 않게) */}
          <button type="button" className="records-save">
            기록 남기기
          </button>
        </section>
      </div>
    </div>
  );
}
