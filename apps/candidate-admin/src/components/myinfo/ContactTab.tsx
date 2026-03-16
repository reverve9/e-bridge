import { useState, useEffect } from 'react';
import { Save, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContactTabProps {
  candidateId: string;
}

// SNS 아이콘 컴포넌트들
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const BlogIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.273 12.845 7.376 24H0l8.899-11.155L0 0h7.377l8.896 12.845zm0 0L24 0h-7.377l-5.753 7.158 5.403 5.687z"/>
  </svg>
);

const KakaoIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
  </svg>
);

const SNS_CONFIG: Record<string, { Icon: any; color: string; label: string; placeholder: string }> = {
  youtube: { Icon: YoutubeIcon, color: '#FF0000', label: 'YouTube', placeholder: 'https://youtube.com/@채널명' },
  instagram: { Icon: InstagramIcon, color: '#E4405F', label: 'Instagram', placeholder: 'https://instagram.com/아이디' },
  facebook: { Icon: FacebookIcon, color: '#1877F2', label: 'Facebook', placeholder: 'https://facebook.com/페이지명' },
  twitter: { Icon: TwitterIcon, color: '#000000', label: 'X (Twitter)', placeholder: 'https://x.com/아이디' },
  blog: { Icon: BlogIcon, color: '#03C75A', label: 'Blog', placeholder: 'https://blog.naver.com/아이디' },
  kakao: { Icon: KakaoIcon, color: '#FEE500', label: 'KakaoTalk 채널', placeholder: 'https://pf.kakao.com/채널명' },
};

const DEFAULT_ORDER = ['youtube', 'instagram', 'facebook', 'twitter', 'blog', 'kakao'];

export default function ContactTab({ candidateId }: ContactTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snsOrder, setSnsOrder] = useState<string[]>(DEFAULT_ORDER);

  const [formData, setFormData] = useState({
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    sns_youtube: '',
    sns_instagram: '',
    sns_facebook: '',
    sns_twitter: '',
    sns_blog: '',
    sns_kakao: '',
  });

  useEffect(() => {
    fetchData();
  }, [candidateId]);

  const fetchData = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('contact_address, contact_phone, contact_email, sns_youtube, sns_instagram, sns_facebook, sns_twitter, sns_blog, sns_kakao, sns_order')
      .eq('id', candidateId)
      .single();

    if (data) {
      setFormData({
        contact_address: data.contact_address || '',
        contact_phone: data.contact_phone || '',
        contact_email: data.contact_email || '',
        sns_youtube: data.sns_youtube || '',
        sns_instagram: data.sns_instagram || '',
        sns_facebook: data.sns_facebook || '',
        sns_twitter: data.sns_twitter || '',
        sns_blog: data.sns_blog || '',
        sns_kakao: data.sns_kakao || '',
      });
      setSnsOrder(data.sns_order || DEFAULT_ORDER);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSnsChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [`sns_${key}`]: value }));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...snsOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSnsOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === snsOrder.length - 1) return;
    const newOrder = [...snsOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSnsOrder(newOrder);
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('candidates')
      .update({
        contact_address: formData.contact_address || null,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
        sns_youtube: formData.sns_youtube || null,
        sns_instagram: formData.sns_instagram || null,
        sns_facebook: formData.sns_facebook || null,
        sns_twitter: formData.sns_twitter || null,
        sns_blog: formData.sns_blog || null,
        sns_kakao: formData.sns_kakao || null,
        sns_order: snsOrder,
      })
      .eq('id', candidateId);

    if (error) {
      alert('저장에 실패했습니다: ' + error.message);
    } else {
      alert('저장되었습니다');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">연락처 / SNS</h1>
        <p className="text-gray-500 mt-1">유권자 페이지에 표시될 연락처와 SNS 링크를 관리합니다.</p>
      </div>

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 좌측: 연락처 정보 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 mb-2">연락처 정보</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">선거사무소 주소</label>
            <input
              type="text"
              name="contact_address"
              value={formData.contact_address}
              onChange={handleChange}
              placeholder="예: 강릉시 강릉대로 122, 지하1층"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 우측: SNS 링크 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">SNS 링크</h3>
          <p className="text-sm text-gray-500 mb-4">화살표로 표시 순서를 변경할 수 있습니다.</p>
          
          <div className="space-y-3">
            {snsOrder.map((key, index) => {
              const config = SNS_CONFIG[key];
              if (!config) return null;
              const { Icon, color, label, placeholder } = config;
              const value = formData[`sns_${key}` as keyof typeof formData];
              const hasUrl = !!value;
              
              return (
                <div 
                  key={key} 
                  className={`bg-gray-50 rounded-xl p-3 ${hasUrl ? 'ring-1 ring-blue-200' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* 순서 변경 버튼 */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === snsOrder.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* 아이콘 */}
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* 입력 */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input
                        type="url"
                        value={value}
                        onChange={(e) => handleSnsChange(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700"
        >
          <Save size={20} />
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
