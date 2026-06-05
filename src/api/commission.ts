import apiClient from './client';

export interface fixedCommission {
    category_id: number;
    type: string;
    amount_per_hour: number;
    amount_per_half_day: number;
    amount_per_day: number;
}

export interface percentageCommission {
    category_id: number;
    type: string;
    amount_per_hour: number;
    amount_per_half_day: number;
    amount_per_day: number;
    cap_per_hour: number;
    cap_per_half_day: number;
    cap_per_day: number;
}


export const createCommission = async (payload: fixedCommission | percentageCommission) => {
  return await apiClient.post('/admin/commissions', payload);
};

export const updateCommission = async (id: number, payload: fixedCommission | percentageCommission) => {
  return await apiClient.put(`/admin/commissions/${id}`, payload);
};

export const getCommission = async () => {
  return await apiClient.get('/admin/commissions');
};

export const deleteCommission = async (id: number) => {
  return await apiClient.delete(`/admin/commissions/${id}`);
};