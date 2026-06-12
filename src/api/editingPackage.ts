import apiClient from './client';

export interface EditingPackageFeature {
  feature_key: string;
  quantity: number;
  label: string;
  sort_order: number;
}

export interface EditingPackageImage {
  type: string;
  key: string;
  document_type: string;
}

export interface EditingPackagePayload {
  name?: string;
  price?: number;
  description?: string;
  is_active?: boolean;
  features?: EditingPackageFeature[];
  images?: EditingPackageImage[];
}

// Create Editing Package
export const createEditingPackage = async (
  payload: EditingPackagePayload
) => {
  return await apiClient.post('/admin/editing-packages', payload);
};

// Update Editing Package
export const updateEditingPackage = async (
  packageId: number | string,
  payload: EditingPackagePayload
) => {
  return await apiClient.put(
    `/admin/editing-packages/${packageId}`,
    payload
  );
};

// Get Editing Package Details
export const getEditingPackageDetails = async (
  packageId: number | string
) => {
  return await apiClient.get(
    `/admin/editing-packages/${packageId}`
  );
};

// Get Editing Package List
export const getEditingPackages = async () => {
  return await apiClient.get('/admin/editing-packages');
};

// Delete Editing Package
export const deleteEditingPackage = async (
  packageId: number | string
) => {
  return await apiClient.delete(
    `/admin/editing-packages/${packageId}`
  );
};