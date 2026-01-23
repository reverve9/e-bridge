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
    return;
  }
  
  const [partyCode, candidateCode] = pathParts;
  
  // 유효한 partyCode 패턴 확인 (tmj, ppp 등)
  const validPartyCodes = ['tmj', 'ppp', 'gnp', 'jnp', 'prp', 'ind'];
  if (!validPartyCodes.includes(partyCode)) {
    return;
  }

  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const isCrawler = CRAWLER_PATTERNS.some(pattern => userAgent.includes(pattern));

  if (isCrawler) {
    const ogUrl = new URL(`/api/og?party=${partyCode}&code=${candidateCode}`, request.url);
    return Response.redirect(ogUrl.toString(), 307);
  }

  return;
}
