import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  Layers, 
  Settings, 
  LogOut,
  ChevronDown,
  FileText,
  Image,
  Phone,
  Target,
  Newspaper,
  Heart,
  MessageCircle,
  MessageSquare as MessageSquareText,
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  candidateId: string;
  onLogout: () => void;
}

// PC 사이드바 네비게이션
const sidebarNavItems = [
  { path: '/dashboard', label: '홈', icon: Home },
  { path: '/my-info', label: '내정보', icon: User, hasSubmenu: true },
  { path: '/content', label: '콘텐츠', icon: Layers, hasSubmenu: true },
  { path: '/settings', label: '설정', icon: Settings },
];

// 내정보 서브메뉴 (공약 포함, 테마 삭제)
const myInfoSubItems = [
  { path: '/my-info/images', label: '이미지', icon: Image },
  { path: '/my-info/profile', label: '프로필', icon: FileText },
  { path: '/my-info/contact', label: '연락처/SNS', icon: Phone },
  { path: '/my-info/pledges', label: '공약', icon: Target },
];

// 콘텐츠 서브메뉴 (공약 제외)
const contentSubItems = [
  { path: '/content/feeds', label: '소식', icon: Newspaper },
  { path: '/content/cheers', label: '응원', icon: Heart },
  { path: '/content/qna', label: 'Q&A', icon: MessageCircle },
  { path: '/content/sms', label: '문자', icon: MessageSquareText },
];

// 모바일 바텀 네비게이션 (내정보 제외, 콘텐츠 펼침)
const mobileNavItems = [
  { path: '/dashboard', label: '홈', icon: Home },
  { path: '/content/feeds', label: '소식', icon: Newspaper },
  { path: '/content/cheers', label: '응원', icon: Heart },
  { path: '/content/qna', label: 'Q&A', icon: MessageCircle },
  { path: '/settings', label: '설정', icon: Settings },
];

export default function MainLayout({ children, candidateId, onLogout }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // PC 사이드바 서브메뉴 열림 상태
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(
    location.pathname.startsWith('/my-info') ? '/my-info' :
    location.pathname.startsWith('/content') ? '/content' : null
  );

  const isActivePath = (path: string) => {
    if (path === '/my-info') return location.pathname.startsWith('/my-info');
    if (path === '/content') return location.pathname.startsWith('/content');
    return location.pathname === path;
  };

  const handleSidebarNavClick = (item: typeof sidebarNavItems[0]) => {
    if (item.hasSubmenu) {
      setOpenSubmenu(openSubmenu === item.path ? null : item.path);
    } else {
      navigate(item.path);
    }
  };

  const getSubItems = (path: string) => {
    if (path === '/my-info') return myInfoSubItems;
    if (path === '/content') return contentSubItems;
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========== PC: 사이드바 ========== */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:bottom-0 md:w-60 md:flex-col md:bg-white md:border-r md:border-gray-200">
        {/* 로고 */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600">E-Bridge</h1>
          <p className="text-xs text-gray-400 mt-1">후보자 관리</p>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(item.path);
              const isOpen = openSubmenu === item.path;
              const subItems = getSubItems(item.path);

              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleSidebarNavClick(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      {item.label}
                    </div>
                    {item.hasSubmenu && (
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {/* 서브메뉴 */}
                  {item.hasSubmenu && isOpen && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subActive = location.pathname === subItem.path;
                        return (
                          <li key={subItem.path}>
                            <button
                              onClick={() => navigate(subItem.path)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                                subActive 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              <SubIcon size={16} />
                              {subItem.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 로그아웃 */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <LogOut size={20} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* ========== 메인 컨텐츠 영역 ========== */}
      <main className="pb-28 md:pb-0 md:ml-60">
        <div className="max-w-[1280px] mx-auto">
          {children}
        </div>
      </main>

      {/* ========== 모바일: 하단 네비게이션 ========== */}
      <nav 
        className="md:hidden fixed bottom-[30px] left-4 right-4 rounded-2xl shadow-lg safe-area-bottom"
        style={{ 
          maxWidth: '400px', 
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex justify-around py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-2 px-2 rounded-xl transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
