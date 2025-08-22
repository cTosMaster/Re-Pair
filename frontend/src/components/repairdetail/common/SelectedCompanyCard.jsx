function SelectedCompanyCard({
  company = { name: "-", email: "-", phone: "-", profileImage: "" },
}) {
  const { name, email, phone, profileImage } = company;

  return (
    <div
      className="
        mt-3 max-w-md mx-auto
        bg-white rounded-xl shadow-md
        border border-gray-200
        px-4 py-3
        flex items-center justify-between
      "
    >
      {/* 왼쪽: 아바타 + 정보 */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-16 h-16 rounded-md bg-blue-400/90 overflow-hidden shrink-0">
          {profileImage ? (
            <img src={profileImage} alt="업체 로고" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[14px] text-white">
              🏢
            </div>
          )}
        </div>

        <div className="text-[13px] leading-5 text-gray-800 min-w-0">
          <p className="font-semibold truncate">{name}</p>
          <p className="text-gray-500 truncate">{email}</p>
          <p className="text-gray-500 truncate">{phone}</p>
        </div>
      </div>
    </div>
  );
}

export default SelectedCompanyCard;