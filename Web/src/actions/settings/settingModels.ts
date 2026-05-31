export interface GetCurrencyPayload {
  search?: {
    fieldName: string;
    fieldValue: any;
    operator?: number;
    logicOperator?: number;
    subFilters?: string[];
  };
  sort?: {
    fieldName: string;
    sortDirection: number;
    subSort: string[];
  };
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface GetCurrencyResponse {
  successStatus: {
    total: number;
    items: Currencies[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface Currencies {
  id: string;
  name: number;
  code: string;
  symbol: string;
}

export interface AddCurrency {
  name: {
    value: string;
    id?: string;
    localizedStrings?: {
      id: string;
      language: string;
      value: string;
    }[];
  };
  symbol: string;
}

export interface AddSetting {
  key: string;
  value: string;
  extra: string;
  isActive?: boolean;
}

export interface UpdateSetting {
  id?: string;
  key: string;
  value: string;
  extra?: string;
  isActive?: boolean;
}

export interface GetSettingsResponse {
  successStatus: {
    total: number;
    items: Settings[];
  };
  succeeded: boolean;
  errors: any[];
}
export interface Settings {
  id: string;
  key: string;
  value: string;
  extra: string;
  isActive: boolean;
}
