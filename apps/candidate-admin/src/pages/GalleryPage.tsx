import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface GalleryPageProps {
  candidateId: string;
}

export default function GalleryPage({ candidateId }: GalleryPageProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from('candidates')
        .select('gallery_images')
        .eq('id', candidateId)
        .single();

      if (data?.gallery_images) {
        setImages(data.gallery_images);
      }
      setLoading(false);
    };

    fetchGallery();
  }, [candidateId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      alert('최대 3장까지 업로드할 수 있습니다.');
      return;
    }

    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${candidateId}/gallery/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('candidates')
      .upload(fileName, file);

    if (uploadError) {
      alert('업로드에 실패했습니다.');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('candidates')
      .getPublicUrl(fileName);

    const newImages = [...images, urlData.publicUrl];
    setImages(newImages);

    // DB 저장
    await supabase
      .from('candidates')
      .update({ gallery_images: newImages })
      .eq('id', candidateId);

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = async (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);

    setSaving(true);
    await supabase
      .from('candidates')
      .update({ gallery_images: newImages })
      .eq('id', candidateId);
    setSaving(false);
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    setImages(newImages);

    setSaving(true);
    await supabase
      .from('candidates')
      .update({ gallery_images: newImages })
      .eq('id', candidateId);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">갤러리 관리</h1>
      </div>

      {/* 안내 */}
      <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-xl mb-6">
        <p>• 최대 3장까지 업로드할 수 있습니다.</p>
        <p>• 첫 번째 이미지가 대표 이미지로 표시됩니다.</p>
        <p>• 드래그하여 순서를 변경할 수 있습니다.</p>
      </div>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300"
          >
            {images[index] ? (
              <>
                <img
                  src={images[index]}
                  alt={`갤러리 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X size={14} className="text-white" />
                </button>
                {index === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                    대표
                  </span>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={24} />
                <span className="text-xs mt-1">{index + 1}번 이미지</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 업로드 버튼 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || images.length >= 3}
        className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            업로드 중...
          </>
        ) : (
          <>
            <Upload size={20} />
            이미지 업로드 ({images.length}/3)
          </>
        )}
      </button>

      {saving && (
        <p className="text-center text-sm text-gray-500 mt-4">저장 중...</p>
      )}
    </div>
  );
}
