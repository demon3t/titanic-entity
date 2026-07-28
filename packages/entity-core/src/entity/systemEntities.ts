import { Entity } from "./EntityModel";
import { BooleanColumn } from "./columns/BooleanColumn";
import { LookupColumn } from "./columns/LookupColumn";
import { StringColumn } from "./columns/StringColumn";

export class AppUserEntity extends Entity {
  readonly id = new StringColumn("Id", "", { hidden: true });
  readonly userName = new StringColumn("UserName");
  readonly displayName = new StringColumn("DisplayName");
  readonly workEmail = new StringColumn("WorkEmail");
  readonly role = new StringColumn("Role");
  readonly departmentId = new LookupColumn("DepartmentId");
  readonly employeeId = new LookupColumn("EmployeeId");
  readonly officeId = new LookupColumn("OfficeId");
  readonly isActive = new BooleanColumn("IsActive");

  constructor() {
    super({
      name: "app_user",
      providerName: "default",
      primaryColumn: "Id",
      displayColumn: "DisplayName"
    });
  }
}

export class UserPersonalDataEntity extends Entity {
  readonly id = new StringColumn("Id", "", { hidden: true });
  readonly userId = new StringColumn("UserId", "", { hidden: true });
  readonly userKey = new StringColumn("UserKey", "", { hidden: true });
  readonly firstName = new StringColumn("FirstName");
  readonly lastName = new StringColumn("LastName");
  readonly phone = new StringColumn("Phone");
  readonly birthDate = new StringColumn("BirthDate");
  readonly addressLine = new StringColumn("AddressLine");
  readonly emergencyContact = new StringColumn("EmergencyContact");
  readonly cultureCode = new StringColumn("CultureCode");
  readonly themeCode = new StringColumn("ThemeCode");

  constructor() {
    super({
      name: "user_personal_data",
      providerName: "personalData",
      primaryColumn: "Id",
      displayColumn: "FirstName"
    });
  }
}

export class UserGridColumnSettingEntity extends Entity {
  readonly id = new StringColumn("Id", "", { hidden: true });
  readonly userId = new StringColumn("UserId");
  readonly gridId = new StringColumn("GridId");
  readonly nameColumn = new StringColumn("Name", "", { alias: "name" });
  readonly columnsJson = new StringColumn("ColumnsJson");
  readonly isDefault = new BooleanColumn("IsDefault");
  readonly updatedAt = new StringColumn("UpdatedAt");

  constructor() {
    super({
      name: "sys_user_grid_column_setting",
      providerName: "default",
      primaryColumn: "Id",
      displayColumn: "Name"
    });
  }
}

export const appUserEntity = new AppUserEntity();
export const userPersonalDataEntity = new UserPersonalDataEntity();
export const userGridColumnSettingEntity = new UserGridColumnSettingEntity();
