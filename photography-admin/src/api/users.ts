import apiClient from "./client";

export const getUsers = async (payload?: any) => {
  return await apiClient.get('/admin/kyc');
};

export const updateKycStatus = async (id: number, status: string) => {
  return await apiClient.put(`/admin/kyc/${id}`, { status });
};