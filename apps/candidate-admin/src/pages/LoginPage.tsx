import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (candidateId: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 간단한 이메일 기반 로그인 (실제로는 Supabase Auth 사용 권장)
    const { data, error: fetchError } = await supabase
      .from('candidates')
      .select('id')
      .eq('login_email', email)
      .single();

    if (fetchError || !data) {
      setError('등록되지 않은 이메일입니다.');
      setLoading(false);
      return;
    }

    // TODO: 실제 비밀번호 검증 추가
    onLogin(data.id);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">E-Bridge</h1>
          <p className="text-blue-200">후보자 관리 앱</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">로그인</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="candidate@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                로그인
              </>
            )}
          </button>

          <p className="mt-4 text-center text-sm text-gray-500">
            로그인 정보는 슈퍼 관리자에게 문의하세요
          </p>
        </form>
      </div>
    </div>
  );
}
