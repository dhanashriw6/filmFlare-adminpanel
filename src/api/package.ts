import apiClient from './client';

export interface PackageRequirement {
  skill: string;
  count: number;
}

export interface PackageImage {
  type: string;
  id?: number;
  image?: string;
}

export interface PackagePayload {
  name?: string;
  time_unit?: string;
  time_required?: number;
  is_active?: boolean;
  requirements?: PackageRequirement[];
  images?: PackageImage[];
}

export const createPackage = async (payload: PackagePayload) => {
  return await apiClient.post('/admin/event_packages', payload);
};

export const updatePackage = async (
  packageId: number | string,
  payload: PackagePayload
) => {
  return await apiClient.put(
    `/admin/event_packages/${packageId}`,
    payload
  );
};

export const getPackages = async () => {
  return await apiClient.get('/admin/event_packages');
};

