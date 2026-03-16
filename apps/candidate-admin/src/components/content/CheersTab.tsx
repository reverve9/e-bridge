import { useState, useEffect } from 'react';
import { Heart, Eye, EyeOff, User, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Cheer {
  id: string;
  name: string;
  message: string;
  is_visible: boolean;
  likes_count: number;
  created_at: string;
}

interface CheersTabProps {
  candidateId: string;
}

export default function CheersTab({ candidateId }: CheersTabProps) {
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

  const handleDelete = async (id: string) => {
    if (!confirm('이 응원 메시지를 삭제하시겠습니까?')) return;
    
    await supabase.from('cheers').delete().eq('id', id);
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

  const visibleCount = cheers.filter(c => c.is_visible).length;
  const hiddenCount = cheers.filter(c => !c.is_visible).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-red-500" />
            <h1 className="text-xl font-bold">응원 메시지</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">유권자들이 보낸 응원 메시지를 관리합니다.</p>
        </div>
        <div className="text-sm text-gray-500">
          표시 <span className="font-bold text-green-600">{visibleCount}</span> / 
          전체 <span className="font-bold">{cheers.length}</span>
        </div>
      </div>

      {cheers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          아직 응원 메시지가 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {cheers.map((cheer) => (
            <div 
              key={cheer.id} 
              className={`bg-gray-50 rounded-xl p-4 ${!cheer.is_visible ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{cheer.name}</span>
                      <span className="text-xs text-gray-400">{formatDate(cheer.created_at)}</span>
                      {!cheer.is_visible && (
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">숨김</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleVisibility(cheer.id, cheer.is_visible)}
                        className={`p-1.5 rounded-lg ${
                          cheer.is_visible 
                            ? 'hover:bg-gray-200' 
                            : 'hover:bg-green-100'
                        }`}
                        title={cheer.is_visible ? '숨기기' : '보이기'}
                      >
                        {cheer.is_visible ? (
                          <Eye size={16} className="text-green-500" />
                        ) : (
                          <EyeOff size={16} className="text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(cheer.id)}
                        className="p-1.5 hover:bg-red-100 rounded-lg"
                        title="삭제"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap break-words">{cheer.message}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <Heart size={12} />
                    {cheer.likes_count || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
