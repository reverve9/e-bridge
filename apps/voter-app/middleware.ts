import { next } from '@vercel/edge';

const CRAWLER_PATTERNS = [
  'kakaotalk',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'telegrambot',
  'whatsapp',
  'discordbot',
];

export const config = {
  matcher: ['/((?!api|assets|_next|favicon.ico|.*\\.).*)'],
};

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // partyCode/candidateCode 형태만 처리
  if (pathParts.length !== 2) {
    return next();
  }
  
  const [partyCode, candidateCode] = pathParts;
  
  // 유효한 partyCode 패턴 확인 (tmj, ppp 등)
  const validPartyCodes = ['tmj', 'ppp', 'gnp', 'jnp', 'prp', 'ind'];
  if (!validPartyCodes.includes(partyCode)) {
    return next();
  }

  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const isCrawler = CRAWLER_PATTERNS.some(pattern => userAgent.includes(pattern));

  if (isCrawler) {
    // 크롤러면 OG API로 rewrite
    return Response.redirect(new URL(`/api/og?party=${partyCode}&code=${candidateCode}`, request.url), 307);
  }

  return next();
}
