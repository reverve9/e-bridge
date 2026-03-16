import { useState, useEffect, useRef } from 'react';
import { Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImagesTabProps {
  candidateId: string;
}

export default function ImagesTab({ candidateId }: ImagesTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    photo_url: '',
    thumbnail_url: '',
    gallery_images: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, [candidateId]);

  const fetchData = async () => {
    const { data } = await supabase
      .from('candidates')
      .select('photo_url, thumbnail_url, gallery_images')
      .eq('id', candidateId)
      .single();

    if (data) {
      setFormData({
        photo_url: data.photo_url || '',
        thumbnail_url: data.thumbnail_url || '',
        gallery_images: data.gallery_images || [],
      });
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${candidateId}.${fileExt}`;
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

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `thumb-${candidateId}.${fileExt}`;
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

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.gallery_images.length >= 2) {
      alert('갤러리 이미지는 최대 2장까지 업로드할 수 있습니다.');
      return;
    }

    setUploadingGallery(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `gallery-${candidateId}-${Date.now()}.${fileExt}`;
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

  const handleRemoveGalleryImage = (index: number) => {
    const newImages = formData.gallery_images.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery_images: newImages });
  };

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('candidates')
      .update({
        photo_url: formData.photo_url || null,
        thumbnail_url: formData.thumbnail_url || null,
        gallery_images: formData.gallery_images,
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
        <h1 className="text-2xl font-bold">이미지 관리</h1>
        <p className="text-gray-500 mt-1">프로필 사진과 갤러리 이미지를 관리합니다.</p>
      </div>

      {/* 2열 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 좌측: 대표 이미지 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">대표 이미지</h3>
          <p className="text-sm text-gray-500 mb-4">갤러리 슬라이드의 첫 번째 이미지로 표시됩니다. (16:9 권장)</p>
          
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          
          {formData.photo_url ? (
            <div className="relative">
              <img 
                src={formData.photo_url} 
                alt="대표 이미지" 
                className="w-full aspect-video object-cover rounded-xl"
              />
              <button
                onClick={() => setFormData({ ...formData, photo_url: '' })}
                className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X size={18} />
              </button>
              <button
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-3 right-3 px-4 py-2 bg-white/90 rounded-lg text-sm font-medium hover:bg-white"
              >
                변경
              </button>
            </div>
          ) : (
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              {uploadingPhoto ? (
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <>
                  <Upload size={32} className="text-gray-400" />
                  <span className="text-gray-500">클릭하여 이미지 업로드</span>
                  <span className="text-xs text-gray-400">권장: 1920x1080px (16:9)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 우측: 썸네일 + 갤러리 */}
        <div className="space-y-6">
          {/* 썸네일 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">썸네일</h3>
            <p className="text-sm text-gray-500 mb-4">헤더와 목록에 표시되는 프로필 사진입니다. (1:1 권장)</p>
            
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="hidden"
            />
            
            <div className="flex items-center gap-6">
              {formData.thumbnail_url ? (
                <div className="relative">
                  <img 
                    src={formData.thumbnail_url} 
                    alt="썸네일" 
                    className="w-28 h-28 object-cover rounded-full"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, thumbnail_url: '' })}
                    className="absolute -top-1 -right-1 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="w-28 h-28 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {uploadingThumbnail ? (
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    <Upload size={24} className="text-gray-400" />
                  )}
                </button>
              )}
              <div className="text-sm text-gray-500">
                <p>권장 크기: 200x200px 이상</p>
                <p>정사각형 비율 권장</p>
                {formData.thumbnail_url && (
                  <button
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="mt-2 text-blue-600 hover:underline"
                  >
                    이미지 변경
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 갤러리 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">갤러리 이미지</h3>
            <p className="text-sm text-gray-500 mb-4">대표 이미지와 함께 슬라이드로 표시됩니다. (최대 2장)</p>
            
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleGalleryUpload}
              className="hidden"
            />
            
            <div className="grid grid-cols-2 gap-4">
              {formData.gallery_images.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`갤러리 ${index + 1}`} 
                    className="w-full aspect-video object-cover rounded-xl"
                  />
                  <button
                    onClick={() => handleRemoveGalleryImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {formData.gallery_images.length < 2 && (
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                  className="aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {uploadingGallery ? (
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-gray-400" />
                      <span className="text-sm text-gray-500">추가</span>
                    </>
                  )}
                </button>
              )}
            </div>
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
