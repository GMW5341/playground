"use client";

export default function HistoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">실험 이력</h2>
        <p className="text-gray-500 mt-1">
          과거 프로토타입 실험 결과를 비교하고 분석할 수 있습니다.
        </p>
      </div>

      <div className="card p-12 text-center">
        <div className="text-gray-300 text-5xl mb-4">&#128203;</div>
        <h3 className="text-lg font-medium text-gray-500">
          실험 이력은 현재 세션 메모리에 저장됩니다
        </h3>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          향후 업데이트에서 DB 연동을 통해 영구 저장, 팀 공유, 버전 비교 기능이 추가될 예정입니다.
          현재는 메인 시험장 페이지에서 실시간으로 이력을 확인하실 수 있습니다.
        </p>
        <a href="/" className="inline-block mt-6 btn-primary text-sm">
          시험장으로 이동
        </a>
      </div>

      {/* 향후 기능 로드맵 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h4 className="font-medium text-gray-700 mb-2">영구 저장</h4>
          <p className="text-sm text-gray-500">
            PostgreSQL/Supabase 연동으로 모든 실험 결과를 영구 보관합니다.
          </p>
          <span className="inline-block mt-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">예정</span>
        </div>
        <div className="card p-5">
          <h4 className="font-medium text-gray-700 mb-2">버전 비교</h4>
          <p className="text-sm text-gray-500">
            같은 기능의 다른 버전을 나란히 비교하여 최적의 설계를 선택합니다.
          </p>
          <span className="inline-block mt-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">예정</span>
        </div>
        <div className="card p-5">
          <h4 className="font-medium text-gray-700 mb-2">팀 협업</h4>
          <p className="text-sm text-gray-500">
            팀원과 실험 결과를 공유하고 코멘트를 남겨 의사결정을 가속화합니다.
          </p>
          <span className="inline-block mt-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">예정</span>
        </div>
      </div>
    </div>
  );
}
