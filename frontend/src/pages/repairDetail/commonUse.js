import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCustomerRepairRequestDetail,
  listEngineers,
  listPresets,
} from "../../services/customerAPI";

export function CommonUse() {
  const { requestId: _rid } = useParams();
  const requestId = _rid ?? "";

  const stored = localStorage.getItem("user");
  const parsed = stored ? JSON.parse(stored) : null;
  const role = parsed?.role ?? null;

  const [statusCode, setStatusCode] = useState("");
  const [reason, setReason] = useState({ message: "" });
  const [categoryData, setCategoryData] = useState({
    title: "",
    category: "",
    product: "",
    phone: "",
    content: "",
  });
  const [engineerList, setEngineerList] = useState([]);
  const [presetList, setPresetList] = useState([]);

  const [engineer, setEngineer] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    dateText: "",
    profileImage: "",
  });

  const [selectedPresets, setSelectedPresets] = useState([]);
  const [finalEstimateDummy, setFinalEstimateDummy] = useState(null);
  const [finalEstimateData, setFinalEstimateData] = useState(null);

  const [estimate, setEstimate] = useState({
    createdAt: "",
    presets: [],
    extraNote: "",
    totalPrice: 0,
    manualAmount: 0,
  });

  useEffect(() => {
    if (!requestId) return;

    // statusCode + reason + categoryData + engineer + estimate
    (async () => {
      try {
        const { data } = await getCustomerRepairRequestDetail(requestId);

        setStatusCode(data?.status?.code ?? "");
        setReason({
          message: data?.status?.lastReasons?.cancel ?? "",
        });

        setCategoryData({
          title: data?.request?.title ?? "",
          category: data?.request?.category?.name ?? "",
          product: data?.request?.item?.name ?? "",
          phone: data?.request?.phone ?? "",
          content: data?.request?.content ?? "",
        });

        const eng = data?.request?.engineer ?? {};
        setEngineer({
          id: eng?.id ?? null,
          name: eng?.name ?? "",
          email: eng?.email ?? "",
          phone: eng?.phone ?? "",
          dateText: eng?.assignedAt ?? "",
          profileImage: "",
        });

        if (data?.estimate) {
          const mappedPresets = (data.estimate.presets ?? []).map((p) => ({
            id: p.presetId ?? p.id ?? 0,
            name: p.name ?? "",
            price: p.price ?? 0,
          }));
          setSelectedPresets(mappedPresets);

          setEstimate({
            createdAt: data.estimate.createdAt ?? "",
            presets: mappedPresets,
            extraNote: data.estimate.description ?? "",
            totalPrice: data.estimate.totalPrice ?? 0,
            manualAmount: data.estimate.manualAmount ?? 0,
          });

          setFinalEstimateDummy({
            presets: mappedPresets,
            extraNote: data.estimate.description ?? "",
            extraCost: data.estimate.manualAmount ?? 0, 
            beforeImgs: [
              { id: "b1", url: "https://via.placeholder.com/150?text=Before1" },
              { id: "b2", url: "https://via.placeholder.com/150?text=Before2" },
            ],
            afterImgs: [
              { id: "a1", url: "https://via.placeholder.com/150?text=After1" },
            ],
          });

          setFinalEstimateData({
            presets: mappedPresets,
            extraNote: data.estimate.description ?? "",
            totalPrice: data.estimate.totalPrice ?? 0,
            beforeImages: [
              "https://via.placeholder.com/150",
              "https://via.placeholder.com/150",
            ],
            afterImages: [
              "https://via.placeholder.com/150",
              "https://via.placeholder.com/150",
            ],
          });
        }

        // ✅ presetList 불러오기
        const categoryId = data?.request?.category?.id ?? null;
        const itemId = data?.request?.item?.id ?? null;
        if (categoryId && itemId) {
          const { data: presetRes } = await listPresets({
            page: 0,
            size: 50,
            categoryId,
            itemId,
          });
          const items = Array.isArray(presetRes?.content) ? presetRes.content : [];
          setPresetList(
            items.map((p) => ({
              id: p.id ?? p.presetId ?? 0,
              name: p.name ?? "",
              price: p.price ?? 0,
            }))
          );
        }
      } catch (e) {
        console.error("detail fetch error:", e);
      }
    })();

    // engineerList
    (async () => {
      try {
        const { data } = await listEngineers({ page: 0, size: 20 });
        const items = Array.isArray(data?.content) ? data.content : [];
        const mapped = items.map((e) => ({
          id: e.engineerId ?? 0,
          name: e.name ?? "",
          email: e.email ?? "",
          phone: e.phone ?? "",
          status: e.statusLabel === "수리 중",
          profileImage: null,
        }));
        setEngineerList(mapped);
      } catch (err) {
        console.error("listEngineers fetch error:", err);
      }
    })();
  }, [requestId]);

  return {
    requestId,
    role,
    repair: {
      statusCode,
      isCancelled: false,
    },
    presetList,
    selectedPresets,
    engineer,
    engineerList,
    estimate, 
    finalEstimateDummy,
    finalEstimateData,
    reason,
    categoryData,
  };
}