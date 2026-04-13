# 개발 로그 (DEVLOG)

> 동인 행사 정보 사이트 — 개발 진행 기록  
> 각 단계별 작업 내용, 생성/수정된 파일 목록을 시간 순으로 정리

---

## 사전 기획

- 서비스 방향 정의: 동인 행사 정보(코믹월드, 일러스타 페스 등) + 부스 목록 + 작가/작품 정보
- 기술 스택 결정: Vite + React + React Router + dayjs + lucide-react
- 호스팅: Vercel (무료 플랜)
- 데이터 전략: 초기 JSON 파일 기반, 추후 Supabase 전환 고려
- 파일 구조 설계: pages / components / hooks / utils / constants / styles 모듈화

---

## v0.1 — 기반 구축 및 전체 페이지 초안

### [단계 1] 환경 세팅

**작업 내용**
- Vite + React 프로젝트 생성 (`npm create vite@latest`)
- 추가 패키지 설치: `react-router-dom`, `dayjs`, `lucide-react`
- VS Code 확장 설치 권장: ES7+ React snippets, Prettier, ESLint 등
- 폴더 구조 생성

**생성된 파일**
```
src/
  main.jsx
  App.jsx
  styles/
    variables.css   ← 디자인 토큰 (색상, 폰트, 간격, 행사 타입 색상)
    global.css      ← 리셋 + 기본 스타일 (Pretendard 폰트 포함)
```

---

### [단계 2] 데이터 정리

**작업 내용**
- 기존 보유 데이터(booths.json, artists.json, works.json, events_.json) 검토
- `booths.json` → `public/data/booths/cw_331.json` 으로 이동 (행사별 분리 구조)
- `events_.json` → `events.json` (status 필드 제거 — 날짜 기반 자동 계산으로 대체)
- `works.json` 중복 id 2개 제거 (356 → 354개)

**생성된 파일**
```
public/data/
  events.json          ← eventTypes + events 통합 구조
  artists.json
  works.json
  booths/
    cw_331.json        ← 코믹월드 331 부산 (381개 부스)
```

**주요 결정사항**
- `status` 필드를 JSON에서 제거하고 `dates.start / dates.end`로 실시간 계산
- 부스 데이터는 `booths/{eventId}.json` 구조로 행사별 분리 (확장성)

---

### [단계 3] 레이아웃 및 공통 컴포넌트

**작업 내용**
- 전체 레이아웃 (사이드바 + 메인 콘텐츠) 구현
- 사이드바: 정보/데이터/관리 그룹 네비게이션, 모바일 드로어 지원
- 공통 컴포넌트 2종

**생성된 파일**
```
src/
  App.jsx                              ← React Router 설정
  components/
    layout/
      Layout.jsx + .module.css         ← 사이드바 + 콘텐츠 래퍼
      Sidebar.jsx + .module.css        ← 네비게이션 사이드바
    common/
      PageHeader.jsx + .module.css     ← 페이지 제목/부제
      EmptyState.jsx + .module.css     ← 빈 상태 표시
```

---

### [단계 4] 페이지 뼈대

**작업 내용**
- 모든 페이지 라우트 등록 및 뼈대 컴포넌트 생성

**생성된 파일**
```
src/pages/
  MainPage.jsx
  EventListPage.jsx
  BoothListPage.jsx
  ArtistListPage.jsx
  WorkListPage.jsx
  CalendarPage.jsx
  StatsPage.jsx
  ContributorsPage.jsx
  NotFoundPage.jsx + .module.css
```

---

### [단계 5] 행사 목록 페이지

**작업 내용**
- `events.json` fetch + 필터링 훅 구현
- 날짜 기반 상태 자동 계산 (`upcoming / ongoing / ended`)
- 행사 카드 컴포넌트, 필터 UI 구현

**생성된 파일**
```
src/
  hooks/
    useEvents.js                        ← useEvents / useFilteredEvents / useEvent / useMainEvents
  utils/
    eventUtils.js                       ← getEventStatus / getDDay / formatDateRange / getTypeColor 등
  components/event/
    EventCard.jsx + .module.css         ← 행사 카드 (타입 색상 스트라이프, D-day 뱃지)
  pages/
    EventListPage.jsx + .module.css     ← 진행중/예정/종료 섹션, 타입·도시·상태 필터
```

**주요 기능**
- 행사 타입 칩 필터 (코믹월드 / 일러스타 페스 / 코미버스)
- 도시 셀렉트 필터
- 지난 행사 2년 숨김 토글
- 로딩 스켈레톤

---

### [단계 6] 메인 페이지

**작업 내용**
- 이번 달 행사 → 없으면 가장 가까운 3개 표시
- 우선순위: 진행 중 > 이번 달 예정 > 가까운 3개

**생성된 파일**
```
src/
  components/event/
    MainEventCard.jsx + .module.css     ← 메인용 강조 카드 (진행 중 pulse 테두리)
  pages/
    MainPage.jsx + .module.css          ← 히어로 + 행사 섹션 + 퀵 링크
```

**수정된 파일**
```
src/hooks/useEvents.js                  ← useMainEvents 훅 추가
```

---

### [단계 7] 행사 상세 페이지

**작업 내용**
- `/events/:eventId` 라우트 추가
- 일정, 장소, 협력 행사, 공식 링크, 부스 CTA 표시
- 카카오맵 검색 링크 연동 (좌표 없어 주소 검색 방식)

**생성된 파일**
```
src/pages/
  EventDetailPage.jsx + .module.css
```

**수정된 파일**
```
src/App.jsx                             ← /events/:eventId 라우트 추가
src/hooks/useEvents.js                  ← useEvent(eventId) 단일 조회 훅 추가
src/components/event/EventCard.jsx      ← 카드 클릭 시 상세 페이지 이동
src/components/event/MainEventCard.jsx  ← 카드 클릭 상세, 버튼 버블링 차단
```

---

### [단계 8] 데이터 스키마 정의 및 임포트 페이지

**작업 내용**
- 전체 데이터 필드/키 정의 파일 작성
- JSON/CSV 파일 업로드 + 텍스트 붙여넣기 + 직접 입력 지원
- 검증, JSON 복사, CSV 내보내기

**생성된 파일**
```
src/
  constants/
    schema.js                           ← EVENT_SCHEMA / BOOTH_SCHEMA / ARTIST_SCHEMA / WORK_SCHEMA
  utils/
    dataUtils.js                        ← parseCSV / parseJSONData / validateRecord / toCSV 등
  pages/
    DataImportPage.jsx + .module.css    ← /data-import
```

---

### [단계 9] 행사 관리 CRUD 페이지

**작업 내용**
- 행사 타입(시리즈) 추가/수정/삭제
- 회차 추가/수정/삭제
- 변경사항 localStorage 임시 저장, JSON 내보내기

**생성된 파일**
```
src/
  hooks/
    useEventsAdmin.js                   ← localStorage 기반 CRUD + exportJSON
  components/admin/
    EventTypeForm.jsx                   ← 행사 시리즈 등록 폼
    EventEpisodeForm.jsx                ← 회차 등록 폼 (id/name 자동 생성)
    EventForm.module.css
  pages/
    EventAdminPage.jsx + .module.css    ← /admin/events
```

**수정된 파일**
```
src/App.jsx                             ← /admin/events 라우트 추가
src/components/layout/Sidebar.jsx      ← 관리 그룹 추가
```

---

### [단계 10] 부스 목록 페이지

**작업 내용**
- 행사 ID 기반 부스 데이터 fetch
- 카드형 / 리스트형 뷰 전환
- 부스명/번호/태그 검색, spec/요일 필터, 태그 칩 필터
- 부스 상세 모달 (이미지, 링크, 태그, 부스 번호)

**생성된 파일**
```
src/
  hooks/
    useBooths.js                        ← useBooths / useFilteredBooths
  components/booth/
    BoothCard.jsx + .module.css         ← 썸네일, 요일 뱃지, 태그
    BoothListItem.jsx + .module.css     ← 리스트형 (이미지 없음)
    BoothDetailModal.jsx + .module.css  ← 이미지 가로 스크롤, 링크 버튼
  pages/
    BoothListPage.jsx + .module.css
```

---

### [단계 11] 캘린더 페이지

**작업 내용**
- 월간 달력: 날짜 칸에 행사 pill 표시, 이전/다음 달 이동
- 주간 타임라인: 바 형식, 겹치는 행사 레인 자동 분리, 오늘 세로선

**생성된 파일**
```
src/
  utils/
    calendarUtils.js                    ← buildMonthGrid / buildWeekRange / assignLanes 등
  components/calendar/
    MonthlyCalendar.jsx + .module.css
    WeeklyTimeline.jsx + .module.css
  pages/
    CalendarPage.jsx + .module.css
```

---

### [단계 12] 통계 페이지

**작업 내용**
- 부스 탭: 규격/요일/크기/링크 분포 (도넛 차트), 장르 Top 20 (가로 바 차트)
- 행사 탭: 연도별/월별 추이 (세로 바 차트), 타입/도시 분포
- 외부 차트 라이브러리 없이 순수 SVG + CSS 구현

**생성된 파일**
```
src/
  utils/
    statsUtils.js                       ← calcSpecDist / calcTagDist / calcYearDist 등
  components/stats/
    StatCard.jsx + .module.css          ← StatCard / MetricCard / HBarChart / VBarChart / DonutChart
  pages/
    StatsPage.jsx + .module.css
```

---

### [단계 13] 작가 목록 페이지

**작업 내용**
- 부스 데이터 교차 집계: 작가별 참여 부스 + 주요 장르 자동 계산
- 링크트리 스타일 상세 모달
- 이름 검색, 플랫폼 필터, 장르 태그 필터

**생성된 파일**
```
src/
  hooks/
    useArtists.js                       ← useArtists / buildArtistBoothMap / useFilteredArtists
  components/artist/
    ArtistCard.jsx + .module.css
    ArtistDetailModal.jsx + .module.css ← 링크트리 스타일, 참여 부스 목록
  pages/
    ArtistListPage.jsx + .module.css
```

---

### [단계 14] 작품/장르 목록 + 기여자 페이지 → v0.1 완성

**작업 내용**
- 작품 목록: 가나다 초성 그룹핑, 인덱스 점프, 부스 참여 횟수 배지
- 기여자 페이지: 개발자/기여자 카드, 사용 기술 목록

**생성된 파일**
```
src/
  hooks/
    useWorks.js                         ← getInitialGroup / useFilteredWorks
  pages/
    WorkListPage.jsx + .module.css
    ContributorsPage.jsx + .module.css
```

> **여기까지가 v0.1** — 모든 페이지 구현 완료

---

## v0.2 — 기능 개선 및 버그 수정

### [v0.2.0] 브랜드 아이콘 교체

**배경**: lucide-react의 브랜드 아이콘(Twitter, Github 등)이 제거 예정. simple-icons 전환 권장.

**작업 내용**
- simple-icons SVG path 인라인 관리 공통 컴포넌트 작성
- 지원 플랫폼: X(Twitter) / Instagram / YouTube / Pixiv / Bluesky / GitHub

**생성된 파일**
```
src/components/common/
  BrandIcon.jsx                         ← platform prop으로 브랜드 아이콘 렌더링
```

**수정된 파일**
```
src/components/artist/ArtistCard.jsx
src/components/artist/ArtistDetailModal.jsx
src/components/booth/BoothDetailModal.jsx
src/components/admin/EventTypeForm.jsx
src/pages/EventDetailPage.jsx
src/pages/ContributorsPage.jsx
```

**버그 수정**
- `EventDetailPage`: `resolveLink()`가 반환한 `brand` 필드를 호출부에서 누락 → `LinkItem`에 `icon: undefined` 전달되어 오류 발생 → 구조분해에 `brand` 추가
- `BoothDetailModal`: `<meta.icon ...>` 패턴은 JSX 렌더링 불가 → `const Icon = meta.icon` 대문자 변수 할당으로 수정

---

### [v0.2.1] 부스 목록 — 요일 필터 개선

**배경**: 기존 `토 선택 → 토 포함 부스 전체 표시` 방식이 의도와 다름. 토요일만 단독 참가하는 부스를 걸러보고 싶은 수요.

**변경 내용**
- 요일 select UI → 버튼 그룹으로 교체
- **데이터 기반 동적 생성**: `days.length === 1`인 부스에서 등장하는 요일만 추출, 월→일 순 정렬
- 필터 동작: 선택한 요일만 단독 참가하는 부스만 표시 (양일 참가 부스 제외)
- 단독 참가 요일이 없는 행사는 버튼 그룹 미표시

**수정된 파일**
```
src/hooks/useBooths.js                  ← filterDay 로직 변경, singleDays 반환 추가
src/pages/BoothListPage.jsx             ← select → 동적 버튼 그룹
src/pages/BoothListPage.module.css      ← dayFilter / dayBtn 스타일 추가
```

---

### [v0.2.2] 부스 목록 — 장르 다중 선택 (OR 조건)

**배경**: 기존 단일 선택 방식에서 여러 장르를 동시에 필터링하는 수요.

**변경 내용**
- `filterTag: string` → `filterTags: Set<string>`으로 변경
- 필터 조건: 선택된 태그 중 **하나라도** 포함한 부스 표시 (OR 조건)
- 태그 칩 클릭 시 토글 (선택/해제)
- 선택된 태그 수 표시 + 태그 초기화 버튼 별도 추가
- 초기화 버튼 항상 표시 (필터 적용 시 accent 색상 강조)

**수정된 파일**
```
src/hooks/useBooths.js                  ← filterTags(Set) OR 조건 필터 로직
src/pages/BoothListPage.jsx             ← filterTags 상태, toggleTag 함수, UI 전면 개편
src/pages/BoothListPage.module.css      ← tagSelectedInfo / tagCheck 스타일 추가
```

---

### [v0.2.3] 데이터 구조 변경 대응 (외부 작업)

**배경**: 개발 중단 기간 동안 데이터 구조 변경 및 신규 데이터 추가.

**변경된 데이터**
- `booths/{eventId}.json` 구조 변경: 배열 → `{ lastUpdate, list: [...] }` 객체
- `cw_332.json` 추가 (557개 부스)
- `works.json` 확장: 354개 → 534개, 일부 `category` 필드 보강
- `genres.json` 신규 추가 (별도 파일)

**수정된 파일**
```
src/hooks/useBooths.js                  ← 배열/객체 구조 모두 처리
                                          Array.isArray(json) ? json : json.list ?? []
```

**미반영 사항 (추후 처리 필요)**
- `cw_332`의 `spec` 전체가 빈 문자열 → 규격 필터 예외 처리
- `WorkListPage` 부스 집계가 `cw_331` 하드코딩 → 복수 행사 지원 구조 필요

---

## 현재 버전: v0.2.3

### 0.2 진행 체크리스트

| 항목 | 상태 |
|---|---|
| 부스 목록 — 요일 필터 개선 | ✅ v0.2.1 |
| 부스 목록 — 장르 다중 선택 OR | ✅ v0.2.2 |
| 부스 목록 — 초기화 버튼 항상 표시 | ✅ v0.2.2 |
| 데이터 구조 변경 대응 | ✅ v0.2.3 |
| 행사 목록 카드 — 부스 수 표기 | ⬜ |
| 작품 목록 — 리스트 뷰 + 부스 수 정렬 | ⬜ |
| 작품 목록 — 기간 필터 (행사 날짜 범위) | ⬜ |
| 행사 관리 — 부스/작가/작품 편집 기능 | ⬜ |
| 사이트 설정 — 폰트 크기 / 테마 선택 | ⬜ |
| 버전 표기 업데이트 + README | ⬜ |

---

## 파일 구조 전체

```
public/data/
├── events.json
├── artists.json
├── works.json
├── genres.json          ← v0.2.3 신규
├── booths.json          ← 레거시 (미사용)
└── booths/
    ├── cw_331.json      ← { lastUpdate, list: [...] }  v0.2.3 구조 변경
    └── cw_332.json      ← v0.2.3 신규

src/
├── main.jsx
├── App.jsx
├── styles/
│   ├── variables.css
│   └── global.css
├── constants/
│   └── schema.js
├── hooks/
│   ├── useEvents.js
│   ├── useBooths.js     ← v0.2.1·v0.2.2·v0.2.3 수정
│   ├── useEventsAdmin.js
│   ├── useArtists.js
│   └── useWorks.js
├── utils/
│   ├── eventUtils.js
│   ├── calendarUtils.js
│   ├── statsUtils.js
│   └── dataUtils.js
├── components/
│   ├── common/
│   │   ├── BrandIcon.jsx          ← v0.2.0 신규
│   │   ├── PageHeader.jsx
│   │   └── EmptyState.jsx
│   ├── layout/
│   │   ├── Layout.jsx
│   │   └── Sidebar.jsx
│   ├── event/
│   │   ├── EventCard.jsx
│   │   └── MainEventCard.jsx
│   ├── booth/
│   │   ├── BoothCard.jsx
│   │   ├── BoothListItem.jsx
│   │   └── BoothDetailModal.jsx   ← v0.2.0 수정
│   ├── artist/
│   │   ├── ArtistCard.jsx         ← v0.2.0 수정
│   │   └── ArtistDetailModal.jsx  ← v0.2.0 수정
│   ├── calendar/
│   │   ├── MonthlyCalendar.jsx
│   │   └── WeeklyTimeline.jsx
│   ├── stats/
│   │   └── StatCard.jsx
│   └── admin/
│       ├── EventTypeForm.jsx      ← v0.2.0 수정
│       └── EventEpisodeForm.jsx
└── pages/
    ├── MainPage.jsx
    ├── EventListPage.jsx
    ├── EventDetailPage.jsx        ← v0.2.0 수정
    ├── BoothListPage.jsx          ← v0.2.1·v0.2.2 수정
    ├── ArtistListPage.jsx
    ├── WorkListPage.jsx
    ├── CalendarPage.jsx
    ├── StatsPage.jsx
    ├── ContributorsPage.jsx       ← v0.2.0 수정
    ├── EventAdminPage.jsx
    ├── DataImportPage.jsx
    └── NotFoundPage.jsx
```