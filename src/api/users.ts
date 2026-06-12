import apiClient from "./client";

export const getUsers = async (payload?: any) => {
  return await apiClient.get('/admin/kyc');
};

export const approveKycStatus = async (id: number) => {
  return await apiClient.patch(`/admin/kyc/${id}/approve`);
};

export const rejectKycStatus = async (id: number) => {
  return await apiClient.patch(`/admin/kyc/${id}/reject`);
};

export const getUserList = async (payload?: any) => {
  return await apiClient.get('/admin/users', { params: payload })
}

export const getUserDetails = async (payload?: any) => {
  return await apiClient.get(`/admin/users/${payload?.id}`, { params: payload })
}