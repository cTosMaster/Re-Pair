import React, { useEffect, useState } from "react";

/* ===== 스크립트 로더 유틸 (SignUp.jsx와 동일 로직) ===== */
const loadScriptOnce = (src, id) =>
  new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) return resolve(true);
    const s = document.createElement("script");
    if (id) s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = reject;
    document.head.appendChild(s);
  });

const ensureDaumPostcode = () =>
  window.daum?.Postcode
    ? Promise.resolve(true)
    : loadScriptOnce(
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js",
        "daum-postcode-sdk"
      );

/* Kakao Maps services 로더 (지오코딩용) */
const loadKakaoIfNeeded = () =>
  new Promise((resolve, reject) => {
    // 이미 services까지 준비됨
    if (window.kakao?.maps?.services) return resolve(true);

    // 스크립트가 있고 autoload=false라면 load만 호출
    if (window.kakao?.maps?.load) {
      return window.kakao.maps.load(() => resolve(true));
    }

    const id = "kakao-maps-sdk";
    let s = document.getElementById(id);
    const onReady = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => resolve(true));
      } else {
        reject(new Error("kakao.maps.load not available"));
      }
    };

    if (!s) {
      s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false&libraries=services`;
      s.onerror = reject;
      document.head.appendChild(s);
    }
    s.addEventListener("load", onReady, { once: true });
  });

const CompanyInfoForm = ({ onNext }) => {
  // 1단계 폼 상태 (DTO 매핑은 컨테이너에서 해도 되고 여기서 해도 됨)
  const [form, setForm] = useState({
    companyName: "",
    registrationNumber: "", // => DTO companyNumber로 매핑
    ceoName: "",            // => DTO contactName
    phone: "",              // => DTO contactPhone
    postalCode: "",
    roadAddress: "",
    detailAddress: "",
    lat: null,
    lng: null,
  });

  const [geoStatus, setGeoStatus] = useState("idle"); // idle | ok | fail

  useEffect(() => {
    // 사용자 체감 줄이기: 미리 로드
    ensureDaumPostcode().catch(() => {});
    loadKakaoIfNeeded().catch(() => {});
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openPostcode = async () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소검색 로딩중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: async (data) => {
        const address =
          data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;

        // 주소 먼저 반영 + 좌표 초기화
        setForm((prev) => ({
          ...prev,
          postalCode: data.zonecode,
          roadAddress: address,
          lat: null,
          lng: null,
        }));
        setGeoStatus("idle");

        try {
          await loadKakaoIfNeeded();

          const geocoder = new window.kakao.maps.services.Geocoder();

          // 1차: 전체 주소 지오코딩
          geocoder.addressSearch(address, (results, status) => {
            if (status === window.kakao.maps.services.Status.OK && results?.[0]) {
              const { x, y } = results[0]; // x=lng, y=lat
              setForm((prev) => ({ ...prev, lat: +y, lng: +x }));
              setGeoStatus("ok");
            } else {
              // 2차: 시/군/구 단위로 폴백
              const fallback = `${data.sido || ""} ${data.sigungu || ""}`.trim();
              if (!fallback) {
                setGeoStatus("fail");
                return;
              }
              geocoder.addressSearch(fallback, (res2, st2) => {
                if (st2 === window.kakao.maps.services.Status.OK && res2?.[0]) {
                  const { x, y } = res2[0];
                  setForm((prev) => ({ ...prev, lat: +y, lng: +x }));
                  setGeoStatus("ok");
                } else {
                  setGeoStatus("fail");
                }
              });
            }
          });
        } catch (e) {
          console.warn("Kakao maps load/geocode error:", e);
          setGeoStatus("fail");
        }
      },
    }).open();
  };

  const handleNext = (e) => {
    e.preventDefault();

    // 필수값 체크(1단계 기준)
    if (!form.companyName || !form.registrationNumber || !form.ceoName || !form.phone) {
      alert("회사명/사업자등록번호/대표자명/대표전화는 필수입니다.");
      return;
    }
    if (!form.postalCode || !form.roadAddress) {
      alert("주소를 입력(검색)해주세요.");
      return;
    }

    onNext?.({ ...form });
  };

  return (
    <div className="mt-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">회사 정보를 입력해 주세요</h1>
        <span className="text-[#6b8b4e] text-sm">1/2</span>
      </div>

      <form className="space-y-5" onSubmit={handleNext}>
        {/* 회사명 */}
        <div>
          <label className="block mb-1">
            회사명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{ width: "492px", height: "48px" }}
          />
        </div>

        {/* 사업자 등록번호 */}
        <div>
          <label className="block mb-1">
            사업자 등록번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="registrationNumber"
            value={form.registrationNumber}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{ width: "492px", height: "48px" }}
          />
        </div>

        {/* 주소(우편번호 + 도로명 + 상세 + 좌표표시) */}
        <div>
          <label className="block mb-1">
            업체 주소 <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              name="postalCode"
              value={form.postalCode}
              onChange={onChange}
              placeholder="우편번호"
              readOnly
              className="border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "392px", height: "48px" }}
            />
            <button
              type="button"
              onClick={openPostcode}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              style={{ height: "48px" }}
            >
              주소검색
            </button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              name="roadAddress"
              value={form.roadAddress}
              onChange={onChange}
              placeholder="도로명 주소"
              readOnly
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              style={{ width: "492px", height: "48px" }}
            />
            {geoStatus === "ok" && (
              <span className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                좌표 OK
              </span>
            )}
            {geoStatus === "fail" && (
              <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200">
                좌표 실패
              </span>
            )}
          </div>

          <input
            type="text"
            name="detailAddress"
            value={form.detailAddress}
            onChange={onChange}
            placeholder="상세주소 (동/호수 등)"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{ width: "492px", height: "48px" }}
          />

          {/* 확인용: 숨기고 싶으면 감춰도 됨 */}
          <div className="mt-1 text-xs text-gray-500">
            lat: {form.lat ?? "-"} / lng: {form.lng ?? "-"}
          </div>
        </div>

        {/* 대표자명 */}
        <div>
          <label className="block mb-1">
            대표자명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ceoName"
            value={form.ceoName}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{ width: "492px", height: "48px" }}
          />
        </div>

        {/* 대표 전화번호 */}
        <div>
          <label className="block mb-1">
            대표 전화번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{ width: "492px", height: "48px" }}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#a3cd7f] text-white font-bold py-2 rounded mt-6 rounded-lg"
          style={{ width: "492px", height: "48px" }}
        >
          다음
        </button>
      </form>
    </div>
  );
};

export default CompanyInfoForm;