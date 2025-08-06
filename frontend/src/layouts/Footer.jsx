const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-sm py-6 px-4 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">© 2025 Re:Pair. All rights reserved.</div>
        <div className="space-x-4">
          <a href="#" className="hover:underline">이용약관</a>
          <a href="#" className="hover:underline">개인정보처리방침</a>
          <a href="mailto:support@repair.com" className="hover:underline">고객지원</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
