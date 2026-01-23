import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-500 mb-6">
          QR코드를 다시 스캔하거나<br />
          올바른 주소인지 확인해주세요.
        </p>
        <div className="text-sm text-gray-400">
          E-Bridge
        </div>
      </div>
    </div>
  );
}
