import type { EntityApiClient, EntityApiEntity } from "@titanic-entity/entity-api";
import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import type {
  BaseSectionDiffItem,
  BaseSectionMethods,
  BaseSectionTemplate,
  NormalizedBaseSectionTemplate
} from "@titanic-entity/entity-react/templates";
import type { ReactNode, Ref } from "react";
import "../button";
import "../container";
import "../dataGrid";
import type {
  EntityDataGridEntityDescriptor,
  DataGridHandle,
  DataGridProps,
  EntityDataGridRowAction,
  EntityDataGridSelectionChangeContext,
  EntityDataGridToolbarContext,
  EntityDataGridToolbarFactory,
  EntityDataGridToolbarItemInput
} from "../dataGrid";
import type { EntityDataGridLabels } from "../dataGrid/data-grid-settings";
import "./base-section";

type RecordsSectionGridProps<TRow> = Omit<
  DataGridProps<TRow>,
  | "className"
  | "createToolbarCenterItems"
  | "createToolbarLeftItems"
  | "createToolbarRightItems"
  | "onRowClick"
  | "onRowDoubleClick"
  | "onSelectionChange"
  | "refreshKey"
  | "rowActions"
>;

export interface EntityRecordsSectionLabels extends Partial<EntityDataGridLabels> {
  createRecord?: string;
  deleteRecord?: string;
  deleteRecordConfirm?: string;
  deleteRecordError?: string;
  deleteSelectedRecords?: string;
  deleteSelectedRecordsConfirm?: string;
  deleteSelectedRecordsError?: string;
  openRecord?: string;
  selectedRecords?: string | ((count: number) => ReactNode);
}

export interface EntityRecordsSectionContext<TRow = EntityApiEntity> {
  client?: EntityApiClient;
  diff: BaseSectionDiffItem[];
  entity: EntityDataGridEntityDescriptor;
  grid: EntityDataGridToolbarContext<TRow> | null;
  methods: BaseSectionMethods;
  refresh: () => void;
  runMethod: (name: string, ...args: unknown[]) => Promise<unknown>;
  selectedRowKeys: readonly string[];
  selectedRows: readonly TRow[];
  selectionModeEnabled: boolean;
  template: NormalizedBaseSectionTemplate;
}

export interface EntityRecordsSectionRecordContext<TRow = EntityApiEntity>
  extends EntityRecordsSectionContext<TRow> {
  primaryValue: string | number | null;
  row: TRow;
  rowIndex?: number;
}

export interface EntityRecordsSectionRecordsContext<TRow = EntityApiEntity>
  extends EntityRecordsSectionContext<TRow> {
  primaryValues: readonly (string | number)[];
  rows: readonly TRow[];
}

export type EntityRecordsSectionToolbarFactory<TRow = EntityApiEntity> = (
  context: EntityRecordsSectionContext<TRow>
) => readonly EntityDataGridToolbarItemInput<TRow>[];

export interface EntityRecordsSectionHandle<TRow = EntityApiEntity> {
  clearSelection: () => void;
  deleteRecord: (row: TRow) => Promise<void>;
  deleteSelectedRecords: (rows?: readonly TRow[]) => Promise<void>;
  disableMultiSelect: () => void;
  enableMultiSelect: () => void;
  getSelectedRowKeys: () => readonly string[];
  getSelectedRows: () => readonly TRow[];
  openCreatePage: () => Promise<void>;
  openDeleteManyPage: (rows?: readonly TRow[]) => Promise<void>;
  openDeletePage: (row: TRow) => Promise<void>;
  openEditPage: (row: TRow) => Promise<void>;
  refresh: () => void;
  runMethod: (name: string, ...args: unknown[]) => Promise<unknown>;
}

export interface EntityRecordsSectionProps<TRow = EntityApiEntity> extends RecordsSectionGridProps<TRow> {
  bottom?: ReactNode;
  className?: string;
  confirmDelete?: boolean;
  confirmDeleteRecord?: (context: EntityRecordsSectionRecordContext<TRow>) => boolean | Promise<boolean>;
  confirmDeleteRecords?: (context: EntityRecordsSectionRecordsContext<TRow>) => boolean | Promise<boolean>;
  createAddButtons?: (
    context: EntityRecordsSectionContext<TRow>
  ) => readonly EntityDataGridToolbarItemInput<TRow>[];
  createToolbarCenterItems?: EntityRecordsSectionToolbarFactory<TRow>;
  createToolbarLeftItems?: EntityRecordsSectionToolbarFactory<TRow>;
  createToolbarRightItems?: EntityRecordsSectionToolbarFactory<TRow>;
  deleteEnabled?: boolean;
  deleteSelectedEnabled?: boolean;
  getRowPrimaryValue?: (
    row: TRow,
    context: EntityRecordsSectionRecordContext<TRow>
  ) => string | number | null | undefined;
  gridClassName?: string;
  labels?: EntityRecordsSectionLabels;
  locale?: string;
  methods?: BaseSectionMethods;
  onDeleteRecord?: (context: EntityRecordsSectionRecordContext<TRow>) => Promise<void> | void;
  onDeleteRecords?: (context: EntityRecordsSectionRecordsContext<TRow>) => Promise<void> | void;
  onOpenCreatePage?: (context: EntityRecordsSectionContext<TRow>) => Promise<void> | void;
  onOpenDeleteManyPage?: (context: EntityRecordsSectionRecordsContext<TRow>) => Promise<void> | void;
  onOpenDeletePage?: (context: EntityRecordsSectionRecordContext<TRow>) => Promise<void> | void;
  onOpenEditPage?: (context: EntityRecordsSectionRecordContext<TRow>) => Promise<void> | void;
  onRowClick?: (row: TRow, rowIndex?: number) => void;
  onRowDoubleClick?: (row: TRow, rowIndex?: number) => void;
  onSelectionChange?: (context: EntityDataGridSelectionChangeContext<TRow>) => void;
  refreshKey?: string | number;
  renderBottomContainer?: (content: ReactNode, context: EntityRecordsSectionContext<TRow>) => ReactNode;
  renderTopContainer?: (content: ReactNode, context: EntityRecordsSectionContext<TRow>) => ReactNode;
  rowActions?: readonly EntityDataGridRowAction<TRow>[];
  template?: BaseSectionTemplate;
  top?: ReactNode;
}

export type BaseSectionLabels = EntityRecordsSectionLabels;
export type BaseSectionContext<TRow = EntityApiEntity> = EntityRecordsSectionContext<TRow>;
export type BaseSectionRecordContext<TRow = EntityApiEntity> = EntityRecordsSectionRecordContext<TRow>;
export type BaseSectionRecordsContext<TRow = EntityApiEntity> = EntityRecordsSectionRecordsContext<TRow>;
export type BaseSectionToolbarFactory<TRow = EntityApiEntity> = EntityRecordsSectionToolbarFactory<TRow>;
export type BaseSectionHandle<TRow = EntityApiEntity> = EntityRecordsSectionHandle<TRow>;
export type BaseSectionProps<TRow = EntityApiEntity> = EntityRecordsSectionProps<TRow>;

export type BaseEntitySectionLabels = BaseSectionLabels;
export type BaseEntitySectionContext<TRow = EntityApiEntity> = BaseSectionContext<TRow>;
export type BaseEntitySectionRecordContext<TRow = EntityApiEntity> = BaseSectionRecordContext<TRow>;
export type BaseEntitySectionRecordsContext<TRow = EntityApiEntity> = BaseSectionRecordsContext<TRow>;
export type BaseEntitySectionToolbarFactory<TRow = EntityApiEntity> = BaseSectionToolbarFactory<TRow>;
export type BaseEntitySectionHandle<TRow = EntityApiEntity> = BaseSectionHandle<TRow>;
export type BaseEntitySectionProps<TRow = EntityApiEntity> = BaseSectionProps<TRow>;

export interface RecordsSectionSelection<TRow> {
  selectedRowKeys: readonly string[];
  selectedRows: readonly TRow[];
  selectionModeEnabled: boolean;
}

export type BaseSectionComponent<TRow = EntityApiEntity> = (
  props: BaseSectionProps<TRow> & {
    ref?: Ref<BaseSectionHandle<TRow>>;
  }
) => ReactNode;

export type BaseEntitySectionComponent<TRow = EntityApiEntity> = BaseSectionComponent<TRow>;
export type EntityRecordsSectionComponent<TRow = EntityApiEntity> = BaseSectionComponent<TRow>;
export type BaseSectionDataGridToolbarFactory<TRow = EntityApiEntity> =
  EntityDataGridToolbarFactory<TRow>;
export type BaseSectionDataGridHandle<TRow = EntityApiEntity> = DataGridHandle<TRow>;

export const BaseSection = Titanic.getReactModule(
  "Titanic.UI.BaseSection"
) as unknown as BaseSectionComponent;

export const BaseEntitySection = BaseSection;
export const EntityRecordsSection = BaseSection;

export const baseSectionComponentSchema = defineComponentSchema<BaseSectionProps>({
  component: BaseSection as never,
  kind: "component",
  name: entityReactComponentNames.BaseSection
});

export const baseEntitySectionComponentSchema = baseSectionComponentSchema;
export const recordsSectionComponentSchema = baseSectionComponentSchema;
