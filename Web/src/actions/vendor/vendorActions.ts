import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  GetClientPayload,
  GetClientResponse,
  CreateClient,
  AddContract,
  GetContractPayload,
  UpdateClient,
  DeleteClient,
  UpdateContract,
  GetSourceResponse,
  AddSource,
  UpdateSource,
  CreateClientContact,
  UpdateClientContact,
} from '../client/clientModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshWhenOffline: false,
  refreshWhenHidden: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};
export function getVendors(payload?: GetClientPayload) {
  const defaultPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 200,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.vendors.getVendor, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetClientResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const vendorObject = data?.successStatus;
    const vendors = data?.successStatus?.items ?? [];

    return {
      vendorList: { vendors, vendorObject },
      vendorListLoading: isLoading,
      vendorListError: error,
      vendorListValidating: isValidating,
      vendorListEmpty: !isLoading && vendors.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addVendor(data: CreateClient) {
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
    const response = await zetaAxiosInstance.post(apiEndpoints.vendors.addVendor, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding vendor:', error);

    return { success: false, error };
  }
}

export async function updateVendor(data: UpdateClient) {
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
    const response = await zetaAxiosInstance.put(apiEndpoints.vendors.updateVendor, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating vendor:', error);

    return { success: false, error };
  }
}

export async function deleteVendor(id: string) {
  const requestData: DeleteClient = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting vendor: ID is missing');
    return { success: false, error: 'Vendor ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.vendors.deleteVendor}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting vendor:', error);

    return { success: false, error };
  }
}

export function getContracts(id?: string) {
  const finalPayload: GetContractPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    vendorId: id || '',
  };

  const swrKey = useMemo(
    () => (id ? [apiEndpoints.vendors.getContract, finalPayload] : null),
    [id, JSON.stringify(finalPayload)]
  );

  const { data, isLoading, error, isValidating, mutate } = useSWR<GetClientResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const contractObject = data?.successStatus;
    const contracts = data?.successStatus?.items ?? [];

    return {
      contractList: { contracts, contractObject },
      contractListLoading: isLoading,
      contractListError: error,
      contractListValidating: isValidating,
      contractListEmpty: !isLoading && contracts.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addContract(data: AddContract) {
  const requestData: AddContract = {
    code: data?.code,
    name: data?.name,
    description: data?.description,
    vendorId: data?.vendorId,
    vendorContractStatusId: data?.vendorContractStatusId,
    vendorContractTypeId: data.vendorContractTypeId,

    value: data?.value,
    currencyId: data?.currencyId,
    expectedStartDate: data.expectedStartDate,
    expectedEndDate: data.expectedEndDate,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.vendors.addContract, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding contract:', error);

    return { success: false, error };
  }
}

export async function updateContract(data: UpdateContract) {
  const requestData: UpdateContract = {
    id: data.id,
    code: data.code,
    name: data.name,
    vendorId: data.vendorId,
    description: data.description,
    vendorContractStatusId: data.vendorContractStatusId,
    vendorContractTypeId: data.vendorContractTypeId,
    value: data.value,
    currencyId: data.currencyId,
    expectedStartDate: data.expectedStartDate,
    expectedEndDate: data.expectedEndDate,
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
    const response = await zetaAxiosInstance.put(apiEndpoints.vendors.updateContract, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating contract:', error);

    return { success: false, error };
  }
}

export async function deleteContract(id: string) {
  const requestData: DeleteClient = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting contract: ID is missing');
    return { success: false, error: 'Contract ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.vendors.deleteContract}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting contract:', error);

    return { success: false, error };
  }
}

export function getContractStatus(payload?: GetClientPayload) {
  const defaultPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.vendors.getContractStatus, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetSourceResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const contractStatusObject = data?.successStatus;
    const status = data?.successStatus?.items ?? [];

    return {
      contractStatusList: { status, contractStatusObject },
      contractStatusListLoading: isLoading,
      contractStatusListError: error,
      contractStatusListValidating: isValidating,
      contractStatusListEmpty: !isLoading && status.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addContractStatus(data: AddSource) {
  const requestData: AddSource = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.vendors.addContractStatus,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding status:', error);

    return { success: false, error };
  }
}

export async function updateContractStatus(data: UpdateSource) {
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
      apiEndpoints.vendors.updateContractStatus,
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

export async function deleteContractStatus(id: string) {
  if (!id) {
    console.error('Error deleting status: ID is missing');
    return { success: false, error: 'Status ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.vendors.deleteContractStatus}/${id}`
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

export function getContractType(payload?: GetClientPayload) {
  const defaultPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.vendors.getContractType, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetSourceResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const contractTypeObject = data?.successStatus;
    const contractType = data?.successStatus?.items ?? [];

    return {
      contractTypeList: { contractType, contractTypeObject },
      contractTypeListLoading: isLoading,
      contractTypeListError: error,
      contractTypeListValidating: isValidating,
      contractTypeListEmpty: !isLoading && contractType.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addContractType(data: AddSource) {
  const requestData: AddSource = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.vendors.addContractType,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding type:', error);

    return { success: false, error };
  }
}

export async function updateContractType(data: UpdateSource) {
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
      apiEndpoints.vendors.updateContractType,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating type:', error);

    return { success: false, error };
  }
}

export async function deleteContractType(id: string) {
  if (!id) {
    console.error('Error deleting type: ID is missing');
    return { success: false, error: 'Contract type ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.vendors.deleteContractType}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting type:', error);

    return { success: false, error };
  }
}

export function getVendorContacts(payload?: GetClientPayload) {
  const finalPayload: GetClientPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
    ...payload,
  };

  const swrKey = useMemo(
    () => [apiEndpoints.vendors.getContacts, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const vendorContactObject = data?.successStatus;
    const vendorContacts = data?.successStatus?.items ?? [];
    const totalContacts = data?.successStatus?.total;

    return {
      vendorContactList: { vendorContacts, totalContacts, vendorContactObject },
      vendorContactListLoading: isLoading,
      vendorContactListError: error,
      vendorContactListValidating: isValidating,
      vendorContactListEmpty: !isLoading && vendorContacts.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addVendorContacts(data: CreateClientContact) {
  const requestData: CreateClientContact = {
    name: data?.name,
    email: data?.email,
    mobileNumber: data?.mobileNumber,
    phoneNumber: data?.phoneNumber,
    designation: data?.designation,
    vendorId: data?.vendorId,
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
    const response = await zetaAxiosInstance.post(apiEndpoints.vendors.addContact, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding vendor contact:', error);

    return { success: false, error };
  }
}
export async function updateVendorContact(data: UpdateClientContact) {
  const requestData: UpdateClientContact = {
    id: data.id,
    name: data?.name,
    email: data?.email,
    mobileNumber: data?.mobileNumber,
    phoneNumber: data?.phoneNumber,
    designation: data?.designation,
    vendorId: data?.vendorId,
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
    const response = await zetaAxiosInstance.put(apiEndpoints.vendors.updateContact, filteredData);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating vendor contact:', error);

    return { success: false, error };
  }
}

export async function deleteVendorContact(id: string) {
  if (!id) {
    console.error('Error deleting vendor contact: ID is missing');
    return { success: false, error: 'Vendor contact ID is required' };
  }

  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.vendors.deleteContact}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting vendor contact:', error);

    return { success: false, error };
  }
}
