function SelectedEngineerRow({
  engineer = { name: "-", email: "-", phone: "-", profileImage: "", dateText: "" },
}) {
  const { name, email, phone, profileImage, dateText } = engineer;

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
        <div className="w-8 h-8 rounded-md bg-teal-300/90 overflow-hidden shrink-0">
          {profileImage ? (
            <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[14px] text-white">👤</div>
          )}
        </div>

        <div className="text-[13px] leading-5 text-gray-800 min-w-0">
          <p className="font-semibold truncate">{name}</p>
          <p className="text-gray-500 truncate">{email}</p>
          <p className="text-gray-500 truncate">{phone}</p>
        </div>
      </div>

      {/* 오른쪽: 날짜 */}
      <div className="text-[11px] text-gray-500 shrink-0 ml-3">{dateText}</div>
    </div>
  );
}

export default SelectedEngineerRow;