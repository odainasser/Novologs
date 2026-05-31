import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher, fetchGetRequest } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetClientPayload,
  GetClientResponse,
  CreateClient,
  AddLead,
  GetLeadPayload,
  UpdateClient,
  DeleteClient,
  UpdateLead,
  GetSourceResponse,
  AddSource,
  UpdateSource,
  DeleteSource,
  ChangeLeadStatus,
  GetSalesReportPayload,
  GetSalesReportResponse,
  AddSalesTarget,
  CreateClientContact,
  UpdateClientContact,
  AddLeadMembers,
  GetLeadUpdatesPayload,
  AddLeadUpdate,
} from './clientModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};
export function getClients(payload?: GetClientPayload) {
  const finalPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    ...payload,
  };

  const swrKey = useMemo(
    () => [apiEndpoints.clients.getClients, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetClientResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const clientObject = data?.successStatus;
    const clients = data?.successStatus?.items ?? [];

    return {
      clientList: { clients, clientObject },
      clientListLoading: isLoading,
      clientListError: error,
      clientListValidating: isValidating,
      clientListEmpty: !isLoading && clients.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addClient(data: CreateClient) {
  const requestData: CreateClient = {
    code: data?.code,
    name: data?.name,
    website: data?.website,
    address: data?.address,
    email: data?.email,
    phonenumber: data?.phonenumber,
    emirate: data.emirate,
    locationLatitude: data.locationLatitude,
    locationLongitude: data.locationLongitude,
    logoFileId: data.logoFileId,
    isAccount: data?.isAccount,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.clients.addClient, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding client:', error);

    return { success: false, error };
  }
}

export async function updateClient(data: UpdateClient) {
  const requestData: UpdateClient = {
    id: data.id,
    code: data.code,
    name: data.name,
    email: data.email,
    emirate: data.emirate,
    address: data.address,
    phonenumber: data.phonenumber,
    website: data.website,
    locationLatitude: data.locationLatitude,
    locationLongitude: data.locationLongitude,
    logoFileId: data.logoFileId,
    isAccount: data?.isAccount,
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
    const response = await zetaAxiosInstance.put(apiEndpoints.clients.updateClient, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating client:', error);

    return { success: false, error };
  }
}

export async function deleteClient(id: string) {
  const requestData: DeleteClient = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting client: ID is missing');
    return { success: false, error: 'Client ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.clients.deleteClient}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting client:', error);

    return { success: false, error };
  }
}

export function getLeads(clientId: string, myLeads?: boolean) {
  const finalPayload: GetLeadPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },

    clientId: clientId,
    myLeads: myLeads || false,
  };

  const swrKey = useMemo(
    // If id is not a truthy string, pass null as the key to SWR to prevent fetching.
    () =>
      clientId
        ? [apiEndpoints.clients.getLeads, finalPayload]
        : [apiEndpoints.clients.getLeads, finalPayload],
    [clientId, JSON.stringify(finalPayload)] // Add clientId to dependency array for the conditional logic
  );

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetClientResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const leadObject = data?.successStatus;
    const leads = data?.successStatus?.items ?? [];

    return {
      leadList: { leads, leadObject },
      leadListLoading: isLoading,
      leadListError: error,
      leadListValidating: isValidating,
      leadListEmpty: !isLoading && leads.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addLead(data: AddLead) {
  const requestData: AddLead = {
    code: data?.code,
    name: data?.name,
    clientId: data?.clientId,
    saleStatusId: data?.saleStatusId,
    leadSourceId: data?.leadSourceId,
    value: data?.value,
    currencyId: data?.currencyId,
    expectedAwardedDate: data?.expectedAwardedDate,
    probability: data?.probability,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.clients.addLead, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding lead:', error);

    return { success: false, error };
  }
}

export async function updateLead(data: UpdateLead) {
  const requestData: UpdateLead = {
    id: data.id,
    code: data.code,
    name: data.name,
    clientId: data.clientId,
    saleStatusId: data.saleStatusId,
    leadSourceId: data.leadSourceId,
    value: data.value,
    currencyId: data.currencyId,
    expectedAwardedDate: data.expectedAwardedDate,
    probability: data?.probability,
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
    const response = await zetaAxiosInstance.put(apiEndpoints.clients.updateLead, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating lead:', error);

    return { success: false, error };
  }
}

export async function deleteLead(id: string) {
  const requestData: DeleteClient = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting lead: ID is missing');
    return { success: false, error: 'Lead ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.clients.deleteLead}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting lead:', error);

    return { success: false, error };
  }
}

export async function changeLeadStatus(data: ChangeLeadStatus) {
  const requestData: ChangeLeadStatus = {
    id: data.id,
    leadStatus: data.leadStatus,
    awardedValue: data.awardedValue,
    awardedDate: data.awardedDate,
    awardedCurrencyId: data.awardedCurrencyId,
    rejectedDate: data.rejectedDate,
    rejectionReasonId: data.rejectionReasonId,
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
      apiEndpoints.clients.changeLeadStatus,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error changing lead status:', error);

    return { success: false, error };
  }
}

export function getSources(payload?: GetClientPayload) {
  const defaultPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.clients.getSources, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetSourceResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const sourceObject = data?.successStatus;
    const sources = data?.successStatus?.items ?? [];

    return {
      sourceList: { sources, sourceObject },
      sourceListLoading: isLoading,
      sourceListError: error,
      sourceListValidating: isValidating,
      sourceListEmpty: !isLoading && sources.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addSource(data: AddSource) {
  const requestData: AddSource = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.clients.addSource, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding source:', error);

    return { success: false, error };
  }
}

export async function updateSource(data: UpdateSource) {
  const requestData: UpdateSource = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(apiEndpoints.clients.updateSource, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating source:', error);

    return { success: false, error };
  }
}

export async function deleteSource(id: string) {
  const requestData: DeleteSource = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting source: ID is missing');
    return { success: false, error: 'Source ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.clients.deleteSource}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting source:', error);

    return { success: false, error };
  }
}

export function getSaleStatuses(payload?: GetClientPayload) {
  const defaultPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.clients.getSaleStatuses, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetSourceResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const salesStatusObject = data?.successStatus;
    const status = data?.successStatus?.items ?? [];

    return {
      salesStatusList: { status, salesStatusObject },
      salesStatusListLoading: isLoading,
      salesStatusListError: error,
      salesStatusListValidating: isValidating,
      salesStatusListEmpty: !isLoading && status.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addSaleStatus(data: AddSource) {
  const requestData: AddSource = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.clients.addSaleStatus, requestData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding status:', error);

    return { success: false, error };
  }
}

export async function updateSaleStatus(data: UpdateSource) {
  const requestData: UpdateSource = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(
      apiEndpoints.clients.updateSaleStatus,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating status:', error);

    return { success: false, error };
  }
}

export async function deleteSaleStatus(id: string) {
  const requestData: DeleteSource = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting status: ID is missing');
    return { success: false, error: 'Status ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.clients.deleteSaleStatus}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting status:', error);

    return { success: false, error };
  }
}

export function getRejectionReasons(payload?: GetClientPayload) {
  const defaultPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.clients.getRejectionReasons, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetSourceResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const reasonsObject = data?.successStatus;
    const reasons = data?.successStatus?.items ?? [];

    return {
      reasonsList: { reasons, reasonsObject },
      reasonsListLoading: isLoading,
      reasonsListError: error,
      reasonsListValidating: isValidating,
      reasonsListEmpty: !isLoading && reasons.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addRejectionReason(data: AddSource) {
  const requestData: AddSource = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.clients.addRejectionReason,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding reason:', error);

    return { success: false, error };
  }
}

export async function updateRejectionReason(data: UpdateSource) {
  const requestData: UpdateSource = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.put(
      apiEndpoints.clients.updateRejectionReason,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating reason:', error);

    return { success: false, error };
  }
}

export async function deleteRejectionReason(id: string) {
  const requestData: DeleteSource = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting reason: ID is missing');
    return { success: false, error: 'Reason ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.clients.deleteRejectionReason}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting reason:', error);

    return { success: false, error };
  }
}

export function getSalesTarget(payload: GetSalesReportPayload | null) {
  const swrKey = useMemo(() => {
    if (!payload) {
      return null;
    }

    const finalPayload: GetSalesReportPayload = {
      ...payload,
    };
    return [apiEndpoints.clients.getSalesTargets, finalPayload];
  }, [payload ? JSON.stringify(payload) : null]);
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetSalesReportResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const target = data?.successStatus?.items ?? [];
    const totalTarget = data?.successStatus?.total;

    return {
      salesTarget: { target, totalTarget },
      salesTargetLoading: isLoading,
      salesTargetError: error,
      salesTargetValidating: isValidating,
      salesTargetEmpty: !isLoading && target.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addUserTarget(data: AddSalesTarget) {
  const requestData: AddSalesTarget = {
    targets: data?.targets,
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
    const response = await zetaAxiosInstance.post(
      apiEndpoints.clients.addSalesTargetList,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding sales target:', error);

    return { success: false, error };
  }
}

export function getClientContacts(payload?: GetClientPayload) {
  const finalPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    ...payload,
  };

  const swrKey = useMemo(
    () => [apiEndpoints.clients.getContacts, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const clientContactObject = data?.successStatus;
    const clientContacts = data?.successStatus?.items ?? [];
    const totalContacts = data?.successStatus?.total;

    return {
      clientContactList: { clientContacts, totalContacts, clientContactObject },
      clientContactListLoading: isLoading,
      clientContactListError: error,
      clientContactListValidating: isValidating,
      clientContactListEmpty: !isLoading && clientContacts.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addClientContacts(data: CreateClientContact) {
  const requestData: CreateClientContact = {
    name: data?.name,
    email: data?.email,
    mobileNumber: data?.mobileNumber,
    phoneNumber: data?.phoneNumber,
    designation: data?.designation,
    clientId: data?.clientId,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.clients.addContact, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding client contact:', error);

    return { success: false, error };
  }
}
export async function updateClientContact(data: UpdateClientContact) {
  const requestData: UpdateClientContact = {
    id: data.id,
    name: data?.name,
    email: data?.email,
    mobileNumber: data?.mobileNumber,
    phoneNumber: data?.phoneNumber,
    designation: data?.designation,
    clientId: data?.clientId,
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
    const response = await zetaAxiosInstance.put(apiEndpoints.clients.updateContact, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating client contact:', error);

    return { success: false, error };
  }
}

export async function deleteClientContact(id: string) {
  if (!id) {
    console.error('Error deleting client contact: ID is missing');
    return { success: false, error: 'Client contact ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.clients.deleteContact}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting client contact:', error);

    return { success: false, error };
  }
}
export async function shareLeadMembers(data: AddLeadMembers) {
  const requestData: AddLeadMembers = {
    leadId: data.leadId,
    members: data.members,
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
      apiEndpoints.clients.shareLeadMembers,
      filteredData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error sharing members:', error);

    return { success: false, error };
  }
}

export function getSharedLeads(payload?: GetClientPayload) {
  const finalPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    ...payload,
  };

  const swrKey = useMemo(
    () => [apiEndpoints.clients.getSharedLeads, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const sharedLeadObject = data?.successStatus;
    const sharedLeads = data?.successStatus?.items ?? [];

    return {
      sharedLeadList: { sharedLeads, sharedLeadObject },
      sharedLeadListLoading: isLoading,
      sharedLeadListError: error,
      sharedLeadListValidating: isValidating,
      sharedLeadListEmpty: !isLoading && sharedLeads.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
export function getLeadMemberByLeadId(id: string, shouldFetch: boolean = true) {
  const url = id ? `${apiEndpoints.clients.getLeadMemberByLeadId}/${id}` : null;

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    shouldFetch && url ? url : null,
    fetchGetRequest,
    swrOptions
  );
  const memoizedValue = useMemo(() => {
    const isApiError = data?.__error;

    return {
      leadMembersById: { details: isApiError ? null : data?.successStatus },
      leadMembersByIdLoading: isLoading,
      leadMembersByIdError: isApiError ? data.message : error,
      leadMembersByIdValidating: isValidating,
      mutate,
    };
  }, [data, error, isValidating]);

  return memoizedValue;
}

export function getLeadUpdates(payload?: GetLeadUpdatesPayload) {
  const finalPayload: GetLeadUpdatesPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    ...payload,
  };

  const swrKey = useMemo(
    () => [apiEndpoints.clients.getLeadUpdates, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const leadUpdateObject = data?.successStatus;
    const leadUpdates = data?.successStatus?.items ?? [];

    return {
      leadUpdateList: { leadUpdates, leadUpdateObject },
      leadUpdateListLoading: isLoading,
      leadUpdateListError: error,
      leadUpdateListValidating: isValidating,
      leadUpdateListEmpty: !isLoading && leadUpdates.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addLeadUpdate(data: AddLeadUpdate) {
  const requestData: AddLeadUpdate = {
    leadId: data.leadId,
    description: data.description,
    status: data.status,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.clients.addLeadUpdate, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    return { success: false, error };
  }
}

export async function deleteLeadUpdate(id: string) {
  if (!id) {
    return { success: false, error: 'Lead Update ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.clients.deleteLeadUpdate}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    return { success: false, error };
  }
}
