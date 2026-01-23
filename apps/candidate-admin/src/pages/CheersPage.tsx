import { useState, useEffect } from 'react';
import { supabase, Cheer } from '../lib/supabase';
import { Heart, Eye, EyeOff, User } from 'lucide-react';

interface CheersPageProps {
  candidateId: string;
}

export default function CheersPage({ candidateId }: CheersPageProps) {
  const [cheers, setCheers] = useState<Cheer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCheers = async () => {
    const { data } = await supabase
      .from('cheers')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (data) setCheers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCheers();
  }, [candidateId]);

  const toggleVisibility = async (id: string, isVisible: boolean) => {
    await supabase.from('cheers').update({ is_visible: !isVisible }).eq('id', id);
    fetchCheers();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (hours < 48) return '어제';
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart size={24} className="text-red-500" />
          <h1 className="text-xl font-bold">응원 메시지</h1>
        </div>
        <span className="text-sm text-gray-400">{cheers.length}개</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : cheers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          아직 응원 메시지가 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {cheers.map((cheer) => (
            <div 
              key={cheer.id} 
              className={`bg-white rounded-xl p-4 border ${
                cheer.is_visible ? 'border-gray-100' : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{cheer.name}</span>
                      <span className="text-xs text-gray-400">{formatDate(cheer.created_at)}</span>
                    </div>
                    <button
                      onClick={() => toggleVisibility(cheer.id, cheer.is_visible)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg"
                      title={cheer.is_visible ? '숨기기' : '보이기'}
                    >
                      {cheer.is_visible ? (
                        <Eye size={16} className="text-gray-400" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-700">{cheer.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
