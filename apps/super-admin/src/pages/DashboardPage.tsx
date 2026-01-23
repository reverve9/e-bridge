import { Users, MapPin, FileText, TrendingUp } from 'lucide-react';

const stats = [
  { label: '등록 후보자', value: '0', icon: Users, color: 'bg-blue-500' },
  { label: '선거구', value: '0', icon: MapPin, color: 'bg-green-500' },
  { label: '등록 공약', value: '0', icon: FileText, color: 'bg-purple-500' },
  { label: '오늘 방문자', value: '0', icon: TrendingUp, color: 'bg-orange-500' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 등록 후보자</h3>
          <div className="text-gray-500 text-sm py-8 text-center">
            등록된 후보자가 없습니다.
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">선거 정보</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">선거명</span>
              <span className="font-medium">제9회 전국동시지방선거</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">선거일</span>
              <span className="font-medium">2026년 6월 3일 (수)</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">D-Day</span>
              <span className="font-bold text-blue-600 text-xl">
                D-{Math.ceil((new Date('2026-06-03').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
