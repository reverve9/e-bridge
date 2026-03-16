import { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Eye, EyeOff, Trash2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface QnA {
  id: string;
  question: string;
  answer: string | null;
  questioner_name: string | null;
  is_answered: boolean;
  is_visible: boolean;
  created_at: string;
  answered_at: string | null;
}

interface QnaTabProps {
  candidateId: string;
}

export default function QnaTab({ candidateId }: QnaTabProps) {
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQna, setSelectedQna] = useState<QnA | null>(null);
  const [answer, setAnswer] = useState('');
  const [activeFilter, setActiveFilter] = useState<'unanswered' | 'answered'>('unanswered');

  const fetchQnas = async () => {
    const { data } = await supabase
      .from('qna')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (data) setQnas(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQnas();
  }, [candidateId]);

  const handleAnswer = async () => {
    if (!selectedQna || !answer.trim()) return;

    const { error } = await supabase.from('qna').update({
      answer,
      is_answered: true,
      answered_at: new Date().toISOString(),
    }).eq('id', selectedQna.id);

    if (!error) {
      setSelectedQna(null);
      setAnswer('');
      fetchQnas();
    }
  };

  const toggleVisibility = async (id: string, isVisible: boolean) => {
    await supabase.from('qna').update({ is_visible: !isVisible }).eq('id', id);
    fetchQnas();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 Q&A를 삭제하시겠습니까?')) return;
    
    await supabase.from('qna').delete().eq('id', id);
    fetchQnas();
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

  const unansweredCount = qnas.filter(q => !q.is_answered).length;
  const answeredCount = qnas.filter(q => q.is_answered).length;

  const filteredQnas = qnas.filter(q => 
    activeFilter === 'unanswered' ? !q.is_answered : q.is_answered
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle size={20} className="text-blue-500" />
          <h1 className="text-xl font-bold">Q&A 관리</h1>
          {unansweredCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unansweredCount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">유권자 질문에 답변하고 관리합니다.</p>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('unanswered')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeFilter === 'unanswered'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          미답변 ({unansweredCount})
        </button>
        <button
          onClick={() => setActiveFilter('answered')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeFilter === 'answered'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          답변완료 ({answeredCount})
        </button>
      </div>

      {/* Q&A 목록 */}
      {filteredQnas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          {activeFilter === 'unanswered' ? '미답변 질문이 없습니다' : '답변 완료된 질문이 없습니다'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQnas.map((qna) => (
            <div 
              key={qna.id} 
              className={`bg-gray-50 rounded-xl p-4 ${!qna.is_visible ? 'opacity-50' : ''}`}
            >
              {/* 질문 헤더 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">
                    {qna.questioner_name || '익명'}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{formatDate(qna.created_at)}</span>
                  {!qna.is_visible && (
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-500 rounded-full">숨김</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {qna.is_answered && (
                    <button
                      onClick={() => toggleVisibility(qna.id, qna.is_visible)}
                      className="p-1.5 hover:bg-gray-200 rounded-lg"
                      title={qna.is_visible ? '숨기기' : '보이기'}
                    >
                      {qna.is_visible ? (
                        <Eye size={16} className="text-green-500" />
                      ) : (
                        <EyeOff size={16} className="text-gray-400" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(qna.id)}
                    className="p-1.5 hover:bg-red-100 rounded-lg"
                    title="삭제"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              {/* 질문 내용 */}
              <p className="font-medium text-gray-900 mb-3">{qna.question}</p>

              {/* 답변 영역 */}
              {qna.is_answered ? (
                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                    <Check size={12} />
                    답변완료
                    {qna.answered_at && (
                      <span className="text-gray-400 ml-1">
                        · {formatDate(qna.answered_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{qna.answer}</p>
                  <button
                    onClick={() => {
                      setSelectedQna(qna);
                      setAnswer(qna.answer || '');
                    }}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    답변 수정
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedQna(qna);
                    setAnswer('');
                  }}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium"
                >
                  답변하기
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 답변 모달 */}
      {selectedQna && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
          onClick={() => setSelectedQna(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-3xl overflow-hidden"
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">
                {selectedQna.is_answered ? '답변 수정' : '답변하기'}
              </h2>
              <button onClick={() => setSelectedQna(null)}>
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* 모달 컨텐츠 */}
            <div className="p-4">
              {/* 질문 */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    {selectedQna.questioner_name || '익명'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(selectedQna.created_at)}
                  </span>
                </div>
                <p className="font-medium text-gray-900">{selectedQna.question}</p>
              </div>

              {/* 답변 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">답변</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="유권자의 질문에 답변해주세요"
                />
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleAnswer}
                disabled={!answer.trim()}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={18} />
                {selectedQna.is_answered ? '답변 수정' : '답변 등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
