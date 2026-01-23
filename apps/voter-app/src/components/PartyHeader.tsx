// 정당별 헤더 컴포넌트
// 나중에 정당별 스타일 확장 시 사용

interface PartyHeaderProps {
  party: string;
  partyCode: string;
  partyColor: string;
  partyLogoUrl?: string | null;
  snsLinks?: {
    key: string;
    url: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[];
}

export default function PartyHeader({
  party,
  partyCode,
  partyColor,
  partyLogoUrl,
  snsLinks = [],
}: PartyHeaderProps) {
  // 정당별 헤더 배경 스타일
  const getHeaderStyle = () => {
    if (partyCode === 'tmj' || party === '더불어민주당') {
      return {
        background: 'linear-gradient(90deg, #00B050 0%, #00A0E0 50%, #004EA2 100%)'
      };
    }
    return { backgroundColor: partyColor };
  };

  return (
    <header 
      className="sticky top-0 z-50"
      style={getHeaderStyle()}
    >
      <div className="flex items-center justify-between px-4 py-[15px]">
        {/* 정당 로고 또는 텍스트 */}
        {partyLogoUrl ? (
          <img 
            src={partyLogoUrl} 
            alt={party} 
            className="h-5 object-contain"
          />
        ) : (
          <span className="text-sm font-bold text-white">{party}</span>
        )}

        {/* SNS 아이콘 */}
        {snsLinks.length > 0 && (
          <div className="flex items-center gap-2">
            {snsLinks.map(({ key, url, Icon }) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-white/20"
              >
                <Icon className="w-4 h-4 text-white" />
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
