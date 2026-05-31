import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher, fetchGetRequest } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetTaskPayload,
  GetTaskResponse,
  CreateTasks,
  UpdateTask,
  GetStatusPayload,
  GetStatusResponse,
  DeleteTask,
  AddStatus,
  UpdateStatus,
  DeleteStatus,
  ChangeStatus,
  AddTodo,
  GetTodoPayload,
  GetTodoResponse,
  UpdateTodo,
  ChangeTodoStatus,
  GetProjectCategoryPayload,
  GetUserPayload,
  TranscribeTask,
} from './taskModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};
export function getTasks(payload?: GetTaskPayload, memberId: string = '') {
  const swrKey = useMemo(() => {
    if (!payload) return null;

    const filters = [];

    if (memberId) {
      filters.push({
        fieldName: 'memberId',
        fieldValue: memberId,
        operator: 0,
        logicOperator: 0,
        subFilters: [],
      });
    }

    const search =
      filters.length === 1
        ? filters[0]
        : filters.length > 1
          ? {
              ...filters[0],
              logicOperator: 0,
              subFilters: [...(filters[0].subFilters || []), ...filters.slice(1)],
            }
          : undefined;

    const finalPayload: GetTaskPayload = {
      ...payload,
      search,
    };

    return [apiEndpoints.tasks.getTask, finalPayload];
  }, [payload ? JSON.stringify(payload) : null, memberId]);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetTaskResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const taskObject = data?.successStatus;
    const tasks = data?.successStatus?.items ?? [];
    const totalTasks = data?.successStatus?.total ?? 0;

    return {
      taskList: { tasks, taskObject, totalTasks },
      taskListLoading: isLoading,
      taskListError: error,
      taskListValidating: isValidating,
      taskListEmpty: !isLoading && tasks.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memoizedValue;
}

export async function addTask(data: CreateTasks) {
  const requestData: CreateTasks = {
    code: data?.code,
    description: data?.description,
    startDate: data?.startDate,
    endDate: data?.endDate,
    membersIds: data?.membersIds,
    isConfidential: data?.isConfidential,
    isAssignedToMe: data?.isAssignedToMe,
    categoryId: data?.categoryId,
    priorityId: data?.priorityId,
    parentTaskId: data?.parentTaskId,
    projectId: data?.projectId,
    mileStoneId: data?.mileStoneId,
    clientId: data?.clientId,
    clientLeadId: data?.clientLeadId,
    vendorId: data?.vendorId,
    vendorContractId: data?.vendorContractId,
    audioFileId: data?.audioFileId,
    IsChatMessage: data?.IsChatMessage,
    ChatMessageId: data?.ChatMessageId,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.tasks.createTask, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding task:', error);

    return {
      success: false,
      error:
        typeof error === 'string' ? error : error?.response?.statusText || 'Failed to create task',
    };
  }
}

export async function updateTask(data: UpdateTask) {
  const requestData: UpdateTask = {
    id: data?.id,
    code: data?.code || '',
    description: data?.description || '',
    startDate: data?.startDate || '',
    endDate: data?.endDate || '',
    membersIds: data?.membersIds || [],
    isConfidential: data?.isConfidential || false,
    isAssignedToMe: data?.isAssignedToMe || false,
    categoryId: data?.categoryId || '',
    priorityId: data?.priorityId || '',
    parentTaskId: data?.parentTaskId || '',
    projectId: data?.projectId || '',
    mileStoneId: data?.mileStoneId || '',
    clientId: data?.clientId || '',
    clientLeadId: data?.clientLeadId || '',
    vendorId: data?.vendorId || '',
    vendorContractId: data?.vendorContractId || '',
    documentId: data?.documentId,
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
    const response = await zetaAxiosInstance.put(apiEndpoints.tasks.updateTask, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
      // throw new Error('Failed to updating task');
    }
  } catch (error: any) {
    console.error('Error updating task:', error);

    return { success: false, error };
  }
}

export async function deleteTask(id: string) {
  const requestData: DeleteTask = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting task: ID is missing');
    return { success: false, error: 'Task ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.tasks.deleteTask}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting task:', error);

    return { success: false, error };
  }
}

export async function changeStatus(data: ChangeStatus) {
  const requestData: ChangeStatus = {
    taskId: data?.taskId,
    statusId: data?.statusId,
    userId: data?.userId,
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.tasks.changeStatus, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error changing status:', error);

    return { success: false, error };
  }
}

export function getStatus(payload?: GetStatusPayload) {
  const defaultPayload: GetStatusPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.tasks.getStatus, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetStatusResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const statusObject = data?.successStatus;
    const status = data?.successStatus?.items ?? [];

    return {
      statusList: { status, statusObject },
      statusListLoading: isLoading,
      statusListError: error,
      statusListValidating: isValidating,
      statusListEmpty: !isLoading && status.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
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
    const response = await zetaAxiosInstance.post(apiEndpoints.tasks.addStatus, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
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
      localizedStrings: data.name?.localizedStrings,
    },
    color: data?.color,
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.tasks.updateStatus, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating status:', error);

    return { success: false, error };
  }
}

export async function deleteStatus(id: string) {
  const requestData: DeleteStatus = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting status: ID is missing');
    return { success: false, error: 'Status ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.tasks.deleteStatus}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting status:', error);

    return { success: false, error };
  }
}

export function getCategories(payload?: GetStatusPayload) {
  const defaultPayload: GetStatusPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.tasks.getCategory, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetStatusResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const categoryObject = data?.successStatus;
    const categories = data?.successStatus?.items ?? [];

    return {
      categoryList: { categories, categoryObject },
      categoryListLoading: isLoading,
      categoryListError: error,
      categoryListValidating: isValidating,
      categoryListEmpty: !isLoading && categories.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addCategory(data: AddStatus) {
  const requestData: AddStatus = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.tasks.addCategory, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding category:', error);

    return { success: false, error };
  }
}

export async function updateCategory(data: UpdateStatus) {
  const requestData: UpdateStatus = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.tasks.updateCategory, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating category:', error);

    return { success: false, error };
  }
}

export async function deleteCategory(id: string) {
  const requestData: DeleteStatus = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting category: ID is missing');
    return { success: false, error: 'Category ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.tasks.deleteCategory}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting category:', error);

    return { success: false, error };
  }
}

export function getProjectCategories(payload?: GetProjectCategoryPayload) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetProjectCategoryPayload = {
      ...payload,
    };
    return [apiEndpoints.tasks.getProjectCategory, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const categoryObject = data?.successStatus;
    const categories = data?.successStatus?.items ?? [];

    return {
      categoryList: { categories, categoryObject },
      categoryListLoading: isLoading,
      categoryListError: error,
      categoryListValidating: isValidating,
      categoryListEmpty: !isLoading && categories.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export function getPriorities(payload?: GetStatusPayload) {
  const defaultPayload: GetStatusPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.tasks.getPriority, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetStatusResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const priorityObject = data?.successStatus;
    const priorities = data?.successStatus?.items ?? [];

    return {
      priorityList: { priorities, priorityObject },
      priorityListLoading: isLoading,
      priorityListError: error,
      priorityListValidating: isValidating,
      priorityListEmpty: !isLoading && priorities.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addPriority(data: AddStatus) {
  const requestData: AddStatus = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.tasks.addPriority, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding priority:', error);

    return { success: false, error };
  }
}

export async function updatePriority(data: UpdateStatus) {
  const requestData: UpdateStatus = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.tasks.updatePriority, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating priority:', error);

    return { success: false, error };
  }
}

export async function deletePriority(id: string) {
  const requestData: DeleteStatus = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting priority: ID is missing');
    return { success: false, error: 'Priority ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.tasks.deletePriority}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting priority:', error);

    return { success: false, error };
  }
}

export function getTodo(payload?: GetTodoPayload) {
  const defaultPayload: GetTodoPayload = {
    ...payload,
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.tasks.getTodo, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetTodoResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const todoObject = data?.successStatus;
    const todos = data?.successStatus?.items ?? [];

    return {
      todoList: { todos, todoObject },
      todoListLoading: isLoading,
      todoListError: error,
      todoListValidating: isValidating,
      todoListEmpty: !isLoading && todos.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
export async function addTodoItem(data: AddTodo) {
  const requestData: AddTodo = {
    content: data?.content,
    taskId: data?.taskId,
    reminderDateTime: data?.reminderDateTime,
    memberIds: data?.memberIds,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.tasks.addTodo, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding to do:', error);

    return { success: false, error };
  }
}

export async function updateTodo(data: UpdateTodo) {
  const requestData: UpdateTodo = {
    id: data.id,
    content: data?.content,
    reminderDateTime: data?.reminderDateTime,
    memberIds: data?.memberIds,
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.tasks.updateTodo, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating todo:', error);

    return { success: false, error };
  }
}

export async function deleteTodo(id: string) {
  if (!id) {
    console.error('Error deleting todo: ID is missing');
    return { success: false, error: 'Todo ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.tasks.deleteTodo}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting todo:', error);

    return { success: false, error };
  }
}

export async function changeTodoStatus(data: ChangeTodoStatus) {
  const requestData: ChangeTodoStatus = {
    id: data?.id,
    status: data?.status,
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.tasks.changeTodoStatus, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating status:', error);

    return { success: false, error };
  }
}

export function getTaskDetail(id: string, shouldFetch: boolean = true) {
  const url = id ? `${apiEndpoints.tasks.getTaskDetails}/${id}` : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    shouldFetch && url ? url : null,
    fetchGetRequest,
    swrOptions
  );
  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error;

    return {
      taskDetails: { details: isApiError ? null : data?.successStatus },
      taskDetailsLoading: isLoading,
      taskDetailsError: isApiError ? data.message : error,
      taskDetailsValidating: isValidating,
      mutate,
    };
  }, [data, error, isValidating]);

  return memoizedValue;
}

export function getAvailableUser(payload?: GetUserPayload) {
  const defaultPayload: GetUserPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },

    employeeId: payload?.employeeId ?? '',
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.tasks.getTaskAvailableUsers, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const users = data?.successStatus?.items ?? [];

    return {
      availableUsersList: { users },
      usersListLoading: isLoading,
      usersListError: error,
      usersListValidating: isValidating,
      usersListEmpty: !isLoading && users.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function transcribeTask(data: TranscribeTask) {
  const requestData: TranscribeTask = {
    taskId: data?.taskId,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.tasks.transcribeTask, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    return {
      success: false,
      error:
        typeof error === 'string' ? error : error?.response?.statusText || 'Failed to transcribe',
    };
  }
}
