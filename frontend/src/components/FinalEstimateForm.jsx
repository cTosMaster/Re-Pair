import { useState, useEffect } from "react";

const FinalEstimateForm = ({ initialData = {} }) => {
  const [form, setForm] = useState({
    product: "",
    engineer: "",
    phone: "",
    content: "",
    price: "",
  });

  // ✅ 외부에서 받은 초기 데이터 반영
  useEffect(() => {
    setForm({
      product: initialData.product || "",
      engineer: initialData.engineer || "",
      phone: initialData.phone || "",
      content: initialData.content || "",
      price: initialData.price || "",
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-md shadow w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">최종 견적서</h2>

      <div className="space-y-3 text-sm text-gray-700">
        <input
          type="text"
          name="product"
          value={form.product}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="제품명"
        />

        <input
          type="text"
          name="engineer"
          value={form.engineer}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="수리기사"
        />

        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="전화번호"
        />

        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={4}
          className="w-full border rounded p-2 resize-none"
          placeholder="수리 내용"
        />

        <input
          type="text"
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="금액"
        />
      </div>

      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-500">{initialData.date || "YYYY.MM.DD"}</span>
        <button className="px-4 py-2 bg-green-400 text-white rounded hover:bg-green-500 transition">
          제출
        </button>
      </div>
    </div>
  );
};

export default FinalEstimateForm;