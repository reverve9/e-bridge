import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, Target, Newspaper, MessageCircle, Settings } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  candidateId: string;
  onLogout: () => void;
}

const navItems = [
  { path: '/dashboard', label: '홈', icon: Home },
  { path: '/feeds', label: '소식', icon: Newspaper },
  { path: '/pledges', label: '공약', icon: Target },
  { path: '/cheers', label: '응원', icon: MessageCircle },
  { path: '/settings', label: '설정', icon: Settings },
];

export default function MainLayout({ children, candidateId, onLogout }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 메인 컨텐츠 */}
      <main>{children}</main>

      {/* 하단 탭 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom" style={{ maxWidth: '430px', margin: '0 auto' }}>
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-2 px-3 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
