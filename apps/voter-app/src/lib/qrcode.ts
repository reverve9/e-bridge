// QR코드 생성 유틸리티
// Google Charts API 사용 (무료, 설치 불필요)

export const generateQRCodeUrl = (data: string, size: number = 150): string => {
  const encodedData = encodeURIComponent(data);
  return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedData}&choe=UTF-8`;
};

// 후보자 페이지 URL 생성
export const getCandidatePageUrl = (partyCode: string, candidateCode: string): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ebridge.kr';
  return `${baseUrl}/${partyCode}/${candidateCode}`;
};

// 후보자 QR코드 URL 생성
export const getCandidateQRCode = (partyCode: string, candidateCode: string, size: number = 150): string => {
  const pageUrl = getCandidatePageUrl(partyCode, candidateCode);
  return generateQRCodeUrl(pageUrl, size);
};
