import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import Chevron from '../components/Chevron.tsx';
import PageHeader from '../components/PageHeader.tsx';
import {
  ConstellationCard,
  DictionaryGlossary,
  DictionaryHero,
  DictionarySearch,
  DictionaryTabs,
} from './dictionary/DictionaryParts.tsx';
import {
  constellationsOf,
  dictionaryPaths,
  directionDetails,
  isDirectionId,
  type DictionaryTabId,
} from './dictionary/dictionaryData.ts';
import './DirectionDetailPage.css';

/**
 * 08_04_01 방위 상세 — figma-reference/08_04_01_direction-detail_draft.png (초안, 393 × 1702)
 * 방위 ID(/constellations/dictionary/direction/:id)에 따라 데이터만 바꿔 표시하는 공통 화면
 * 상세 데이터가 없는 방위(현재 현무·백호·주작)는 사전 메인으로 되돌림
 * ‹ · '전체' 탭 → 사전 메인 / 방위 탭 → 해당 방위 상세 (상세 데이터가 있는 방위만)
 * ⏳ 미확정(표시만): 자세히 보기, 검색, 별자리 카드 → 별자리 상세(08_04_02), 용어
 */
export default function DirectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const detail = isDirectionId(id) ? directionDetails[id] : undefined;
  if (!isDirectionId(id) || !detail) return <Navigate to={dictionaryPaths.main} replace />;

  // 사전 메인에서 들어왔으면 뒤로(스크롤 위치 등 기록 유지), 직접 접속이면 사전 메인으로 교체
  const goToMain = () => {
    if ((location.state as { fromDictionary?: boolean } | null)?.fromDictionary) navigate(-1);
    else navigate(dictionaryPaths.main, { replace: true });
  };

  const selectTab = (tab: DictionaryTabId) => {
    if (tab === 'all') goToMain();
    else if (tab !== id && directionDetails[tab]) navigate(dictionaryPaths.direction(tab), { replace: true, state: location.state });
    // 상세 데이터가 없는 방위 탭은 아직 연결하지 않음
  };

  return (
    <div className="direction">
      <div className="direction-top">
        <PageHeader title="별자리 사전" onBack={goToMain} />
        <DictionaryTabs active={id} onSelect={selectTab} />

        {/* 방위 그림 자리 — 초안의 빈 영역 그대로 (에셋 미제공) */}
        <div className="direction-top__image" aria-hidden="true" />

        <DictionaryHero
          label={detail.label}
          name={detail.name}
          hanja={detail.hanja}
          meta={detail.meta}
          aside={
            // ⏳ 이동 위치 미확정
            <span className="dictionary-more">
              자세히 보기 <Chevron direction="right" size={6} />
            </span>
          }
        />
      </div>

      {/* ── 본문 판 ── */}
      <div className="direction-sheet">
        <DictionarySearch />

        <p className="direction-intro">
          {detail.intro.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <div className="direction-grid">
          {constellationsOf(id).map((c) => (
            <ConstellationCard key={c.id} item={c} />
          ))}
        </div>

        <DictionaryGlossary />
      </div>
    </div>
  );
}
