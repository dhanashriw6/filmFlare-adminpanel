import apiClient from './client';

export interface category {
  name?: string;
  
}


export const createCategory = async (payload: category) => {
  return await apiClient.post('/admin/master_event_categories', payload);
};

export const updateCategory = async (categoryId, payload) => {
  return await apiClient.put(
    `/admin/master_event_categories/${categoryId}`,
    payload
  );
};
export const getCategory = async (payload: category) => {
  return await apiClient.get('/admin/master_event_categories');
};