import axios from "axios";
import api from "./api";

/** 1) 업로드 초기화: presigned URL 발급 */
export const initiateUpload = (file, options = {}) => {
  const body = {
    fileName: file?.name ?? "file",
    contentType: file?.type || "application/octet-stream",
    size: file?.size ?? 0,
  };
  return api.post("/files/initiate", body, { signal: options.signal });
};

/** 2) presigned URL 로 바이너리 업로드 (보통 PUT) */
export const uploadToPresignedUrl = (uploadUrl, file, { onProgress, signal } = {}) => {
  return axios.put(uploadUrl, file, {
    headers: { "Content-Type": file?.type || "application/octet-stream" },
    // presigned 업로드는 외부 스토리지로 가므로 쿠키/토큰 붙이면 안 됨
    withCredentials: false,
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
    signal,
  });
};

/** 3) 업로드 완료 통지: DB 반영(파일 id/url 획득) */
export const completeUpload = (init, file, options = {}) => {
  const body = {
    key: init.key,
    fileName: file?.name ?? "file",
    contentType: file?.type || "application/octet-stream",
    size: file?.size ?? 0,
  };
  return api.post("/files/complete", body, { signal: options.signal });
};

/**
 * 고수준 헬퍼: 파일 1개 업로드 풀사이클
 * @returns {Promise<{ id:number, key:string, url:string, publicUrl?:string }>}
 */
export const uploadFile = async (file, { onProgress, signal } = {}) => {
  // 1) presigned 발급
  const { data: init } = await initiateUpload(file, { signal });
  // 2) 실제 스토리지 업로드
  await uploadToPresignedUrl(init.uploadUrl, file, { onProgress, signal });
  // 3) 완료 통지 → 최종 URL/ID
  const { data: res } = await completeUpload(init, file, { signal });
  // publicUrl(init) 과 res.url(DB)이 모두 있을 수 있음. 보통 res.url 사용.
  return { id: res.id, key: res.key, url: res.url, publicUrl: init.publicUrl };
};