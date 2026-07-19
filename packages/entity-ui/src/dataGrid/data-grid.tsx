import { EntityGridColumnSettingsApiClient } from "@titanic-entity/entity-api";
import { columnSettingsDefinedComponentNames } from "../dataGridSettingsModalPage/schemas/component-names";

Titanic.define("Titanic.UI.EntityDataGrid", {
  attributes: {
    activeRowKey: {},
    batchRowCount: {},
    className: {},
    client: {},
    columnLabels: {},
    columnPickerLabels: {},
    columnSettingsClient: {},
    columns: {},
    createQuery: {},
    createQueryColumns: {},
    createToolbarCenterItems: {},
    createToolbarLeftItems: {},
    createToolbarRightItems: {},
    currentUserId: {},
    defaultMultiSelectEnabled: { default: false },
    defaultVisibleColumnKeys: {},
    editable: {},
    emptyText: {},
    entity: {},
    filter: {},
    filters: {},
    getRowKey: {},
    gridId: {},
    gridKey: {},
    gridWidth: {},
    labels: {},
    loading: {},
    mapRows: {},
    onMultiSelectChange: {},
    onRowClick: {},
    onRowDoubleClick: {},
    onRowsLoaded: {},
    onSelectionChange: {},
    onVisibleColumnKeysChange: {},
    orders: {},
    packages: {},
    prepareQuery: {},
    primaryColumn: {},
    query: {},
    refreshKey: {},
    renderRow: {},
    rowActions: {},
    rowCount: {},
    rowMode: { default: "list" },
    rows: {},
    settings: {},
    structure: {},
    tableName: {},
    title: {},
    visibleColumnKeys: {},

    internalRows: { state: true, default: [] },
    internalLoading: { state: true, default: false },
    error: { state: true, default: null },
    refreshVersion: { state: true, default: 0 },
    multiSelectEnabled: {
      state: true,
      default(this: any): boolean {
        return Boolean(this.props.defaultMultiSelectEnabled);
      }
    },
    selectedRowKeys: { state: true, default: [] },
    columnSettingsOpen: { state: true, default: false },
    columnSettingsSaving: { state: true, default: false },
    columnSettingsError: { state: true, default: null },
    appliedColumnSettings: { state: true, default: [] },
    columnSettingsMode: {
      state: true,
      default(this: any): string {
        return this.methods.normalizeColumnSettingsMode(this.props.rowMode);
      }
    },
    columnModeSettings: { state: true, default: undefined },
    sortSetting: { state: true, default: null },
    lastRowsLoadedFingerprint: { ref: true, default: "" },

    effectiveSettings: {
      value(this: any): Record<string, unknown> {
        return this.methods.resolveSettings();
      }
    },
    effectiveLabels: {
      value(this: any): Record<string, string> {
        return this.methods.resolveLabels();
      }
    },
    resolvedEntity: {
      value(this: any): Record<string, unknown> {
        return this.methods.resolveEntity();
      }
    },
    normalizedColumns: {
      value(this: any): any[] {
        return this.methods.normalizeColumns();
      }
    },
    resolvedGridKey: {
      value(this: any): string {
        return this.methods.resolveGridKey();
      }
    },
    activeColumnSettings: {
      value(this: any): any[] {
        return this.methods.resolveActiveColumnSettings();
      }
    },
    visibleColumnKeysEffective: {
      value(this: any): string[] {
        return this.methods.resolveVisibleColumnKeys();
      }
    },
    visibleColumns: {
      value(this: any): any[] {
        const hasExplicitVisibleKeys = Array.isArray(this.attributes.visibleColumnKeys);

        if (!hasExplicitVisibleKeys && this.attributes.activeColumnSettings.length > 0) {
          const columns = this.methods.applyColumnSettingsToColumns(this.attributes.activeColumnSettings);

          if (columns.length > 0) {
            return columns;
          }
        }

        const visibleKeys = new Set(this.attributes.visibleColumnKeysEffective);

        return this.attributes.normalizedColumns.filter((column: any) => visibleKeys.has(column.key));
      }
    },
    visibleColumnFingerprint: {
      value(this: any): string {
        return this.attributes.visibleColumns
          .map((column: any) => `${column.key}:${column.path ?? ""}`)
          .join("|");
      }
    },
    effectiveOrders: {
      value(this: any): unknown {
        return this.methods.resolveEffectiveOrders();
      }
    },
    queryFingerprint: {
      value(this: any): string {
        return this.methods.createQueryFingerprint();
      }
    },
    effectiveRows: {
      value(this: any): readonly any[] {
        return this.methods.resolveEffectiveRows();
      }
    },
    rowsLoadedFingerprint: {
      value(this: any): string {
        return this.methods.createRowsFingerprint(this.methods.resolveEffectiveRows());
      }
    },
    effectiveLoading: {
      value(this: any): boolean {
        return Boolean(this.attributes.loading ?? this.attributes.internalLoading);
      }
    },
    selectedRows: {
      value(this: any): any[] {
        const selectedKeys = new Set(this.methods.resolveSelectedRowKeys());

        return this.methods.resolveEffectiveRows().filter((row: any, rowIndex: number) =>
          selectedKeys.has(this.methods.getResolvedRowKey(row, rowIndex))
        );
      }
    },
    selectedRowKey: {
      value(this: any): string | null {
        const selectedRowKeys = this.methods.resolveSelectedRowKeys();

        return selectedRowKeys.length > 0 ? selectedRowKeys[0] : null;
      }
    },
    selectionChangeFingerprint: {
      value(this: any): string {
        return JSON.stringify({
          multiSelectEnabled: this.attributes.multiSelectEnabled,
          rows: this.attributes.rowsLoadedFingerprint,
          selectedRowKeys: this.methods.resolveSelectedRowKeys()
        });
      }
    },
    toolbarContext: {
      value(this: any): Record<string, unknown> {
        return this.methods.createToolbarContext();
      }
    },
    toolbarLeftItems: {
      value(this: any): readonly unknown[] {
        return this.methods.resolveToolbarItems(this.attributes.createToolbarLeftItems);
      }
    },
    toolbarCenterItems: {
      value(this: any): readonly unknown[] {
        return this.methods.resolveToolbarItems(this.attributes.createToolbarCenterItems);
      }
    },
    toolbarRightItems: {
      value(this: any): readonly unknown[] {
        return [
          ...this.methods.createDefaultToolbarRightItems(),
          ...this.methods.resolveToolbarItems(this.attributes.createToolbarRightItems)
        ];
      }
    },
    hasToolbarItems: {
      value(this: any): boolean {
        return (
          this.attributes.toolbarLeftItems.length > 0 ||
          this.attributes.toolbarCenterItems.length > 0 ||
          this.attributes.toolbarRightItems.length > 0
        );
      }
    },
    rootClassName: {
      value(this: any): string {
        const mode = this.attributes.rowMode === "tile" ? "tile" : "list";

        return this.methods.joinClassNames(
          "titanic-data-grid",
          `titanic-data-grid_layout_${mode}`,
          `titanic-data-grid--${mode}`,
          this.attributes.multiSelectEnabled ? "titanic-data-grid_selecting titanic-data-grid--selecting" : null,
          this.attributes.className
        );
      }
    },
    rootStyle: {
      value(this: any): Record<string, string> {
        const template = this.methods.createGridTemplate();

        return {
          "--titanic-data-grid-columns": String(Math.max(this.attributes.visibleColumns.length, 1)),
          "--titanic-data-grid-row-template": template,
          "--titanic-data-grid-template": template
        };
      }
    },
    columnCount: {
      value(this: any): number {
        return this.attributes.visibleColumns.length + (this.attributes.multiSelectEnabled ? 1 : 0);
      }
    },
    rowCountValue: {
      value(this: any): number {
        return this.attributes.effectiveRows.length;
      }
    },
    showColumnHeader: {
      value(this: any): boolean {
        return this.attributes.rowMode !== "tile" && this.attributes.visibleColumns.length > 0;
      }
    },
    hasRows: {
      value(this: any): boolean {
        return this.attributes.effectiveRows.length > 0;
      }
    },
    showEmpty: {
      value(this: any): boolean {
        return !this.attributes.effectiveLoading && !this.attributes.error && !this.attributes.hasRows;
      }
    },
    showStatus: {
      value(this: any): boolean {
        return this.attributes.effectiveLoading || this.attributes.showEmpty;
      }
    },
    statusText: {
      value(this: any): string {
        return this.methods.resolveStatusText();
      }
    },
    loadRowsEffect: {
      deps: {
        array: [
          { attr: "client" },
          { attr: "rows" },
          { attr: "query" },
          { attr: "createQuery" },
          { attr: "prepareQuery" },
          { attr: "refreshKey" },
          { attr: "refreshVersion" },
          { attr: "resolvedEntity.tableName" },
          { attr: "resolvedEntity.entityTypeName" },
          { attr: "visibleColumnFingerprint" },
          { attr: "queryFingerprint" }
        ]
      },
      effect(this: any): () => void {
        let cancelled = false;

        void this.methods.loadRows(() => cancelled);

        return () => {
          cancelled = true;
        };
      }
    },
    columnSettingsLoadEffect: {
      deps: {
        array: [
          { attr: "columnSettingsClient" },
          { attr: "client" },
          { attr: "currentUserId" },
          { attr: "gridId" },
          { attr: "gridKey" },
          { attr: "resolvedGridKey" },
          { attr: "effectiveSettings.persistColumnSettings" },
          { attr: "rowMode" }
        ]
      },
      effect(this: any): () => void {
        let cancelled = false;

        void this.methods.loadColumnSettings(() => cancelled);

        return () => {
          cancelled = true;
        };
      }
    },
    rowsLoadedEffect: {
      deps: { array: [{ attr: "effectiveLoading" }, { attr: "rowsLoadedFingerprint" }] },
      effect(this: any): () => void {
        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        if (this.attributes.effectiveLoading) {
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
      }
    },
    selectionChangeEffect: {
      deps: { array: [{ attr: "selectionChangeFingerprint" }] },
      effect(this: any): void {
        if (typeof this.attributes.onSelectionChange === "function") {
          this.attributes.onSelectionChange({
            selectedRowKeys: [...this.methods.resolveSelectedRowKeys()],
            selectedRows: [...this.attributes.selectedRows],
            selectionModeEnabled: this.attributes.multiSelectEnabled
          });
        }
      }
    }
  },
  methods: {
    getHandle(this: any): Record<string, unknown> {
      return {
        clearSelection: this.methods.clearSelection,
        disableMultiSelect: this.methods.disableMultiSelect,
        enableMultiSelect: this.methods.enableMultiSelect,
        getGridColumnSettings: this.methods.getGridColumnSettings,
        getSelectedRowKeys: this.methods.getSelectedRowKeys,
        getSelectedRows: this.methods.getSelectedRows,
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
      const path = column.path ?? column.name ?? key;

      return {
        ...column,
        defaultVisible: column.defaultVisible ?? true,
        key,
        label: this.methods.getColumnLabel({ ...column, key, path }),
        path,
        settingId: column.settingId ?? key,
        span: column.span ?? column.width
      };
    },

    getColumnKey(this: any, column: any): string | undefined {
      return column?.key ?? column?.settingId ?? column?.path ?? column?.name;
    },

    getColumnLabel(this: any, column: any): string {
      const key = this.methods.getColumnKey(column);
      const labels = this.attributes.columnLabels ?? {};

      return (
        (key ? labels[key] : undefined) ??
        column.label ??
        column.caption ??
        column.title ??
        column.name ??
        column.path ??
        key ??
        ""
      );
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
          .filter(({ setting }: any) => setting?.visible !== false && availableKeys.has(setting.key))
          .sort((left: any, right: any) => {
            const leftOrder = Number.isFinite(Number(left.setting.order)) ? Number(left.setting.order) : left.settingIndex;
            const rightOrder = Number.isFinite(Number(right.setting.order)) ? Number(right.setting.order) : right.settingIndex;

            return leftOrder - rightOrder;
          })
          .map(({ setting }: any) => setting.key);

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
      const mode = this.methods.normalizeColumnSettingsMode(this.attributes.rowMode);
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

    applyColumnSettingsToColumns(this: any, settings: any[]): any[] {
      const columnsByKey = new Map(this.attributes.normalizedColumns.map((column: any) => [column.key, column]));
      const renderedKeys = new Set<string>();
      const result = [...settings]
        .map((setting: any, settingIndex: number) => ({ setting, settingIndex }))
        .filter(({ setting }: any) => setting?.visible !== false && columnsByKey.has(setting.key))
        .sort((left: any, right: any) => {
          const leftOrder = Number.isFinite(Number(left.setting.order)) ? Number(left.setting.order) : left.settingIndex;
          const rightOrder = Number.isFinite(Number(right.setting.order)) ? Number(right.setting.order) : right.settingIndex;

          return leftOrder - rightOrder;
        })
        .map(({ setting }: any) => {
          const column = columnsByKey.get(setting.key) as any;

          renderedKeys.add(setting.key);

          return {
            ...column,
            label: setting.label ?? column.label,
            path: setting.path ?? column.path,
            span: this.methods.normalizeGridSpan(setting.span ?? column.span),
            width: this.methods.normalizeGridWidth(setting.width ?? column.width)
          };
        });

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

      return this.attributes.normalizedColumns.map((column: any, columnIndex: number) => ({
        id: column.settingId ?? column.key,
        key: column.key,
        label: column.label,
        order: columnIndex,
        path: column.path,
        span: this.methods.normalizeGridSpan(column.span ?? defaultSpan),
        visible: visibleKeys.has(column.key),
        width: this.methods.normalizeGridWidth(column.width)
      }));
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
      const path = typeof column?.path === "string" ? column.path.trim() : "";
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
      const path = typeof column?.path === "string" ? column.path.trim() : "";

      if ((path && sortSetting.path === path) || (key && sortSetting.key === key)) {
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
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.rowMode);
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
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.rowMode);
      const safeSettings = Array.isArray(settings) ? [...settings] : [];
      const nextModeSettings = this.methods.createColumnModeSettings(safeSettings, activeMode, modeSettings);
      const currentMode = this.methods.normalizeColumnSettingsMode(this.attributes.rowMode);
      const currentModeSettings = Array.isArray(nextModeSettings[currentMode]?.columns)
        ? nextModeSettings[currentMode].columns
        : safeSettings;

      this.attributes.setAppliedColumnSettings([...currentModeSettings]);
      this.attributes.setColumnSettingsMode(activeMode);
      this.attributes.setColumnModeSettings(nextModeSettings);
    },

    applyColumnSettings(this: any, settings: any[], mode?: string, modeSettings?: Record<string, any>): void {
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.rowMode);
      const safeSettings = Array.isArray(settings) ? [...settings] : [];
      const nextModeSettings = this.methods.createColumnModeSettings(safeSettings, activeMode, modeSettings);
      const currentMode = this.methods.normalizeColumnSettingsMode(this.attributes.rowMode);
      const visibleSettings = Array.isArray(nextModeSettings[currentMode]?.columns)
        ? nextModeSettings[currentMode].columns
        : safeSettings;

      this.methods.setColumnSettingsState(safeSettings, activeMode, nextModeSettings);
      this.attributes.setColumnSettingsOpen(false);
      this.methods.notifyVisibleColumnKeysChange(visibleSettings, currentMode, nextModeSettings);
    },

    notifyVisibleColumnKeysChange(this: any, settings: any[], mode?: string, modeSettings?: Record<string, any>): void {
      if (typeof this.attributes.onVisibleColumnKeysChange !== "function") {
        return;
      }

      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.rowMode);
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
        .map(({ setting }: any) => setting.key)
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
        "EntityDataGrid",
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
      if (!this.attributes.effectiveSettings.persistColumnSettings) {
        return;
      }

      try {
        const dto = await this.methods.getGridColumnSettings({ scope: "personal" });

        if (isCancelled?.()) {
          return;
        }

        const currentMode = this.methods.normalizeColumnSettingsMode(this.attributes.rowMode);

        if (!dto) {
          const defaultSettings = this.methods.createDefaultColumnSettings();

          this.methods.setColumnSettingsState(defaultSettings, currentMode);
          this.attributes.setSortSetting(null);
          this.attributes.setColumnSettingsError(null);
          return;
        }

        const savedMode = this.methods.normalizeColumnSettingsMode(dto.columnSettingsMode ?? dto.displayMode);
        const modeSettings = dto.modeSettings && typeof dto.modeSettings === "object" ? dto.modeSettings : undefined;
        const settings = Array.isArray(modeSettings?.[currentMode]?.columns)
          ? modeSettings?.[currentMode]?.columns
          : Array.isArray(modeSettings?.[savedMode]?.columns)
            ? modeSettings?.[savedMode]?.columns
            : Array.isArray(dto.columns)
              ? dto.columns
              : [];

        this.methods.setColumnSettingsState(settings, currentMode, modeSettings);
        this.attributes.setSortSetting(this.methods.normalizeSortSetting(dto.sort));
        this.attributes.setColumnSettingsError(null);
      } catch (error) {
        if (isCancelled?.()) {
          return;
        }

        this.attributes.setColumnSettingsError(
          this.attributes.effectiveLabels.columnSettingsLoadError ?? String(error)
        );
      }
    },

    async saveDefaultColumnSettings(this: any, settings: any[], mode?: string, modeSettings?: Record<string, any>): Promise<void> {
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.rowMode);
      const currentMode = this.methods.normalizeColumnSettingsMode(this.attributes.rowMode);
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
          displayMode: currentMode,
          gridId,
          isDefault: true,
          modeSettings: nextModeSettings,
          sort: currentSort,
          userId
        });
        const resultModeSettings =
          dto?.modeSettings && typeof dto.modeSettings === "object" ? dto.modeSettings : nextModeSettings;
        const resultSettings = Array.isArray(resultModeSettings?.[currentMode]?.columns)
          ? resultModeSettings?.[currentMode]?.columns
          : Array.isArray(dto?.columns)
            ? dto.columns
            : safeSettings;

        this.methods.setColumnSettingsState(resultSettings, currentMode, resultModeSettings);
        this.attributes.setColumnSettingsOpen(false);
        this.methods.notifyVisibleColumnKeysChange(resultSettings, currentMode, resultModeSettings);
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
      const activeMode = this.methods.normalizeColumnSettingsMode(mode ?? this.attributes.rowMode);
      const currentMode = this.methods.normalizeColumnSettingsMode(this.attributes.rowMode);
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
        columnSettingsMode: hasSettingsPayload ? activeMode : this.attributes.columnSettingsMode ?? currentMode,
        displayMode: currentMode,
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
          const resultSettings = Array.isArray(resultModeSettings?.[currentMode]?.columns)
            ? resultModeSettings?.[currentMode]?.columns
            : Array.isArray(dto?.columns)
              ? dto.columns
              : safeSettings;

          this.methods.setColumnSettingsState(resultSettings, currentMode, resultModeSettings);
          this.attributes.setColumnSettingsOpen(false);
          this.methods.notifyVisibleColumnKeysChange(resultSettings, currentMode, resultModeSettings);
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

    createQueryContext(this: any): Record<string, unknown> {
      const primaryColumn = this.attributes.resolvedEntity.primaryColumn;
      const columnSet = new Set<string>(
        this.attributes.visibleColumns
          .map((column: any) => column.path ?? column.key)
          .filter(Boolean)
      );

      if (primaryColumn) {
        columnSet.add(primaryColumn);
      }

      const columns = Array.from(columnSet);
      const filters = [
        ...(Array.isArray(this.attributes.filters) ? this.attributes.filters : []),
        ...(Array.isArray(this.attributes.filter)
          ? this.attributes.filter
          : this.attributes.filter
            ? [this.attributes.filter]
            : [])
      ];
      const rowCount =
        this.attributes.rowCount ??
        this.attributes.effectiveSettings.defaultRowCount ??
        this.attributes.effectiveSettings.batchRowCount ??
        15;

      return {
        columnPaths: columns,
        columns,
        entity: this.attributes.resolvedEntity,
        entityTypeName: this.attributes.resolvedEntity.entityTypeName,
        filters,
        orders: this.attributes.effectiveOrders,
        pageIndex: 0,
        pageSize: rowCount,
        primaryColumn,
        rowCount,
        skipRow: 0,
        tableName: this.attributes.resolvedEntity.tableName
      };
    },

    buildQuery(this: any): unknown {
      const context = this.methods.createQueryContext();
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
          skipRow: context.skipRow,
          tableName: context.tableName
        };
      }

      const toEntityQueryJson = (Titanic as any).EntityApi?.toEntityQueryJson;
      let query = typeof toEntityQueryJson === "function" ? toEntityQueryJson(queryInput) : queryInput;

      if (typeof this.attributes.prepareQuery === "function") {
        const preparedQuery = this.attributes.prepareQuery(query, context);

        if (preparedQuery) {
          query = typeof toEntityQueryJson === "function" ? toEntityQueryJson(preparedQuery) : preparedQuery;
        }
      }

      return query;
    },

    createQueryFingerprint(this: any): string {
      try {
        return JSON.stringify({
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

      return this.attributes.emptyText ?? this.attributes.effectiveLabels.empty;
    },

    async loadRows(this: any, isCancelled?: () => boolean): Promise<void> {
      if (Array.isArray(this.attributes.rows)) {
        this.attributes.setInternalRows([]);
        this.attributes.setError(null);
        this.attributes.setInternalLoading(false);
        return;
      }

      const client = this.attributes.client;

      if (!client) {
        this.attributes.setInternalRows([]);
        this.attributes.setError(null);
        this.attributes.setInternalLoading(false);
        return;
      }

      this.attributes.setInternalLoading(true);
      this.attributes.setError(null);

      try {
        const query = this.methods.buildQuery();
        const result =
          typeof client.select === "function"
            ? await client.select(query)
            : typeof client.selectEntityRows === "function"
              ? await client.selectEntityRows(query)
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

        this.attributes.setInternalRows(Array.isArray(mappedRows) ? mappedRows : []);
      } catch (error: unknown) {
        if (!isCancelled?.()) {
          this.attributes.setError(error instanceof Error ? error.message : String(error));
          this.attributes.setInternalRows([]);
        }
      } finally {
        if (!isCancelled?.()) {
          this.attributes.setInternalLoading(false);
        }
      }
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
      const getEntityValue = (Titanic as any).EntityApi?.getEntityValue;

      if (typeof getEntityValue === "function") {
        const value = getEntityValue(row, path);

        if (value !== undefined) {
          return value;
        }
      }

      return String(path)
        .split(".")
        .reduce((value: any, segment: string) => (value == null ? undefined : value[segment]), row);
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

    createToolbarContext(this: any): Record<string, unknown> {
      return {
        client: this.attributes.client,
        columns: this.attributes.normalizedColumns,
        disableMultiSelect: this.methods.disableMultiSelect,
        displayMode: this.attributes.rowMode,
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
        {
          component: "Titanic.UI.Button",
          key: "data-grid-column-settings",
          props: {
            "aria-label": { attr: "effectiveLabels.configureColumns" },
            className: "titanic-data-grid__settings-button",
            onClick: { method: "openColumnSettings" },
            title: { attr: "effectiveLabels.configureColumns" },
            type: "button",
            unstyled: true
          },
          children: [
            {
              component: "Titanic.UI.ResourceSvgIcon",
              props: {
                className: "titanic-data-grid__settings-icon",
                icon: "settings.titanicColumns"
              }
            }
          ]
        }
      ];
    },

    renderToolbarSection(this: any, placement: string, items: readonly unknown[]): unknown {
      if (items.length === 0) {
        return null;
      }

      return this.renderDiff(
        [
          {
            tag: "div",
            props: {
              className: `titanic-data-grid__toolbar-section titanic-data-grid__toolbar-section_${placement} titanic-data-grid__toolbar-section--${placement}`
            },
            children: [
              {
                each: { local: "items" },
                as: "item",
                indexAs: "itemIndex",
                diff: [{ call: "renderToolbarItem", args: [{ local: "item" }, { local: "itemIndex" }] }]
              }
            ]
          }
        ],
        { items }
      );
    },

    renderToolbarItem(this: any, item: any, itemIndex: number): unknown {
      const value = typeof item === "function" ? item(this.attributes.toolbarContext) : item;

      if (value == null || value === false) {
        return null;
      }

      return this.methods.renderMaybeDiff(value, { item: value, itemIndex });
    },

    renderHeaderSelectionCell(this: any): unknown {
      if (!this.attributes.multiSelectEnabled) {
        return null;
      }

      return this.renderDiff([
        {
          tag: "th",
          props: {
            className: "titanic-data-grid__selection-cell titanic-data-grid__selection-cell_head titanic-data-grid__selection-cell--head",
            scope: "col"
          },
          children: [
            {
              component: "Titanic.UI.Button",
              props: {
                className: "titanic-data-grid__selection-button",
                onClick: { method: "handleHeaderSelectionClick" },
                title: { attr: "effectiveLabels.selectAllRows" },
                unstyled: true
              },
              children: [{ tag: "span", props: { className: "titanic-data-grid__selection-box" } }]
            }
          ]
        }
      ]);
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

      return this.renderDiff(
        [
          {
            tag: "th",
            props: {
              className: {
                call: "joinClassNames",
                args: [
                  "titanic-data-grid__cell",
                  "titanic-data-grid__cell_header",
                  "titanic-data-grid__cell--head",
                  { local: "className" }
                ]
              },
              scope: "col",
              style: { object: { width: { local: "width" } } }
            },
            children: [
              {
                component: "Titanic.UI.Button",
                props: {
                  className: {
                    call: "joinClassNames",
                    args: [
                      "titanic-data-grid__sort-header-button",
                      { local: "activeClassName" }
                    ]
                  },
                  onClick: { method: "handleHeaderSortClick", args: [{ local: "column" }] },
                  title: { local: "title" },
                  type: "button",
                  unstyled: true
                },
                children: [
                  {
                    tag: "span",
                    props: { className: "titanic-data-grid__sort-header-label" },
                    children: [{ text: { local: "label" } }]
                  },
                  {
                    tag: "span",
                    when: { local: "direction" },
                    props: {
                      "aria-hidden": true,
                      className: {
                        call: "joinClassNames",
                        args: [
                          "titanic-data-grid__sort-header-icon",
                          { local: "sortIconClassName" }
                        ]
                      }
                    }
                  }
                ]
              }
            ]
          }
        ],
        {
          activeClassName: direction ? "titanic-data-grid__sort-header-button_active" : null,
          className: column.className,
          column,
          direction,
          label: column.label,
          sortIconClassName: direction ? `titanic-data-grid__sort-header-icon_${direction}` : null,
          title,
          width: column.width ? `${column.width}px` : undefined
        }
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
              displayMode: this.attributes.rowMode,
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
        return this.methods.renderMaybeDiff(customRow, { row, rowIndex, rowKey, selected });
      }

      return this.renderDiff(
        [
          {
            tag: "tr",
            props: {
              "aria-selected": { local: "selected" },
              className: {
                call: "joinClassNames",
                args: [
                  "titanic-data-grid__row",
                  { local: "selectedClassName" },
                  { local: "activeClassName" },
                  { local: "clickableClassName" }
                ]
              },
              onClick: { method: "handleRowClick", args: [{ local: "row" }, { local: "rowIndex" }] },
              onDoubleClick: { method: "handleRowDoubleClick", args: [{ local: "row" }, { local: "rowIndex" }] }
            },
            children: [
              { call: "renderSelectionBodyCell", args: [{ local: "row" }, { local: "rowIndex" }] },
              {
                each: { attr: "visibleColumns" },
                as: "column",
                indexAs: "columnIndex",
                diff: [
                  {
                    call: "renderBodyCell",
                    args: [
                      { local: "column" },
                      { local: "row" },
                      { local: "rowIndex" },
                      { local: "columnIndex" }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        {
          activeClassName: this.attributes.activeRowKey === rowKey
            ? "titanic-data-grid__row_active titanic-data-grid__row--active"
            : null,
          clickableClassName:
            this.attributes.onRowClick || this.attributes.onRowDoubleClick || this.attributes.multiSelectEnabled
              ? "titanic-data-grid__row_clickable"
              : null,
          row,
          rowIndex,
          rowKey,
          selected,
          selectedClassName: selected ? "titanic-data-grid__row_selected titanic-data-grid__row--selected" : null
        }
      );
    },

    renderSelectionBodyCell(this: any, row: any, rowIndex: number): unknown {
      if (!this.attributes.multiSelectEnabled) {
        return null;
      }

      return this.renderDiff(
        [
          {
            tag: "td",
            props: {
              className: "titanic-data-grid__selection-cell"
            },
            children: [
              {
                component: "Titanic.UI.Button",
                props: {
                  className: "titanic-data-grid__selection-button",
                  onClick: { method: "handleRowSelectionClick", args: [{ local: "row" }, { local: "rowIndex" }] },
                  title: { attr: "effectiveLabels.selectRow" },
                  unstyled: true
                },
                children: [
                  {
                    tag: "span",
                    props: {
                      className: {
                        call: "joinClassNames",
                        args: ["titanic-data-grid__selection-box", { local: "selectedClassName" }]
                      }
                    }
                  }
                ]
              }
            ]
          }
        ],
        {
          row,
          rowIndex,
          selectedClassName: this.methods.resolveSelectedRowKeys().includes(this.methods.getResolvedRowKey(row, rowIndex))
            ? "titanic-data-grid__selection-box_selected titanic-data-grid__selection-box--selected"
            : null
        }
      );
    },

    renderBodyCell(this: any, column: any, row: any, rowIndex: number, columnIndex: number): unknown {
      const value = this.methods.getRowValue(row, column);
      const rendered = typeof column.render === "function" ? column.render(row) : undefined;

      return this.renderDiff(
        [
          {
            tag: "td",
            props: {
              className: {
                call: "joinClassNames",
                args: ["titanic-data-grid__cell", { local: "className" }]
              },
              "data-column": { local: "columnKey" },
              style: {
                object: {
                  "--titanic-data-grid-cell-span": { local: "span" },
                  width: { local: "width" }
                }
              }
            },
            children: [{ call: "renderCellContent", args: [{ local: "rendered" }, { local: "value" }, { local: "column" }] }]
          }
        ],
        {
          className: column.className,
          column,
          columnIndex,
          columnKey: column.key,
          rendered,
          row,
          rowIndex,
          span: this.methods.normalizeGridSpan(
            column.span ?? this.attributes.effectiveSettings.gridWidth ?? this.attributes.gridWidth ?? 24
          ),
          width: this.methods.normalizeGridWidth(column.width) ? `${this.methods.normalizeGridWidth(column.width)}px` : undefined,
          value
        }
      );
    },

    renderCellContent(this: any, rendered: unknown, value: unknown, column: any): unknown {
      if (rendered !== undefined && rendered !== null) {
        return this.methods.renderMaybeDiff(rendered, { column, value });
      }

      return this.renderDiff(
        [
          {
            tag: "span",
            props: { className: "titanic-data-grid__cell-value" },
            text: { call: "formatCellValue", args: [{ local: "value" }, { local: "column" }] }
          }
        ],
        { column, value }
      );
    },

    renderColumnSettingsDialog(this: any): unknown {
      if (!this.attributes.columnSettingsOpen) {
        return null;
      }

      const renderer = this.methods.resolveColumnSettingsRenderer();

      if (!renderer) {
        return null;
      }

      return this.methods.renderMaybeDiff(
        renderer({
          columnPickerLabels: this.attributes.columnPickerLabels,
          client: this.attributes.client,
          columns: this.attributes.normalizedColumns,
          columnSettingsMode: this.methods.normalizeColumnSettingsMode(
            this.attributes.columnSettingsMode ?? this.attributes.rowMode
          ),
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
        })
      );
    },

    renderMaybeDiff(this: any, value: unknown, locals?: Record<string, unknown>): unknown {
      if (Array.isArray(value)) {
        return this.renderDiff(value, locals);
      }

      if (value && typeof value === "object" && !("type" in (value as any))) {
        const record = value as Record<string, unknown>;

        if ("tag" in record || "component" in record || "text" in record || "call" in record || "each" in record) {
          return this.renderDiff([record as any], locals);
        }
      }

      return value;
    },

    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    },

    noop(): void {}
  },
  diff: [
    {
      component: "Titanic.UI.EntityContainer",
      props: {
        ariaLabel: { coalesce: [{ attr: "title" }, { prop: "aria-label" }, { attr: "resolvedGridKey" }, { attr: "gridId" }] },
        className: { attr: "rootClassName" },
        role: "region",
        style: { attr: "rootStyle" }
      },
      children: [
        {
          tag: "div",
          when: { attr: "hasToolbarItems" },
          props: {
            className: "titanic-data-grid__toolbar"
          },
          children: [
            { call: "renderToolbarSection", args: ["left", { attr: "toolbarLeftItems" }] },
            { call: "renderToolbarSection", args: ["center", { attr: "toolbarCenterItems" }] },
            { call: "renderToolbarSection", args: ["right", { attr: "toolbarRightItems" }] }
          ]
        },
        {
          tag: "div",
          props: {
            className: "titanic-data-grid__table-wrap"
          },
          children: [
            {
              tag: "table",
              props: {
                className: "titanic-data-grid__table"
              },
              children: [
                {
                  tag: "thead",
                  when: { attr: "showColumnHeader" },
                  props: {
                    className: "titanic-data-grid__head"
                  },
                  children: [
                    {
                      tag: "tr",
                      props: {
                        className: "titanic-data-grid__row titanic-data-grid__row_header titanic-data-grid__row--head"
                      },
                      children: [
                        { call: "renderHeaderSelectionCell" },
                        {
                          each: { attr: "visibleColumns" },
                          as: "column",
                          indexAs: "columnIndex",
                          diff: [{ call: "renderHeaderCell", args: [{ local: "column" }, { local: "columnIndex" }] }]
                        }
                      ]
                    }
                  ]
                },
                {
                  tag: "tbody",
                  props: {
                    className: "titanic-data-grid__body"
                  },
                  children: [
                    {
                      each: { attr: "effectiveRows" },
                      as: "row",
                      indexAs: "rowIndex",
                      diff: [{ call: "renderBodyRow", args: [{ local: "row" }, { local: "rowIndex" }] }]
                    },
                    {
                      tag: "tr",
                      when: { attr: "showStatus" },
                      props: {
                        className:
                          "titanic-data-grid__status-row titanic-data-grid__row titanic-data-grid__row_status titanic-data-grid__row--status"
                      },
                      children: [
                        {
                          tag: "td",
                          props: {
                            className: "titanic-data-grid__cell titanic-data-grid__cell_status titanic-data-grid__status",
                            colSpan: { attr: "columnCount" }
                          },
                          children: [{ text: { attr: "statusText" } }]
                        }
                      ]
                    },
                    {
                      tag: "tr",
                      when: { attr: "error" },
                      props: {
                        className:
                          "titanic-data-grid__status-row titanic-data-grid__row titanic-data-grid__row_error titanic-data-grid__row--error"
                      },
                      children: [
                        {
                          tag: "td",
                          props: {
                            className: "titanic-data-grid__cell titanic-data-grid__cell_error titanic-data-grid__error",
                            colSpan: { attr: "columnCount" }
                          },
                          children: [{ text: { attr: "error" } }]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        { call: "renderColumnSettingsDialog" }
      ]
    }
  ]
});
