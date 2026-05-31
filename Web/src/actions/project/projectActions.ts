import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher, fetchGetRequest } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetProjectPayload,
  GetProjectResponse,
  CreateProject,
  GetGoalResponse,
  UpdateProject,
  DeleteProject,
  AddGoal,
  UpdateGoal,
  GetModulesPayload,
  GetModulesResponse,
  AddModules,
  UpdateModules,
  AddMilestone,
  GetProjectMilestonePayload,
  AddMilestoneTasks,
} from './projectModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};
export function getProjects(payload?: GetProjectPayload, departmentId: string = '') {
  const defaultPayload: GetProjectPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const swrKey = useMemo(() => {
    const basePayload = payload ?? defaultPayload;

    const departmentFilter = departmentId
      ? {
          fieldName: 'departmentId',
          fieldValue: departmentId,
          operator: 0,
          logicOperator: 0,
          subFilters: [],
        }
      : null;

    const search = departmentFilter
      ? basePayload.search
        ? {
            ...basePayload.search,
            logicOperator: 0,
            subFilters: [...(basePayload.search.subFilters || []), departmentFilter],
          }
        : departmentFilter
      : basePayload.search;

    const finalPayload: GetProjectPayload = {
      ...basePayload,
      search,
    };

    return [apiEndpoints.projects.getProjects, finalPayload];
  }, [payload ? JSON.stringify(payload) : null, departmentId]);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetProjectResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const projectObject = data?.successStatus;
    const projects = data?.successStatus?.items ?? [];
    const totalProjects = data?.successStatus?.total ?? 0;

    return {
      projectList: { projects, projectObject, totalProjects },
      projectListLoading: isLoading,
      projectListError: error,
      projectListValidating: isValidating,
      projectListEmpty: !isLoading && projects.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating, mutate]);

  return memoizedValue;
}

export function getProjectStatistics(id: string) {
  const url = `${apiEndpoints.projects.getProjectStatistics}/${id}`;

  const { data, isLoading, error, isValidating, mutate } = useSWR(url, fetchGetRequest, swrOptions);
  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error === true;

    const successData = isApiError ? null : data?.successStatus;

    const taskCount = successData?.taskCount ?? 0;
    const backlogTaskCount = successData?.backlogTaskCount ?? 0;

    const taskStatistics = successData?.taskStatistics ?? [];
    const usersStatistics = successData?.usersStatistics ?? [];

    return {
      projectStatistics: { taskCount, backlogTaskCount, taskStatistics, usersStatistics },
      projectStatisticsLoading: isLoading,
      projectStatisticsError: isApiError ? data?.message : error,
      projectStatisticsValidating: isValidating,
      taskStatisticsEmpty: !isLoading && taskStatistics.length === 0,
      usersStatisticsEmpty: !isLoading && usersStatistics.length === 0,
      mutate,
    };
  }, [data, error, isValidating]);

  return memoizedValue;
}
export async function addProject(data: CreateProject) {
  const requestData: CreateProject = {
    code: data?.code,
    name: data?.name,
    type: data?.type,
    description: data?.description,
    startDate: data?.startDate,
    endDate: data?.endDate,
    departmentId: data?.departmentId,
    // isMission: data.isMission,
    color: data.color,
    memberList: data.memberList,
    clientId: data.clientId,
    leadId: data.leadId,
    vendorId: data.vendorId,
    contractId: data.contractId,
    goalId: data.goalId,
    initiativeId: data.initiativeId,
    taskTypeIds: data.taskTypeIds,
    moduleIds: data.moduleIds,
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
      apiEndpoints.projects.createProject,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding project:', error);

    return { success: false, error };
  }
}

export async function updateProject(data: UpdateProject) {
  const requestData: UpdateProject = {
    id: data?.id,
    name: data?.name,
    code: data?.code || '',
    type: data?.type,
    description: data?.description || '',
    startDate: data?.startDate || '',
    endDate: data?.endDate || '',
    departmentId: data?.departmentId || '',
    isMission: data.isMission,
    color: data.color,
    memberList: data.memberList,
    clientId: data.clientId,
    goalId: data.goalId,
    initiativeId: data.initiativeId,
    taskTypeIds: data.taskTypeIds,
    moduleIds: data.moduleIds,
    overviewDocumentId: data?.overviewDocumentId,
    status: data?.status,
    lifeCycle: data?.lifeCycle,
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
    const response = await zetaAxiosInstance.put(apiEndpoints.projects.updateProject, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
      // throw new Error('Failed updating project');
    }
  } catch (error: any) {
    console.error('Error updating project:', error);

    return { success: false, error };
  }
}

export async function deleteProject(id: string) {
  const requestData: DeleteProject = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting project: ID is missing');
    return { success: false, error: 'Project ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.projects.deleteProject}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting project:', error);

    return { success: false, error };
  }
}

export function getGoals(payload?: GetProjectPayload) {
  const defaultPayload: GetProjectPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.projects.getGoals, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetGoalResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const goalObject = data?.successStatus;
    const goals = data?.successStatus?.items ?? [];

    return {
      goalList: { goals, goalObject },
      goalListLoading: isLoading,
      goalListError: error,
      goalListValidating: isValidating,
      goalListEmpty: !isLoading && goals.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addGoal(data: AddGoal) {
  const requestData: AddGoal = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.projects.addGoal, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding goal:', error);

    return { success: false, error };
  }
}

export async function updateGoal(data: UpdateGoal) {
  const requestData: UpdateGoal = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.projects.updateGoal, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating goal:', error);

    return { success: false, error };
  }
}

export async function deleteGoal(id: string) {
  const requestData: DeleteProject = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting goal: ID is missing');
    return { success: false, error: 'Goal ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.projects.deleteGoal}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting goal:', error);

    return { success: false, error };
  }
}

export function getInitiatives(payload?: GetProjectPayload) {
  const defaultPayload: GetProjectPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.projects.getInitiatives, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetGoalResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const initiativeObject = data?.successStatus;
    const initiatives = data?.successStatus?.items ?? [];

    return {
      initiativeList: { initiatives, initiativeObject },
      initiativeListLoading: isLoading,
      initiativeListError: error,
      initiativeListValidating: isValidating,
      initiativeListEmpty: !isLoading && initiatives.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addInitiative(data: AddGoal) {
  const requestData: AddGoal = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.projects.addInitiative, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding initiative:', error);

    return { success: false, error };
  }
}

export async function updateInitiative(data: UpdateGoal) {
  const requestData: UpdateGoal = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(
      apiEndpoints.projects.updateInitiative,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating initiative:', error);

    return { success: false, error };
  }
}

export async function deleteInitiative(id: string) {
  const requestData: DeleteProject = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting initiative: ID is missing');
    return { success: false, error: 'Initiative ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.projects.deleteInitiative}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting initiative:', error);

    return { success: false, error };
  }
}

export function getTaskTypes(payload?: GetProjectPayload) {
  const defaultPayload: GetProjectPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.projects.getTaskTypes, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetGoalResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const taskTypeObject = data?.successStatus;
    const taskTypes = data?.successStatus?.items ?? [];

    return {
      taskTypeList: { taskTypes, taskTypeObject },
      taskTypeListLoading: isLoading,
      taskTypeListError: error,
      taskTypeListValidating: isValidating,
      taskTypeListEmpty: !isLoading && taskTypes.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addTaskType(data: AddGoal) {
  const requestData: AddGoal = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.projects.addTaskType, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding task type:', error);

    return { success: false, error };
  }
}

export async function updateTaskType(data: UpdateGoal) {
  const requestData: UpdateGoal = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.projects.updateTaskType, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating task type:', error);

    return { success: false, error };
  }
}

export async function deleteTaskType(id: string) {
  const requestData: DeleteProject = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting task type: ID is missing');
    return { success: false, error: 'Task type ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.projects.deleteTaskType}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting task type:', error);

    return { success: false, error };
  }
}

export function getProjectModules(payload: string) {
  const finalPayload: GetModulesPayload = {
    projectId: payload,
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const swrKey = useMemo(
    () => [apiEndpoints.projects.getModules, finalPayload],
    [JSON.stringify(finalPayload)]
  );

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetModulesResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const projectModuleObject = data?.successStatus;
    const projectModules = data?.successStatus?.items ?? [];

    return {
      projectModuleList: { projectModules, projectModuleObject },
      projectModuleListLoading: isLoading,
      projectModuleListError: error,
      projectModuleListValidating: isValidating,
      projectModuleListEmpty: !isLoading && projectModules.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addProjectModule(data: AddModules) {
  const requestData: AddModules = {
    projectId: data.projectId,
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.projects.addModule, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding project module:', error);

    return { success: false, error };
  }
}

export async function updateProjectModule(data: UpdateModules) {
  const requestData: UpdateModules = {
    id: data.id,
    projectId: data.projectId,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.projects.updateModule, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating project module:', error);

    return { success: false, error };
  }
}

export async function deleteProjectModule(id: string) {
  const requestData: DeleteProject = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting project module: ID is missing');
    return { success: false, error: 'Project module ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.projects.deleteModule}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting project module:', error);

    return { success: false, error };
  }
}

export function getMilestone(payload: GetProjectMilestonePayload | null) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetProjectMilestonePayload = {
      ...payload,
    };
    return [apiEndpoints.projects.getMileStones, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const milestoneObject = data?.successStatus;
    const milestone = data?.successStatus?.items ?? [];
    const totalMilestones = data?.successStatus?.total ?? 0;

    return {
      milestoneList: { milestone, milestoneObject, totalMilestones },
      milestoneListLoading: isLoading,
      milestoneListError: error,
      milestoneListValidating: isValidating,
      milestoneListEmpty: !isLoading && milestone.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addMilestone(data: AddMilestone) {
  const requestData: AddMilestone = {
    projectId: data.projectId,
    name: data?.name,
    description: data?.description,
    startDate: data?.startDate,
    dueDate: data?.dueDate,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.projects.addMileStone, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding milestone:', error);

    return { success: false, error };
  }
}

export async function addMilestoneTasks(data: AddMilestoneTasks) {
  const requestData: AddMilestoneTasks = {
    milestoneId: data.milestoneId,
    taskIds: data?.taskIds,
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.projects.addTasksToMileStone,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding milestone tasks:', error);

    return { success: false, error };
  }
}

export async function deleteMilestone(id: string) {
  if (!id) {
    console.error('Error deleting milestone: ID is missing');
    return { success: false, error: 'Milestone ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.projects.deleteMileStone}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting milestone:', error);

    return { success: false, error };
  }
}
