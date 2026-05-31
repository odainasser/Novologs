import useSWR from 'swr';
import { useMemo } from 'react';

import { apiEndpoints } from 'src/utils/api-endpoints';
import { postFetcher, fetchGetRequest, zetaAxiosInstance } from 'src/utils/axios-zeta';

import {
  AddRoles,
  AddStatus,
  DeleteRole,
  ConfirmEmail,
  UpdateStatus,
  AddUserGroup,
  GetUserPayload,
  ChangePassword,
  ChangeMyStatus,
  GetUserResponse,
  UpdateUserGroup,
  NotificationRead,
  AddCompanyBranch,
  GetAllRolesResponse,
  UpdateCompanyBranch,
  DeleteCompanyBranch,
  GetUserGroupResponse,
  UpdateUserPermission,
  GetWorkStatusResponse,
  AssignPermissionToUser,
  AssignPermissionToRole,
  AddPermissionDescription,
  GetUserNotificationsResponse,
  GetUserWithPermissionPayload,
} from './userManageModels';

const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getUser(
  payload?: GetUserPayload,
  searchParam: string = '',
  departmentId: string = '',
  designationId: string = '',
  companyBranchId: string = ''
) {
  const swrKey = useMemo(() => {
    if (!payload) return null;

    const filters = [];

    if (searchParam?.trim()) {
      filters.push({
        fieldName: 'fullName',
        fieldValue: searchParam.trim(),
        operator: 2,
        logicOperator: 1,
        subFilters: [
          {
            fieldName: 'email',
            fieldValue: searchParam.trim(),
            operator: 2,
            logicOperator: 1,
          },
          {
            fieldName: 'code',
            fieldValue: searchParam.trim(),
            operator: 2,
            logicOperator: 1,
          },
        ],
      });
    }

    if (departmentId) {
      filters.push({
        fieldName: 'departmentId',
        fieldValue: departmentId,
        operator: 0,
        logicOperator: 0,
      });
    }
    if (designationId) {
      filters.push({
        fieldName: 'designationId',
        fieldValue: designationId,
        operator: 0,
        logicOperator: 0,
      });
    }
    if (companyBranchId) {
      filters.push({
        fieldName: 'companyBranchId',
        fieldValue: companyBranchId,
        operator: 0,
        logicOperator: 0,
      });
    }

    const search =
      filters.length === 0
        ? payload.search
        : {
            ...filters[0],
            subFilters: [...(filters[0].subFilters || []), ...filters.slice(1)],
          };

    const finalPayload: GetUserPayload = {
      ...payload,
      search,
      sort: {
        fieldName: 'Created',
        sortDirection: 1,
      },
    };

    return [apiEndpoints.users.getUser, finalPayload];
  }, [
    payload ? JSON.stringify(payload) : null,
    searchParam,
    departmentId,
    designationId,
    companyBranchId,
  ]);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetUserResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const users = data?.successStatus?.items ?? [];
    const totalusers = data?.successStatus?.total ?? 0;

    return {
      usersList: { users, totalusers },
      usersListLoading: isLoading,
      usersListError: error,
      usersListValidating: isValidating,
      usersListEmpty: !isLoading && users.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memoizedValue;
}

export function getAllRoles() {
  const swrKey = useMemo(() => apiEndpoints.users.getAllRoles, []);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetAllRolesResponse>(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error === true;

    const successData = isApiError ? null : data?.successStatus;

    const roles = successData?.roles ?? [];
    const permissions = successData?.permissions ?? [];

    return {
      allRoles: { roles, permissions },
      allRolesLoading: isLoading,
      allRolesError: isApiError ? data?.message : error,
      allRolesValidating: isValidating,
      allRolesEmpty: !isLoading && !roles.length,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function confirmEmail(data: ConfirmEmail) {
  const requestData: ConfirmEmail = {
    code: data?.code || '',
    userId: data?.userId || '',
    password: data?.password,
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.users.confirmEmailSetPassword,
      requestData
    );

    // Always return a uniform shape
    return {
      success: response.status === 200,
      data: response.data || null,
    };
  } catch (error: any) {
    return {
      success: false,
      error,
    };
  }
}

export async function changePassword(data: ChangePassword) {
  const requestData: ChangePassword = {
    email: data?.email,
    currentPassword: data?.currentPassword,
    newPassword: data?.newPassword,
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.users.changePassword, requestData);

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error changing password:', error);

    return { success: false, error };
  }
}

export function getWorkStatus(payload?: GetUserPayload) {
  const defaultPayload: GetUserPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.users.getWorkStatuses, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetWorkStatusResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const workStatuses = data?.successStatus?.items ?? [];

    return {
      workStatusList: { workStatuses },
      workStatusListLoading: isLoading,
      workStatusListError: error,
      workStatusListValidating: isValidating,
      workStatusListEmpty: !isLoading && workStatuses.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function changeMyStatus(data: ChangeMyStatus) {
  const requestData: ChangeMyStatus = {
    workStatusId: data?.workStatusId,
    startDate: data?.startDate,
    endDate: data?.endDate,
  };

  try {
    const response = await zetaAxiosInstance.put(
      apiEndpoints.users.changeMyWorkStatus,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error changing status:', error);

    return { success: false, error };
  }
}

export async function addStatus(data: AddStatus) {
  const requestData: AddStatus = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    color: data?.color,
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.users.addWorkStatus, requestData);

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error adding status:', error);

    return { success: false, error };
  }
}

export async function updateStatus(data: UpdateStatus) {
  const requestData: UpdateStatus = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      // localizedStrings: data.name?.localizedStrings,
    },
    color: data?.color,
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.users.updateWorkStatus, requestData);

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error updating status:', error);

    return { success: false, error };
  }
}

export async function deleteStatus(id: string) {
  if (!id) {
    console.error('Error deleting status: ID is missing');
    return { success: false, error: 'Status ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.users.deleteWorkStatus}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error deleting status:', error);

    return { success: false, error };
  }
}

export function getUserDetail(id: string) {
  const url = id ? `${apiEndpoints.users.getUserById}/${id}` : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetchGetRequest, swrOptions);

  return useMemo(() => {
    const isApiError = data?.__error === true;

    const details = isApiError ? null : data?.successStatus;

    return {
      userDetails: details ? { details } : null,
      userDetailsLoading: isLoading,
      userDetailsError: isApiError ? data?.message : error,
      userDetailsValidating: isValidating,
      mutate,
    };
  }, [data, isLoading, error, isValidating, mutate]);
}

export function getUserStatistics(userId: string) {
  const url = `${apiEndpoints.users.getUserStatistics}?userId=${userId}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetchGetRequest, swrOptions);

  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error;

    return {
      userStatistics: { statistics: isApiError ? null : data?.successStatus },
      userStatisticsLoading: isLoading,
      userStatisticsError: isApiError ? data.message : error,
      userStatisticsValidating: isValidating,
      mutate,
    };
  }, [data, error, isValidating]);

  return memoizedValue;
}

export function getAdminStatistics(userId: string) {
  const url = `${apiEndpoints.users.getAdminStatistics}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetchGetRequest, swrOptions);

  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error;
    return {
      adminStatistics: { statistics: isApiError ? null : data?.successStatus },
      adminStatisticsLoading: isLoading,
      adminStatisticsError: isApiError ? data.message : error,
      adminStatisticsValidating: isValidating,
      mutate,
    };
  }, [data, error, isValidating]);

  return memoizedValue;
}

export function getUserGroups(payload?: GetUserPayload) {
  const defaultPayload: GetUserPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    sort: {
      fieldName: 'Created',
      sortDirection: 1,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.users.getUserGroups, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetUserGroupResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const userGroup = data?.successStatus?.items ?? [];

    return {
      userGroupList: { userGroup },
      userGroupListLoading: isLoading,
      userGroupListError: error,
      userGroupListValidating: isValidating,
      userGroupListEmpty: !isLoading && userGroup.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addUserGroup(data: AddUserGroup) {
  const requestData: AddUserGroup = {
    code: data?.code,
    name: data?.name,
    memberIds: data?.memberIds,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.users.addUserGroup, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error adding user group:', error);

    return { success: false, error };
  }
}

export async function updateUserGroup(data: UpdateUserGroup) {
  const requestData: UpdateUserGroup = {
    id: data?.id,
    code: data?.code,
    name: data?.name,
    memberIds: data?.memberIds,
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.users.updateUserGroup, requestData);

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error updating user group:', error);

    return { success: false, error };
  }
}

export async function deleteUserGroup(id: string) {
  if (!id) {
    console.error('Error deleting group: ID is missing');
    return { success: false, error: 'Group ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.users.deleteUserGroup}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error deleting group:', error);

    return { success: false, error };
  }
}

export function getUserNotifications(payload?: GetUserPayload) {
  if (!payload) {
    return null;
  }
  const defaultPayload: GetUserPayload = {
    ...payload,
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.users.getNotifications, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetUserNotificationsResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const userNotifications = data?.successStatus?.items ?? [];
    const totalNotifications = data?.successStatus?.total;
    const totalUnreadNotifications = data?.successStatus?.unreadCount;

    return {
      userNotificationsList: {
        userNotifications,
        totalNotifications,
        totalUnreadNotifications,
      },
      userNotificationsListLoading: isLoading,
      userNotificationsListError: error,
      userNotificationsListValidating: isValidating,
      userNotificationsListEmpty: !isLoading && userNotifications.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function setNotificationAsRead(data: NotificationRead) {
  const requestData: NotificationRead = {
    id: data?.id,
    isRead: data?.isRead,
  };

  try {
    const response = await zetaAxiosInstance.put(
      apiEndpoints.users.setNotificationIsRead,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error :', error);

    return { success: false, error };
  }
}

export async function clearNotification() {
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.users.clearNotification}`);

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error deleting notifications:', error);

    return { success: false, error };
  }
}

export function getPermissionList(payload?: GetUserPayload) {
  const defaultPayload: GetUserPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 1000,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.users.getPermissionList, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const permissions = data?.successStatus?.items ?? [];

    return {
      permissionList: { permissions },
      permissionListLoading: isLoading,
      permissionListError: error,
      permissionListValidating: isValidating,
      permissionListEmpty: !isLoading && permissions.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function assignPermissionToUser(data: AssignPermissionToUser) {
  const requestData: AssignPermissionToUser = {
    userIds: data?.userIds,
    permissionIds: data?.permissionIds,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.users.assignPermissionToUser,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
    // throw new Error('Failed to add user');
  } catch (error: any) {
    console.error('Error adding user permissions:', error);

    return { success: false, error };
  }
}

export function getAllUserRoles(payload?: GetUserPayload) {
  const defaultPayload: GetUserPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.users.getAllUserRoles, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const roles = data?.successStatus?.items ?? [];
    const totalPermissions = data?.successStatus?.total ?? 0;

    return {
      userRolesList: { roles, totalPermissions },
      userRolesListLoading: isLoading,
      userRolesListError: error,
      userRolesListValidating: isValidating,
      userRolesListEmpty: !isLoading && roles.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addRoles(data: AddRoles) {
  const requestData: AddRoles = {
    name: data?.name,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.users.addRole, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    }
    // throw new Error('Failed to add role');
  } catch (error: any) {
    console.error('Error adding role:', error);

    return { success: false, error };
  }
}

export async function addPermissionDescription(data: AddPermissionDescription) {
  const requestData: AddPermissionDescription = {
    id: data?.id,
    description: data?.description,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.users.addDescriptionToPermission,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
    // throw new Error('Failed to add role');
  } catch (error: any) {
    console.error('Error adding role description:', error);

    return { success: false, error };
  }
}
export async function deleteRole(id: string) {
  const requestData: DeleteRole = {
    id: id || '',
  };

  try {
    const response = await zetaAxiosInstance.delete(apiEndpoints.users.deleteRole, {
      data: requestData,
    });

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error  deleting role:', error);

    return { success: false, error };
  }
}

export async function assignPermissionToRole(data: AssignPermissionToRole) {
  const requestData: AssignPermissionToRole = {
    roleId: data?.roleId,
    permissionIds: data?.permissionIds,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.users.assignPermissionToRole,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
    // throw new Error('Failed to add permissions');
  } catch (error: any) {
    console.error('Error adding roles permissions:', error);

    return { success: false, error };
  }
}

export async function unassignPermissionToRole(data: AssignPermissionToRole) {
  const requestData: AssignPermissionToRole = {
    roleId: data?.roleId,
    permissionIds: data?.permissionIds,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.users.unassignPermissionToRole,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
    // throw new Error('Failed to un assign permissions');
  } catch (error: any) {
    console.error('Error un assigning roles permissions:', error);

    return { success: false, error };
  }
}

export async function updateRolePermission(data: AssignPermissionToRole) {
  const requestData: AssignPermissionToRole = {
    roleId: data?.roleId,
    permissionIds: data?.permissionIds,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.users.updateRolePermission,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error updating role permissions:', error);

    return { success: false, error };
  }
}

export async function updateUserPermission(data: UpdateUserPermission) {
  const requestData: UpdateUserPermission = {
    userId: data?.userId,
    permissionIds: data?.permissionIds,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.users.updateUserPermission,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error updating user permissions:', error);

    return { success: false, error };
  }
}

export function getUsersWithPermission(payload?: GetUserWithPermissionPayload) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetUserWithPermissionPayload = {
      ...payload,
    };
    return [apiEndpoints.users.getUsersWithPermission, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const userWithPermission = data?.successStatus;
    const users = data?.successStatus?.items ?? [];
    const totalUsers = data?.successStatus?.total ?? 0;
    return {
      usersPermissionList: { users, userWithPermission, totalUsers },
      usersPermissionListLoading: isLoading,
      usersPermissionListError: error,
      usersPermissionListValidating: isValidating,
      usersPermissionListEmpty: !isLoading && users.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function unassignPermissionToUser(data: AssignPermissionToUser) {
  const requestData: AssignPermissionToUser = {
    userIds: data?.userIds,
    permissionIds: data?.permissionIds,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.users.unassignPermissionToUser,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error un assigning user permissions:', error);

    return { success: false, error };
  }
}

export function getCompanyBranches(payload?: GetUserPayload) {
  const finalPayload: GetUserPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    ...payload,
  };

  const swrKey = useMemo(
    () => [apiEndpoints.users.getCompanyBranches, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const branchObject = data?.successStatus;
    const branches = data?.successStatus?.items ?? [];
    const totalBranches = data?.successStatus?.total;

    return {
      branchList: { branches, totalBranches, branchObject },
      branchListLoading: isLoading,
      branchListError: error,
      branchListValidating: isValidating,
      branchListEmpty: !isLoading && branches.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addCompanyBranch(data: AddCompanyBranch) {
  const requestData: AddCompanyBranch = {
    name: data?.name,
    code: data?.code,
    phone: data?.phone,
    email: data?.email,
    country: data?.country,
    city: data?.city,
    address: data?.address,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.users.addCompanyBranch,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error adding branch:', error);

    return { success: false, error };
  }
}

export async function updateCompanyBranch(data: UpdateCompanyBranch) {
  const requestData: UpdateCompanyBranch = {
    id: data.id,
    name: data?.name,
    code: data?.code,
    phone: data?.phone,
    email: data?.email,
    country: data?.country,
    city: data?.city,
    address: data?.address,
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
    const response = await zetaAxiosInstance.put(
      apiEndpoints.users.updateCompanyBranch,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error updating branch:', error);

    return { success: false, error };
  }
}

export async function deleteCompanyBranch(id: string) {
  const requestData: DeleteCompanyBranch = {
    id: id || '',
  };

  try {
    const response = await zetaAxiosInstance.delete(apiEndpoints.users.deleteCompanyBranch, {
      data: requestData,
    });

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error  deleting branch:', error);

    return { success: false, error };
  }
}

export function getTenantInfo() {
  const swrKey = useMemo(() => apiEndpoints.users.tenantInfo, []);

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error === true;
    const successData = isApiError ? null : data?.successStatus;

    const tenantInfo = successData?.tenantInfo;
    const users = successData?.users ?? [];
    const usersStatistics = successData?.usersStatistics;

    return {
      tenant: { tenantInfo, users, usersStatistics },
      tenantLoading: isLoading,
      tenantError: isApiError ? data?.message : error,
      tenantValidating: isValidating,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export function getAuditLogs(payload?: GetUserPayload, searchParam: string = '') {
  const swrKey = useMemo(() => {
    if (!payload) return null;

    let search: GetUserPayload['search'] | undefined = undefined;

    if (searchParam?.trim()) {
      search = {
        fieldName: 'entityName',
        fieldValue: searchParam.trim(),
        operator: 0,
        logicOperator: 0,
        subFilters: [],
      };
    }

    const finalPayload: GetUserPayload = {
      ...payload,
      search,
    };

    return [apiEndpoints.users.getAuditLogs, finalPayload];
  }, [payload ? JSON.stringify(payload) : null, searchParam]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const auditLogs = data?.successStatus;
    const audits = data?.successStatus?.items ?? [];
    const totalAudits = data?.successStatus?.total ?? 0;
    return {
      auditList: { audits, auditLogs, totalAudits },
      auditListLoading: isLoading,
      auditListError: error,
      auditListValidating: isValidating,
      auditListEmpty: !isLoading && audits.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
