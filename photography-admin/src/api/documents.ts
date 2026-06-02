import apiClient from "./client";

export interface UploadDocumentPayload {
  document_for: string;
  document_type: string;
  mimetype: string;
  side: string;
}

export const getUploadUrl = async (
  payload: UploadDocumentPayload
) => {
  return await apiClient.post(
    "/admin/documents/upload_url",
    payload
  );
};