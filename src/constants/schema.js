/**
 * schema.js
 * 전체 데이터 구조 정의
 *
 * 각 스키마는 다음을 포함합니다:
 *   - fields: 필드 정의 목록
 *   - requiredFields: 필수 필드 키 목록
 *   - csvColumns: CSV import 시 컬럼 매핑 정의
 *
 * 필드 속성:
 *   key       - JSON 키 이름
 *   label     - 사람이 읽는 이름 (한국어)
 *   type      - 'string' | 'number' | 'array' | 'object' | 'boolean' | 'date'
 *   required  - 필수 여부
 *   nullable  - null 허용 여부
 *   options   - 선택 가능한 값 목록 (enum)
 *   desc      - 설명
 */

// ─────────────────────────────────────────
// 행사 타입 (eventTypes)
// ─────────────────────────────────────────
export const EVENT_TYPE_SCHEMA = {
  fields: [
    {
      key: 'name',
      label: '행사 타입 이름',
      type: 'string',
      required: true,
      desc: '행사 주최의 공식 이름. 예: 코믹월드',
    },
    {
      key: 'shortName',
      label: '약칭',
      type: 'string',
      required: true,
      desc: '짧은 표시용 이름. 예: CW',
    },
    {
      key: 'links',
      label: '공식 링크',
      type: 'object',
      required: false,
      desc: '외부 링크 모음. 키: homepage | twitter | bluesky | gall | 기타',
      subFields: [
        { key: 'homepage', label: '공식 홈페이지', type: 'string' },
        { key: 'twitter',  label: 'Twitter / X',  type: 'string' },
        { key: 'bluesky',  label: 'Bluesky',       type: 'string' },
        { key: 'gall',     label: 'DC 갤러리',     type: 'string' },
      ],
    },
  ],
}

// ─────────────────────────────────────────
// 행사 (events)
// ─────────────────────────────────────────
export const EVENT_SCHEMA = {
  fields: [
    {
      key: 'id',
      label: '행사 ID',
      type: 'string',
      required: true,
      desc: '고유 식별자. 규칙: {type약어}_{회차} 예: cw_331 / ilfe_10 / ilfe_petit_4',
    },
    {
      key: 'name',
      label: '행사 이름',
      type: 'string',
      required: true,
      desc: '공식 행사 이름. 예: 코믹월드 331회 부산',
    },
    {
      key: 'shortName',
      label: '행사 약칭',
      type: 'string',
      required: true,
      desc: '목록/뱃지 표시용 짧은 이름. 예: CW331 부산',
    },
    {
      key: 'type',
      label: '행사 타입',
      type: 'string',
      required: true,
      options: ['comicworld', 'illustarfes', 'comiverse'],
      desc: 'eventTypes 의 키와 일치해야 함',
    },
    {
      key: 'episode',
      label: '회차',
      type: 'number',
      required: false,
      nullable: true,
      desc: '정수 회차. 특별 행사 등 회차가 없는 경우 null',
    },
    {
      key: 'category',
      label: '카테고리',
      type: 'string',
      required: false,
      nullable: true,
      options: ['regular', 'special', 'petit'],
      desc: '일러스타 페스 전용. regular(정기) | special(특별) | petit(쁘띠). 코믹월드·코미버스는 null',
    },
    {
      key: 'city',
      label: '도시',
      type: 'string',
      required: true,
      desc: '개최 도시. 예: 서울 / 부산 / 일산 / 수원 / 판교 / 부천 / 전주 / 순천',
    },
    {
      key: 'venue',
      label: '장소',
      type: 'string',
      required: true,
      desc: '개최 장소 이름. 예: BEXCO 제2전시장 / KINTEX 제1전시장 4·5홀',
    },
    {
      key: 'dates',
      label: '일정',
      type: 'object',
      required: true,
      desc: '행사 날짜. status 필드 없이 이 값으로 상태를 자동 계산',
      subFields: [
        { key: 'start', label: '시작일', type: 'date', required: true,  desc: 'YYYY-MM-DD 형식' },
        { key: 'end',   label: '종료일', type: 'date', required: true,  desc: 'YYYY-MM-DD 형식. 당일 행사면 start와 동일' },
      ],
    },
    {
      key: 'collaboration',
      label: '협력 행사',
      type: 'array',
      required: false,
      nullable: true,
      desc: '함께 진행되는 외부 행사 이름 목록. 예: ["G-STAR 2024", "VOCASTAR"]',
    },
    {
      key: 'links',
      label: '행사별 링크',
      type: 'object',
      required: false,
      nullable: true,
      desc: '행사 단위 링크. 현재는 boothData 경로만 사용',
      subFields: [
        { key: 'boothData', label: '부스 데이터 경로', type: 'string', desc: '예: data/booths/cw_331.json' },
        { key: 'ticket',    label: '티켓 구매 링크',  type: 'string' },
      ],
    },
  ],

  requiredFields: ['id', 'name', 'shortName', 'type', 'city', 'venue', 'dates'],

  // CSV import 시 컬럼 → 필드 매핑
  csvColumns: [
    { csvHeader: 'id',            field: 'id' },
    { csvHeader: 'name',          field: 'name' },
    { csvHeader: 'shortName',     field: 'shortName' },
    { csvHeader: 'type',          field: 'type' },
    { csvHeader: 'episode',       field: 'episode',  transform: (v) => v ? Number(v) : null },
    { csvHeader: 'category',      field: 'category', transform: (v) => v || null },
    { csvHeader: 'city',          field: 'city' },
    { csvHeader: 'venue',         field: 'venue' },
    { csvHeader: 'startDate',     field: 'dates.start' },
    { csvHeader: 'endDate',       field: 'dates.end' },
    { csvHeader: 'collaboration', field: 'collaboration', transform: (v) => v ? v.split('|').map(s => s.trim()) : [] },
  ],
}

// ─────────────────────────────────────────
// 부스 (booths/{eventId}.json)
// ─────────────────────────────────────────
export const BOOTH_SCHEMA = {
  fields: [
    {
      key: 'id',
      label: '부스 ID',
      type: 'string',
      required: true,
      desc: '부스 고유 식별자. 규칙: 부스번호 소문자+하이픈. 예: da-01 / a-42',
    },
    {
      key: 'name',
      label: '부스명',
      type: 'string',
      required: true,
      desc: '부스(서클) 이름',
    },
    {
      key: 'numbers',
      label: '부스 번호 목록',
      type: 'array',
      required: true,
      desc: '실제 배정된 부스 번호 배열. 2칸 이상이면 여러 값. 예: ["DA_01", "DA_02"]',
    },
    {
      key: 'displayNumber',
      label: '부스 번호 표시',
      type: 'string',
      required: true,
      desc: 'UI에 표시할 부스 번호 문자열. 예: DA_01~DA_02 / A-42',
    },
    {
      key: 'spec',
      label: '부스 규격',
      type: 'string',
      required: true,
      options: ['성덕', '청년', '전문', '문구청년', '문구전문', '코스어성덕'],
      desc: '부스 참가 규격/분류',
    },
    {
      key: 'days',
      label: '참가 요일',
      type: 'array',
      required: true,
      options: ['토', '일', '월', '화', '수', '목', '금'],
      desc: '참가하는 요일 목록. 예: ["토", "일"] / ["토"]',
    },
    {
      key: 'description',
      label: '부스 소개',
      type: 'string',
      required: false,
      desc: '부스 자유 소개 텍스트. 비어있을 수 있음',
    },
    {
      key: 'artists',
      label: '참여 작가 ID 목록',
      type: 'array',
      required: false,
      desc: 'artists.json 의 id 값 참조. 예: ["Hingumon", "땅땅공방"]',
    },
    {
      key: 'tags',
      label: '장르/작품 태그',
      type: 'array',
      required: false,
      desc: '취급 장르·작품 이름 목록. works.json 의 name 과 매핑 예정. 예: ["원신", "블루아카이브"]',
    },
    {
      key: 'infoImage',
      label: '대표 이미지 URL',
      type: 'string',
      required: false,
      desc: '부스 대표 이미지 URL. 없으면 빈 문자열',
    },
    {
      key: 'infoImages',
      label: '추가 이미지 URL 목록',
      type: 'array',
      required: false,
      desc: '부스 추가 이미지 URL 배열',
    },
    {
      key: 'goods',
      label: '판매 굿즈 목록',
      type: 'array',
      required: false,
      desc: '판매 상품 목록. 현재 미사용. 추후 확장 예정',
    },
    {
      key: 'links',
      label: '외부 링크 목록',
      type: 'array',
      required: false,
      desc: '링크 객체 배열. 각 링크는 { type, label, url } 구조',
      subFields: [
        {
          key: 'type',
          label: '링크 타입',
          type: 'string',
          options: ['official', 'payment', 'twitter', 'community', 'other'],
          desc: 'official: 공식 페이지 | payment: 결제/사전주문 | twitter: SNS | community: 커뮤니티',
        },
        { key: 'label', label: '링크 표시 이름', type: 'string', desc: '비어있으면 type 기본값 사용' },
        { key: 'url',   label: 'URL',            type: 'string', required: true },
      ],
    },
  ],

  requiredFields: ['id', 'name', 'numbers', 'displayNumber', 'spec', 'days'],

  csvColumns: [
    { csvHeader: 'id',            field: 'id' },
    { csvHeader: 'name',          field: 'name' },
    { csvHeader: 'numbers',       field: 'numbers',       transform: (v) => v.split('|').map(s => s.trim()) },
    { csvHeader: 'displayNumber', field: 'displayNumber' },
    { csvHeader: 'spec',          field: 'spec' },
    { csvHeader: 'days',          field: 'days',          transform: (v) => v.split('|').map(s => s.trim()) },
    { csvHeader: 'tags',          field: 'tags',          transform: (v) => v ? v.split('|').map(s => s.trim()) : [] },
    { csvHeader: 'artists',       field: 'artists',       transform: (v) => v ? v.split('|').map(s => s.trim()) : [] },
    { csvHeader: 'description',   field: 'description',  transform: (v) => v || '' },
    { csvHeader: 'infoImage',     field: 'infoImage',    transform: (v) => v || '' },
  ],
}

// ─────────────────────────────────────────
// 작가 (artists.json)
// ─────────────────────────────────────────
export const ARTIST_SCHEMA = {
  fields: [
    {
      key: 'id',
      label: '작가 ID',
      type: 'string',
      required: true,
      desc: '작가 고유 식별자. 보통 닉네임과 동일. 예: Hingumon / 땅땅공방',
    },
    {
      key: 'nickname',
      label: '닉네임',
      type: 'string',
      required: true,
      desc: '표시용 닉네임. id와 동일하게 유지 권장',
    },
    {
      key: 'bio',
      label: '소개',
      type: 'string',
      required: false,
      desc: '작가 자기소개. 비어있을 수 있음',
    },
    {
      key: 'avatar',
      label: '프로필 이미지 URL',
      type: 'string',
      required: false,
      desc: '프로필 이미지 URL. 없으면 빈 문자열',
    },
    {
      key: 'tags',
      label: '주요 장르 태그',
      type: 'array',
      required: false,
      desc: '작가의 주요 활동 장르. 부스 tags에서 집계해 자동 생성 예정',
    },
    {
      key: 'links',
      label: 'SNS 링크',
      type: 'object',
      required: false,
      desc: '플랫폼별 링크. 키: twitter | instagram | pixiv | youtube | bluesky',
      subFields: [
        { key: 'twitter',   label: 'Twitter / X', type: 'string' },
        { key: 'instagram', label: 'Instagram',   type: 'string' },
        { key: 'pixiv',     label: 'Pixiv',       type: 'string' },
        { key: 'youtube',   label: 'YouTube',     type: 'string' },
        { key: 'bluesky',   label: 'Bluesky',     type: 'string' },
      ],
    },
    {
      key: 'events',
      label: '참여 행사 기록',
      type: 'array',
      required: false,
      desc: '참여한 행사 ID 목록. 현재 미사용. 부스 데이터에서 역참조로 집계 예정',
    },
  ],

  requiredFields: ['id', 'nickname'],

  csvColumns: [
    { csvHeader: 'id',        field: 'id' },
    { csvHeader: 'nickname',  field: 'nickname' },
    { csvHeader: 'bio',       field: 'bio',     transform: (v) => v || '' },
    { csvHeader: 'avatar',    field: 'avatar',  transform: (v) => v || '' },
    { csvHeader: 'twitter',   field: 'links.twitter',   transform: (v) => v || undefined },
    { csvHeader: 'instagram', field: 'links.instagram', transform: (v) => v || undefined },
    { csvHeader: 'pixiv',     field: 'links.pixiv',     transform: (v) => v || undefined },
    { csvHeader: 'youtube',   field: 'links.youtube',   transform: (v) => v || undefined },
    { csvHeader: 'bluesky',   field: 'links.bluesky',   transform: (v) => v || undefined },
  ],
}

// ─────────────────────────────────────────
// 작품 (works.json)
// ─────────────────────────────────────────
export const WORK_SCHEMA = {
  fields: [
    {
      key: 'id',
      label: '작품 ID',
      type: 'string',
      required: true,
      desc: '고유 식별자. 한국어 이름 기반 snake_case 또는 영문. 예: 원신 → 원신 / blue_archive',
    },
    {
      key: 'name',
      label: '작품명',
      type: 'string',
      required: true,
      desc: '정식 발매 명칭 우선. 예: 블루 아카이브 / 원신 / 하이큐!!',
    },
    {
      key: 'aliases',
      label: '별칭 목록',
      type: 'array',
      required: false,
      desc: '줄임말, 다른 표기, 원어명 등. 검색 및 매핑에 활용. 예: ["블아", "Blue Archive", "ブルーアーカイブ"]',
    },
    {
      key: 'category',
      label: '매체 분류',
      type: 'string',
      required: true,
      options: ['game', 'anime', 'manga', 'novel', 'webtoon', 'light_novel', 'web_novel', 'music', 'vtuber', 'other'],
      desc: '작품의 주 매체. 복수 매체는 배열로 확장 예정',
    },
  ],

  requiredFields: ['id', 'name', 'category'],

  // 카테고리 한국어 라벨
  categoryLabels: {
    game:        '게임',
    anime:       '애니메이션',
    manga:       '만화',
    novel:       '소설',
    webtoon:     '웹툰',
    light_novel: '라이트 노벨',
    web_novel:   '웹소설',
    music:       '음악',
    vtuber:      'VTuber',
    other:       '기타',
  },

  csvColumns: [
    { csvHeader: 'id',       field: 'id' },
    { csvHeader: 'name',     field: 'name' },
    { csvHeader: 'aliases',  field: 'aliases',  transform: (v) => v ? v.split('|').map(s => s.trim()) : [] },
    { csvHeader: 'category', field: 'category' },
  ],
}

// ─────────────────────────────────────────
// 전체 스키마 맵 (import 편의용)
// ─────────────────────────────────────────
export const SCHEMAS = {
  event:     EVENT_SCHEMA,
  eventType: EVENT_TYPE_SCHEMA,
  booth:     BOOTH_SCHEMA,
  artist:    ARTIST_SCHEMA,
  work:      WORK_SCHEMA,
}
