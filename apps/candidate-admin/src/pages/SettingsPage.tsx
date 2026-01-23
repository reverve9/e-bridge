import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Phone, Mail, MapPin, Clock, ExternalLink, Save } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  party_code: string;
  candidate_code: string;
  region: string;
  district: string | null;
}

interface SettingsPageProps {
  candidateId: string;
  onLogout: () => void;
}

export default function SettingsPage({ candidateId, onLogout }: SettingsPageProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [contact, setContact] = useState({
    phone: '',
    email: '',
    office_address: '',
    office_hours: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [candidateRes, contactRes] = await Promise.all([
        supabase.from('candidates').select('*').eq('id', candidateId).single(),
        supabase.from('contacts').select('*').eq('candidate_id', candidateId).maybeSingle(),
      ]);

      if (candidateRes.data) {
        setCandidate(candidateRes.data);
      }
      if (contactRes.data) {
        setContact({
          phone: contactRes.data.phone || '',
          email: contactRes.data.email || '',
          office_address: contactRes.data.office_address || '',
          office_hours: contactRes.data.office_hours || '',
        });
      }
      setLoading(false);
    };

    fetchData();
  }, [candidateId]);

  const handleSaveContact = async () => {
    setSaving(true);
    
    await supabase.from('contacts').upsert({
      candidate_id: candidateId,
      ...contact,
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
      <h1 className="text-xl font-bold mb-6">설정</h1>

      {/* 내 정보 */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">내 정보</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">이름</span>
            <span className="font-medium">{candidate?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">정당</span>
            <span className="font-medium">{candidate?.party}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">선거구</span>
            <span className="font-medium text-sm">{candidate?.region} {candidate?.district}</span>
          </div>
        </div>
      </div>

      {/* 유권자 페이지 링크 */}
      <a
        href={`https://ebridge.kr/${candidate?.party_code}/${candidate?.candidate_code}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-700">내 유권자 페이지</p>
            <p className="text-sm text-blue-500 mt-1">
              ebridge.kr/{candidate?.party_code}/{candidate?.candidate_code}
            </p>
          </div>
          <ExternalLink size={20} className="text-blue-500" />
        </div>
      </a>

      {/* 연락처 설정 */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-4">연락처 설정</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Phone size={16} />
              전화번호
            </label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010-0000-0000"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Mail size={16} />
              이메일
            </label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin size={16} />
              선거사무소 주소
            </label>
            <input
              type="text"
              value={contact.office_address}
              onChange={(e) => setContact({ ...contact, office_address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="강릉시 강릉대로 122"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Clock size={16} />
              운영 시간
            </label>
            <input
              type="text"
              value={contact.office_hours}
              onChange={(e) => setContact({ ...contact, office_hours: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="평일 09:00 - 18:00"
            />
          </div>
        </div>
        <button
          onClick={handleSaveContact}
          disabled={saving}
          className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {saving ? '저장 중...' : '연락처 저장'}
        </button>
      </div>

      {/* 로그아웃 */}
      <button
        onClick={onLogout}
        className="w-full py-3 border border-red-200 text-red-500 rounded-xl font-medium flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        로그아웃
      </button>

      <p className="text-center text-xs text-gray-400 mt-6">
        E-Bridge v0.0.1
      </p>
    </div>
  );
}
