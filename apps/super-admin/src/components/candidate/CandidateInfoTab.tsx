import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase, Candidate, PARTIES, getPartyCode, getPartyColor } from '../../lib/supabase';

const partyOptions = Object.keys(PARTIES);

const ELECTION_TYPES = [
  { id: 'metro_head', label: '광역자치단체장' },
  { id: 'local_head', label: '기초자치단체장' },
  { id: 'metro_council_district', label: '광역의원 (지역구)' },
  { id: 'metro_council_proportional', label: '광역의원 (비례대표)' },
  { id: 'local_council_district', label: '기초의원 (지역구)' },
  { id: 'local_council_proportional', label: '기초의원 (비례대표)' },
  { id: 'education', label: '교육감' },
];

const ELECTION_TYPE_LABELS: Record<string, string> = {
  metro_head: '광역자치단체장',
  local_head: '기초자치단체장',
  metro_council_district: '광역의원(지역구)',
  metro_council_proportional: '광역의원(비례)',
  local_council_district: '기초의원(지역구)',
  local_council_proportional: '기초의원(비례)',
  education: '교육감',
};

const REGIONS = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
  '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원특별자치도',
  '충청북도', '충청남도', '전북특별자치도', '전라남도', '경상북도', '경상남도', '제주특별자치도',
];

interface CandidateInfoTabProps {
  candidate: Candidate;
  onUpdate: () => void;
}

export default function CandidateInfoTab({ candidate, onUpdate }: CandidateInfoTabProps) {
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: candidate.name,
    party: candidate.party,
    election_type: candidate.election_type,
    election_name: (candidate as any).election_name || '',
    region: candidate.region,
    district: candidate.district || '',
    constituency: candidate.constituency || '',
    constituency_detail: (candidate as any).constituency_detail || '',
    candidate_number: (candidate as any).candidate_number || '',
    slogan: candidate.slogan || '',
    tagline: (candidate as any).tagline || '',
    login_email: candidate.login_email,
    photo_url: candidate.photo_url || '',
    thumbnail_url: (candidate as any).thumbnail_url || '',
    gallery_images: (candidate as any).gallery_images || [],
    signature_url: (candidate as any).signature_url || '',
    party_logo_url: (candidate as any).party_logo_url || '',
    theme_mode: (candidate as any).theme_mode || 'classic',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 대표 이미지 업로드 (16:9)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${candidate.id}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('candidates')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('이미지 업로드에 실패했습니다.');
      setUploadingPhoto(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('candidates')
      .getPublicUrl(filePath);

    const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
    setFormData({ ...formData, photo_url: urlWithTimestamp });
    setUploadingPhoto(false);
  };

  // 썸네일 이미지 업로드 (1:1)
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `thumb-${candidate.id}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('candidates')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('썸네일 업로드에 실패했습니다.');
      setUploadingThumbnail(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('candidates')
      .getPublicUrl(filePath);

    const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
    setFormData({ ...formData, thumbnail_url: urlWithTimestamp });
    setUploadingThumbnail(false);
  };

  // 갤러리 이미지 업로드 (최대 2장)
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.gallery_images.length >= 2) {
      alert('갤러리 이미지는 최대 2장까지 업로드할 수 있습니다.');
      return;
    }

    setUploadingGallery(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `gallery-${candidate.id}-${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('candidates')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('이미지 업로드에 실패했습니다.');
      setUploadingGallery(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('candidates')
      .getPublicUrl(filePath);

    setFormData({ 
      ...formData, 
      gallery_images: [...formData.gallery_images, publicUrl] 
    });
    setUploadingGallery(false);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // 갤러리 이미지 삭제
  const handleRemoveGalleryImage = (index: number) => {
    const newImages = formData.gallery_images.filter((_: string, i: number) => i !== index);
    setFormData({ ...formData, gallery_images: newImages });
  };

  // 싸인 이미지 업로드
  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSignature(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `sign-${candidate.id}.${fileExt}`;
    const filePath = `signatures/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('candidates')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('싸인 업로드에 실패했습니다.');
      setUploadingSignature(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('candidates')
      .getPublicUrl(filePath);

    const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
    setFormData({ ...formData, signature_url: urlWithTimestamp });
    setUploadingSignature(false);
  };

  // 당 로고 업로드
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `party-logo-${candidate.id}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('candidates')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('로고 업로드에 실패했습니다.');
      setUploadingLogo(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('candidates')
      .getPublicUrl(filePath);

    const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
    setFormData({ ...formData, party_logo_url: urlWithTimestamp });
    setUploadingLogo(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const partyCode = getPartyCode(formData.party);

    const { error } = await supabase
      .from('candidates')
      .update({
        name: formData.name,
        party: formData.party,
        party_code: partyCode,
        election_type: formData.election_type,
        election_name: formData.election_name || null,
        region: formData.region,
        district: formData.district || null,
        constituency: formData.constituency || null,
        constituency_detail: formData.constituency_detail || null,
        candidate_number: formData.candidate_number || null,
        slogan: formData.slogan || null,
        tagline: formData.tagline || null,
        login_email: formData.login_email,
        photo_url: formData.photo_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        gallery_images: formData.gallery_images,
        signature_url: formData.signature_url || null,
        party_logo_url: formData.party_logo_url || null,
        theme_mode: formData.theme_mode,
      })
      .eq('id', candidate.id);

    if (error) {
      alert('저장에 실패했습니다.');
    } else {
      onUpdate();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('candidates').delete().eq('id', candidate.id);
    if (!error) {
      navigate('/candidates');
    }
  };

  const partyColor = getPartyColor(formData.party);

  return (
    <div className="space-y-6">
      {/* 이미지 업로드 영역 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">이미지 관리</h3>
        
        <div className="grid grid-cols-2 gap-6">
          {/* 대표 이미지 (16:9) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">대표 이미지 (16:9)</label>
            <p className="text-xs text-gray-500 mb-2">히어로 섹션 첫 번째 이미지로 표시됩니다.</p>
            <div className="flex items-end gap-3">
              {formData.photo_url ? (
                <img 
                  src={formData.photo_url} 
                  alt="대표"
                  className="w-40 h-[90px] rounded-lg object-cover"
                />
              ) : (
                <div className="w-40 h-[90px] rounded-lg flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-300">
                  이미지 없음
                </div>
              )}
              <div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Upload size={16} />
                  {uploadingPhoto ? '업로드 중...' : '변경'}
                </button>
              </div>
            </div>
          </div>

          {/* 썸네일 이미지 (1:1) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">썸네일 이미지 (1:1)</label>
            <p className="text-xs text-gray-500 mb-2">모달, 목록 등에 표시됩니다.</p>
            <div className="flex items-end gap-3">
              {formData.thumbnail_url ? (
                <img 
                  src={formData.thumbnail_url} 
                  alt="썸네일"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-300">
                  없음
                </div>
              )}
              <div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <button
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Upload size={16} />
                  {uploadingThumbnail ? '업로드 중...' : '변경'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* 갤러리 이미지 (최대 2장) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">갤러리 이미지 (최대 2장)</label>
            <p className="text-xs text-gray-500 mb-2">슬라이드로 표시됩니다. (대표 + 갤러리 = 최대 3장)</p>
            <div className="flex items-end gap-3">
              <div className="flex gap-2">
                {[0, 1].map((idx) => (
                  <div key={idx} className="relative">
                    {formData.gallery_images[idx] ? (
                      <>
                        <img 
                          src={formData.gallery_images[idx]} 
                          alt={`갤러리 ${idx + 1}`}
                          className="w-20 h-[45px] rounded object-cover"
                        />
                        <button
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="w-20 h-[45px] rounded flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery || formData.gallery_images.length >= 2}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <Upload size={16} />
                  {uploadingGallery ? '업로드 중...' : '추가'}
                </button>
              </div>
            </div>
          </div>

          {/* 싸인 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">싸인 이미지</label>
            <p className="text-xs text-gray-500 mb-2">인사말 하단에 표시됩니다.</p>
            <div className="flex items-end gap-3">
              {formData.signature_url ? (
                <img 
                  src={formData.signature_url} 
                  alt="싸인"
                  className="h-10 object-contain"
                />
              ) : (
                <div className="w-24 h-10 rounded flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300">
                  없음
                </div>
              )}
              <div>
                <input
                  ref={signatureInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
                <button
                  onClick={() => signatureInputRef.current?.click()}
                  disabled={uploadingSignature}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Upload size={16} />
                  {uploadingSignature ? '업로드 중...' : '변경'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* 당 로고 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정당 로고</label>
            <p className="text-xs text-gray-500 mb-2">헤더에 표시됩니다. (흰색 로고 권장)</p>
            <div className="flex items-end gap-3">
              {formData.party_logo_url ? (
                <div className="px-3 py-2 rounded" style={{ backgroundColor: partyColor }}>
                  <img 
                    src={formData.party_logo_url} 
                    alt="당 로고"
                    className="h-6 object-contain brightness-0 invert"
                  />
                </div>
              ) : (
                <div className="w-24 h-10 rounded flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300">
                  없음
                </div>
              )}
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Upload size={16} />
                  {uploadingLogo ? '업로드 중...' : '변경'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">정당 *</label>
          <select
            name="party"
            value={formData.party}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {partyOptions.map((party) => (
              <option key={party} value={party}>{party}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">기호</label>
          <input
            type="text"
            name="candidate_number"
            value={formData.candidate_number}
            onChange={handleChange}
            placeholder="예: 1-가, 2, 3-나"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">태그라인</label>
          <input
            type="text"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            placeholder="예: MBC 아나운서 출신 · 소통전문가"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 선거 정보 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">선거 종류</label>
          <select
            name="election_type"
            value={formData.election_type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ELECTION_TYPES.map((type) => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">선거명</label>
          <input
            type="text"
            name="election_name"
            value={formData.election_name}
            onChange={handleChange}
            placeholder="예: 강릉시의회의원선거"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">시·도</label>
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">구·시·군</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="예: 강릉시"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">선거구</label>
          <input
            type="text"
            name="constituency"
            value={formData.constituency}
            onChange={handleChange}
            placeholder="예: 다선거구"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">선거구 상세 (행정동)</label>
        <input
          type="text"
          name="constituency_detail"
          value={formData.constituency_detail}
          onChange={handleChange}
          placeholder="예: 교1동, 홍제동, 중앙동"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">슬로건</label>
        <textarea
          name="slogan"
          value={formData.slogan}
          onChange={handleChange}
          rows={2}
          placeholder="예: 멀리 보고 크게 생각하는 새로운 시의원!"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 테마 설정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">유권자 페이지 테마</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme_mode"
              value="classic"
              checked={formData.theme_mode === 'classic'}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">클래식 (라이트)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme_mode"
              value="dark"
              checked={formData.theme_mode === 'dark'}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">다크</span>
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">유권자가 보는 후보자 페이지에 적용됩니다.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">로그인 이메일 *</label>
        <input
          type="email"
          name="login_email"
          value={formData.login_email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between pt-4 border-t">
        <div>
          {deleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-600">정말 삭제하시겠습니까?</span>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                삭제
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={18} />
              삭제
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
}
