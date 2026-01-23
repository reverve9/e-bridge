import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const partyCode = url.searchParams.get('party');
  const candidateCode = url.searchParams.get('code');
  const isCheer = url.searchParams.get('cheer') === '1';

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !partyCode || !candidateCode) {
    return defaultOgResponse();
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: candidate, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('party_code', partyCode)
      .eq('candidate_code', candidateCode)
      .eq('is_active', true)
      .single();

    if (error || !candidate) {
      return defaultOgResponse();
    }

    // 선거구 정보 조합
    const electionInfo = [candidate.election_name, candidate.constituency].filter(Boolean).join(' ');
    const title = `${candidate.candidate_number || ''} ${candidate.name}`.trim();
    
    // 응원 공유인 경우 다른 description
    const description = isCheer 
      ? `누군가 이 후보를 응원했어요! 🎉`
      : (electionInfo || `${candidate.party} 후보`);
    
    const image = candidate.photo_url || candidate.thumbnail_url || 'https://ebridge.kr/og-default.png';
    const pageUrl = `https://ebridge.kr/${partyCode}/${candidateCode}`;

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - E-Bridge</title>
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="E-Bridge">
  <meta property="og:locale" content="ko_KR">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  
  <meta name="description" content="${escapeHtml(description)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <img src="${image}" alt="${escapeHtml(title)}">
  <a href="${pageUrl}">페이지로 이동</a>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (e) {
    return defaultOgResponse();
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function defaultOgResponse() {
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>E-Bridge</title>
  <meta property="og:title" content="E-Bridge">
  <meta property="og:description" content="후보자와 유권자를 연결하는 플랫폼">
  <meta property="og:image" content="https://ebridge.kr/og-default.png">
  <meta property="og:site_name" content="E-Bridge">
</head>
<body>
  <h1>E-Bridge</h1>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
