import { useState } from "react";
import axios from "axios";
import { createFinalEstimate } from "../../../services/customerAPI";


function FinalEstimateSubmitter({ requestId, estimateData, beforeImgs = [], afterImgs = [], onSubmitted }) {
  const [loading, setLoading] = useState(false);

  // === 파일 업로드 로직 ===
  const uploadFile = async (file) => {
    // 1) initiate
    const initRes = await axios.post("/api/files/initiate", {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    });
    const { key, uploadUrl } = initRes.data;

    // 2) presigned url 업로드
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    // 3) complete
    const completeRes = await axios.post("/api/files/complete", {
      key,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    });

    return completeRes.data.url; // 최종 URL
  };

  // === 제출 ===
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // BEFORE
      const uploadedBefore = await Promise.all(
        beforeImgs.map(async (f) => {
          if (f?.file) {
            const url = await uploadFile(f.file);
            return { url, imageType: "BEFORE" };
          } else if (f?.url) {
            return { url: f.url, imageType: "BEFORE" };
          }
          return null;
        })
      );

      // AFTER
      const uploadedAfter = await Promise.all(
        afterImgs.map(async (f) => {
          if (f?.file) {
            const url = await uploadFile(f.file);
            return { url, imageType: "AFTER" };
          } else if (f?.url) {
            return { url: f.url, imageType: "AFTER" };
          }
          return null;
        })
      );

      const images = [...uploadedBefore, ...uploadedAfter].filter(Boolean);

      // 최종 견적 데이터
      const body = {
        description: estimateData.extraNote ?? "",
        finalPrice:
          estimateData.presets.reduce((s, p) => s + (p.price || 0), 0) +
          (parseInt(estimateData.extraCost || 0, 10) || 0),
        presetIds: estimateData.presets.map((p) => p.id),
        images,
      };

      // ✅ 최종 견적 제출
      await createFinalEstimate(requestId, body);

      alert("최종 견적 제출 완료!");
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error("FinalEstimateSubmitter error:", err.response ?? err);
      alert("제출 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleSubmit}
      className="w-full py-2 rounded-md bg-[#A5CD82] text-white font-medium hover:bg-[#94bb71] transition"
    >
      {loading ? "제출 중..." : "제출"}
    </button>
  );
}

export default FinalEstimateSubmitter;