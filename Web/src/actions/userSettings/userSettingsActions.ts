import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import { AddUser, UpdateUser, DeactivateUser, DeleteUser, ResendEmail } from './userSettingsModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};
export async function addUser(data: AddUser) {
  const requestData: AddUser = {
    code: data?.code,
    fullName: data?.fullName,
    email: data?.email,
    userName: data?.email,
    country: data?.country,
    language: 'en',
    // userType: data?.userType || 0,
    hierarchyParentId: data?.hierarchyParentId || null,
    designationId: data?.designationId || null,
    departmentId: data?.departmentId || null,
    roles: data?.roles,
    profileImageFileId: data?.profileImageFileId,
    companyBranchId: data?.companyBranchId,
    hourlyRate: data?.hourlyRate || 0,
    phoneNumber: data?.phoneNumber,
  };
  const filteredData = Object.fromEntries(
    Object.entries(requestData).filter(
      ([_, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        // For arrays, allow empty arrays
        (!Array.isArray(value) || value.length > 0)
    )
  );

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.users.addUser, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
      // throw new Error('Failed to add user');
    }
  } catch (error: any) {
    console.error('Error adding user:', error);

    return { success: false, error };
  }
}

export async function updateUser(data: UpdateUser) {
  const requestData: UpdateUser = {
    userId: data?.userId,
    code: data?.code || '',
    fullName: data?.fullName || '',
    userName: data?.email,
    email: data?.email,
    country: data?.country || '',
    language: 'en',
    userType: data?.userType || 0,
    hierarchyParentId: data?.hierarchyParentId || null,
    designationId: data?.designationId || null,
    departmentId: data?.departmentId || null,
    roles: data?.roles || [],
    profileImageFileId: data?.profileImageFileId,
    companyBranchId: data?.companyBranchId || null,
    hourlyRate: data?.hourlyRate || 0,
    phoneNumber: data?.phoneNumber,
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.users.updateUser, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
      // throw new Error('Failed to updating user');
    }
  } catch (error: any) {
    console.error('Error updating user:', error);

    return { success: false, error };
  }
}

export async function deactivateUser(data: DeactivateUser) {
  const requestData: DeactivateUser = {
    userId: data?.userId,
    isActive: data?.isActive,
  };
  const filteredData = Object.fromEntries(
    Object.entries(requestData).filter(
      ([_, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        // For arrays, allow empty arrays
        (!Array.isArray(value) || value.length > 0)
    )
  );

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.users.deactivateUser, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error :', error);

    return { success: false, error };
  }
}
export async function deleteUser(data: DeleteUser) {
  const requestData: DeleteUser = {
    userId: data?.userId,
  };
  const filteredData = Object.fromEntries(
    Object.entries(requestData).filter(
      ([_, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  );

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.users.deleteUser, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error :', error);

    return { success: false, error };
  }
}
export async function resendEmail(data: ResendEmail) {
  const requestData: ResendEmail = {
    userId: data?.userId,
  };
  const filteredData = Object.fromEntries(
    Object.entries(requestData).filter(
      ([_, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
  );

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.users.resendEmail, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error :', error);

    return { success: false, error };
  }
}
