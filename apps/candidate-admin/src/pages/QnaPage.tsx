import { useState, useEffect } from 'react';
import { supabase, QnA } from '../lib/supabase';
import { MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QnaPageProps {
  candidateId: string;
}

export default function QnaPage({ candidateId }: QnaPageProps) {
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQna, setSelectedQna] = useState<QnA | null>(null);
  const [answer, setAnswer] = useState('');

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

    await supabase.from('qna').update({
      answer,
      is_answered: true,
      answered_at: new Date().toISOString(),
    }).eq('id', selectedQna.id);

    setSelectedQna(null);
    setAnswer('');
    fetchQnas();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const unansweredCount = qnas.filter(q => !q.is_answered).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle size={24} className="text-blue-500" />
          <h1 className="text-xl font-bold">Q&A</h1>
          {unansweredCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {unansweredCount}
            </span>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
          미답변 ({unansweredCount})
        </button>
        <button className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
          답변완료 ({qnas.length - unansweredCount})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : qnas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          등록된 질문이 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {qnas.filter(q => !q.is_answered).map((qna) => (
            <button
              key={qna.id}
              onClick={() => {
                setSelectedQna(qna);
                setAnswer(qna.answer || '');
              }}
              className="w-full bg-white rounded-xl p-4 border border-gray-100 text-left"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">{qna.questioner_name || '익명'}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">{formatDate(qna.created_at)}</span>
              </div>
              <p className="font-medium text-gray-900">{qna.question}</p>
            </button>
          ))}
        </div>
      )}

      {/* 답변 모달 */}
      <AnimatePresence>
        {selectedQna && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setSelectedQna(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl p-6"
              style={{ maxWidth: '430px', margin: '0 auto' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">답변하기</h2>
                <button onClick={() => setSelectedQna(null)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-500 mb-1">질문</p>
                <p className="font-medium text-gray-900">{selectedQna.question}</p>
              </div>

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

              <button
                onClick={handleAnswer}
                className="w-full mt-4 py-3.5 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Send size={18} />
                답변 등록
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
