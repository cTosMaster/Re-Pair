export default function PartnerCard({
  data,
  className = "",
  gradient = ["#f64086", "#ffa4c9"], // 상단 비주얼 그라데이션 커스터마이즈
}) {
  const { name, address, hours, manager, phone, rating, imageUrl, brandTitle, brandSubtitle } = data;

  return (
    <div className={`snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[32%] p-2 ${className}`}>
      <div className="rounded-2xl shadow-md bg-white transition-all duration-200 hover:shadow-lg">
        {/* 상단 비주얼 */}
        <div
          className="h-48 w-full flex items-center justify-center rounded-t-2xl overflow-hidden"
          style={{ background: `linear-gradient(180deg, ${gradient[0]} 0%, ${gradient[1]} 100%)` }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="bg-white/90 rounded-xl px-6 py-4 text-center">
              <div className="text-2xl font-extrabold text-gray-600 tracking-wide">
                {brandTitle || "새롬 정비"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {brandSubtitle || "수리 전문점"}
              </div>
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="p-5 rounded-b-2xl">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{name}</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            {address && (
              <li>
                <span className="font-medium text-gray-700">주소:</span> {address}
              </li>
            )}
            {hours && (
              <li>
                <span className="font-medium text-gray-700">영업시간:</span> {hours}
              </li>
            )}
            {(manager || phone) && (
              <li>
                <span className="font-medium text-gray-700">담당자:</span> {manager} {phone && `(${phone})`}
              </li>
            )}
            {rating != null && (
              <li className="flex items-center gap-1">
                <span className="font-medium text-gray-700">평균 평점:</span> ⭐ {rating}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}