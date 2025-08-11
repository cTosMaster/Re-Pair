import { useState } from "react";

  // const categoryData = [
  //   {
  //     category: "핸드폰",
  //     products: ["아이폰 14", "갤럭시 S23"]
  //   },
  //   {
  //     category: "노트북",
  //     products: ["맥북 프로", "그램 16"]
  //   }
  // ];

function RepairRequestForm({ categoryData = [] }) {
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
    setPhone(onlyNums);
  };

  const productList =
    categoryData.find((item) => item.category === selectedCategory)
      ?.products || [];

  const isFormValid =
    title.trim() &&
    phone.length === 11 &&
    content.trim() &&
    selectedCategory &&
    selectedProduct;

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white shadow-md rounded-xl">
      <h2 className="text-xl font-semibold mb-6 text-center">수리 요청서</h2>

      {/* 제목 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 고장난 시계를 수리하고 싶어요"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* 카테고리 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">카테고리</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedProduct(""); // 제품 초기화
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">카테고리 선택</option>
          {categoryData.map(({ category }) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* 제품명 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">제품명</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          disabled={!selectedCategory}
        >
          <option value="">제품명 선택</option>
          {productList.map((product) => (
            <option key={product} value={product}>
              {product}
            </option>
          ))}
        </select>
      </div>

      {/* 연락처 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">연락처</label>
        <input
          type="text"
          value={phone}
          onChange={handlePhoneChange}
          maxLength={11}
          inputMode="numeric"
          placeholder="예: 01012345678 (숫자만 입력)"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* 수리 내용 */}
      <div className="mb-6">
        <label className="block mb-1 text-sm font-medium">수리 내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="5"
          placeholder="어떤 문제가 있는지 자세히 알려주세요."
          className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none"
        />
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={!isFormValid}
        className={`w-full py-2 rounded-md font-medium transition ${
          isFormValid
            ? "bg-[#A5CD82] text-white hover:bg-[#94bb71]"
            : "bg-gray-300 text-white cursor-not-allowed"
        }`}
      >
        제출하기
      </button>
    </div>
  );
}

export default RepairRequestForm;