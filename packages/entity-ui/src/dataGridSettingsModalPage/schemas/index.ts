export * from "./ColumnSettingsDialogLayout";
export * from "./ColumnSettingsFieldPickerSchema";
export * from "./ColumnSettingsModeTabs";
export * from "./ColumnSettingsVisibleFieldSchema";
export * from "./ColumnSettingsVisibleFieldsSchema";
export * from "./component-names";

import { defineComponentSchema } from "@titanic-entity/entity-base";
import {
  ColumnSettingsDialogLayout,
  type ColumnSettingsDialogLayoutProps
} from "./ColumnSettingsDialogLayout";
import {
  ColumnSettingsAvailableColumnsList,
  type ColumnSettingsAvailableColumnsListProps,
  ColumnSettingsFieldPickerList,
  type ColumnSettingsFieldPickerListProps,
  ColumnSettingsFieldPickerPath,
  type ColumnSettingsFieldPickerPathProps,
  ColumnSettingsFieldPickerSchema,
  type ColumnSettingsFieldPickerSchemaProps
} from "./ColumnSettingsFieldPickerSchema";
import {
  ColumnSettingsModeTabs,
  type ColumnSettingsModeTabsProps
} from "./ColumnSettingsModeTabs";
import {
  ColumnSettingsVisibleFieldSchema,
  type ColumnSettingsVisibleFieldSchemaProps
} from "./ColumnSettingsVisibleFieldSchema";
import {
  ColumnSettingsVisibleFieldsSchema,
  type ColumnSettingsVisibleFieldsSchemaProps
} from "./ColumnSettingsVisibleFieldsSchema";
import { columnSettingsComponentNames } from "./component-names";

export const columnSettingsAvailableColumnsListComponentSchema =
  defineComponentSchema<ColumnSettingsAvailableColumnsListProps>({
    kind: "component",
    name: columnSettingsComponentNames.ColumnSettingsAvailableColumnsList,
    component: ColumnSettingsAvailableColumnsList
  });

export const columnSettingsDialogLayoutComponentSchema = defineComponentSchema<ColumnSettingsDialogLayoutProps>({
  kind: "component",
  name: columnSettingsComponentNames.ColumnSettingsDialogLayout,
  component: ColumnSettingsDialogLayout
});

export const columnSettingsFieldPickerComponentSchema = defineComponentSchema<ColumnSettingsFieldPickerSchemaProps>({
  kind: "component",
  name: columnSettingsComponentNames.ColumnSettingsFieldPicker,
  component: ColumnSettingsFieldPickerSchema
});

export const columnSettingsFieldPickerListComponentSchema =
  defineComponentSchema<ColumnSettingsFieldPickerListProps>({
    kind: "component",
    name: columnSettingsComponentNames.ColumnSettingsFieldPickerList,
    component: ColumnSettingsFieldPickerList
  });

export const columnSettingsFieldPickerPathComponentSchema =
  defineComponentSchema<ColumnSettingsFieldPickerPathProps>({
    kind: "component",
    name: columnSettingsComponentNames.ColumnSettingsFieldPickerPath,
    component: ColumnSettingsFieldPickerPath
  });

export const columnSettingsModeTabsComponentSchema = defineComponentSchema<ColumnSettingsModeTabsProps>({
  kind: "component",
  name: columnSettingsComponentNames.ColumnSettingsModeTabs,
  component: ColumnSettingsModeTabs
});

export const columnSettingsVisibleFieldComponentSchema = defineComponentSchema<ColumnSettingsVisibleFieldSchemaProps>({
  kind: "component",
  name: columnSettingsComponentNames.ColumnSettingsVisibleField,
  component: ColumnSettingsVisibleFieldSchema
});

export const columnSettingsVisibleFieldsComponentSchema = defineComponentSchema<ColumnSettingsVisibleFieldsSchemaProps>({
  kind: "component",
  name: columnSettingsComponentNames.ColumnSettingsVisibleFields,
  component: ColumnSettingsVisibleFieldsSchema
});

export const columnSettingsComponentSchemas = [
  columnSettingsAvailableColumnsListComponentSchema,
  columnSettingsDialogLayoutComponentSchema,
  columnSettingsFieldPickerComponentSchema,
  columnSettingsFieldPickerListComponentSchema,
  columnSettingsFieldPickerPathComponentSchema,
  columnSettingsModeTabsComponentSchema,
  columnSettingsVisibleFieldComponentSchema,
  columnSettingsVisibleFieldsComponentSchema
] as const;
