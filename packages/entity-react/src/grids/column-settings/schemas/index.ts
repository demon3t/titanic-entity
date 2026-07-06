export * from "./ColumnSettingsDialogLayout";
export * from "./ColumnSettingsFieldPickerSchema";
export * from "./ColumnSettingsModeTabs";
export * from "./ColumnSettingsVisibleFieldSchema";
export * from "./ColumnSettingsVisibleFieldsSchema";

import { defineComponentSchema } from "@titanic/entity-base";
import {
  ColumnSettingsDialogLayout,
  type ColumnSettingsDialogLayoutProps
} from "./ColumnSettingsDialogLayout";
import {
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

export const columnSettingsComponentNames = {
  ColumnSettingsDialogLayout: "ColumnSettingsDialogLayout",
  ColumnSettingsFieldPicker: "ColumnSettingsFieldPicker",
  ColumnSettingsModeTabs: "ColumnSettingsModeTabs",
  ColumnSettingsVisibleField: "ColumnSettingsVisibleField",
  ColumnSettingsVisibleFields: "ColumnSettingsVisibleFields"
} as const;

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
  columnSettingsDialogLayoutComponentSchema,
  columnSettingsFieldPickerComponentSchema,
  columnSettingsModeTabsComponentSchema,
  columnSettingsVisibleFieldComponentSchema,
  columnSettingsVisibleFieldsComponentSchema
] as const;
