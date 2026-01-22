import { useState } from 'react';
import { Save, Bell, Shield, Database, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'E-Bridge',
    siteDescription: '제9회 전국동시지방선거 후보자 정보 플랫폼',
    adminEmail: 'admin@ebridge.kr',
    enableNotifications: true,
    maintenanceMode: false,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = () => {
    // TODO: Supabase에 저장
    console.log('Settings saved:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 기본 설정 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database size={20} className="text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">기본 설정</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사이트명
            </label>
            <input
              type="text"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사이트 설명
            </label>
            <textarea
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 이메일
            </label>
            <input
              type="email"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 알림 설정 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Bell size={20} className="text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">알림 설정</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">새 후보자 등록 알림</p>
              <p className="text-sm text-gray-500">새 후보자가 등록되면 이메일로 알림을 받습니다.</p>
            </div>
            <input
              type="checkbox"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* 시스템 설정 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield size={20} className="text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">시스템 설정</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">유지보수 모드</p>
              <p className="text-sm text-gray-500">활성화하면 유권자 앱 접속이 일시 차단됩니다.</p>
            </div>
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* 선거 정보 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette size={20} className="text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">선거 정보</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">선거명</p>
            <p className="font-medium">제9회 전국동시지방선거</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">선거일</p>
            <p className="font-medium">2026년 6월 3일 (수)</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">사전투표</p>
            <p className="font-medium">2026년 5월 29일 ~ 30일</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">D-Day</p>
            <p className="font-bold text-blue-600 text-xl">
              D-{Math.ceil((new Date('2026-06-03').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
            </p>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
            saved 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save size={20} />
          <span>{saved ? '저장됨!' : '설정 저장'}</span>
        </button>
      </div>
    </div>
  );
}
