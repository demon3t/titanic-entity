import { EntityGridColumnSettingsApiClient } from "@titanic-entity/entity-api";
import { Titanic } from "@titanic-entity/entity-react";
import { Fragment, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "../button";
import { Container } from "../container";
import { columnSettingsDefinedComponentNames } from "../dataGridSettingsModalPage/schemas/component-names";
import { ResourceSvgIcon } from "../resourceSvgIcon";
import type { DataGridProps } from "./index";

const dataGridMethodDefinitions: Record<string, (this: any, ...args: any[]) => any> = {
    getHandle(this: any): Record<string, unknown> {
      return {
        clearSelection: this.methods.clearSelection,
        disableMultiSelect: this.methods.disableMultiSelect,
        enableMultiSelect: this.methods.enableMultiSelect,
        getGridColumnSettings: this.methods.getGridColumnSettings,
        getSelectedRowKeys: this.methods.getSelectedRowKeys,
        getSelectedRows: this.methods.getSelectedRows,
        loadMoreRows: this.methods.loadMoreRows,
        openColumnSettings: this.methods.openColumnSettings,
        refresh: this.methods.refresh
      };
    },

    refresh(this: any): void {
      this.attributes.setRefreshVersion((version: number) => version + 1);
    },

    clearSelection(this: any): void {
      this.attributes.setSelectedRowKeys([]);
    },

    enableMultiSelect(this: any): void {
      this.methods.setMultiSelectEnabled(true, true);
    },

    disableMultiSelect(this: any): void {
      this.methods.setMultiSelectEnabled(false, true);
    },

    toggleMultiSelect(this: any): void {
      this.methods.setMultiSelectEnabled(!this.attributes.multiSelectEnabled, true);
    },

    setMultiSelectEnabled(this: any, enabled: boolean, notify: boolean): void {
      this.attributes.setMultiSelectEnabled(enabled);

      if (!enabled) {
        this.attributes.setSelectedRowKeys([]);
      }

      if (notify && typeof this.attributes.onMultiSelectChange === "function") {
        this.attributes.onMultiSelectChange(enabled);
      }
    },

    getSelectedRowKeys(this: any): readonly string[] {
      return [...this.methods.resolveSelectedRowKeys()];
    },

    getSelectedRows(this: any): readonly unknown[] {
      return [...this.attributes.selectedRows];
    },

    resolveEffectiveRows(this: any): readonly any[] {
      if (Array.isArray(this.attributes.rows)) {
        return this.attributes.rows;
      }

      return Array.isArray(this.attributes.internalRows) ? this.attributes.internalRows : [];
    },

    resolveSelectedRowKeys(this: any): readonly string[] {
      return Array.isArray(this.attributes.selectedRowKeys) ? this.attributes.selectedRowKeys : [];
    },

    createRowsFingerprint(this: any, rows: readonly any[]): string {
      try {
        return JSON.stringify(
          rows.map((row: any, rowIndex: number) => ({
            key: this.methods.getResolvedRowKey(row, rowIndex),
            row
          }))
        );
      } catch {
        return rows
          .map((row: any, rowIndex: number) => this.methods.getResolvedRowKey(row, rowIndex))
          .join("|");
      }
    },

    resolveRowEventArgs(
      this: any,
      eventOrRow: unknown,
      rowOrIndex?: unknown,
      maybeRowIndex?: unknown
    ): { event: unknown; row: any; rowIndex?: number } {
      if (typeof rowOrIndex === "number" && maybeRowIndex === undefined) {
        return {
          event: undefined,
          row: eventOrRow,
          rowIndex: rowOrIndex
        };
      }

      return {
        event: eventOrRow,
        row: rowOrIndex,
        rowIndex: typeof maybeRowIndex === "number" ? maybeRowIndex : undefined
      };
    },

    resolveSettings(this: any): Record<string, unknown> {
      return {
        defaultRowCount: 15,
        batchRowCount: this.attributes.batchRowCount ?? 15,
        gridWidth: this.attributes.gridWidth ?? 24,
        editable: Boolean(this.attributes.editable),
        persistColumnSettings: true,
        showRowContextMenu: true,
        storagePrefix: "titanic.entityDataGrid",
        labels: {},
        ...(this.attributes.settings ?? {})
      };
    },

    resolveLabels(this: any): Record<string, string> {
      const locale = this.attributes.effectiveSettings.locale ?? this.attributes.effectiveSettings.culture;
      const getLabels = (Titanic as any).UI?.getEntityDataGridLabels;
      const baseLabels =
        typeof getLabels === "function"
          ? getLabels(locale)
          : {
              loading: "Loading",
              loadingMore: "Loading",
              loadingStructure: "Loading",
              empty: "No records",
              error: "Failed to load records",
              booleanTrue: "Yes",
              booleanFalse: "No",
              selectRow: "Select row",
              selectAllRows: "Select all rows",
              cancelSelection: "Cancel selection",
              listMode: "List",
              tileMode: "Tile",
              configureColumns: "Configure columns",
              configureTotals: "Configure totals",
              sortColumns: "Sort columns",
              sortAscending: "Ascending",
              sortDescending: "Descending"
            };

      return {
        ...baseLabels,
        ...(this.attributes.effectiveSettings.labels ?? {}),
        ...(this.attributes.labels ?? {})
      };
    },

    resolveEntity(this: any): Record<string, unknown> {
      const entityInput = this.attributes.entity;
      const primaryColumn = this.attributes.primaryColumn;

      if (typeof entityInput === "string") {
        return {
          entityTypeName: entityInput,
          primaryColumn,
          tableName: this.attributes.tableName ?? entityInput
        };
      }

      if (entityInput && typeof entityInput === "object") {
        const schema = (entityInput as any).schema ?? entityInput;
        const columns = this.methods.getEntityColumns(entityInput);
        const tableName =
          schema.tableName ??
          schema.name ??
          schema.entityName ??
          schema.entityTypeName ??
          this.attributes.tableName;

        return {
          ...schema,
          columns,
          entityTypeName: schema.entityTypeName ?? schema.name ?? tableName,
          primaryColumn: schema.primaryColumn ?? primaryColumn,
          tableName
        };
      }

      return {
        entityTypeName: this.attributes.tableName,
        primaryColumn,
        tableName: this.attributes.tableName
      };
    },

    getEntityColumns(this: any, entityInput?: unknown): any[] {
      const source = entityInput ?? this.attributes.entity;
      const schema = (source as any)?.schema ?? source;
      const columnSource = (schema as any)?.columns ?? (source as any)?.columns;

      if (Array.isArray(columnSource)) {
        return columnSource;
      }

      if (columnSource && typeof columnSource === "object") {
        return Object.entries(columnSource).map(([key, column]) => ({
          ...(typeof column === "object" && column ? column : {}),
          key,
          path: (column as any)?.path ?? key
        }));
      }

      return [];
    },

    normalizeColumns(this: any): any[] {
      const explicitColumns = Array.isArray(this.attributes.columns) ? this.attributes.columns : [];
      const entityColumns = this.methods.getEntityColumns();
      const sourceColumns = explicitColumns.length > 0 ? explicitColumns : entityColumns;
      const sampleRow = this.methods.resolveEffectiveRows()[0];

      if (sourceColumns.length > 0) {
        return sourceColumns.map((column: any, columnIndex: number) =>
          this.methods.normalizeColumn(column, columnIndex)
        );
      }

      if (sampleRow && typeof sampleRow === "object") {
        return Object.keys(sampleRow).map((key, columnIndex) =>
          this.methods.normalizeColumn({ key, path: key }, columnIndex)
        );
      }

      return [];
    },

    normalizeColumn(this: any, column: any, columnIndex: number): Record<string, unknown> {
      const key = this.methods.getColumnKey(column) ?? `column_${columnIndex}`;
      const field = this.methods.getColumnField(column);
      const path = this.methods.normalizeColumnSettingText(column.path)
        || this.methods.normalizeColumnSettingText(field?.path)
        || this.methods.normalizeColumnSettingText(column.name)
        || key;
      const normalizedColumn = { ...column, key, path };
      const sortPath = this.methods.getColumnSortPath(undefined, normalizedColumn);
      const normalizedColumnWithSortPath = sortPath ? { ...normalizedColumn, sortPath } : normalizedColumn;

      return {
        ...normalizedColumnWithSortPath,
        defaultVisible: column.defaultVisible ?? true,
        field: this.methods.createColumnField(normalizedColumnWithSortPath),
        key,
        label: this.methods.getColumnLabel(normalizedColumn),
        path,
        settingId: column.settingId ?? key,
        span: column.span ?? column.width
      };
    },

    getColumnKey(this: any, column: any): string | undefined {
      const field = this.methods.getColumnField(column);

      return this.methods.normalizeColumnSettingText(column?.key)
        || this.methods.normalizeColumnSettingText(column?.settingId)
        || this.methods.normalizeColumnSettingText(field?.key)
        || this.methods.normalizeColumnSettingText(field?.alias)
        || this.methods.normalizeColumnSettingText(column?.path)
        || this.methods.normalizeColumnSettingText(field?.path)
        || this.methods.normalizeColumnSettingText(column?.name)
        || undefined;
    },

    getColumnLabel(this: any, column: any): string {
      const key = this.methods.getColumnKey(column);
      const labels = this.attributes.columnLabels ?? {};
      const field = this.methods.getColumnField(column);
      const path = this.methods.normalizeColumnSettingText(column?.path)
        || this.methods.normalizeColumnSettingText(field?.path);
      const fieldCaption = this.methods.normalizeColumnSettingText(field?.caption);
      const configuredLabel = (key ? labels[key] : undefined) ?? (path ? labels[path] : undefined);

      return configuredLabel
        || this.methods.normalizeColumnSettingText(column.label)
        || this.methods.normalizeColumnSettingText(column.caption)
        || fieldCaption
        || this.methods.normalizeColumnSettingText(column.title)
        || this.methods.normalizeColumnSettingText(column.name)
        || path
        || key
        || "";
    },

    resolveDefaultVisibleColumnKeys(this: any): string[] {
      return this.attributes.normalizedColumns
        .filter((column: any) => column.defaultVisible !== false)
        .map((column: any) => column.key);
    },

    resolveVisibleColumnKeys(this: any): string[] {
      if (Array.isArray(this.attributes.visibleColumnKeys)) {
        return [...this.attributes.visibleColumnKeys];
      }

      if (this.attributes.activeColumnSettings.length > 0) {
        const availableKeys = new Set(this.attributes.normalizedColumns.map((column: any) => column.key));
        const keys = [...this.attributes.activeColumnSettings]
          .map((setting: any, settingIndex: number) => ({ setting, settingIndex }))
          .map(({ setting, settingIndex }: any) => ({
            key: this.methods.getColumnSettingKey(setting),
            setting,
            settingIndex
          }))
          .filter(({ setting, key }: any) =>
            setting?.visible !== false &&
            key &&
            (availableKeys.has(key) || Boolean(this.methods.createColumnFromSetting({ ...setting, key })))
          )
          .sort((left: any, right: any) => {
            const leftOrder = Number.isFinite(Number(left.setting.order)) ? Number(left.setting.order) : left.settingIndex;
            const rightOrder = Number.isFinite(Number(right.setting.order)) ? Number(right.setting.order) : right.settingIndex;

            return leftOrder - rightOrder;
          })
          .map(({ key }: any) => key);

        if (keys.length > 0) {
          return keys;
        }
      }

      if (Array.isArray(this.attributes.defaultVisibleColumnKeys)) {
        return [...this.attributes.defaultVisibleColumnKeys];
      }

      return this.methods.resolveDefaultVisibleColumnKeys();
    },

    resolveActiveColumnSettings(this: any): any[] {
      const mode = this.methods.normalizeColumnSettingsMode(this.attributes.effectiveRowMode);
      const modeSettings = this.attributes.columnModeSettings;

      if (
        modeSettings &&
        typeof modeSettings === "object" &&
        Array.isArray((modeSettings as any)[mode]?.columns) &&
        (modeSettings as any)[mode].columns.length > 0
      ) {
        return [...(modeSettings as any)[mode].columns];
      }

      return Array.isArray(this.attributes.appliedColumnSettings) ? [...this.attributes.appliedColumnSettings] : [];
    },

    resolveEffectiveRowMode(this: any): string {
      return this.methods.normalizeColumnSettingsMode(
        this.attributes.columnSettingsMode ?? this.attributes.rowMode
      );
    },

    normalizeColumnSettingsMode(this: any, value: unknown): string {
      return value === "tile" ? "tile" : "list";
    },

    normalizeGridSpan(this: any, value: unknown): number {
      const gridWidth = Number(this.attributes.effectiveSettings.gridWidth ?? this.attributes.gridWidth ?? 24);
      const maxSpan = Number.isFinite(gridWidth) && gridWidth > 0 ? Math.round(gridWidth) : 24;
      const span = Number(value);

      if (!Number.isFinite(span) || span <= 0) {
        return 1;
      }

      return Math.max(1, Math.min(Math.round(span), maxSpan));
    },

    normalizeGridWidth(this: any, value: unknown): number | undefined {
      const width = Number(value);

      return Number.isFinite(width) && width > 0 ? width : undefined;
    },

    hasColumnRelativeSpan(this: any, column: any): boolean {
      const span = Number(column?.span);

      return Number.isFinite(span) && span > 0;
    },

    resolveColumnPixelWidth(this: any, column: any): string | undefined {
      if (this.attributes.effectiveRowMode === "tile") {
        return undefined;
      }

      const width = this.methods.normalizeGridWidth(column?.width);

      return width ? `${width}px` : undefined;
    },

    normalizeColumnSettingText(this: any, value: unknown): string {
      return typeof value === "string" ? value.trim() : "";
    },

    getColumnField(this: any, value: any): Record<string, unknown> | undefined {
      const field = value?.field;

      return field && typeof field === "object" && !Array.isArray(field)
        ? field as Record<string, unknown>
        : undefined;
    },

    getColumnSettingKey(this: any, setting: any): string {
      const field = this.methods.getColumnField(setting);

      return this.methods.normalizeColumnSettingText(setting?.key)
        || this.methods.normalizeColumnSettingText(field?.key)
        || this.methods.normalizeColumnSettingText(field?.alias)
        || this.methods.normalizeColumnSettingText(field?.path)
        || this.methods.normalizeColumnSettingText(setting?.path);
    },

    getColumnSettingPath(this: any, setting: any, column?: any): string {
      const settingField = this.methods.getColumnField(setting);
      const columnField = this.methods.getColumnField(column);

      return this.methods.normalizeColumnSettingText(setting?.path)
        || this.methods.normalizeColumnSettingText(settingField?.path)
        || this.methods.normalizeColumnSettingText(column?.path)
        || this.methods.normalizeColumnSettingText(columnField?.path)
        || this.methods.getColumnSettingKey(setting)
        || this.methods.normalizeColumnSettingText(this.methods.getColumnKey(column));
    },

    getColumnSortPath(this: any, setting?: any, column?: any): string {
      const settingField = this.methods.getColumnField(setting);
      const columnField = this.methods.getColumnField(column);
      const explicitSortPath = this.methods.normalizeColumnSettingText(setting?.sortPath)
        || this.methods.normalizeColumnSettingText(settingField?.sortPath)
        || this.methods.normalizeColumnSettingText(column?.sortPath)
        || this.methods.normalizeColumnSettingText(columnField?.sortPath);

      if (explicitSortPath) {
        return explicitSortPath;
      }

      const valuePath = this.methods.getColumnSettingPath(setting ?? {}, column);
      const displaySortPath = this.methods.resolveReferenceDisplaySortPath(valuePath);

      return displaySortPath || "";
    },

    resolveReferenceDisplaySortPath(this: any, valuePath: string): string | undefined {
      const structure = this.attributes.structure;
      const rootTableName = this.methods.normalizeColumnSettingText(this.attributes.resolvedEntity?.tableName);

      if (!structure || !Array.isArray(structure.entities) || !rootTableName || !valuePath) {
        return undefined;
      }

      const entityByTableName = new Map<string, any>();

      for (const entity of structure.entities) {
        const tableName = this.methods.normalizeColumnSettingText(entity?.tableName);

        if (tableName) {
          entityByTableName.set(tableName.toLocaleLowerCase(), entity);
        }
      }

      let entity = entityByTableName.get(rootTableName.toLocaleLowerCase());
      let referenceEntity: any | undefined;
      const segments = valuePath.split(".").map((segment: string) => segment.trim()).filter(Boolean);

      for (const segment of segments) {
        if (!entity || !Array.isArray(entity.columns)) {
          return undefined;
        }

        const column = entity.columns.find((candidate: any) =>
          this.methods.normalizeColumnSettingText(candidate?.propertyName).toLocaleLowerCase() === segment.toLocaleLowerCase()
        );

        if (!column?.isReference || !column.referenceTableName) {
          referenceEntity = undefined;
          entity = undefined;
          continue;
        }

        referenceEntity = entityByTableName.get(String(column.referenceTableName).toLocaleLowerCase());
        entity = referenceEntity;
      }

      if (!referenceEntity || !Array.isArray(referenceEntity.columns)) {
        return undefined;
      }

      const displayColumn =
        referenceEntity.columns.find((column: any) => column?.isDisplay) ??
        referenceEntity.columns.find((column: any) =>
          ["name", "displayname", "title"].includes(
            this.methods.normalizeColumnSettingText(column?.propertyName).toLocaleLowerCase()
          )
        );
      const displayColumnName = this.methods.normalizeColumnSettingText(displayColumn?.propertyName);

      return displayColumnName ? `${valuePath}.${displayColumnName}` : undefined;
    },

    getColumnSettingCaption(this: any, setting: any): string {
      const field = this.methods.getColumnField(setting);

      return this.methods.normalizeColumnSettingText(setting?.caption)
        || this.methods.normalizeColumnSettingText(setting?.label)
        || this.methods.normalizeColumnSettingText(field?.caption);
    },

    createColumnField(this: any, column: any, setting?: any): Record<string, unknown> | undefined {
      const columnField = this.methods.getColumnField(column);
      const settingField = this.methods.getColumnField(setting);
      const key = this.methods.normalizeColumnSettingText(this.methods.getColumnKey(column))
        || this.methods.getColumnSettingKey(setting);
      const path = this.methods.getColumnSettingPath(setting ?? {}, column)
        || this.methods.normalizeColumnSettingText(column?.path ?? column?.key);
      const sortPath = this.methods.normalizeColumnSettingText(setting?.sortPath)
        || this.methods.normalizeColumnSettingText(settingField?.sortPath)
        || this.methods.normalizeColumnSettingText(column?.sortPath)
        || this.methods.normalizeColumnSettingText(columnField?.sortPath);
      const alias = this.methods.normalizeColumnSettingText(settingField?.alias)
        || this.methods.normalizeColumnSettingText(columnField?.alias)
        || this.methods.normalizeColumnSettingText(column?.alias);
      const caption = this.methods.getColumnSettingCaption(setting)
        || this.methods.normalizeColumnSettingText(column?.caption)
        || this.methods.normalizeColumnSettingText(columnField?.caption)
        || this.methods.normalizeColumnSettingText(column?.label);
      const nextField = {
        ...(columnField ?? {}),
        ...(settingField ?? {}),
        ...(key ? { key } : {}),
        ...(path ? { path } : {}),
        ...(sortPath ? { sortPath } : {}),
        ...(alias ? { alias } : {}),
        ...(caption ? { caption } : {})
      };

      return Object.keys(nextField).length > 0 ? nextField : undefined;
    },

    getLabelFromColumnPath(this: any, path: string): string | undefined {
      const label = path
        .split(".")
        .map((part) => part.trim())
        .filter(Boolean)
        .pop();

      return label || undefined;
    },

    splitTechnicalColumnName(this: any, value: string): string {
      const normalizedValue = value.trim().replace(/Id$/, "");

      return normalizedValue
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim() || value;
    },

    getReadableLabelFromColumnPath(this: any, path: string): string | undefined {
      const parts = path
        .split(".")
        .map((part) => this.methods.splitTechnicalColumnName(part))
        .filter(Boolean);

      return parts.length > 0 ? parts.join(" / ") : undefined;
    },

    isColumnSettingPathLeafLabel(this: any, label: string, path: string): boolean {
      const normalizedPath = this.methods.normalizeColumnSettingText(path);

      if (!normalizedPath.includes(".")) {
        return false;
      }

      const leafLabel = this.methods.getLabelFromColumnPath(normalizedPath);
      return Boolean(leafLabel && leafLabel.localeCompare(label, undefined, { sensitivity: "accent" }) === 0);
    },

    resolveColumnSettingLabel(this: any, column: any, setting: any): string {
      const settingLabel = this.methods.getColumnSettingCaption(setting);
      const path = this.methods.getColumnSettingPath(setting, column);

      if (settingLabel && !this.methods.isColumnSettingPathLeafLabel(settingLabel, path)) {
        return settingLabel;
      }

      const columnLabel = this.methods.normalizeColumnSettingText(column?.label);

      if (columnLabel) {
        return columnLabel;
      }

      return (path ? this.methods.getReadableLabelFromColumnPath(path) : undefined)
        || settingLabel
        || path
        || "";
    },

    createColumnFromSetting(this: any, setting: any): any | null {
      const key = this.methods.getColumnSettingKey(setting);
      const path = this.methods.getColumnSettingPath(setting, { key });

      if (!key) {
        return null;
      }

      const columnPath = path || key;
      const settingLabel = this.methods.getColumnSettingCaption(setting);
      const label = settingLabel && !this.methods.isColumnSettingPathLeafLabel(settingLabel, columnPath)
        ? settingLabel
        : this.methods.getReadableLabelFromColumnPath(columnPath) || settingLabel || key;
      const column = {
        key,
        label,
        path: columnPath,
        defaultVisible: false
      };

      return {
        ...column,
        alias: this.methods.createQueryColumnAlias(column),
        field: this.methods.createColumnField(column, setting)
      };
    },

    createQueryColumnAlias(this: any, column: any): string | undefined {
      const field = this.methods.getColumnField(column);
      const path = this.methods.normalizeColumnSettingText(column?.path)
        || this.methods.normalizeColumnSettingText(field?.path)
        || this.methods.normalizeColumnSettingText(column?.key)
        || this.methods.normalizeColumnSettingText(field?.key);
      const explicitAlias = this.methods.normalizeColumnSettingText(column?.alias)
        || this.methods.normalizeColumnSettingText(field?.alias);

      if (explicitAlias) {
        return explicitAlias;
      }

      if (!path || !path.includes(".")) {
        return undefined;
      }

      const key = this.methods.normalizeColumnSettingText(column?.key)
        || this.methods.normalizeColumnSettingText(field?.key);

      if (key && key !== path && !key.includes(".")) {
        return key;
      }

      const alias = path
        .split(".")
        .map((part: string) => part.replace(/[^A-Za-z0-9_]/g, ""))
        .filter(Boolean)
        .map((part: string, partIndex: number) =>
          partIndex === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join("");

      return alias || undefined;
    },

    createQueryColumn(this: any, column: any): Record<string, unknown> | null {
      const field = this.methods.getColumnField(column);
      const path = this.methods.normalizeColumnSettingText(column?.path)
        || this.methods.normalizeColumnSettingText(field?.path)
        || this.methods.normalizeColumnSettingText(column?.key)
        || this.methods.normalizeColumnSettingText(field?.key);

      if (!path) {
        return null;
      }

      const alias = this.methods.createQueryColumnAlias(column);

      return alias && alias !== path ? { path, alias } : { path };
    },

    applyColumnSettingsToColumns(this: any, settings: any[]): any[] {
      const columnsByKey = new Map<string, any>();

      for (const column of this.attributes.normalizedColumns) {
        const field = this.methods.getColumnField(column);
        [
          column.key,
          column.path,
          column.alias,
          field?.key,
          field?.path,
          field?.alias
        ]
          .map((value: unknown) => this.methods.normalizeColumnSettingText(value))
          .filter(Boolean)
          .forEach((key: string) => columnsByKey.set(key, column));
      }

      const renderedKeys = new Set<string>();
      const result = [...settings]
        .map((setting: any, settingIndex: number) => ({ setting, settingIndex }))
        .filter(({ setting }: any) => setting?.visible !== false)
        .sort((left: any, right: any) => {
          const leftOrder = Number.isFinite(Number(left.setting.order)) ? Number(left.setting.order) : left.settingIndex;
          const rightOrder = Number.isFinite(Number(right.setting.order)) ? Number(right.setting.order) : right.settingIndex;

          return leftOrder - rightOrder;
        })
        .map(({ setting }: any) => {
          const key = this.methods.getColumnSettingKey(setting);

          if (!key) {
            return null;
          }

          const normalizedSetting = { ...setting, key };
          const column = columnsByKey.get(key) ?? this.methods.createColumnFromSetting(normalizedSetting);

          if (!column) {
            return null;
          }

          renderedKeys.add(column.key);
          renderedKeys.add(key);

          const path = this.methods.getColumnSettingPath(normalizedSetting, column) || column.path;
          const hasRelativeSpan = this.methods.hasColumnRelativeSpan(normalizedSetting);
          const nextColumn = { ...column, ...normalizedSetting, path };

          return {
            ...column,
            label: this.methods.resolveColumnSettingLabel(column, normalizedSetting),
            path,
            alias: this.methods.createQueryColumnAlias(nextColumn),
            field: this.methods.createColumnField(column, normalizedSetting),
            span: this.methods.normalizeGridSpan(normalizedSetting.span ?? column.span),
            width: hasRelativeSpan
              ? undefined
              : this.methods.normalizeGridWidth(normalizedSetting.width ?? column.width)
          };
        })
        .filter(Boolean);

      for (const column of this.attributes.normalizedColumns) {
        if (!renderedKeys.has(column.key) && (column.required || column.alwaysVisible)) {
          result.push(column);
        }
      }

      return result.length > 0
        ? result
        : this.attributes.normalizedColumns.filter((column: any) => column.defaultVisible !== false);
    },

    createDefaultColumnSettings(this: any): any[] {
      const visibleKeys = new Set(this.methods.resolveDefaultVisibleColumnKeys());
      const defaultSpan = this.methods.normalizeGridSpan(
        this.attributes.effectiveSettings.gridWidth ?? this.attributes.gridWidth ?? 24
      );

      return this.attributes.normalizedColumns.map((column: any, columnIndex: number) => {
        const field = this.methods.createColumnField(column);
        const caption = this.methods.normalizeColumnSettingText(column.caption)
          || this.methods.normalizeColumnSettingText(field?.caption)
          || this.methods.normalizeColumnSettingText(column.label);

        return {
          id: column.settingId ?? column.key,
          key: column.key,
          ...(caption ? { caption } : {}),
          ...(field ? { field } : {}),
          order: columnIndex,
          path: column.path,
          span: this.methods.normalizeGridSpan(column.span ?? defaultSpan),
          visible: visibleKeys.has(column.key),
          width: this.methods.normalizeGridWidth(column.width)
        };
      });
    },

    resolveCurrentColumnSettings(this: any): any[] {
      return this.attributes.activeColumnSettings.length > 0
        ? [...this.attributes.activeColumnSettings]
        : this.methods.createDefaultColumnSettings();
    },

    normalizeSortSetting(this: any, value: unknown): { key: string; path?: string; direction: "asc" | "desc" } | null {
      if (!value || typeof value !== "object") {
        return null;
      }

      const payload = value as Record<string, unknown>;
      const key = typeof payload.key === "string" ? payload.key.trim() : "";
      const path = typeof payload.path === "string" ? payload.path.trim() : "";
      const rawDirection = typeof payload.direction === "string" ? payload.direction.toLowerCase() : "";
      const fallbackKey = path || key;

      if (!fallbackKey) {
        return null;
      }

      return {
        key: key || fallbackKey,
        ...(path ? { path } : {}),
        direction: rawDirection === "desc" || rawDirection === "descending" ? "desc" : "asc"
      };
    },

    createColumnSortSetting(this: any, column: any, direction: "asc" | "desc"): { key: string; path?: string; direction: "asc" | "desc" } | null {
      const key = this.methods.getColumnKey(column);
      const sortPath = this.methods.getColumnSortPath({}, column);
      const valuePath = this.methods.getColumnSettingPath({}, column);
      const path = sortPath || valuePath;
      const fallbackKey = path || key;

      if (!fallbackKey) {
        return null;
      }

      return {
        key: key || fallbackKey,
        ...(path ? { path } : {}),
        direction
      };
    },

    getColumnSortDirection(this: any, column: any): "asc" | "desc" | null {
      const sortSetting = this.methods.normalizeSortSetting(this.attributes.sortSetting);

      if (!sortSetting) {
        return null;
      }

      const key = this.methods.getColumnKey(column);
      const path = this.methods.getColumnSettingPath({}, column);
      const sortPath = this.methods.getColumnSortPath({}, column);

      if (
        (sortPath && sortSetting.path === sortPath) ||
        (path && sortSetting.path === path) ||
        (key && sortSetting.key === key)
      ) {
        return sortSetting.direction;
      }

      return null;
    },

    getNextColumnSortSetting(this: any, column: any): { key: string; path?: string; direction: "asc" | "desc" } | null {
      const currentDirection = this.methods.getColumnSortDirection(column);

      return this.methods.createColumnSortSetting(column, currentDirection === "asc" ? "desc" : "asc");
    },

    createOrderFromSortSetting(this: any, value: unknown): Record<string, unknown> | null {
      const sortSetting = this.methods.normalizeSortSetting(value);

      if (!sortSetting) {
        return null;
      }

      const isDescending = sortSetting.direction === "desc";

      return {
        path: sortSetting.path ?? sortSetting.key,
        direction: isDescending ? 1 : 0,
        desc: isDescending
      };
    },

    resolveEffectiveOrders(this: any): unknown {
      const sortOrder = this.methods.createOrderFromSortSetting(this.attributes.sortSetting);

      return sortOrder ? [sortOrder] : this.attributes.orders;
    },

    createGridTemplate(this: any): string {
      if (this.attributes.effectiveRowMode === "tile") {
        const gridWidth = this.methods.normalizeGridSpan(
          this.attributes.effectiveSettings.gridWidth ?? this.attributes.gridWidth ?? 24
        );
        const tracks = [`repeat(${gridWidth}, minmax(0, 1fr))`];

        if (this.attributes.multiSelectEnabled) {
          tracks.unshift("40px");
        }

        return tracks.join(" ");
      }

      const tracks =
        this.attributes.visibleColumns.length > 0
          ? this.attributes.visibleColumns.map((column: any) => {
              const width = this.methods.normalizeGridWidth(column.width);

              return width ? `${width}px` : `minmax(0, ${this.methods.normalizeGridSpan(column.span)}fr)`;
            })
          : ["minmax(0, 1fr)"];

      if (this.attributes.multiSelectEnabled) {
        tracks.unshift("40px");
      }

      return tracks.join(" ");
    },

    openColumnSettings(this: any): void {
      this.attributes.setColumnSettingsError(null);
      this.attributes.setColumnSettingsOpen(true);
    },

    closeColumnSettings(this: any): void {
      this.attributes.setColumnSettingsOpen(false);
    },

    createColumnModeSettings(this: any, settings: any[], mode?: string, modeSettings?: Record<string, any>): Record<string, any> {
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.effectiveRowMode);
      const currentSettings =
        this.attributes.columnModeSettings && typeof this.attributes.columnModeSettings === "object"
          ? this.attributes.columnModeSettings
          : {};
      const suppliedSettings = modeSettings && typeof modeSettings === "object" ? modeSettings : {};
      const nextModeSettings = {
        ...currentSettings,
        ...suppliedSettings
      };

      nextModeSettings[activeMode] = {
        ...(nextModeSettings[activeMode] ?? {}),
        columns: Array.isArray(settings) ? [...settings] : []
      };

      return nextModeSettings;
    },

    setColumnSettingsState(this: any, settings: any[], mode?: string, modeSettings?: Record<string, any>): void {
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.effectiveRowMode);
      const safeSettings = Array.isArray(settings) ? [...settings] : [];
      const nextModeSettings = this.methods.createColumnModeSettings(safeSettings, activeMode, modeSettings);
      const visibleSettings = Array.isArray(nextModeSettings[activeMode]?.columns)
        ? nextModeSettings[activeMode].columns
        : safeSettings;

      this.attributes.setAppliedColumnSettings([...visibleSettings]);
      this.attributes.setColumnSettingsMode(activeMode);
      this.attributes.setColumnModeSettings(nextModeSettings);
    },

    applyColumnSettings(this: any, settings: any[], mode?: string, modeSettings?: Record<string, any>): void {
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.effectiveRowMode);
      const safeSettings = Array.isArray(settings) ? [...settings] : [];
      const nextModeSettings = this.methods.createColumnModeSettings(safeSettings, activeMode, modeSettings);
      const visibleSettings = Array.isArray(nextModeSettings[activeMode]?.columns)
        ? nextModeSettings[activeMode].columns
        : safeSettings;

      this.methods.setColumnSettingsState(safeSettings, activeMode, nextModeSettings);
      this.attributes.setColumnSettingsOpen(false);
      this.methods.notifyVisibleColumnKeysChange(visibleSettings, activeMode, nextModeSettings);
    },

    notifyVisibleColumnKeysChange(this: any, settings: any[], mode?: string, modeSettings?: Record<string, any>): void {
      if (typeof this.attributes.onVisibleColumnKeysChange !== "function") {
        return;
      }

      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.effectiveRowMode);
      const sourceSettings = Array.isArray(modeSettings?.[activeMode]?.columns)
        ? modeSettings?.[activeMode]?.columns
        : settings;
      const keys = (Array.isArray(sourceSettings) ? sourceSettings : [])
        .map((setting: any, settingIndex: number) => ({ setting, settingIndex }))
        .filter(({ setting }: any) => setting?.visible !== false)
        .sort((left: any, right: any) => {
          const leftOrder = Number.isFinite(Number(left.setting.order)) ? Number(left.setting.order) : left.settingIndex;
          const rightOrder = Number.isFinite(Number(right.setting.order)) ? Number(right.setting.order) : right.settingIndex;

          return leftOrder - rightOrder;
        })
        .map(({ setting }: any) => this.methods.getColumnSettingKey(setting))
        .filter(Boolean);

      this.attributes.onVisibleColumnKeysChange(keys);
    },

    resolveColumnSettingsClient(this: any): any | undefined {
      return this.attributes.columnSettingsClient
        ?? (this.attributes.client ? new EntityGridColumnSettingsApiClient(this.attributes.client) : undefined);
    },

    normalizeGridKeyCandidate(this: any, value: unknown): string {
      if (typeof value === "string" || typeof value === "number") {
        return String(value).trim().replace(/\s+/g, " ");
      }

      return "";
    },

    getCurrentLocationPath(): string {
      const browserWindow = (globalThis as any).window;

      if (browserWindow?.location && typeof browserWindow.location.pathname === "string") {
        return browserWindow.location.pathname;
      }

      return "";
    },

    resolveGridKey(this: any, explicitGridKey?: unknown): string {
      const explicit = this.methods.normalizeGridKeyCandidate(
        explicitGridKey
          ?? this.attributes.gridKey
          ?? this.attributes.gridId
          ?? this.attributes.effectiveSettings.gridKey
          ?? this.attributes.effectiveSettings.gridId
      );

      if (explicit) {
        return explicit;
      }

      const entity = this.attributes.resolvedEntity ?? {};
      const tableName = this.methods.normalizeGridKeyCandidate(entity.tableName);
      const entityTypeName = this.methods.normalizeGridKeyCandidate(entity.entityTypeName);
      const primaryColumn = this.methods.normalizeGridKeyCandidate(entity.primaryColumn ?? this.attributes.primaryColumn);
      const pagePath = this.methods.normalizeGridKeyCandidate(this.methods.getCurrentLocationPath());
      const title = this.methods.normalizeGridKeyCandidate(this.attributes.title);
      const columnFingerprint = (Array.isArray(this.attributes.normalizedColumns) ? this.attributes.normalizedColumns : [])
        .map((column: any) => this.methods.normalizeGridKeyCandidate(column?.path ?? column?.key))
        .filter(Boolean)
        .join(",");

      return [
        "DataGrid",
        pagePath,
        tableName || entityTypeName,
        primaryColumn,
        title,
        columnFingerprint ? `columns:${columnFingerprint}` : ""
      ].filter(Boolean).join(":");
    },

    normalizeUserIdCandidate(this: any, value: unknown): string {
      if (typeof value === "string" || typeof value === "number") {
        return String(value).trim();
      }

      return "";
    },

    resolveUserIdFromCurrentUser(this: any, currentUser: unknown): string {
      if (!currentUser || typeof currentUser !== "object") {
        return "";
      }

      const user = currentUser as Record<string, unknown>;
      const claimKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

      return this.methods.normalizeUserIdCandidate(
        user.userId
          ?? user.UserId
          ?? user.id
          ?? user.Id
          ?? user.ID
          ?? user.contactId
          ?? user.ContactId
          ?? user.accountId
          ?? user.AccountId
          ?? user.sub
          ?? user.nameid
          ?? user[claimKey]
      );
    },

    async ensureCurrentUserId(this: any, explicitUserId?: unknown): Promise<string> {
      const explicit = this.methods.normalizeUserIdCandidate(explicitUserId ?? this.attributes.currentUserId);

      if (explicit) {
        return explicit;
      }

      const currentTitanicUserId = this.methods.resolveUserIdFromCurrentUser((Titanic as any).CurrentUser);

      if (currentTitanicUserId) {
        return currentTitanicUserId;
      }

      const client = this.attributes.client;

      if (client && typeof client.getCurrentUser === "function") {
        try {
          const currentUser = await client.getCurrentUser();

          return this.methods.resolveUserIdFromCurrentUser(currentUser);
        } catch (_error) {
          return "";
        }
      }

      return "";
    },

    async getGridColumnSettings(this: any, options?: { gridId?: string; gridKey?: string; scope?: "default" | "personal"; userId?: string }): Promise<any | null> {
      if (!this.attributes.effectiveSettings.persistColumnSettings) {
        return null;
      }

      const client = this.methods.resolveColumnSettingsClient();
      const gridId = this.methods.resolveGridKey(options?.gridKey ?? options?.gridId);
      const userId = await this.methods.ensureCurrentUserId(options?.userId);
      const scope = options?.scope === "default" ? "default" : "personal";

      if (!client || !gridId || !userId) {
        return null;
      }

      if (scope === "personal") {
        const personalSettings =
          typeof client.getEntityGridColumnPersonalSettings === "function"
            ? await client.getEntityGridColumnPersonalSettings(gridId, userId)
            : typeof client.getEntityGridColumnSettings === "function"
              ? await client.getEntityGridColumnSettings(gridId, userId)
              : null;

        if (personalSettings) {
          return personalSettings;
        }
      }

      if (typeof client.getEntityGridColumnDefaultSettings === "function") {
        return client.getEntityGridColumnDefaultSettings(gridId, userId);
      }

      return null;
    },

    async loadColumnSettings(this: any, isCancelled?: () => boolean): Promise<void> {
      const defaultMode = this.methods.normalizeColumnSettingsMode(this.attributes.rowMode);

      if (!this.attributes.effectiveSettings.persistColumnSettings) {
        this.attributes.setColumnSettingsMode(defaultMode);
        this.attributes.setColumnSettingsReady(true);
        return;
      }

      this.attributes.setColumnSettingsReady(false);

      try {
        const dto = await this.methods.getGridColumnSettings({ scope: "personal" });

        if (isCancelled?.()) {
          return;
        }

        if (!dto) {
          const defaultSettings = this.methods.createDefaultColumnSettings();

          this.methods.setColumnSettingsState(defaultSettings, defaultMode);
          this.attributes.setSortSetting(null);
          this.attributes.setColumnSettingsError(null);
          return;
        }

        const savedMode = this.methods.normalizeColumnSettingsMode(dto.columnSettingsMode ?? dto.displayMode ?? defaultMode);
        const modeSettings = dto.modeSettings && typeof dto.modeSettings === "object" ? dto.modeSettings : undefined;
        const settings = Array.isArray(modeSettings?.[savedMode]?.columns)
          ? modeSettings?.[savedMode]?.columns
          : Array.isArray(dto.columns)
            ? dto.columns
            : Array.isArray(modeSettings?.[defaultMode]?.columns)
              ? modeSettings?.[defaultMode]?.columns
              : [];

        this.methods.setColumnSettingsState(settings, savedMode, modeSettings);
        this.attributes.setSortSetting(this.methods.normalizeSortSetting(dto.sort));
        this.attributes.setColumnSettingsError(null);
      } catch (error) {
        if (isCancelled?.()) {
          return;
        }

        this.attributes.setColumnSettingsError(
          this.attributes.effectiveLabels.columnSettingsLoadError ?? String(error)
        );
      } finally {
        if (!isCancelled?.()) {
          this.attributes.setColumnSettingsReady(true);
        }
      }
    },

    async saveDefaultColumnSettings(this: any, settings: any[], mode?: string, modeSettings?: Record<string, any>): Promise<void> {
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.effectiveRowMode);
      const safeSettings = Array.isArray(settings) ? [...settings] : [];
      const nextModeSettings = this.methods.createColumnModeSettings(safeSettings, activeMode, modeSettings);
      const client = this.methods.resolveColumnSettingsClient();
      const gridId = this.attributes.resolvedGridKey;
      const userId = await this.methods.ensureCurrentUserId();
      const currentSort = this.methods.normalizeSortSetting(this.attributes.sortSetting) ?? undefined;

      if (
        !this.attributes.effectiveSettings.persistColumnSettings ||
        !client ||
        !gridId ||
        !userId ||
        typeof client.saveEntityGridColumnDefaultSettings !== "function"
      ) {
        this.methods.applyColumnSettings(safeSettings, activeMode, nextModeSettings);
        return;
      }

      this.attributes.setColumnSettingsSaving(true);
      this.attributes.setColumnSettingsError(null);

      try {
        const dto = await client.saveEntityGridColumnDefaultSettings({
          columns: safeSettings,
          columnSettingsMode: activeMode,
          displayMode: activeMode,
          gridId,
          isDefault: true,
          modeSettings: nextModeSettings,
          sort: currentSort,
          userId
        });
        const resultModeSettings =
          dto?.modeSettings && typeof dto.modeSettings === "object" ? dto.modeSettings : nextModeSettings;
        const resultSettings = Array.isArray(resultModeSettings?.[activeMode]?.columns)
          ? resultModeSettings?.[activeMode]?.columns
          : Array.isArray(dto?.columns)
            ? dto.columns
            : safeSettings;

        this.methods.setColumnSettingsState(resultSettings, activeMode, resultModeSettings);
        this.attributes.setColumnSettingsOpen(false);
        this.methods.notifyVisibleColumnKeysChange(resultSettings, activeMode, resultModeSettings);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const label = this.attributes.effectiveLabels.columnSettingsSaveError ?? "Column settings save error";

        this.attributes.setColumnSettingsError(message ? `${label}: ${message}` : label);
      } finally {
        this.attributes.setColumnSettingsSaving(false);
      }
    },

    async savePersonalColumnSettings(this: any, settingsOrSortSetting?: unknown, mode?: string, modeSettings?: Record<string, any>): Promise<void> {
      const hasSettingsPayload = Array.isArray(settingsOrSortSetting);
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.effectiveRowMode);
      const currentMode = this.methods.normalizeColumnSettingsMode(this.attributes.effectiveRowMode);
      const safeSettings = hasSettingsPayload
        ? [...(settingsOrSortSetting as any[])]
        : this.methods.resolveCurrentColumnSettings();
      const nextModeSettings = this.methods.createColumnModeSettings(
        safeSettings,
        hasSettingsPayload ? activeMode : currentMode,
        hasSettingsPayload ? modeSettings : this.attributes.columnModeSettings
      );
      const client = this.methods.resolveColumnSettingsClient();
      const gridId = this.attributes.resolvedGridKey;
      const userId = await this.methods.ensureCurrentUserId();
      const nextSort = this.methods.normalizeSortSetting(
        hasSettingsPayload ? this.attributes.sortSetting : settingsOrSortSetting ?? this.attributes.sortSetting
      ) ?? undefined;

      if (!this.attributes.effectiveSettings.persistColumnSettings || !client || !gridId || !userId) {
        if (hasSettingsPayload) {
          this.methods.applyColumnSettings(safeSettings, activeMode, nextModeSettings);
        }

        return;
      }

      const request = {
        columns: safeSettings,
        columnSettingsMode: hasSettingsPayload ? activeMode : currentMode,
        displayMode: hasSettingsPayload ? activeMode : currentMode,
        gridId,
        isDefault: false,
        modeSettings: nextModeSettings,
        sort: nextSort,
        userId
      };

      if (
        typeof client.saveEntityGridColumnPersonalSettings !== "function" &&
        typeof client.saveEntityGridColumnSettings !== "function"
      ) {
        if (hasSettingsPayload) {
          this.methods.applyColumnSettings(safeSettings, activeMode, nextModeSettings);
        }

        return;
      }

      if (hasSettingsPayload) {
        this.attributes.setColumnSettingsSaving(true);
        this.attributes.setColumnSettingsError(null);
      }

      try {
        const dto =
          typeof client.saveEntityGridColumnPersonalSettings === "function"
            ? await client.saveEntityGridColumnPersonalSettings(request)
            : await client.saveEntityGridColumnSettings(request);

        if (hasSettingsPayload) {
          const resultModeSettings =
            dto?.modeSettings && typeof dto.modeSettings === "object" ? dto.modeSettings : nextModeSettings;
          const resultSettings = Array.isArray(resultModeSettings?.[activeMode]?.columns)
            ? resultModeSettings?.[activeMode]?.columns
            : Array.isArray(dto?.columns)
              ? dto.columns
              : safeSettings;

          this.methods.setColumnSettingsState(resultSettings, activeMode, resultModeSettings);
          this.attributes.setColumnSettingsOpen(false);
          this.methods.notifyVisibleColumnKeysChange(resultSettings, activeMode, resultModeSettings);
        }

        this.attributes.setColumnSettingsError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const label = this.attributes.effectiveLabels.columnSettingsSaveError ?? "Column settings save error";

        this.attributes.setColumnSettingsError(message ? `${label}: ${message}` : label);
      } finally {
        if (hasSettingsPayload) {
          this.attributes.setColumnSettingsSaving(false);
        }
      }
    },

    resolveColumnSettingsRenderer(this: any): ((context: Record<string, unknown>) => unknown) | undefined {
      const packages = Array.isArray(this.attributes.packages) ? [...this.attributes.packages] : [];

      for (const packageItem of packages.sort((left: any, right: any) => (left.order ?? 0) - (right.order ?? 0))) {
        const renderer = packageItem?.extension?.renderColumnSettingsDialog;

        if (typeof renderer === "function") {
          return renderer;
        }
      }

      const SettingsModalPage = Titanic.getReactModule<any>(
        columnSettingsDefinedComponentNames.EntityDataGridSettingsModalPage
      );

      return typeof SettingsModalPage === "function"
        ? (context: Record<string, unknown>) => <SettingsModalPage {...context} />
        : undefined;
    },

    normalizePositiveInteger(this: any, value: unknown): number | undefined {
      const numberValue =
        typeof value === "number"
          ? value
          : typeof value === "string" && value.trim()
            ? Number(value)
            : NaN;

      return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : undefined;
    },

    normalizeNonNegativeInteger(this: any, value: unknown): number {
      const numberValue =
        typeof value === "number"
          ? value
          : typeof value === "string" && value.trim()
            ? Number(value)
            : NaN;

      return Number.isFinite(numberValue) && numberValue > 0 ? Math.floor(numberValue) : 0;
    },

    resolveBatchRowCount(this: any): number {
      return (
        this.methods.normalizePositiveInteger(this.attributes.batchRowCount) ??
        this.methods.normalizePositiveInteger(this.attributes.effectiveSettings.batchRowCount) ??
        this.methods.normalizePositiveInteger(this.attributes.effectiveSettings.defaultRowCount) ??
        15
      );
    },

    resolveTotalRowLimit(this: any): number | undefined {
      return this.methods.normalizePositiveInteger(this.attributes.rowCount);
    },

    resolvePageRowCount(this: any, skipRow?: unknown): number {
      const batchRowCount = this.methods.resolveBatchRowCount();
      const totalLimit = this.methods.resolveTotalRowLimit();
      const safeSkipRow = this.methods.normalizeNonNegativeInteger(skipRow);

      if (totalLimit == null) {
        return batchRowCount;
      }

      return Math.max(0, Math.min(batchRowCount, totalLimit - safeSkipRow));
    },

    createQueryContext(this: any, options?: { rowCount?: unknown; skipRow?: unknown }): Record<string, unknown> {
      const primaryColumn = this.attributes.resolvedEntity.primaryColumn;
      const columns: Array<Record<string, unknown>> = [];
      const seenPaths = new Set<string>();

      for (const column of this.attributes.visibleColumns) {
        const queryColumn = this.methods.createQueryColumn(column);
        const path = typeof queryColumn?.path === "string" ? queryColumn.path : "";

        if (!path || seenPaths.has(path)) {
          continue;
        }

        seenPaths.add(path);
        columns.push(queryColumn);
      }

      if (primaryColumn && !seenPaths.has(primaryColumn)) {
        columns.push({ path: primaryColumn });
      }

      const columnPaths = columns
        .map((column: any) => column.path)
        .filter(Boolean);
      const filters = [
        ...(Array.isArray(this.attributes.filters) ? this.attributes.filters : []),
        ...(Array.isArray(this.attributes.filter)
          ? this.attributes.filter
          : this.attributes.filter
            ? [this.attributes.filter]
            : [])
      ];
      const skipRow = this.methods.normalizeNonNegativeInteger(options?.skipRow);
      const batchRowCount = this.methods.resolveBatchRowCount();
      const rowCount =
        this.methods.normalizePositiveInteger(options?.rowCount) ??
        this.methods.resolvePageRowCount(skipRow);

      return {
        columnPaths,
        columns,
        entity: this.attributes.resolvedEntity,
        entityTypeName: this.attributes.resolvedEntity.entityTypeName,
        filters,
        orders: this.attributes.effectiveOrders,
        pageIndex: batchRowCount > 0 ? Math.floor(skipRow / batchRowCount) : 0,
        pageSize: rowCount,
        primaryColumn,
        rowCount,
        skipRow,
        tableName: this.attributes.resolvedEntity.tableName
      };
    },

    applyQueryPagination(this: any, query: unknown, context: Record<string, unknown>): unknown {
      if (!query || typeof query !== "object" || Array.isArray(query)) {
        return query;
      }

      const rowCount =
        this.methods.normalizePositiveInteger(context.rowCount) ??
        this.methods.resolveBatchRowCount();
      const skipRow = this.methods.normalizeNonNegativeInteger(context.skipRow);

      return {
        ...(query as Record<string, unknown>),
        rowCount,
        skipRow,
        skipRowCount: skipRow
      };
    },

    buildQuery(this: any, queryContext?: Record<string, unknown>): unknown {
      const context = queryContext ?? this.methods.createQueryContext();
      let queryInput =
        typeof this.attributes.createQuery === "function"
          ? this.attributes.createQuery(context)
          : typeof this.attributes.query === "function"
            ? this.attributes.query(context)
            : this.attributes.query;

      if (!queryInput) {
        const columns = Array.isArray(context.columns)
          ? context.columns
            .map((column: any) => typeof column === "string" ? { path: column } : column)
            .filter((column: any) => column?.path)
          : undefined;
        const filters = Array.isArray(context.filters) ? { items: context.filters } : context.filters;
        const orders = Array.isArray(context.orders)
          ? context.orders
            .map((order: any) => typeof order === "string" ? { path: order } : order)
            .filter((order: any) => order?.path)
          : undefined;

        queryInput = {
          columns,
          entityTypeName: context.entityTypeName,
          filters,
          orders,
          rowCount: context.rowCount,
          skipRowCount: context.skipRow,
          skipRow: context.skipRow,
          tableName: context.tableName
        };
      }

      const toEntityQueryJson = (Titanic as any).EntityApi?.toEntityQueryJson;
      let query = typeof toEntityQueryJson === "function" ? toEntityQueryJson(queryInput) : queryInput;
      query = this.methods.applyQueryPagination(query, context);

      if (typeof this.attributes.prepareQuery === "function") {
        const preparedQuery = this.attributes.prepareQuery(query, context);

        if (preparedQuery) {
          query = typeof toEntityQueryJson === "function" ? toEntityQueryJson(preparedQuery) : preparedQuery;
          query = this.methods.applyQueryPagination(query, context);
        }
      }

      return query;
    },

    createQueryFingerprint(this: any): string {
      try {
        return JSON.stringify({
          batchRowCount: this.attributes.batchRowCount,
          filter: this.attributes.filter,
          filters: this.attributes.filters,
          orders: this.attributes.effectiveOrders,
          query: typeof this.attributes.query === "function" ? "factory" : this.attributes.query,
          rowCount: this.attributes.rowCount,
          sort: this.attributes.sortSetting
        });
      } catch {
        return "unserializable";
      }
    },

    resolveStatusText(this: any): string {
      if (this.attributes.effectiveLoading) {
        return this.attributes.effectiveLabels.loading;
      }

      if (this.attributes.loadingMoreRows) {
        return this.attributes.effectiveLabels.loadingMore ?? this.attributes.effectiveLabels.loading;
      }

      return this.attributes.emptyText ?? this.attributes.effectiveLabels.empty;
    },

    resolveHasMoreRows(this: any, fetchedRowCount: number, requestedRowCount: number, loadedRowCount: number): boolean {
      if (requestedRowCount <= 0 || fetchedRowCount < requestedRowCount) {
        return false;
      }

      const totalLimit = this.methods.resolveTotalRowLimit();

      return totalLimit == null || loadedRowCount < totalLimit;
    },

    async loadRows(this: any, isCancelled?: () => boolean): Promise<void> {
      if (Array.isArray(this.attributes.rows)) {
        this.attributes.setInternalRows([]);
        this.attributes.setLoadedRowCount(0);
        this.attributes.setHasMoreRows(false);
        this.attributes.setError(null);
        this.attributes.setInternalLoading(false);
        this.attributes.setLoadingMoreRows(false);
        return;
      }

      if (!this.attributes.columnSettingsReady) {
        this.attributes.setInternalLoading(false);
        return;
      }

      const client = this.attributes.client;

      if (!client) {
        this.attributes.setInternalRows([]);
        this.attributes.setLoadedRowCount(0);
        this.attributes.setHasMoreRows(false);
        this.attributes.setError(null);
        this.attributes.setInternalLoading(false);
        this.attributes.setLoadingMoreRows(false);
        return;
      }

      const requestedRowCount = this.methods.resolvePageRowCount(0);

      if (requestedRowCount <= 0) {
        this.attributes.setInternalRows([]);
        this.attributes.setLoadedRowCount(0);
        this.attributes.setHasMoreRows(false);
        this.attributes.setError(null);
        this.attributes.setInternalLoading(false);
        this.attributes.setLoadingMoreRows(false);
        return;
      }

      this.attributes.setInternalLoading(true);
      this.attributes.setLoadingMoreRows(false);
      this.attributes.setHasMoreRows(false);
      this.attributes.setLoadedRowCount(0);
      this.attributes.setError(null);

      try {
        const context = this.methods.createQueryContext({ rowCount: requestedRowCount, skipRow: 0 });
        const query = this.methods.buildQuery(context);
        const result =
          typeof client.select === "function"
            ? await client.select(query)
            : typeof client.queryEntityRows === "function"
              ? await client.queryEntityRows(query)
              : [];

        if (isCancelled?.()) {
          return;
        }

        const resultRows = this.methods.resolveResultRows(result);
        const mappedRows =
          typeof this.attributes.mapRows === "function"
          ? await this.attributes.mapRows(resultRows)
          : resultRows;

        if (isCancelled?.()) {
          return;
        }

        const safeRows = Array.isArray(mappedRows) ? mappedRows : [];
        const fetchedRowCount = resultRows.length || safeRows.length;

        this.attributes.setInternalRows(safeRows);
        this.attributes.setLoadedRowCount(fetchedRowCount);
        this.attributes.setHasMoreRows(
          this.methods.resolveHasMoreRows(fetchedRowCount, requestedRowCount, fetchedRowCount)
        );
      } catch (error: unknown) {
        if (!isCancelled?.()) {
          this.attributes.setError(error instanceof Error ? error.message : String(error));
          this.attributes.setInternalRows([]);
          this.attributes.setLoadedRowCount(0);
          this.attributes.setHasMoreRows(false);
        }
      } finally {
        if (!isCancelled?.()) {
          this.attributes.setInternalLoading(false);
          this.attributes.setLoadingMoreRows(false);

          if (this.attributes.loadMorePendingRef) {
            this.attributes.loadMorePendingRef.current = false;
          }
        }
      }
    },

    async loadMoreRows(this: any, isCancelled?: () => boolean): Promise<void> {
      if (
        Array.isArray(this.attributes.rows) ||
        !this.attributes.client ||
        !this.attributes.columnSettingsReady ||
        !this.attributes.hasMoreRows ||
        this.attributes.effectiveLoading ||
        this.attributes.loadingMoreRows
      ) {
        return;
      }

      const skipRow = this.methods.normalizeNonNegativeInteger(
        this.attributes.loadedRowCount ?? this.attributes.internalRows?.length
      );
      const requestedRowCount = this.methods.resolvePageRowCount(skipRow);

      if (requestedRowCount <= 0) {
        this.attributes.setHasMoreRows(false);
        return;
      }

      this.attributes.setLoadingMoreRows(true);
      this.attributes.setError(null);

      if (this.attributes.loadMorePendingRef) {
        this.attributes.loadMorePendingRef.current = true;
      }

      try {
        const context = this.methods.createQueryContext({ rowCount: requestedRowCount, skipRow });
        const query = this.methods.buildQuery(context);
        const client = this.attributes.client;
        const result =
          typeof client.select === "function"
            ? await client.select(query)
            : typeof client.queryEntityRows === "function"
              ? await client.queryEntityRows(query)
              : [];

        if (isCancelled?.()) {
          return;
        }

        const resultRows = this.methods.resolveResultRows(result);
        const mappedRows =
          typeof this.attributes.mapRows === "function"
            ? await this.attributes.mapRows(resultRows)
            : resultRows;

        if (isCancelled?.()) {
          return;
        }

        const safeRows = Array.isArray(mappedRows) ? mappedRows : [];
        const existingRows = Array.isArray(this.attributes.internalRows) ? this.attributes.internalRows : [];
        const fetchedRowCount = resultRows.length || safeRows.length;
        const loadedRowCount = skipRow + fetchedRowCount;

        this.attributes.setInternalRows([...existingRows, ...safeRows]);
        this.attributes.setLoadedRowCount(loadedRowCount);
        this.attributes.setHasMoreRows(
          this.methods.resolveHasMoreRows(fetchedRowCount, requestedRowCount, loadedRowCount)
        );
      } catch (error: unknown) {
        if (!isCancelled?.()) {
          this.attributes.setError(error instanceof Error ? error.message : String(error));
        }
      } finally {
        if (!isCancelled?.()) {
          this.attributes.setLoadingMoreRows(false);

          if (this.attributes.loadMorePendingRef) {
            this.attributes.loadMorePendingRef.current = false;
          }
        }
      }
    },

    loadMoreRowsIfScrollMissing(this: any): void {
      const element = this.attributes.tableWrapRef?.current;

      if (!element || element.scrollHeight > element.clientHeight + 1) {
        return;
      }

      if (
        Array.isArray(this.attributes.rows) ||
        !this.attributes.client ||
        !this.attributes.columnSettingsReady ||
        !this.attributes.hasMoreRows ||
        this.attributes.effectiveLoading ||
        this.attributes.loadingMoreRows ||
        this.attributes.loadMorePendingRef?.current
      ) {
        return;
      }

      if (this.attributes.loadMorePendingRef) {
        this.attributes.loadMorePendingRef.current = true;
      }

      void this.methods.loadMoreRows();
    },

    resolveResultRows(this: any, result: unknown): any[] {
      if (Array.isArray(result)) {
        return result;
      }

      if (result && typeof result === "object") {
        const record = result as Record<string, unknown>;

        if (Array.isArray(record.rows)) {
          return record.rows;
        }

        if (Array.isArray(record.items)) {
          return record.items;
        }

        if (Array.isArray(record.collection)) {
          return record.collection;
        }
      }

      return [];
    },

    getResolvedRowKey(this: any, row: any, rowIndex: number): string {
      if (typeof this.attributes.getRowKey === "function") {
        return String(this.attributes.getRowKey(row, rowIndex));
      }

      const primaryColumn = this.attributes.resolvedEntity.primaryColumn;
      const candidate =
        (primaryColumn ? this.methods.getRowValue(row, { path: primaryColumn, key: primaryColumn }) : undefined) ??
        this.methods.getRowValue(row, { path: "id", key: "id" }) ??
        this.methods.getRowValue(row, { path: "Id", key: "Id" }) ??
        this.methods.getRowValue(row, { path: "key", key: "key" });

      return candidate == null ? String(rowIndex) : String(candidate);
    },

    getRowValue(this: any, row: any, column: any): unknown {
      if (!row || typeof row !== "object") {
        return undefined;
      }

      const path = column.path ?? column.key;
      const alias = this.methods.createQueryColumnAlias(column);
      const candidates = Array.from(new Set([column.key, column.alias, alias, path].filter(Boolean).map(String)));
      const hasValue = (value: unknown) => value !== undefined && value !== null && value !== "";
      const readCellValue = (value: any): unknown => {
        if (value && typeof value === "object") {
          const displayValue =
            value.displayValue ??
            value.displayName ??
            value.name ??
            value.Name ??
            value.title ??
            value.Title;

          if (hasValue(displayValue)) {
            return displayValue;
          }

          if ("value" in value) {
            return value.value ?? null;
          }

          const objectValue =
            value.id ??
            value.Id ??
            value.key ??
            value.Key;

          if (hasValue(objectValue)) {
            return objectValue;
          }
        }

        return value;
      };
      const getCaseInsensitiveRowKey = (candidate: string) =>
        Object.keys(row).find((key) => key.toLocaleLowerCase() === candidate.toLocaleLowerCase());
      const getObjectKey = (source: any, candidate: string) => {
        if (!source || typeof source !== "object") {
          return undefined;
        }

        if (Object.prototype.hasOwnProperty.call(source, candidate)) {
          return candidate;
        }

        return Object.keys(source).find((key) => key.toLocaleLowerCase() === candidate.toLocaleLowerCase());
      };
      const readNestedPathValue = (source: any, valuePath: string): unknown => {
        const segments = valuePath.split(".").filter(Boolean);

        if (segments.length === 0) {
          return undefined;
        }

        let value = source;

        for (const segment of segments) {
          const nextKey = getObjectKey(value, segment);

          if (!nextKey) {
            return undefined;
          }

          value = value[nextKey];
        }

        return readCellValue(value);
      };

      for (const candidate of candidates) {
        const rowKey = Object.prototype.hasOwnProperty.call(row, candidate)
          ? candidate
          : getCaseInsensitiveRowKey(candidate);

        if (rowKey) {
          const value = readCellValue(row[rowKey]);

          if (hasValue(value) || Object.prototype.hasOwnProperty.call(row, candidate)) {
            return value;
          }
        }
      }

      const getEntityDisplayValue = (Titanic as any).EntityApi?.getEntityDisplayValue;
      const getEntityValue = (Titanic as any).EntityApi?.getEntityValue;

      for (const candidate of candidates) {
        if (typeof getEntityDisplayValue === "function") {
          const displayValue = getEntityDisplayValue(row, candidate);

          if (displayValue !== undefined && displayValue !== null && displayValue !== "") {
            return displayValue;
          }
        }

        if (typeof getEntityValue === "function") {
          const value = getEntityValue(row, candidate);

          if (value !== undefined && value !== null && value !== "") {
            return value;
          }
        }
      }

      for (const candidate of candidates) {
        if (!candidate.includes(".")) {
          continue;
        }

        const value = readNestedPathValue(row, candidate);

        if (hasValue(value)) {
          return value;
        }
      }

      const parentCandidates = String(path)
        .split(".")
        .filter(Boolean)
        .map((_: string, index: number, parts: string[]) => parts.slice(0, parts.length - index - 1).join("."))
        .filter(Boolean);

      for (const candidate of parentCandidates) {
        const rowKey = Object.prototype.hasOwnProperty.call(row, candidate)
          ? candidate
          : getCaseInsensitiveRowKey(candidate);

        if (rowKey) {
          const value = readCellValue(row[rowKey]);

          if (hasValue(value)) {
            return value;
          }
        }

        if (typeof getEntityDisplayValue === "function") {
          const displayValue = getEntityDisplayValue(row, candidate);

          if (hasValue(displayValue)) {
            return displayValue;
          }
        }

        if (typeof getEntityValue === "function") {
          const value = getEntityValue(row, candidate);

          if (hasValue(value)) {
            return value;
          }
        }
      }

      const nestedValue = readNestedPathValue(row, String(path));

      return hasValue(nestedValue) ? nestedValue : undefined;
    },

    formatCellValue(this: any, value: unknown, column: any): string {
      if (value === null || value === undefined) {
        return "";
      }

      if (typeof value === "boolean") {
        return value ? this.attributes.effectiveLabels.booleanTrue : this.attributes.effectiveLabels.booleanFalse;
      }

      if (value instanceof Date) {
        return value.toLocaleString();
      }

      if (typeof value === "object") {
        const displayValue =
          (value as any).displayValue ??
          (value as any).displayName ??
          (value as any).name ??
          (value as any).title ??
          (value as any).id;

        if (displayValue !== undefined) {
          return String(displayValue);
        }

        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }

      if (column?.kind === "date" || column?.kind === "dateTime") {
        const date = new Date(String(value));

        if (!Number.isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      }

      return String(value);
    },

    handleHeaderSelectionClick(this: any, event: any): void {
      event?.stopPropagation?.();

      const selectedKeys = this.methods.resolveSelectedRowKeys();
      const allKeys = this.methods.resolveEffectiveRows().map((row: any, rowIndex: number) =>
        this.methods.getResolvedRowKey(row, rowIndex)
      );

      this.attributes.setSelectedRowKeys(selectedKeys.length === allKeys.length ? [] : allKeys);
    },

    handleHeaderSortClick(this: any, event: any, column: any): void {
      event?.stopPropagation?.();

      const nextSort = this.methods.getNextColumnSortSetting(column);

      this.attributes.setSortSetting(nextSort);
      void this.methods.savePersonalColumnSettings(nextSort);
    },

    handleRowSelectionClick(this: any, event: any, row: any, rowIndex: number): void {
      event?.stopPropagation?.();

      const rowKey = this.methods.getResolvedRowKey(row, rowIndex);

      this.attributes.setSelectedRowKeys((currentKeys: string[]) =>
        (Array.isArray(currentKeys) ? currentKeys : []).includes(rowKey)
          ? (Array.isArray(currentKeys) ? currentKeys : []).filter((selectedKey) => selectedKey !== rowKey)
          : this.attributes.multiSelectEnabled
            ? [...(Array.isArray(currentKeys) ? currentKeys : []), rowKey]
            : [rowKey]
      );
    },

    handleRowClick(this: any, eventOrRow: unknown, rowOrIndex?: unknown, maybeRowIndex?: unknown): void {
      const { event, row, rowIndex } = this.methods.resolveRowEventArgs(eventOrRow, rowOrIndex, maybeRowIndex);
      const rowKey = this.methods.getResolvedRowKey(row, rowIndex);

      if (this.attributes.multiSelectEnabled) {
        this.methods.handleRowSelectionClick(event, row, rowIndex);
      } else {
        this.attributes.setSelectedRowKeys([rowKey]);
      }

      if (typeof this.attributes.onRowClick === "function") {
        this.attributes.onRowClick(row, rowIndex);
      }
    },

    handleRowDoubleClick(this: any, eventOrRow: unknown, rowOrIndex?: unknown, maybeRowIndex?: unknown): void {
      const { row, rowIndex } = this.methods.resolveRowEventArgs(eventOrRow, rowOrIndex, maybeRowIndex);

      if (typeof this.attributes.onRowDoubleClick === "function") {
        this.attributes.onRowDoubleClick(row, rowIndex);
      }
    },

    handleGridScroll(this: any, event: any): void {
      const element = event?.currentTarget;

      if (!element) {
        return;
      }

      const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

      if (
        distanceToBottom > 96 ||
        Array.isArray(this.attributes.rows) ||
        !this.attributes.client ||
        !this.attributes.columnSettingsReady ||
        !this.attributes.hasMoreRows ||
        this.attributes.effectiveLoading ||
        this.attributes.loadingMoreRows ||
        this.attributes.loadMorePendingRef?.current
      ) {
        return;
      }

      if (this.attributes.loadMorePendingRef) {
        this.attributes.loadMorePendingRef.current = true;
      }

      void this.methods.loadMoreRows();
    },

    createToolbarContext(this: any): Record<string, unknown> {
      return {
        client: this.attributes.client,
        columns: this.attributes.normalizedColumns,
        disableMultiSelect: this.methods.disableMultiSelect,
        displayMode: this.attributes.effectiveRowMode,
        enableMultiSelect: this.methods.enableMultiSelect,
        entity: this.attributes.resolvedEntity,
        labels: this.attributes.effectiveLabels,
        loading: this.attributes.effectiveLoading,
        openColumnSettings: this.methods.openColumnSettings,
        openTotalsSettings: this.methods.noop,
        refresh: this.methods.refresh,
        rows: this.methods.resolveEffectiveRows(),
        selectedRowKey: this.attributes.selectedRowKey,
        selectedRowKeys: this.methods.resolveSelectedRowKeys(),
        selectedRows: this.attributes.selectedRows,
        selectionModeEnabled: this.attributes.multiSelectEnabled,
        settings: this.attributes.effectiveSettings,
        toggleMultiSelect: this.methods.toggleMultiSelect,
        visibleColumns: this.attributes.visibleColumns
      };
    },

    resolveToolbarItems(this: any, factory: unknown): readonly unknown[] {
      if (typeof factory !== "function") {
        return [];
      }

      const result = factory(this.attributes.toolbarContext);

      return Array.isArray(result) ? result : [];
    },

    createDefaultToolbarRightItems(this: any): readonly unknown[] {
      if (this.attributes.normalizedColumns.length === 0) {
        return [];
      }

      return [
        <Button
          unstyled
          aria-label={this.attributes.effectiveLabels.configureColumns}
          className="titanic-data-grid__settings-button"
          key="data-grid-column-settings"
          title={this.attributes.effectiveLabels.configureColumns}
          type="button"
          onClick={this.methods.openColumnSettings}
        >
          <ResourceSvgIcon className="titanic-data-grid__settings-icon" icon="settings.titanicColumns" />
        </Button>
      ];
    },

    renderToolbarSection(this: any, placement: string, items: readonly unknown[]): unknown {
      if (items.length === 0) {
        return null;
      }

      return (
        <div className={`titanic-data-grid__toolbar-section titanic-data-grid__toolbar-section_${placement} titanic-data-grid__toolbar-section--${placement}`}>
          {items.map((item, itemIndex) => (
            <Fragment key={`${placement}-${itemIndex}`}>
              {this.methods.renderToolbarItem(item, itemIndex) as ReactNode}
            </Fragment>
          ))}
        </div>
      );
    },

    renderToolbarItem(this: any, item: any, itemIndex: number): unknown {
      const value = typeof item === "function" ? item(this.attributes.toolbarContext) : item;

      if (value == null || value === false) {
        return null;
      }

      return value;
    },

    renderHeaderSelectionCell(this: any): unknown {
      if (!this.attributes.multiSelectEnabled) {
        return null;
      }

      return (
        <div
          className="titanic-data-grid__selection-cell titanic-data-grid__selection-cell_head titanic-data-grid__selection-cell--head"
          role="columnheader"
        >
          <Button
            unstyled
            className="titanic-data-grid__selection-button"
            title={this.attributes.effectiveLabels.selectAllRows}
            onClick={this.methods.handleHeaderSelectionClick}
          >
            <span className="titanic-data-grid__selection-box" />
          </Button>
        </div>
      );
    },

    renderHeaderCell(this: any, column: any): unknown {
      const direction = this.methods.getColumnSortDirection(column);
      const directionLabel =
        direction === "desc"
          ? this.attributes.effectiveLabels.sortDescending
          : this.attributes.effectiveLabels.sortAscending;
      const title = direction
        ? `${this.attributes.effectiveLabels.sortColumns}: ${column.label} (${directionLabel})`
        : `${this.attributes.effectiveLabels.sortColumns}: ${column.label}`;

      return (
        <div
          className={this.methods.joinClassNames(
            "titanic-data-grid__cell",
            "titanic-data-grid__cell_header",
            "titanic-data-grid__cell--head",
            column.className
          )}
          key={column.key}
          role="columnheader"
          style={{ width: this.methods.resolveColumnPixelWidth(column) }}
        >
          <Button
            unstyled
            className={this.methods.joinClassNames(
              "titanic-data-grid__sort-header-button",
              direction && "titanic-data-grid__sort-header-button_active"
            )}
            title={title}
            type="button"
            onClick={(event) => this.methods.handleHeaderSortClick(event, column)}
          >
            <span className="titanic-data-grid__sort-header-label">{column.label}</span>
            {direction ? (
              <span
                aria-hidden
                className={this.methods.joinClassNames(
                  "titanic-data-grid__sort-header-icon",
                  `titanic-data-grid__sort-header-icon_${direction}`
                )}
              />
            ) : null}
          </Button>
        </div>
      );
    },

    renderBodyRow(this: any, row: any, rowIndex: number): unknown {
      const rowKey = this.methods.getResolvedRowKey(row, rowIndex);
      const selected = this.methods.resolveSelectedRowKeys().includes(rowKey);
      const customRow =
        typeof this.attributes.renderRow === "function"
          ? this.attributes.renderRow({
              client: this.attributes.client,
              columns: this.attributes.normalizedColumns,
              displayMode: this.attributes.effectiveRowMode,
              entity: this.attributes.resolvedEntity,
              gridWidth: this.attributes.effectiveSettings.gridWidth,
              labels: this.attributes.effectiveLabels,
              row,
              rowIndex,
              rowKey,
              settings: this.attributes.effectiveSettings,
              visibleColumns: this.attributes.visibleColumns
            })
          : null;

      if (customRow != null) {
        return <Fragment key={rowKey}>{customRow as ReactNode}</Fragment>;
      }

      return (
        <div
          aria-selected={selected}
          className={this.methods.joinClassNames(
            "titanic-data-grid__row",
            selected && "titanic-data-grid__row_selected titanic-data-grid__row--selected",
            this.attributes.activeRowKey === rowKey && "titanic-data-grid__row_active titanic-data-grid__row--active",
            (this.attributes.onRowClick || this.attributes.onRowDoubleClick || this.attributes.multiSelectEnabled)
              && "titanic-data-grid__row_clickable",
            this.attributes.effectiveRowMode === "tile"
              && "titanic-data-grid__row_tile titanic-data-grid__row--tile"
          )}
          key={rowKey}
          role="row"
          onClick={(event) => this.methods.handleRowClick(event, row, rowIndex)}
          onDoubleClick={(event) => this.methods.handleRowDoubleClick(event, row, rowIndex)}
        >
          {this.methods.renderSelectionBodyCell(row, rowIndex) as ReactNode}
          {this.attributes.visibleColumns.map((column: any, columnIndex: number) => (
            this.methods.renderBodyCell(column, row, rowIndex, columnIndex)
          ))}
          {this.methods.renderTileRowPlaceholderCell() as ReactNode}
        </div>
      );
    },

    getTileRowPlaceholderSpan(this: any): number {
      if (this.attributes.effectiveRowMode !== "tile") {
        return 0;
      }

      const visibleColumns = Array.isArray(this.attributes.visibleColumns)
        ? this.attributes.visibleColumns
        : [];

      if (visibleColumns.length === 0) {
        return 0;
      }

      const gridWidth = this.methods.normalizeGridSpan(
        this.attributes.effectiveSettings.gridWidth ?? this.attributes.gridWidth ?? 24
      );
      let occupiedColumns = 0;

      visibleColumns.forEach((column: any) => {
        const span = this.methods.normalizeGridSpan(column.span ?? gridWidth);

        if (occupiedColumns > 0 && occupiedColumns + span > gridWidth) {
          occupiedColumns = 0;
        }

        occupiedColumns += Math.min(span, gridWidth);

        if (occupiedColumns >= gridWidth) {
          occupiedColumns = 0;
        }
      });

      return occupiedColumns > 0 ? gridWidth - occupiedColumns : 0;
    },

    renderTileRowPlaceholderCell(this: any): unknown {
      const span = this.methods.getTileRowPlaceholderSpan();

      if (span <= 0) {
        return null;
      }

      return (
        <div
          aria-hidden
          className="titanic-data-grid__cell titanic-data-grid__cell_placeholder titanic-data-grid__cell--placeholder"
          role="presentation"
          style={{ "--titanic-data-grid-cell-span": span } as CSSProperties}
        />
      );
    },

    renderSelectionBodyCell(this: any, row: any, rowIndex: number): unknown {
      if (!this.attributes.multiSelectEnabled) {
        return null;
      }

      const selected = this.methods.resolveSelectedRowKeys().includes(this.methods.getResolvedRowKey(row, rowIndex));

      return (
        <div className="titanic-data-grid__selection-cell" role="cell">
          <Button
            unstyled
            className="titanic-data-grid__selection-button"
            title={this.attributes.effectiveLabels.selectRow}
            onClick={(event) => this.methods.handleRowSelectionClick(event, row, rowIndex)}
          >
            <span className={this.methods.joinClassNames(
              "titanic-data-grid__selection-box",
              selected && "titanic-data-grid__selection-box_selected titanic-data-grid__selection-box--selected"
            )} />
          </Button>
        </div>
      );
    },

    renderBodyCell(this: any, column: any, row: any, rowIndex: number, columnIndex: number): unknown {
      const value = this.methods.getRowValue(row, column);
      const rendered = typeof column.render === "function" ? column.render(row) : undefined;

      const span = this.methods.normalizeGridSpan(
        column.span ?? this.attributes.effectiveSettings.gridWidth ?? this.attributes.gridWidth ?? 24
      );

      return (
        <div
          className={this.methods.joinClassNames("titanic-data-grid__cell", column.className)}
          data-column={column.key}
          key={column.key ?? columnIndex}
          role="cell"
          style={{
            "--titanic-data-grid-cell-span": span,
            width: this.methods.resolveColumnPixelWidth(column)
          } as CSSProperties}
        >
          {this.methods.renderCellContent(rendered, value, column) as ReactNode}
        </div>
      );
    },

    renderCellContent(this: any, rendered: unknown, value: unknown, column: any): unknown {
      if (rendered !== undefined && rendered !== null) {
        return this.methods.renderMaybeDiff(rendered, { column, value });
      }

      return <span className="titanic-data-grid__cell-value">{this.methods.formatCellValue(value, column)}</span>;
    },

    renderColumnSettingsDialog(this: any): unknown {
      if (!this.attributes.columnSettingsOpen) {
        return null;
      }

      const renderer = this.methods.resolveColumnSettingsRenderer();

      if (!renderer) {
        return null;
      }

      return renderer({
          columnPickerLabels: this.attributes.columnPickerLabels,
          client: this.attributes.client,
          columns: this.attributes.normalizedColumns,
          columnSettingsMode: this.attributes.effectiveRowMode,
          currentSettings: this.methods.resolveCurrentColumnSettings(),
          error: this.attributes.columnSettingsError,
          gridId: this.attributes.resolvedGridKey,
          gridKey: this.attributes.resolvedGridKey,
          gridWidth: Number(this.attributes.effectiveSettings.gridWidth ?? this.attributes.gridWidth ?? 24),
          isOpen: this.attributes.columnSettingsOpen,
          labels: this.attributes.effectiveLabels,
          modeSettings: this.attributes.columnModeSettings,
          onApply: (settings: any[], mode: string, modeSettings: Record<string, any>) =>
            this.methods.applyColumnSettings(settings, mode, modeSettings),
          onClose: () => this.methods.closeColumnSettings(),
          onSave: (settings: any[], mode: string, modeSettings: Record<string, any>) =>
            this.methods.savePersonalColumnSettings(settings, mode, modeSettings),
          onSaveDefault: (settings: any[], mode: string, modeSettings: Record<string, any>) =>
            this.methods.saveDefaultColumnSettings(settings, mode, modeSettings),
          rootTableName: this.attributes.resolvedEntity.tableName ?? this.attributes.tableName ?? null,
          saving: Boolean(this.attributes.columnSettingsSaving),
          structure: this.attributes.structure,
          title: this.attributes.title ?? this.attributes.effectiveLabels.gridSettings
        });
    },

    renderMaybeDiff(this: any, value: unknown): unknown {
      return value;
    },

    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    },

    noop(): void {}
  };

export const DataGrid = Titanic.define<DataGridProps<any>>(
  "Titanic.UI.DataGrid",
  function DataGrid(props: DataGridProps<any>) {
  const attributes: any = {};
  const context: any = { attributes, props };
  const methods: any = {};
  context.methods = methods;

  Object.entries(dataGridMethodDefinitions).forEach(([name, method]) => {
    methods[name] = (...args: any[]) => method.apply(context, args);
  });

  attributes.activeRowKey = (props as any).activeRowKey === undefined ? undefined : (props as any).activeRowKey;
  attributes.batchRowCount = (props as any).batchRowCount === undefined ? undefined : (props as any).batchRowCount;
  attributes.className = (props as any).className === undefined ? undefined : (props as any).className;
  attributes.client = (props as any).client === undefined ? undefined : (props as any).client;
  attributes.columnLabels = (props as any).columnLabels === undefined ? undefined : (props as any).columnLabels;
  attributes.columnPickerLabels = (props as any).columnPickerLabels === undefined ? undefined : (props as any).columnPickerLabels;
  attributes.columnSettingsClient = (props as any).columnSettingsClient === undefined ? undefined : (props as any).columnSettingsClient;
  attributes.columns = (props as any).columns === undefined ? undefined : (props as any).columns;
  attributes.createQuery = (props as any).createQuery === undefined ? undefined : (props as any).createQuery;
  attributes.createQueryColumns = (props as any).createQueryColumns === undefined ? undefined : (props as any).createQueryColumns;
  attributes.createToolbarCenterItems = (props as any).createToolbarCenterItems === undefined ? undefined : (props as any).createToolbarCenterItems;
  attributes.createToolbarLeftItems = (props as any).createToolbarLeftItems === undefined ? undefined : (props as any).createToolbarLeftItems;
  attributes.createToolbarRightItems = (props as any).createToolbarRightItems === undefined ? undefined : (props as any).createToolbarRightItems;
  attributes.currentUserId = (props as any).currentUserId === undefined ? undefined : (props as any).currentUserId;
  attributes.defaultMultiSelectEnabled = (props as any).defaultMultiSelectEnabled === undefined ? false : (props as any).defaultMultiSelectEnabled;
  attributes.defaultVisibleColumnKeys = (props as any).defaultVisibleColumnKeys === undefined ? undefined : (props as any).defaultVisibleColumnKeys;
  attributes.editable = (props as any).editable === undefined ? undefined : (props as any).editable;
  attributes.emptyText = (props as any).emptyText === undefined ? undefined : (props as any).emptyText;
  attributes.entity = (props as any).entity === undefined ? undefined : (props as any).entity;
  attributes.filter = (props as any).filter === undefined ? undefined : (props as any).filter;
  attributes.filters = (props as any).filters === undefined ? undefined : (props as any).filters;
  attributes.getRowKey = (props as any).getRowKey === undefined ? undefined : (props as any).getRowKey;
  attributes.gridId = (props as any).gridId === undefined ? undefined : (props as any).gridId;
  attributes.gridKey = (props as any).gridKey === undefined ? undefined : (props as any).gridKey;
  attributes.gridWidth = (props as any).gridWidth === undefined ? undefined : (props as any).gridWidth;
  attributes.labels = (props as any).labels === undefined ? undefined : (props as any).labels;
  attributes.loading = (props as any).loading === undefined ? undefined : (props as any).loading;
  attributes.mapRows = (props as any).mapRows === undefined ? undefined : (props as any).mapRows;
  attributes.onMultiSelectChange = (props as any).onMultiSelectChange === undefined ? undefined : (props as any).onMultiSelectChange;
  attributes.onRowClick = (props as any).onRowClick === undefined ? undefined : (props as any).onRowClick;
  attributes.onRowDoubleClick = (props as any).onRowDoubleClick === undefined ? undefined : (props as any).onRowDoubleClick;
  attributes.onRowsLoaded = (props as any).onRowsLoaded === undefined ? undefined : (props as any).onRowsLoaded;
  attributes.onSelectionChange = (props as any).onSelectionChange === undefined ? undefined : (props as any).onSelectionChange;
  attributes.onVisibleColumnKeysChange = (props as any).onVisibleColumnKeysChange === undefined ? undefined : (props as any).onVisibleColumnKeysChange;
  attributes.orders = (props as any).orders === undefined ? undefined : (props as any).orders;
  attributes.packages = (props as any).packages === undefined ? undefined : (props as any).packages;
  attributes.prepareQuery = (props as any).prepareQuery === undefined ? undefined : (props as any).prepareQuery;
  attributes.primaryColumn = (props as any).primaryColumn === undefined ? undefined : (props as any).primaryColumn;
  attributes.query = (props as any).query === undefined ? undefined : (props as any).query;
  attributes.refreshKey = (props as any).refreshKey === undefined ? undefined : (props as any).refreshKey;
  attributes.renderRow = (props as any).renderRow === undefined ? undefined : (props as any).renderRow;
  attributes.rowActions = (props as any).rowActions === undefined ? undefined : (props as any).rowActions;
  attributes.rowCount = (props as any).rowCount === undefined ? undefined : (props as any).rowCount;
  attributes.rowMode = (props as any).rowMode === undefined ? "list" : (props as any).rowMode;
  attributes.rows = (props as any).rows === undefined ? undefined : (props as any).rows;
  attributes.settings = (props as any).settings === undefined ? undefined : (props as any).settings;
  attributes.structure = (props as any).structure === undefined ? undefined : (props as any).structure;
  attributes.tableName = (props as any).tableName === undefined ? undefined : (props as any).tableName;
  attributes.title = (props as any).title === undefined ? undefined : (props as any).title;
  attributes.visibleColumnKeys = (props as any).visibleColumnKeys === undefined ? undefined : (props as any).visibleColumnKeys;
  const [internalRows, setInternalRows] = useState<any>(() => []);
  attributes.internalRows = internalRows;
  attributes.setInternalRows = setInternalRows;
  const [internalLoading, setInternalLoading] = useState<any>(() => false);
  attributes.internalLoading = internalLoading;
  attributes.setInternalLoading = setInternalLoading;
  const [loadingMoreRows, setLoadingMoreRows] = useState<any>(() => false);
  attributes.loadingMoreRows = loadingMoreRows;
  attributes.setLoadingMoreRows = setLoadingMoreRows;
  const [loadedRowCount, setLoadedRowCount] = useState<any>(() => 0);
  attributes.loadedRowCount = loadedRowCount;
  attributes.setLoadedRowCount = setLoadedRowCount;
  const [hasMoreRows, setHasMoreRows] = useState<any>(() => false);
  attributes.hasMoreRows = hasMoreRows;
  attributes.setHasMoreRows = setHasMoreRows;
  const [error, setError] = useState<any>(() => null);
  attributes.error = error;
  attributes.setError = setError;
  const [refreshVersion, setRefreshVersion] = useState<any>(() => 0);
  attributes.refreshVersion = refreshVersion;
  attributes.setRefreshVersion = setRefreshVersion;
  const [multiSelectEnabled, setMultiSelectEnabled] = useState<any>(() => (function(this: any): boolean {
        return Boolean(this.props.defaultMultiSelectEnabled);
      }).call(context));
  attributes.multiSelectEnabled = multiSelectEnabled;
  attributes.setMultiSelectEnabled = setMultiSelectEnabled;
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>(() => []);
  attributes.selectedRowKeys = selectedRowKeys;
  attributes.setSelectedRowKeys = setSelectedRowKeys;
  const [columnSettingsOpen, setColumnSettingsOpen] = useState<any>(() => false);
  attributes.columnSettingsOpen = columnSettingsOpen;
  attributes.setColumnSettingsOpen = setColumnSettingsOpen;
  const [columnSettingsReady, setColumnSettingsReady] = useState<any>(() => false);
  attributes.columnSettingsReady = columnSettingsReady;
  attributes.setColumnSettingsReady = setColumnSettingsReady;
  const [columnSettingsSaving, setColumnSettingsSaving] = useState<any>(() => false);
  attributes.columnSettingsSaving = columnSettingsSaving;
  attributes.setColumnSettingsSaving = setColumnSettingsSaving;
  const [columnSettingsError, setColumnSettingsError] = useState<any>(() => null);
  attributes.columnSettingsError = columnSettingsError;
  attributes.setColumnSettingsError = setColumnSettingsError;
  const [appliedColumnSettings, setAppliedColumnSettings] = useState<any>(() => []);
  attributes.appliedColumnSettings = appliedColumnSettings;
  attributes.setAppliedColumnSettings = setAppliedColumnSettings;
  const [columnSettingsMode, setColumnSettingsMode] = useState<any>(() => (function(this: any): string {
        return this.methods.normalizeColumnSettingsMode(this.props.rowMode);
      }).call(context));
  attributes.columnSettingsMode = columnSettingsMode;
  attributes.setColumnSettingsMode = setColumnSettingsMode;
  const [columnModeSettings, setColumnModeSettings] = useState<any>(() => undefined);
  attributes.columnModeSettings = columnModeSettings;
  attributes.setColumnModeSettings = setColumnModeSettings;
  const [sortSetting, setSortSetting] = useState<any>(() => null);
  attributes.sortSetting = sortSetting;
  attributes.setSortSetting = setSortSetting;
  const lastRowsLoadedFingerprint = useRef<any>("");
  attributes.lastRowsLoadedFingerprint = lastRowsLoadedFingerprint;
  const loadMorePendingRef = useRef<any>(false);
  attributes.loadMorePendingRef = loadMorePendingRef;
  const tableWrapRef = useRef<any>(null);
  attributes.tableWrapRef = tableWrapRef;
  attributes.effectiveRowMode = (function(this: any): string {
        return this.methods.resolveEffectiveRowMode();
      }).call(context);
  attributes.effectiveSettings = (function(this: any): Record<string, unknown> {
        return this.methods.resolveSettings();
      }).call(context);
  attributes.effectiveLabels = (function(this: any): Record<string, string> {
        return this.methods.resolveLabels();
      }).call(context);
  attributes.resolvedEntity = (function(this: any): Record<string, unknown> {
        return this.methods.resolveEntity();
      }).call(context);
  attributes.normalizedColumns = (function(this: any): any[] {
        return this.methods.normalizeColumns();
      }).call(context);
  attributes.resolvedGridKey = (function(this: any): string {
        return this.methods.resolveGridKey();
      }).call(context);
  attributes.activeColumnSettings = (function(this: any): any[] {
        return this.methods.resolveActiveColumnSettings();
      }).call(context);
  attributes.visibleColumnKeysEffective = (function(this: any): string[] {
        return this.methods.resolveVisibleColumnKeys();
      }).call(context);
  attributes.visibleColumns = (function(this: any): any[] {
        const hasExplicitVisibleKeys = Array.isArray(this.attributes.visibleColumnKeys);

        if (!hasExplicitVisibleKeys && this.attributes.activeColumnSettings.length > 0) {
          const columns = this.methods.applyColumnSettingsToColumns(this.attributes.activeColumnSettings);

          if (columns.length > 0) {
            return columns;
          }
        }

        const visibleKeys = new Set(this.attributes.visibleColumnKeysEffective);

        return this.attributes.normalizedColumns.filter((column: any) => visibleKeys.has(column.key));
      }).call(context);
  attributes.visibleColumnFingerprint = (function(this: any): string {
        return this.attributes.visibleColumns
          .map((column: any) => `${column.key}:${column.path ?? ""}`)
          .join("|");
      }).call(context);
  attributes.effectiveOrders = (function(this: any): unknown {
        return this.methods.resolveEffectiveOrders();
      }).call(context);
  attributes.queryFingerprint = (function(this: any): string {
        return this.methods.createQueryFingerprint();
      }).call(context);
  attributes.effectiveRows = (function(this: any): readonly any[] {
        return this.methods.resolveEffectiveRows();
      }).call(context);
  attributes.rowsLoadedFingerprint = (function(this: any): string {
        return this.methods.createRowsFingerprint(this.methods.resolveEffectiveRows());
      }).call(context);
  attributes.effectiveLoading = (function(this: any): boolean {
        const hasSuppliedRows = Array.isArray(this.attributes.rows);
        const waitingForColumnSettings = !hasSuppliedRows && !this.attributes.columnSettingsReady;

        return Boolean(this.attributes.loading ?? (this.attributes.internalLoading || waitingForColumnSettings));
      }).call(context);
  attributes.selectedRows = (function(this: any): any[] {
        const selectedKeys = new Set(this.methods.resolveSelectedRowKeys());

        return this.methods.resolveEffectiveRows().filter((row: any, rowIndex: number) =>
          selectedKeys.has(this.methods.getResolvedRowKey(row, rowIndex))
        );
      }).call(context);
  attributes.selectedRowKey = (function(this: any): string | null {
        const selectedRowKeys = this.methods.resolveSelectedRowKeys();

        return selectedRowKeys.length > 0 ? selectedRowKeys[0] : null;
      }).call(context);
  attributes.selectionChangeFingerprint = (function(this: any): string {
        return JSON.stringify({
          multiSelectEnabled: this.attributes.multiSelectEnabled,
          rows: this.attributes.rowsLoadedFingerprint,
          selectedRowKeys: this.methods.resolveSelectedRowKeys()
        });
      }).call(context);
  attributes.toolbarContext = (function(this: any): Record<string, unknown> {
        return this.methods.createToolbarContext();
      }).call(context);
  attributes.toolbarLeftItems = (function(this: any): readonly unknown[] {
        return this.methods.resolveToolbarItems(this.attributes.createToolbarLeftItems);
      }).call(context);
  attributes.toolbarCenterItems = (function(this: any): readonly unknown[] {
        return this.methods.resolveToolbarItems(this.attributes.createToolbarCenterItems);
      }).call(context);
  attributes.toolbarRightItems = (function(this: any): readonly unknown[] {
        return [
          ...this.methods.createDefaultToolbarRightItems(),
          ...this.methods.resolveToolbarItems(this.attributes.createToolbarRightItems)
        ];
      }).call(context);
  attributes.hasToolbarItems = (function(this: any): boolean {
        return (
          this.attributes.toolbarLeftItems.length > 0 ||
          this.attributes.toolbarCenterItems.length > 0 ||
          this.attributes.toolbarRightItems.length > 0
        );
      }).call(context);
  attributes.rootClassName = (function(this: any): string {
        const mode = this.attributes.effectiveRowMode === "tile" ? "tile" : "list";

        return this.methods.joinClassNames(
          "titanic-data-grid",
          `titanic-data-grid_layout_${mode}`,
          `titanic-data-grid--${mode}`,
          this.attributes.multiSelectEnabled ? "titanic-data-grid_selecting titanic-data-grid--selecting" : null,
          this.attributes.className
        );
      }).call(context);
  attributes.rootStyle = (function(this: any): Record<string, string> {
        const template = this.methods.createGridTemplate();
        const columnCount = this.attributes.effectiveRowMode === "tile"
          ? this.methods.normalizeGridSpan(this.attributes.effectiveSettings.gridWidth ?? this.attributes.gridWidth ?? 24)
          : Math.max(this.attributes.visibleColumns.length, 1);

        return {
          "--titanic-data-grid-columns": String(columnCount),
          "--titanic-data-grid-row-template": template,
          "--titanic-data-grid-template": template
        };
      }).call(context);
  attributes.columnCount = (function(this: any): number {
        if (this.attributes.effectiveRowMode === "tile") {
          return this.methods.normalizeGridSpan(
            this.attributes.effectiveSettings.gridWidth ?? this.attributes.gridWidth ?? 24
          ) + (this.attributes.multiSelectEnabled ? 1 : 0);
        }

        return this.attributes.visibleColumns.length + (this.attributes.multiSelectEnabled ? 1 : 0);
      }).call(context);
  attributes.rowCountValue = (function(this: any): number {
        return this.attributes.effectiveRows.length;
      }).call(context);
  attributes.showColumnHeader = (function(this: any): boolean {
        return this.attributes.effectiveRowMode !== "tile" && this.attributes.visibleColumns.length > 0;
      }).call(context);
  attributes.hasRows = (function(this: any): boolean {
        return this.attributes.effectiveRows.length > 0;
      }).call(context);
  attributes.showEmpty = (function(this: any): boolean {
        return !this.attributes.effectiveLoading && !this.attributes.error && !this.attributes.hasRows;
      }).call(context);
  attributes.showStatus = (function(this: any): boolean {
        return this.attributes.effectiveLoading || this.attributes.loadingMoreRows || this.attributes.showEmpty;
      }).call(context);
  attributes.statusText = (function(this: any): string {
        return this.methods.resolveStatusText();
      }).call(context);
  useEffect(() => (function(this: any): () => void {
        let cancelled = false;

        if (!Array.isArray(this.attributes.rows) && !this.attributes.columnSettingsReady) {
          return () => {
            cancelled = true;
          };
        }

        void this.methods.loadRows(() => cancelled);

        return () => {
          cancelled = true;
        };
      }).call(context), [attributes?.["client"], attributes?.["rows"], attributes?.["query"], attributes?.["createQuery"], attributes?.["prepareQuery"], attributes?.["refreshKey"], attributes?.["refreshVersion"], attributes?.["batchRowCount"], attributes?.["effectiveSettings"]?.["batchRowCount"], attributes?.["effectiveSettings"]?.["defaultRowCount"], attributes?.["columnSettingsReady"], attributes?.["resolvedEntity"]?.["tableName"], attributes?.["resolvedEntity"]?.["entityTypeName"], attributes?.["visibleColumnFingerprint"], attributes?.["queryFingerprint"]]);
  useEffect(() => (function(this: any): () => void {
        let cancelled = false;

        void this.methods.loadColumnSettings(() => cancelled);

        return () => {
          cancelled = true;
        };
      }).call(context), [attributes?.["columnSettingsClient"], attributes?.["client"], attributes?.["currentUserId"], attributes?.["gridId"], attributes?.["gridKey"], attributes?.["resolvedGridKey"], attributes?.["effectiveSettings"]?.["persistColumnSettings"], attributes?.["rowMode"]]);
  useEffect(() => (function(this: any): () => void {
        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        if (this.attributes.effectiveLoading || this.attributes.loadingMoreRows) {
          return () => {
            cancelled = true;
          };
        }

        const rows = this.methods.resolveEffectiveRows();
        const fingerprint = this.attributes.rowsLoadedFingerprint;
        const lastFingerprintRef = this.attributes.lastRowsLoadedFingerprint;

        if (lastFingerprintRef?.current === fingerprint) {
          return () => {
            cancelled = true;
          };
        }

        if (lastFingerprintRef) {
          lastFingerprintRef.current = fingerprint;
        }

        if (typeof this.attributes.onRowsLoaded === "function") {
          const loadedRows = [...rows];

          timeoutId = setTimeout(() => {
            if (!cancelled) {
              this.attributes.onRowsLoaded(loadedRows);
            }
          }, 0);
        }

        return () => {
          cancelled = true;

          if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
          }
        };
      }).call(context), [attributes?.["effectiveLoading"], attributes?.["loadingMoreRows"], attributes?.["rowsLoadedFingerprint"]]);
  useEffect(() => (function(this: any): () => void {
        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        if (
          Array.isArray(this.attributes.rows) ||
          !this.attributes.client ||
          !this.attributes.columnSettingsReady ||
          !this.attributes.hasMoreRows ||
          this.attributes.effectiveLoading ||
          this.attributes.loadingMoreRows ||
          this.attributes.loadMorePendingRef?.current
        ) {
          return () => {
            cancelled = true;
          };
        }

        timeoutId = setTimeout(() => {
          if (!cancelled) {
            this.methods.loadMoreRowsIfScrollMissing();
          }
        }, 0);

        return () => {
          cancelled = true;

          if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
          }
        };
      }).call(context), [attributes?.["columnSettingsReady"], attributes?.["effectiveLoading"], attributes?.["loadingMoreRows"], attributes?.["hasMoreRows"], attributes?.["rowsLoadedFingerprint"]]);
  useEffect(() => (function(this: any): void {
        if (typeof this.attributes.onSelectionChange === "function") {
          this.attributes.onSelectionChange({
            selectedRowKeys: [...this.methods.resolveSelectedRowKeys()],
            selectedRows: [...this.attributes.selectedRows],
            selectionModeEnabled: this.attributes.multiSelectEnabled
          });
        }
      }).call(context), [attributes?.["selectionChangeFingerprint"]]);

  useImperativeHandle((props as any).ref, () => methods.getHandle());

  return (
    <Container
      ariaLabel={(props as any).title ?? (props as any)["aria-label"] ?? attributes.resolvedGridKey ?? (props as any).gridId}
      className={attributes.rootClassName}
      role="region"
      style={attributes.rootStyle as CSSProperties}
    >
      {attributes.hasToolbarItems ? (
        <div className="titanic-data-grid__toolbar">
          {methods.renderToolbarSection("left", attributes.toolbarLeftItems)}
          {methods.renderToolbarSection("center", attributes.toolbarCenterItems)}
          {methods.renderToolbarSection("right", attributes.toolbarRightItems)}
        </div>
      ) : null}
      <div className="titanic-data-grid__table-wrap" ref={attributes.tableWrapRef} onScroll={methods.handleGridScroll}>
        <div className="titanic-data-grid__table" role="table">
          {attributes.showColumnHeader ? (
            <div className="titanic-data-grid__head" role="rowgroup">
              <div className="titanic-data-grid__row titanic-data-grid__row_header titanic-data-grid__row--head" role="row">
                {methods.renderHeaderSelectionCell()}
                {attributes.visibleColumns.map((column: any, columnIndex: number) => methods.renderHeaderCell(column, columnIndex))}
              </div>
            </div>
          ) : null}
          <div className="titanic-data-grid__body" role="rowgroup">
            {attributes.effectiveRows.map((row: any, rowIndex: number) => methods.renderBodyRow(row, rowIndex))}
            {attributes.showStatus ? (
              <div className="titanic-data-grid__status-row titanic-data-grid__row titanic-data-grid__row_status titanic-data-grid__row--status" role="row">
                <div className="titanic-data-grid__cell titanic-data-grid__cell_status titanic-data-grid__status" role="cell">
                  {attributes.statusText}
                </div>
              </div>
            ) : null}
            {attributes.error ? (
              <div className="titanic-data-grid__status-row titanic-data-grid__row titanic-data-grid__row_error titanic-data-grid__row--error" role="row">
                <div className="titanic-data-grid__cell titanic-data-grid__cell_error titanic-data-grid__error" role="cell">
                  {String(attributes.error)}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {methods.renderColumnSettingsDialog()}
    </Container>
  );
  }
);
