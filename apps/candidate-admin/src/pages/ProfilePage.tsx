// ProfilePage.tsx
import { useState, useEffect } from 'react';
import { supabase, Candidate, Profile } from '../lib/supabase';
import { Save, Camera } from 'lucide-react';

interface ProfilePageProps {
  candidateId: string;
}

export default function ProfilePage({ candidateId }: ProfilePageProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slogan, setSlogan] = useState('');
  const [introduction, setIntroduction] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [candidateRes, profileRes] = await Promise.all([
        supabase.from('candidates').select('*').eq('id', candidateId).single(),
        supabase.from('profiles').select('*').eq('candidate_id', candidateId).single(),
      ]);

      if (candidateRes.data) {
        setCandidate(candidateRes.data);
        setSlogan(candidateRes.data.slogan || '');
      }
      if (profileRes.data) {
        setProfile(profileRes.data);
        setIntroduction(profileRes.data.introduction || '');
      }
      setLoading(false);
    };

    fetchData();
  }, [candidateId]);

  const handleSave = async () => {
    setSaving(true);

    await supabase.from('candidates').update({ slogan }).eq('id', candidateId);
    
    await supabase.from('profiles').upsert({
      candidate_id: candidateId,
      introduction,
    });

    setSaving(false);
    alert('저장되었습니다');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">프로필 수정</h1>

      {/* 프로필 사진 */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400">
            {candidate?.name[0]}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Camera size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">슬로건</label>
          <input
            type="text"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="멀리 보고 크게 생각하는 새로운 시의원!"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">인사말</label>
          <textarea
            value={introduction}
            onChange={(e) => setIntroduction(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="유권자에게 전하는 인사말을 작성하세요"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        <Save size={20} />
        {saving ? '저장 중...' : '저장하기'}
      </button>
    </div>
  );
}
