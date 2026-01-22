import { useState } from 'react';
import { Search, ChevronRight, ChevronDown, MapPin, Building2, Users, GraduationCap } from 'lucide-react';

// 선거 종류 정의
export const ELECTION_TYPES = {
  METRO_HEAD: { id: 'metro_head', label: '광역자치단체장', level: 'metro', description: '시장, 도지사' },
  LOCAL_HEAD: { id: 'local_head', label: '기초자치단체장', level: 'local', description: '구청장, 시장, 군수' },
  METRO_COUNCIL: { id: 'metro_council', label: '광역의원', level: 'metro_council', description: '시·도의원' },
  LOCAL_COUNCIL: { id: 'local_council', label: '기초의원', level: 'local_council', description: '구·시·군의원' },
  EDUCATION: { id: 'education', label: '교육감', level: 'metro', description: '시·도교육감' },
};

// 시/도 데이터 (강원도만 상세, 나머지는 기본 구조)
const REGIONS = [
  { name: '서울특별시', type: 'metro', districts: [], metroCouncils: [] },
  { name: '부산광역시', type: 'metro', districts: [], metroCouncils: [] },
  { name: '대구광역시', type: 'metro', districts: [], metroCouncils: [] },
  { name: '인천광역시', type: 'metro', districts: [], metroCouncils: [] },
  { name: '광주광역시', type: 'metro', districts: [], metroCouncils: [] },
  { name: '대전광역시', type: 'metro', districts: [], metroCouncils: [] },
  { name: '울산광역시', type: 'metro', districts: [], metroCouncils: [] },
  { name: '세종특별자치시', type: 'metro_single', districts: [], metroCouncils: [] },
  { name: '경기도', type: 'province', districts: [], metroCouncils: [] },
  {
    name: '강원특별자치도',
    type: 'province',
    districts: [
      { 
        name: '춘천시', 
        localCouncils: ['가선거구', '나선거구', '다선거구', '라선거구', '마선거구'] 
      },
      { 
        name: '원주시', 
        localCouncils: ['가선거구', '나선거구', '다선거구', '라선거구', '마선거구', '바선거구'] 
      },
      { 
        name: '강릉시', 
        localCouncils: ['가선거구', '나선거구', '다선거구', '라선거구', '마선거구'] 
      },
      { 
        name: '동해시', 
        localCouncils: ['가선거구', '나선거구', '다선거구'] 
      },
      { 
        name: '태백시', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '속초시', 
        localCouncils: ['가선거구', '나선거구', '다선거구'] 
      },
      { 
        name: '삼척시', 
        localCouncils: ['가선거구', '나선거구', '다선거구'] 
      },
      { 
        name: '홍천군', 
        localCouncils: ['가선거구', '나선거구', '다선거구'] 
      },
      { 
        name: '횡성군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '영월군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '평창군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '정선군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '철원군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '화천군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '양구군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '인제군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '고성군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
      { 
        name: '양양군', 
        localCouncils: ['가선거구', '나선거구'] 
      },
    ],
    metroCouncils: [
      '춘천시 제1선거구', '춘천시 제2선거구',
      '원주시 제1선거구', '원주시 제2선거구', '원주시 제3선거구',
      '강릉시 제1선거구', '강릉시 제2선거구',
      '동해시·삼척시·태백시',
      '속초시·고성군·양양군',
      '홍천군·횡성군',
      '영월군·평창군·정선군',
      '철원군·화천군·양구군·인제군',
    ],
  },
  { name: '충청북도', type: 'province', districts: [], metroCouncils: [] },
  { name: '충청남도', type: 'province', districts: [], metroCouncils: [] },
  { name: '전북특별자치도', type: 'province', districts: [], metroCouncils: [] },
  { name: '전라남도', type: 'province', districts: [], metroCouncils: [] },
  { name: '경상북도', type: 'province', districts: [], metroCouncils: [] },
  { name: '경상남도', type: 'province', districts: [], metroCouncils: [] },
  { name: '제주특별자치도', type: 'province', districts: [], metroCouncils: [] },
];

export default function DistrictsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRegion, setExpandedRegion] = useState<string | null>('강원특별자치도');
  const [expandedDistrict, setExpandedDistrict] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'structure' | 'election'>('structure');

  const filteredRegions = REGIONS.filter(
    (r) =>
      r.name.includes(searchTerm) ||
      r.districts.some((d) => d.name.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="지역명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('structure')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'structure'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          행정구역 구조
        </button>
        <button
          onClick={() => setSelectedTab('election')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'election'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          선거 종류별 안내
        </button>
      </div>

      {selectedTab === 'election' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">제9회 전국동시지방선거 선거 종류</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <Building2 className="text-blue-600 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900">광역자치단체장</h4>
                <p className="text-sm text-gray-600">시장(특별시·광역시), 도지사</p>
                <p className="text-xs text-gray-500 mt-1">선거구: 시·도 전체</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
              <Building2 className="text-green-600 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900">기초자치단체장</h4>
                <p className="text-sm text-gray-600">구청장, 시장, 군수</p>
                <p className="text-xs text-gray-500 mt-1">선거구: 구·시·군 전체</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <Users className="text-purple-600 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900">광역의원 (시·도의원)</h4>
                <p className="text-sm text-gray-600">시·도의회 의원 (지역구 + 비례대표)</p>
                <p className="text-xs text-gray-500 mt-1">선거구: 시·도 내 광역의원 선거구</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
              <Users className="text-orange-600 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900">기초의원 (구·시·군의원)</h4>
                <p className="text-sm text-gray-600">구·시·군의회 의원 (지역구 + 비례대표)</p>
                <p className="text-xs text-gray-500 mt-1">선거구: 구·시·군 내 기초의원 선거구</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
              <GraduationCap className="text-red-600 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900">교육감</h4>
                <p className="text-sm text-gray-600">시·도 교육감</p>
                <p className="text-xs text-gray-500 mt-1">선거구: 시·도 전체</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'structure' && (
        <>
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>안내:</strong> 현재 강원특별자치도만 상세 데이터가 입력되어 있습니다. 
              다른 지역은 순차적으로 추가됩니다.
            </p>
          </div>

          {/* Regions List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {filteredRegions.map((region) => (
              <div key={region.name} className="border-b border-gray-200 last:border-b-0">
                {/* Region Header */}
                <button
                  onClick={() => setExpandedRegion(expandedRegion === region.name ? null : region.name)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{region.name}</span>
                    {region.districts.length > 0 ? (
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded">
                        {region.districts.length}개 시·군
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        데이터 준비중
                      </span>
                    )}
                  </div>
                  {region.districts.length > 0 && (
                    expandedRegion === region.name ? (
                      <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )
                  )}
                </button>

                {/* Expanded Content */}
                {expandedRegion === region.name && region.districts.length > 0 && (
                  <div className="px-6 pb-4 space-y-4">
                    {/* 광역의원 선거구 */}
                    {region.metroCouncils.length > 0 && (
                      <div className="ml-4 p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                          <Users size={16} />
                          광역의원(도의원) 선거구
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {region.metroCouncils.map((council) => (
                            <span
                              key={council}
                              className="px-2 py-1 bg-white text-purple-700 text-sm rounded border border-purple-200"
                            >
                              {council}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 기초자치단체 목록 */}
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Building2 size={16} />
                        기초자치단체 (시·군)
                      </h4>
                      <div className="space-y-2">
                        {region.districts.map((district) => (
                          <div key={district.name} className="border border-gray-200 rounded-lg">
                            <button
                              onClick={() => setExpandedDistrict(
                                expandedDistrict === district.name ? null : district.name
                              )}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                            >
                              <span className="text-gray-800">{district.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  기초의원 {district.localCouncils.length}개 선거구
                                </span>
                                {expandedDistrict === district.name ? (
                                  <ChevronDown size={16} className="text-gray-400" />
                                ) : (
                                  <ChevronRight size={16} className="text-gray-400" />
                                )}
                              </div>
                            </button>

                            {expandedDistrict === district.name && (
                              <div className="px-4 pb-3 pt-1">
                                <div className="p-3 bg-orange-50 rounded-lg">
                                  <h5 className="text-sm font-medium text-orange-800 mb-2">
                                    기초의원({district.name.replace('시', '시의원').replace('군', '군의원')}) 선거구
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {district.localCouncils.map((council) => (
                                      <span
                                        key={council}
                                        className="px-2 py-1 bg-white text-orange-700 text-xs rounded border border-orange-200"
                                      >
                                        {council}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
