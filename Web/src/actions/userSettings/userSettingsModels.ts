export interface AddUser {
  code: string;
  fullName: string;
  email: string;
  userName: string;
  country: string;
  language: string;
  // userType: number;
  hierarchyParentId: string | null;
  designationId: string | null;
  departmentId: string | null;
  roles?: string[];
  profileImageFileId?: string;
  hourlyRate?: number;
  phoneNumber?: string;
  companyBranchId?: string;
}

export interface UpdateUser {
  userId: string;
  code: string;
  fullName: string;
  email: string;
  userName: string;
  country: string;
  language: string;
  userType: number;
  hierarchyParentId: string | null;
  designationId: string | null;
  departmentId: string | null;
  roles?: string[];
  profileImageFileId?: string;
  hourlyRate?: number;
  phoneNumber?: string;
  companyBranchId?: string | null;
}

export interface DeactivateUser {
  userId: string;
  isActive: string;
}
export interface DeleteUser {
  userId: string;
}
export interface ResendEmail {
  userId: string;
}
