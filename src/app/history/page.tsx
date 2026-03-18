"use client";

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">실험 이력</h2>
      <p className="text-gray-500 mb-8">
        현재 실험 이력은 세션 메모리에 저장됩니다. 시험장 페이지 좌측 사이드바에서 확인하세요.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h4 className="font-medium text-gray-700 mb-2">영구 저장</h4>
          <p className="text-sm text-gray-500">
            DB 연동으로 모든 실험 결과를 영구 보관합니다.
          </p>
          <span className="inline-block mt-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
            예정
          </span>
        </div>
        <div className="card p-5">
          <h4 className="font-medium text-gray-700 mb-2">버전 비교</h4>
          <p className="text-sm text-gray-500">
            같은 기능의 다른 버전을 나란히 비교합니다.
          </p>
          <span className="inline-block mt-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
            예정
          </span>
        </div>
        <div className="card p-5">
          <h4 className="font-medium text-gray-700 mb-2">팀 협업</h4>
          <p className="text-sm text-gray-500">
            팀원과 실험 결과를 공유하고 코멘트를 남깁니다.
          </p>
          <span className="inline-block mt-3 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
            예정
          </span>
        </div>
      </div>

      <a href="/" className="inline-block mt-8 btn-primary text-sm">
        시험장으로 이동
      </a>
    </div>
  );
}
