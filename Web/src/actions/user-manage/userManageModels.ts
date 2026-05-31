export interface SearchFilter {
  fieldName: string;
  fieldValue?: string | boolean;
  operator?: number;
  logicOperator?: number;
  subFilters?: SearchFilter[];
}

export interface GetUserPayload {
  search?: SearchFilter;
  sort?: {
    fieldName: string;
    sortDirection: number;
    subSort?: string[];
  };
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
}

export interface GetUserResponse {
  successStatus: {
    total: number;
    items: User[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface User {
  code: string;
  serial: number;
  fullName: string;
  country: string;
  language: string;
  userType: number;
  designationId: string;
  designation: string | null;
  departmentId: string;
  department: string | null;
  memberProjects: any[];
  memeberTasks: any[];
  isDeleted: boolean;
  deletedOnDate: string | null;
  deletedBy: string | null;
  id: string;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}
export interface GetAllRolesResponse {
  successStatus: {
    roles: [];
    permissions: [];
  };
  succeeded: boolean;
  errors: any[];
  __error?: boolean;
  message?: string;
}

export interface ConfirmEmail {
  userId: string;
  code: string;
  password: string;
}

export interface ChangePassword {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface GetWorkStatusResponse {
  successStatus: {
    total: number;
    items: Status[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface LocalizedString {
  id: string;
  language: string;
  value: string;
}

export interface LocalizableName {
  id: string;
  value: string;
  localizedStrings: LocalizedString[];
}
export interface Status {
  id: string;
  name: LocalizableName;
  isActive: boolean;
}

export interface ChangeMyStatus {
  workStatusId: string;
  startDate?: string;
  endDate?: string;
}

export interface AddStatus {
  name: {
    id?: string;
    value: string;
    localizedStrings?: {
      id: string;
      language: string;
      value: string;
    }[];
  };
  color?: string;
}

export interface UpdateStatus {
  id: string;
  name: {
    id: string;
    value: string;
    // localizedStrings?: {
    //   id: string;
    //   language: string;
    //   value: string;
    // }[];
  };
  color?: string;
}

export interface UserGroupMember {
  id: string;
  userGroupId: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    profileImageUrl: string | null;
  };
}

export interface UserGroup {
  id: string;
  code: string | null;
  serial: number;
  name: string;
  members: UserGroupMember[];
}

export interface GetUserGroupResponse {
  successStatus: {
    total: number;
    items: UserGroup[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface AddUserGroup {
  name: string;
  code: string;
  memberIds: string[];
}

export interface UpdateUserGroup {
  id: string;
  name?: string;
  code?: string;
  memberIds?: string[];
}

export interface GetUserNotificationsResponse {
  successStatus: {
    unreadCount: number;
    total: number;
    items: UserNotification[];
  };
  succeeded: boolean;
  errors: any[];
}

export interface UserNotification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  body: string;
  type: number;
  data: {
    TaskCode?: string;
    TaskId?: string;
  };
  isRead: boolean;
}

export interface NotificationRead {
  id: string;
  isRead: boolean;
}

export interface AssignPermissionToUser {
  userIds: string[];
  permissionIds: string[];
}

export interface UpdateUserPermission {
  userId: string[];
  permissionIds: string[];
}
export interface AddRoles {
  name: string;
}

export interface AddPermissionDescription {
  id: string;
  description: string;
}
export interface DeleteRole {
  id: string;
}

export interface AssignPermissionToRole {
  roleId: string;
  permissionIds: string[];
}

export interface GetUserWithPermissionPayload {
  search?: {
    fieldName: string;
    fieldValue: string;
    operator: number;
    logicOperator: number;
    subFilters?: string[];
  };
  sort?: {
    fieldName: string;
    sortDirection: number;
    subSort?: string[];
  };
  pagination: {
    pageNumber: number;
    pageSize: number;
  };
  permissionId: string;
  permissionName: string;
}

export interface AddCompanyBranch {
  name: string;
  code: string;
  phone?: number;
  email?: number;
  country?: string;
  city?: string;
  address?: string;
}

export interface UpdateCompanyBranch {
  id: string;
  name: string;
  code: string;
  phone?: number;
  email?: number;
  country?: string;
  city?: string;
  address?: string;
}

export interface DeleteCompanyBranch {
  id: string;
}
