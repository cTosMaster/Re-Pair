const PublicFooter = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 text-sm py-10 px-4 border-t">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h4 className="text-base font-semibold mb-2">Re: Pair</h4>
          <p className="text-xs text-gray-500">
            회사 소개 | 메인 페이지
          </p>
        </div>

        <div className="text-xs text-gray-500 leading-relaxed space-y-1">
          <p>Copyright © 2025 Re:Pair. All rights reserved</p>
          <p>대표이사: ㅇㅇㅇ | 사업자등록번호: 000-00-00000</p>
          <p>통신판매번호: 2025-ㅇㅇㅇ-00000 | 이메일: repair@repair.co.kr</p>
        </div>

        <div className="mt-4 space-x-4 text-xs">
          <a href="#" className="hover:underline">이용약관</a>
          <a href="#" className="hover:underline">개인정보 처리방침</a>
          <a href="#" className="hover:underline">위치정보 서비스</a>
          <a href="#" className="hover:underline">이용약관</a>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;