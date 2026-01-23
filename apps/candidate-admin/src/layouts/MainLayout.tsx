import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Newspaper, Heart, Settings, LogOut } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  candidateId: string;
  onLogout: () => void;
}

const navItems = [
  { path: '/dashboard', label: '홈', icon: Home },
  { path: '/feeds', label: '소식등록', icon: Newspaper },
  { path: '/cheers', label: '응원', icon: Heart },
  { path: '/settings', label: '설정', icon: Settings },
];

export default function MainLayout({ children, candidateId, onLogout }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PC: 사이드바 */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:bottom-0 md:w-60 md:flex-col md:bg-white md:border-r md:border-gray-200">
        {/* 로고 */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600">E-Bridge</h1>
          <p className="text-xs text-gray-400 mt-1">후보자 관리</p>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
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

      {/* 메인 컨텐츠 영역 */}
      <main className="pb-28 md:pb-0 md:ml-60">
        {children}
      </main>

      {/* 모바일: 하단 플로팅 네비게이션 */}
      <nav 
        className="md:hidden fixed bottom-[30px] left-4 right-4 rounded-2xl shadow-lg safe-area-bottom"
        style={{ 
          maxWidth: '400px', 
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={22} />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
