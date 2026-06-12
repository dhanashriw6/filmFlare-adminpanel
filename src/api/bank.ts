import apiClient from "./client"

export const getBankDetails = async (payload?: any) => {
    return await apiClient.get(`/admin/bank-details`, { params: payload })
}