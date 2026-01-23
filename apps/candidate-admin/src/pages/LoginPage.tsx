import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (id: string) => void;
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

    try {
      // Supabase Auth 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      const userEmail = authData.user?.email;

      // admin_emails 배열에 이메일이 포함된 후보자 찾기
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('id')
        .contains('admin_emails', [userEmail])
        .maybeSingle();

      if (candidateError || !candidate) {
        // 기존 방식 fallback (auth_user_id로 찾기)
        const userId = authData.user?.id;
        const { data: candidateFallback } = await supabase
          .from('candidates')
          .select('id')
          .eq('auth_user_id', userId)
          .maybeSingle();

        if (!candidateFallback) {
          setError('등록된 후보자 정보를 찾을 수 없습니다.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        onLogin(candidateFallback.id);
        return;
      }

      onLogin(candidate.id);
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* 로고 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">E-Bridge</h1>
        <p className="text-gray-500 mt-2">후보자 관리 앱</p>
      </div>

      {/* 로그인 박스 */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-center text-gray-900 mb-6">로그인</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          로그인 정보는 슈퍼 관리자에게 문의하세요
        </p>
      </div>
    </div>
  );
}
