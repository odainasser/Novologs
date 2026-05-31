import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  CreateTimesheet,
  GetTimesheetPayload,
  GetTimesheetResponse,
  UpdateTimesheet,
  GetCostPayload,
} from './timeSheetModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getTimesheet(payload?: GetTimesheetPayload) {
  const defaultPayload: GetTimesheetPayload = {
    ...payload,
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.timesheets.getTimesheet, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetTimesheetResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const timesheetObject = data?.successStatus;
    const timesheets = data?.successStatus?.items ?? [];

    return {
      timesheetsList: { timesheets, timesheetObject },
      timesheetsListLoading: isLoading,
      timesheetsListError: error,
      timesheetsListValidating: isValidating,
      timesheetsListEmpty: !isLoading && timesheets.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addTimesheet(data: CreateTimesheet) {
  const requestData: CreateTimesheet = {
    taskId: data.taskId,
    date: data.date,
    timeSlots: data.timeSlots.map((slot) => ({
      startTime: slot.startTime,
      durationInMinutes: slot.durationInMinutes,
      description: slot.description,
    })),
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
      apiEndpoints.timesheets.addTimesheet,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding timesheet:', error);

    return { success: false, error };
  }
}

export async function updateTimesheet(data: UpdateTimesheet) {
  const requestData: UpdateTimesheet = {
    id: data.id,
    taskId: data.taskId,
    date: data.date,
    timeSlots: data.timeSlots.map((slot) => ({
      startTime: slot.startTime,
      durationInMinutes: slot.durationInMinutes,
      description: slot.description,
    })),
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
    const response = await zetaAxiosInstance.put(
      apiEndpoints.timesheets.updateTimesheet,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
      // throw new Error('Failed to updating timesheet');
    }
  } catch (error: any) {
    console.error('Error updating timesheet:', error);

    return { success: false, error };
  }
}

export async function deleteTimesheet(id: string) {
  if (!id) {
    console.error('Error deleting timesheet: ID is missing');
    return { success: false, error: 'Timesheet ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.timesheets.deleteTimesheet}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting timesheet:', error);

    return { success: false, error };
  }
}

export function getItemCost(payload?: GetCostPayload) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetCostPayload = {
      ...payload,
    };
    return [apiEndpoints.timesheets.getItemCost, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetTimesheetResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const costObject = data?.successStatus;
    const costs = data?.successStatus?.items ?? [];

    return {
      costList: { costs, costObject },
      costListLoading: isLoading,
      costListError: error,
      costListValidating: isValidating,
      costListEmpty: !isLoading && costs.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
