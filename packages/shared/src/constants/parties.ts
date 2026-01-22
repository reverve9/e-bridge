export const PARTY_COLORS = {
  '더불어민주당': '#004EA2',
  '국민의힘': '#E61E2B',
  '조국혁신당': '#004098',
  '개혁신당': '#FF6600',
  '진보당': '#D6001C',
  '새로운미래': '#003865',
  '무소속': '#808080',
} as const;

export type PartyName = keyof typeof PARTY_COLORS;
