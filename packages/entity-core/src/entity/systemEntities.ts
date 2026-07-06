// Общий контракт системных пользовательских сущностей для UI-пакетов.
export const appUserEntity = {
  name: "app_user",
  providerName: "default",
  columns: {
    id: "Id",
    userName: "UserName",
    displayName: "DisplayName",
    workEmail: "WorkEmail",
    role: "Role",
    departmentId: "DepartmentId",
    employeeId: "EmployeeId",
    officeId: "OfficeId",
    isActive: "IsActive"
  }
} as const;

export const userPersonalDataEntity = {
  name: "user_personal_data",
  providerName: "personalData",
  columns: {
    id: "Id",
    userId: "UserId",
    firstName: "FirstName",
    lastName: "LastName",
    phone: "Phone",
    birthDate: "BirthDate",
    addressLine: "AddressLine",
    emergencyContact: "EmergencyContact",
    cultureCode: "CultureCode",
    themeCode: "ThemeCode"
  }
} as const;

export const userGridColumnSettingEntity = {
  name: "sys_user_grid_column_setting",
  providerName: "default",
  columns: {
    id: "Id",
    userId: "UserId",
    gridId: "GridId",
    name: "Name",
    columnsJson: "ColumnsJson",
    isDefault: "IsDefault",
    updatedAt: "UpdatedAt"
  }
} as const;
