import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetDeptResponse,
  GetDeptPayload,
  AddDepartment,
  DeleteDepartment,
  UpdateDepartment,
} from './departmentModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getDepartments(payload?: GetDeptPayload) {
  const defaultPayload: GetDeptPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
    sort: {
      fieldName: 'Created',
      sortDirection: 1,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.departments.getDepartment, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetDeptResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const departments = data?.successStatus?.items ?? [];

    return {
      departmentsList: { departments },
      departmentsListLoading: isLoading,
      departmentsListError: error,
      departmentsListValidating: isValidating,
      departmentsListEmpty: !isLoading && departments.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addDepartment(data: AddDepartment) {
  const requestData: AddDepartment = {
    parentDepartmentId: data.parentDepartmentId || null,
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.departments.addDepartment,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding department:', error);

    return { success: false, error };
  }
}

export async function updateDepartment(data: UpdateDepartment) {
  const requestData: UpdateDepartment = {
    id: data.id,
    parentDepartmentId: data.parentDepartmentId || null,
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(
      apiEndpoints.departments.updateDepartment,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating department:', error);

    return { success: false, error };
  }
}

export async function deleteDepartment(id: string) {
  const requestData: DeleteDepartment = {
    id: id || '',
  };

  try {
    const response = await zetaAxiosInstance.delete(apiEndpoints.departments.deleteDepartment, {
      data: requestData,
    });

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error  deleting department:', error);

    return { success: false, error };
  }
}
