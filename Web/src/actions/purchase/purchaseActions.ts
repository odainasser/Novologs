import useSWR from 'swr';
import { useMemo } from 'react';

import { zetaAxiosInstance, postFetcher, fetchGetRequest } from 'src/utils/axios-zeta';
import { apiEndpoints } from 'src/utils/api-endpoints';
import {
  CreatePurchaseOrder,
  UpdatePurchaseOrder,
  GetProductsPayload,
  GetProductsResponse,
  AddProduct,
  UpdateProduct,
  DeleteProduct,
  GetPurchaseOrderPayload,
  GetPurchaseInvoicePayload,
  GetSalesInvoicePayload,
  CreateSalesInvoice,
  CreatePurchaseInvoice,
  UpdatePurchaseInvoice,
  UpdateSalesInvoice,
  Filter,
  AddDefaultAccount,
  GetDebitNotePayload,
  CreateDebitNote,
  UpdateDebitNote,
} from './purchaseModels';
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  shouldRetryOnError: false,
  dedupingInterval: 30000,
};

export function getPurchaseOrder(
  payload?: GetPurchaseOrderPayload,
  searchParam: string = '',
  enabled = true
) {
  const payloadKey = JSON.stringify(payload ?? {});
  const trimmedSearch = searchParam.trim();

  const swrKey = useMemo(() => {
    if (!enabled) return null;

    const search: Filter | undefined = trimmedSearch
      ? {
          fieldName: 'poNumber',
          fieldValue: trimmedSearch,
          operator: 0,
          logicOperator: 0,
          subFilters: [],
        }
      : undefined;

    const finalPayload: GetPurchaseOrderPayload = {
      ...(payload ?? {
        pagination: {
          pageNumber: 1,
          pageSize: 50,
        },
      }),
      ...(search && { search }),
      sort: {
        fieldName: 'Created',
        sortDirection: 1,
        subSort: [],
      },
    };

    return [apiEndpoints.purchase.getPurchaseOrder, finalPayload];
  }, [enabled, payloadKey, trimmedSearch]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const purchaseOrderObject = data?.successStatus;
    const purchaseOrder = data?.successStatus?.items ?? [];
    const total = data?.successStatus?.total ?? 0;

    return {
      purchaseOrderList: { purchaseOrder, purchaseOrderObject, total },
      purchaseOrderListLoading: enabled ? isLoading : false,
      purchaseOrderListError: error,
      purchaseOrderListValidating: enabled ? isValidating : false,
      purchaseOrderListEmpty: enabled ? !isLoading && purchaseOrder.length === 0 : false,
      mutate,
    };
  }, [data, error, isLoading, isValidating, enabled, mutate]);

  return memoizedValue;
}

export async function createPurchaseOrder(data: CreatePurchaseOrder, files?: File[]) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.post(
      apiEndpoints.purchase.createPurchaseOrder,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error adding purchase order:', error);
    return { success: false, error };
  }
}

export async function updatePurchaseOrder(data: UpdatePurchaseOrder, id: string, files?: File[]) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.purchase.updatePurchaseOrder}/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return { success: true, response };
  } catch (error: any) {
    console.error('Error updating purchase order:', error);
    return { success: false, error };
  }
}
export async function deletePurchaseOrder(id: string) {
  if (!id) {
    console.error('Error deleting purchase order: ID is missing');
    return { success: false, error: 'Purchase Order ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.purchase.deletePurchaseOrder}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting Purchase Order:', error);

    return { success: false, error };
  }
}

export function getPurchaseOrderById(id?: string, enabled?: boolean) {
  const swrKey = useMemo(() => {
    if (!id || !enabled) return null;
    return apiEndpoints.purchase.getPurchaseOrderById(id);
  }, [id, enabled]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const purchaseOrder = data?.successStatus ?? null;

    return {
      purchaseOrderDetails: purchaseOrder,
      purchaseOrderDetailsLoading: isLoading,
      purchaseOrderDetailsError: error,
      purchaseOrderDetailsValidating: isValidating,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export function getProducts(payload?: GetProductsPayload) {
  const defaultPayload: GetProductsPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.purchase.getProducts, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetProductsResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const productObject = data?.successStatus;
    const products = data?.successStatus?.items ?? [];

    return {
      productList: { products, productObject },
      productListLoading: isLoading,
      productListError: error,
      productListValidating: isValidating,
      productListEmpty: !isLoading && products.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addProduct(data: AddProduct) {
  const requestData: AddProduct = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    description: data?.description,
    unit: data?.unit || '',
    taxPercentage: Number(data?.taxPercentage) || 0,
    isActive: data?.isActive,
  };

  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.purchase.createProduct, requestData);

    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding product:', error);

    return { success: false, error };
  }
}

export async function updateProduct(data: UpdateProduct) {
  const requestData: UpdateProduct = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    description: data?.description,
    unit: data?.unit || '',
    taxPercentage: Number(data?.taxPercentage) || 0,
    isActive: data?.isActive,
  };

  try {
    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.purchase.updateProduct}/${data.id}`,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating product:', error);

    return { success: false, error };
  }
}

export async function deleteProduct(id: string) {
  const requestData: DeleteProduct = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting product: ID is missing');
    return { success: false, error: 'Product ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(`${apiEndpoints.purchase.deleteProduct}/${id}`);

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting product:', error);

    return { success: false, error };
  }
}

export function getPurchaseOrderType(payload?: GetProductsPayload) {
  const defaultPayload: GetProductsPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.purchase.getPurchaseOrderType, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetProductsResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const purchaseOrderTypeObject = data?.successStatus;
    const orderType = data?.successStatus?.items ?? [];

    return {
      orderTypeList: { orderType, purchaseOrderTypeObject },
      orderTypeListLoading: isLoading,
      orderTypeListError: error,
      orderTypeListValidating: isValidating,
      orderTypeListEmpty: !isLoading && orderType.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addPurchaseOderType(data: AddProduct) {
  const requestData: AddProduct = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    description: data?.description,
    isActive: data?.isActive,
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.purchase.createPurchaseOrderType,
      requestData
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding purchase order type:', error);

    return { success: false, error };
  }
}

export async function updatePurchaseOrderType(data: UpdateProduct) {
  const requestData: UpdateProduct = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    description: data?.description,
    isActive: data?.isActive,
  };

  try {
    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.purchase.updatePurchaseOrderType}/${data.id}`,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating purchase order type:', error);

    return { success: false, error };
  }
}

export async function deletePurchaseOrderType(id: string) {
  const requestData: DeleteProduct = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting Purchase order type: ID is missing');
    return { success: false, error: 'Purchase order type ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.purchase.deletePurchaseOrderType}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting Purchase order type:', error);

    return { success: false, error };
  }
}

export function getPurchaseTerms(payload?: GetProductsPayload) {
  const defaultPayload: GetProductsPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.purchase.getPurchaseTerms, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetProductsResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const purchaseTermsObject = data?.successStatus;
    const terms = data?.successStatus?.items ?? [];

    return {
      termsList: { terms, purchaseTermsObject },
      termsListLoading: isLoading,
      termsListError: error,
      termsListValidating: isValidating,
      termsListEmpty: !isLoading && terms.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addPurchaseTerms(data: AddProduct) {
  const requestData: AddProduct = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    description: data?.description,
    isActive: data?.isActive,
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.purchase.createPurchaseTerms,
      requestData
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding purchase terms:', error);

    return { success: false, error };
  }
}

export async function updatePurchaseTerms(data: UpdateProduct) {
  const requestData: UpdateProduct = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    description: data?.description,
    isActive: data?.isActive,
  };

  try {
    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.purchase.updatePurchaseTerms}/${data.id}`,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating purchase terms:', error);

    return { success: false, error };
  }
}

export async function deletePurchaseTerms(id: string) {
  const requestData: DeleteProduct = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting Purchase terms: ID is missing');
    return { success: false, error: 'Term ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.purchase.deletePurchaseTerms}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting terms:', error);

    return { success: false, error };
  }
}

export function getProductUnits(payload?: GetProductsPayload) {
  const defaultPayload: GetProductsPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.purchase.getProductUnits, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR<GetProductsResponse>(
    swrKey,
    postFetcher,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const productUnitObject = data?.successStatus;
    const units = data?.successStatus?.items ?? [];

    return {
      productUnitList: { units, productUnitObject },
      productUnitListLoading: isLoading,
      productUnitListError: error,
      productUnitListValidating: isValidating,
      productUnitListEmpty: !isLoading && units.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function addProductUnits(data: AddProduct) {
  const requestData: AddProduct = {
    name: {
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    description: data?.description,
    isActive: data?.isActive,
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.purchase.createProductUnits,
      requestData
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding product unit:', error);

    return { success: false, error };
  }
}

export async function updateProductUnit(data: UpdateProduct) {
  const requestData: UpdateProduct = {
    id: data.id,
    name: {
      id: data.name?.id || '',
      value: data.name?.value || '',
      localizedStrings: data.name?.localizedStrings,
    },
    description: data?.description,
    isActive: data?.isActive,
  };

  try {
    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.purchase.updateProductUnits}/${data.id}`,
      requestData
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error updating product units:', error);

    return { success: false, error };
  }
}

export async function deleteProductUnit(id: string) {
  const requestData: DeleteProduct = {
    id: id || '',
  };
  if (!id) {
    console.error('Error deleting product unit: ID is missing');
    return { success: false, error: 'Product unit ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.purchase.deleteProductUnits}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting unit:', error);

    return { success: false, error };
  }
}

export function getPurchaseInvoice(
  payload?: GetPurchaseInvoicePayload,
  searchParam: string = '',
  enabled = true
) {
  const payloadKey = JSON.stringify(payload ?? {});
  const trimmedSearch = searchParam.trim();

  const swrKey = useMemo(() => {
    if (!enabled) return null;

    const search: Filter | undefined = trimmedSearch
      ? {
          fieldName: 'invNumber',
          fieldValue: trimmedSearch,
          operator: 0,
          logicOperator: 0,
          subFilters: [],
        }
      : undefined;

    const finalPayload: GetPurchaseInvoicePayload = {
      ...(payload ?? {
        pagination: {
          pageNumber: 1,
          pageSize: 50,
        },
      }),
      ...(search && { search }),
    };

    return [apiEndpoints.purchase.getPurchaseInvoice, finalPayload];
  }, [enabled, payloadKey, trimmedSearch]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const purchaseInvoiceObject = data?.successStatus;
    const purchaseInvoice = data?.successStatus?.items ?? [];
    const total = data?.successStatus?.total ?? 0;

    return {
      purchaseInvoiceList: { purchaseInvoice, purchaseInvoiceObject, total },
      purchaseInvoiceListLoading: enabled ? isLoading : false,
      purchaseInvoiceListError: error,
      purchaseInvoiceListValidating: enabled ? isValidating : false,
      purchaseInvoiceListEmpty: enabled ? !isLoading && purchaseInvoice.length === 0 : false,
      mutate,
    };
  }, [data, error, isLoading, isValidating, enabled, mutate]);

  return memoizedValue;
}

export async function createPurchaseInvoice(data: CreatePurchaseInvoice, files?: File[]) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.post(
      apiEndpoints.purchase.createPurchaseInvoice,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error adding purchase invoice:', error);
    return { success: false, error };
  }
}

export async function updatePurchaseInvoice(
  data: UpdatePurchaseInvoice,
  id: string,
  files?: File[]
) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.purchase.updatePurchaseInvoice}/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return { success: true, response };
  } catch (error: any) {
    console.error('Error updating purchase invoice:', error);
    return { success: false, error };
  }
}
export async function deletePurchaseInvoice(id: string) {
  if (!id) {
    console.error('Error deleting purchase invoice: ID is missing');
    return { success: false, error: 'Purchase invoice ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.purchase.deletePurchaseInvoice}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting Purchase invoice:', error);

    return { success: false, error };
  }
}

export function getPurchaseInvoiceById(id?: string, enabled?: boolean) {
  const swrKey = useMemo(() => {
    if (!id || !enabled) return null;
    return apiEndpoints.purchase.getPurchaseInvoiceById(id);
  }, [id, enabled]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const purchaseInvoice = data?.successStatus ?? null;

    return {
      purchaseInvoiceDetails: purchaseInvoice,
      purchaseInvoiceDetailsLoading: isLoading,
      purchaseInvoiceDetailsError: error,
      purchaseInvoiceDetailsValidating: isValidating,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function postPurchaseInvoice(id: number) {
  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.purchase.postPurchaseInvoice(id));

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error posting purchase invoice:', error);
    return { success: false, error };
  }
}

export function getSalesInvoice(
  payload?: GetSalesInvoicePayload,
  searchParam: string = '',
  enabled = true
) {
  const payloadKey = JSON.stringify(payload ?? {});
  const trimmedSearch = searchParam.trim();

  const swrKey = useMemo(() => {
    if (!enabled) return null;

    const search: Filter | undefined = trimmedSearch
      ? {
          fieldName: 'invNumber',
          fieldValue: trimmedSearch,
          operator: 0,
          logicOperator: 0,
          subFilters: [],
        }
      : undefined;

    const finalPayload: GetSalesInvoicePayload = {
      ...(payload ?? {
        pagination: {
          pageNumber: 1,
          pageSize: 50,
        },
      }),
      ...(search && { search }),
    };

    return [apiEndpoints.purchase.getSalesInvoice, finalPayload];
  }, [enabled, payloadKey, trimmedSearch]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const salesInvoiceObject = data?.successStatus;
    const salesInvoice = data?.successStatus?.items ?? [];
    const total = data?.successStatus?.total ?? 0;

    return {
      salesInvoiceList: { salesInvoice, salesInvoiceObject, total },
      salesInvoiceListLoading: enabled ? isLoading : false,
      salesInvoiceListError: error,
      salesInvoiceListValidating: enabled ? isValidating : false,
      salesInvoiceListEmpty: enabled ? !isLoading && salesInvoice.length === 0 : false,
      mutate,
    };
  }, [data, error, isLoading, isValidating, enabled, mutate]);

  return memoizedValue;
}

export async function createSalesInvoice(data: CreateSalesInvoice, files?: File[]) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.post(
      apiEndpoints.purchase.createSalesInvoice,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error adding sales invoice:', error);
    return { success: false, error };
  }
}

export async function updateSalesInvoice(data: UpdateSalesInvoice, id: string, files?: File[]) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.purchase.updateSalesInvoice}/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return { success: true, response };
  } catch (error: any) {
    console.error('Error updating sales invoice:', error);
    return { success: false, error };
  }
}
export async function deleteSalesInvoice(id: string) {
  if (!id) {
    console.error('Error deleting sales invoice: ID is missing');
    return { success: false, error: 'Sales invoice ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.purchase.deleteSalesInvoice}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting sales invoice:', error);

    return { success: false, error };
  }
}

export function getSalesInvoiceById(id?: string, enabled?: boolean) {
  const swrKey = useMemo(() => {
    if (!id || !enabled) return null;
    return apiEndpoints.purchase.getSalesInvoiceById(id);
  }, [id, enabled]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const salesInvoice = data?.successStatus ?? null;

    return {
      salesInvoiceDetails: salesInvoice,
      salesInvoiceDetailsLoading: isLoading,
      salesInvoiceDetailsError: error,
      salesInvoiceDetailsValidating: isValidating,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function postSalesInvoice(id: number) {
  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.purchase.postSalesInvoice(id));

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    console.error('Error posting sales invoice:', error);
    return { success: false, error };
  }
}

export function getDefaultAccounts(payload?: GetProductsPayload) {
  const defaultPayload: GetProductsPayload = {
    pagination: {
      pageNumber: 1,
      pageSize: 100,
    },
  };

  const finalPayload = payload ?? defaultPayload;
  const swrKey = useMemo(
    () => [apiEndpoints.purchase.getDefaultAccounts, finalPayload],
    [JSON.stringify(finalPayload)]
  );
  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const defaultAccountObject = data?.successStatus;
    const defaultAccounts = data?.successStatus?.items ?? [];

    return {
      defaultAccountList: { defaultAccounts, defaultAccountObject },
      defaultAccountListLoading: isLoading,
      defaultAccountListError: error,
      defaultAccountListValidating: isValidating,
      defaultAccountListEmpty: !isLoading && defaultAccounts.length === 0,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}
export async function addDefaultAccount(data: AddDefaultAccount) {
  const requestData: AddDefaultAccount = {
    invoiceCategory: data?.invoiceCategory,
    invoiceAccountRole: data?.invoiceAccountRole,
    accountId: data?.accountId,
  };

  try {
    const response = await zetaAxiosInstance.post(
      apiEndpoints.purchase.createDefaultAccount,
      requestData
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error adding default account:', error);

    return { success: false, error };
  }
}

export async function deleteDefaultAccount(id: string) {
  if (!id) {
    console.error('Error deleting default account: ID is missing');
    return { success: false, error: 'Account  ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.purchase.deleteDefaultAccount}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    console.error('Error deleting default account:', error);

    return { success: false, error };
  }
}

export function getDebitNotePrefillByPurchaseInvoiceId(id?: string, enabled?: boolean) {
  const swrKey = useMemo(() => {
    if (!id || !enabled) return null;
    return apiEndpoints.purchase.getDebitNotePrefillByPurchaseInvoiceId(id);
  }, [id, enabled]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const prefillInvoice = data?.successStatus ?? null;

    return {
      prefillInvoiceDetails: prefillInvoice,
      prefillInvoiceDetailsLoading: isLoading,
      prefillInvoiceDetailsError: error,
      prefillInvoiceDetailsValidating: isValidating,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export function getDebitNote(
  payload?: GetDebitNotePayload,
  searchParam: string = '',
  enabled = true
) {
  const payloadKey = JSON.stringify(payload ?? {});
  const trimmedSearch = searchParam.trim();

  const swrKey = useMemo(() => {
    if (!enabled) return null;

    const search: Filter | undefined = trimmedSearch
      ? {
          fieldName: 'invNumber',
          fieldValue: trimmedSearch,
          operator: 0,
          logicOperator: 0,
          subFilters: [],
        }
      : undefined;

    const finalPayload: GetDebitNotePayload = {
      ...(payload ?? {
        pagination: {
          pageNumber: 1,
          pageSize: 50,
        },
      }),
      ...(search && { search }),
    };

    return [apiEndpoints.purchase.getDebitNote, finalPayload];
  }, [enabled, payloadKey, trimmedSearch]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(swrKey, postFetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const debitNoteObject = data?.successStatus;
    const debitNote = data?.successStatus?.items ?? [];
    const total = data?.successStatus?.total ?? 0;

    return {
      debitNoteList: { debitNote, debitNoteObject, total },
      debitNoteListLoading: enabled ? isLoading : false,
      debitNoteListError: error,
      debitNoteListValidating: enabled ? isValidating : false,
      debitNoteListEmpty: enabled ? !isLoading && debitNote.length === 0 : false,
      mutate,
    };
  }, [data, error, isLoading, isValidating, enabled, mutate]);

  return memoizedValue;
}

export async function createDebitNote(data: CreateDebitNote, files?: File[]) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.post(apiEndpoints.purchase.createDebitNote, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.status === 200 || response.status === 201) {
      return { success: true, response };
    }
  } catch (error: any) {
    return { success: false, error };
  }
}

export async function updateDebitNote(data: UpdateDebitNote, id: string, files?: File[]) {
  try {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await zetaAxiosInstance.put(
      `${apiEndpoints.purchase.updateDebitNote}/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return { success: true, response };
  } catch (error: any) {
    return { success: false, error };
  }
}
export async function deleteDebitNote(id: string) {
  if (!id) {
    return { success: false, error: 'Debit note ID is required' };
  }
  try {
    const response = await zetaAxiosInstance.delete(
      `${apiEndpoints.purchase.deleteDebitNote}/${id}`
    );

    if (response.status === 200) {
      return { success: true, response };
    } else {
    }
  } catch (error: any) {
    return { success: false, error };
  }
}

export function getDebitNoteById(id?: string, enabled?: boolean) {
  const swrKey = useMemo(() => {
    if (!id || !enabled) return null;
    return apiEndpoints.purchase.getDebitNoteById(id);
  }, [id, enabled]);

  const { data, isLoading, error, isValidating, mutate } = useSWR(
    swrKey,
    fetchGetRequest,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const debitNote = data?.successStatus ?? null;

    return {
      debitNoteDetails: debitNote,
      debitNoteDetailsLoading: isLoading,
      debitNoteDetailsError: error,
      debitNoteDetailsValidating: isValidating,
      mutate,
    };
  }, [data, error, isLoading, isValidating]);

  return memoizedValue;
}

export async function postDebitNote(id: number) {
  try {
    const response = await zetaAxiosInstance.post(apiEndpoints.purchase.postDebitNote(id));

    if (response.status === 200) {
      return { success: true, response };
    }
  } catch (error: any) {
    return { success: false, error };
  }
}
