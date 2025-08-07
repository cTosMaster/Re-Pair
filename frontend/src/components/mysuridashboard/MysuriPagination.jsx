
import React from 'react';

const MysuriPagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPageNumbersToShow = 5;

  if (totalPages <= 1) return null;

  // 동적으로 보여줄 페이지 번호 계산
  let startPage = Math.max(currentPage - 2, 1);
  let endPage = startPage + maxPageNumbersToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxPageNumbersToShow + 1, 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center mt-6">
      {/* 왼쪽 화살표 */}
      <button
        className="px-3 py-1 border border-[#D9D9D9] rounded-l bg-white disabled:opacity-50 "
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ＜
      </button>

      {/* 페이지 숫자 버튼 */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border-t border-b border-[#D9D9D9] ${
            page === currentPage
              ? 'bg-[#6A8B4E] text-white'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      {/* 오른쪽 화살표 */}
      <button
        className="px-3 py-1 border border-[#D9D9D9] rounded-r bg-white disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ＞
      </button>
    </div>
  );
};

export default MysuriPagination;
