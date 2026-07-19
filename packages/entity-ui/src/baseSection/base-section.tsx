Titanic.define("Titanic.UI.BaseSection", {
  attributes: {
    actionError: { state: true, default: null },
    actionLoading: { state: true, default: false },
    bottom: {},
    className: {},
    confirmDelete: { default: true },
    confirmDeleteRecord: {},
    confirmDeleteRecords: {},
    createAddButtons: {},
    createToolbarCenterItems: {},
    createToolbarLeftItems: {},
    createToolbarRightItems: {},
    deleteEnabled: { default: true },
    deleteSelectedEnabled: { default: true },
    forwardedRef: {
      value(this: any): unknown {
        return this.props.ref;
      }
    },
    getRowKey: {},
    getRowPrimaryValue: {},
    gridClassName: {},
    gridRef: { ref: true, default: null },
    labelsProp: {
      value(this: any): Record<string, unknown> | undefined {
        return this.props.labels;
      }
    },
    methodChainsRef: { ref: true, default: {} },
    onDeleteRecord: {},
    onDeleteRecords: {},
    onOpenCreatePage: {},
    onOpenDeleteManyPage: {},
    onOpenDeletePage: {},
    onOpenEditPage: {},
    onRowClick: {},
    onRowDoubleClick: {},
    onSelectionChange: {},
    refreshKey: {},
    refreshVersion: { state: true, default: 0 },
    renderBottomContainer: {},
    renderTopContainer: {},
    rowActions: {},
    selection: {
      state: true,
      default(this: any): Record<string, unknown> {
        return {
          selectedRowKeys: [],
          selectedRows: [],
          selectionModeEnabled: Boolean(this.props.defaultMultiSelectEnabled)
        };
      }
    },
    template: {},
    top: {},
    defaultLabels: {
      value(): Record<string, unknown> {
        return {
          createRecord: "Create",
          deleteRecord: "Delete",
          deleteRecordConfirm: "Delete record?",
          deleteRecordError: "Could not delete record.",
          deleteSelectedRecords: "Delete selected",
          deleteSelectedRecordsConfirm: "Delete selected records?",
          deleteSelectedRecordsError: "Could not delete selected records.",
          selectedRecords: (count: number) => `Selected: ${count}`
        };
      }
    },
    labels: {
      value(this: any): Record<string, unknown> {
        return {
          ...this.attributes.defaultLabels,
          ...(this.attributes.labelsProp ?? {})
        };
      }
    },
    gridProps: {
      value(this: any): Record<string, unknown> {
        return this.methods.getGridProps();
      }
    },
    resolvedEntity: {
      value(this: any): Record<string, unknown> {
        return this.methods.resolveRecordsSectionEntity(this.attributes.gridProps);
      }
    },
    normalizedTemplate: {
      value(this: any): Record<string, unknown> {
        return this.methods.createBaseSectionTemplate(this.attributes.template);
      }
    },
    methodChains: {
      value(this: any): Record<string, unknown[]> {
        return this.methods.mergeMethodChains(
          this.methods.createMethodChainsFromMethods(this.attributes.normalizedTemplate?.methods),
          this.attributes.normalizedTemplate?.methodChains
        );
      }
    },
    syncMethodChainsRef: {
      value(this: any): null {
        this.attributes.methodChainsRef.current = this.attributes.methodChains;
        return null;
      }
    },
    sectionMethods: {
      value(this: any): Record<string, unknown> {
        return this.methods.createSectionMethods();
      }
    },
    sectionContext: {
      value(this: any): Record<string, unknown> {
        return this.methods.createSectionContext();
      }
    },
    canDeleteRecords: {
      value(this: any): boolean {
        return Boolean(
          this.attributes.deleteEnabled &&
            (this.attributes.onDeleteRecord ||
              this.attributes.onOpenDeletePage ||
              this.methods.hasDefaultDelete(this.attributes.gridProps))
        );
      }
    },
    canDeleteSelectedRecords: {
      value(this: any): boolean {
        return Boolean(
          this.attributes.deleteSelectedEnabled &&
            (this.attributes.onDeleteRecords ||
              this.attributes.onOpenDeleteManyPage ||
              this.methods.hasDefaultDelete(this.attributes.gridProps))
        );
      }
    },
    effectiveRowActions: {
      value(this: any): readonly unknown[] {
        return this.methods.createEffectiveRowActions();
      }
    },
    resolvedGridClassName: {
      value(this: any): string {
        return this.methods.joinClassNames("titanic-records-section__grid", this.attributes.gridClassName);
      }
    },
    resolvedRefreshKey: {
      value(this: any): string {
        return `${this.attributes.refreshKey ?? "records-section"}:${this.attributes.refreshVersion}`;
      }
    },
    rootClassName: {
      value(this: any): string {
        return this.methods.joinClassNames(
          "titanic-base-section",
          "titanic-base-entity-section",
          "titanic-records-section",
          this.attributes.className
        );
      }
    },
    selectedRows: {
      value(this: any): readonly unknown[] {
        return Array.isArray(this.attributes.selection?.selectedRows)
          ? this.attributes.selection.selectedRows
          : [];
      }
    },
    selectedRowKeys: {
      value(this: any): readonly unknown[] {
        return Array.isArray(this.attributes.selection?.selectedRowKeys)
          ? this.attributes.selection.selectedRowKeys
          : [];
      }
    },
    selectionModeEnabled: {
      value(this: any): boolean {
        return Boolean(this.attributes.selection?.selectionModeEnabled);
      }
    },
    hasSelectedRecords: {
      value(this: any): boolean {
        return this.attributes.selectionModeEnabled && this.attributes.selectedRows.length > 0;
      }
    },
    bottomStatusContent: {
      value(this: any): unknown {
        return this.methods.renderBottomStatus();
      }
    },
    handle: {
      value(this: any): Record<string, unknown> {
        return this.methods.createHandle();
      }
    },
    syncForwardedRef: {
      deps: { array: [{ attr: "forwardedRef" }, { attr: "handle" }] },
      effect(this: any): void | (() => void) {
        const ref = this.attributes.forwardedRef as any;
        const handle = this.attributes.handle;

        if (!ref) {
          return;
        }

        if (typeof ref === "function") {
          ref(handle);
          return () => ref(null);
        }

        ref.current = handle;
        return () => {
          if (ref.current === handle) {
            ref.current = null;
          }
        };
      }
    }
  },
  methods: {
    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    },

    getGridProps(this: any): Record<string, unknown> {
      const gridProps = { ...this.props } as Record<string, unknown>;

      [
        "bottom",
        "className",
        "confirmDelete",
        "confirmDeleteRecord",
        "confirmDeleteRecords",
        "createAddButtons",
        "createToolbarCenterItems",
        "createToolbarLeftItems",
        "createToolbarRightItems",
        "deleteEnabled",
        "deleteSelectedEnabled",
        "getRowPrimaryValue",
        "gridClassName",
        "labels",
        "methods",
        "onDeleteRecord",
        "onDeleteRecords",
        "onOpenCreatePage",
        "onOpenDeleteManyPage",
        "onOpenDeletePage",
        "onOpenEditPage",
        "onRowClick",
        "onRowDoubleClick",
        "onSelectionChange",
        "refreshKey",
        "ref",
        "renderBottomContainer",
        "renderTopContainer",
        "rowActions",
        "template",
        "top"
      ].forEach((propName) => {
        delete gridProps[propName];
      });

      return gridProps;
    },

    normalizeEntityName(this: any, value: unknown): string | undefined {
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }

      return undefined;
    },

    isEntityModel(this: any, value: any): boolean {
      return Boolean(
        value &&
          typeof value === "object" &&
          value.schema &&
          typeof value.schema === "object" &&
          typeof value.toValues === "function" &&
          typeof value.getSaveValues === "function"
      );
    },

    resolveRecordsSectionEntity(this: any, props: any): Record<string, unknown> {
      const entity = props?.entity;
      const explicitTableName = this.methods.normalizeEntityName(props?.tableName);
      const explicitPrimaryColumn = this.methods.normalizeEntityName(props?.primaryColumn);

      if (typeof entity === "string") {
        return {
          entityTypeName: entity,
          primaryColumn: explicitPrimaryColumn ?? "id",
          tableName: explicitTableName ?? entity
        };
      }

      if (this.methods.isEntityModel(entity)) {
        const schema = entity.schema ?? {};
        const tableName =
          explicitTableName ??
          this.methods.normalizeEntityName(schema.tableName) ??
          this.methods.normalizeEntityName(entity.tableName);

        return {
          entity,
          entityTypeName:
            this.methods.normalizeEntityName(schema.providerName) ??
            this.methods.normalizeEntityName(schema.name) ??
            tableName,
          primaryColumn:
            explicitPrimaryColumn ??
            this.methods.normalizeEntityName(schema.primaryColumn) ??
            this.methods.normalizeEntityName(entity.primaryColumn) ??
            "id",
          tableName
        };
      }

      if (entity && typeof entity === "object") {
        return {
          ...entity,
          primaryColumn:
            explicitPrimaryColumn ??
            this.methods.normalizeEntityName(entity.primaryColumn) ??
            "id",
          tableName:
            explicitTableName ??
            this.methods.normalizeEntityName(entity.tableName) ??
            this.methods.normalizeEntityName(entity.entityTypeName)
        };
      }

      return {
        primaryColumn: explicitPrimaryColumn ?? "id",
        tableName: explicitTableName
      };
    },

    readObjectValue(this: any, source: any, key: unknown): unknown {
      if (!source || typeof key !== "string") {
        return undefined;
      }

      if (Object.prototype.hasOwnProperty.call(source, key)) {
        return source[key];
      }

      if (typeof source.getValue === "function") {
        return source.getValue(key);
      }

      if (source.values && typeof source.values === "object") {
        return source.values[key];
      }

      return undefined;
    },

    readDefaultPrimaryValue(this: any, row: any, entity: any): string | number | null {
      const primaryColumn = typeof entity?.primaryColumn === "string" ? entity.primaryColumn : "id";
      const value = this.methods.readObjectValue(row, primaryColumn);

      return typeof value === "string" || typeof value === "number" ? value : null;
    },

    hasDefaultDelete(this: any, props: any): boolean {
      const entity = this.methods.resolveRecordsSectionEntity(props);
      return Boolean(props?.client && entity.tableName);
    },

    mergeRowActions(this: any, baseActions: readonly any[], extraActions?: readonly any[]): readonly any[] {
      if (!extraActions?.length) {
        return baseActions;
      }

      const byKey = new Map<string, any>();
      const result: any[] = [];

      for (const action of baseActions) {
        if (action?.key) {
          byKey.set(action.key, action);
        }

        result.push(action);
      }

      for (const action of extraActions) {
        if (action?.key && byKey.has(action.key)) {
          const index = result.findIndex((item) => item?.key === action.key);
          result[index] = { ...byKey.get(action.key), ...action };
          byKey.set(action.key, result[index]);
          continue;
        }

        result.push(action);
      }

      return result;
    },

    async resolveDeleteConfirmation(
      this: any,
      confirmDelete: unknown,
      callback: (() => boolean | Promise<boolean>) | undefined,
      fallbackMessage: unknown
    ): Promise<boolean> {
      if (callback) {
        return Boolean(await callback());
      }

      if (confirmDelete === false) {
        return true;
      }

      if (typeof window === "undefined" || typeof window.confirm !== "function") {
        return true;
      }

      return window.confirm(String(fallbackMessage ?? "Delete?"));
    },

    createMethodChainsFromMethods(this: any, methods?: Record<string, unknown>): Record<string, unknown[]> {
      const result: Record<string, unknown[]> = {};

      if (!methods) {
        return result;
      }

      for (const [name, method] of Object.entries(methods)) {
        if (typeof method === "function") {
          result[name] = [method];
        }
      }

      return result;
    },

    mergeMethodChains(this: any, ...sources: Array<Record<string, unknown[]> | undefined>): Record<string, unknown[]> {
      const result: Record<string, unknown[]> = {};

      for (const source of sources) {
        if (!source) {
          continue;
        }

        for (const [name, chain] of Object.entries(source)) {
          if (Array.isArray(chain)) {
            result[name] = [...(result[name] ?? []), ...chain];
          }
        }
      }

      return result;
    },

    createBaseSectionTemplate(this: any, template?: any): Record<string, unknown> {
      const source = template ?? {};
      const baseSource = source.extend ?? source.extends ?? source.base;
      const base = baseSource ? this.methods.createBaseSectionTemplate(baseSource.template ?? baseSource) : undefined;
      const baseMethods = base?.methods && typeof base.methods === "object" ? base.methods : {};
      const ownMethods = source.methods && typeof source.methods === "object" ? source.methods : {};
      const methodChains = this.methods.mergeMethodChains(
        base?.methodChains as Record<string, unknown[]> | undefined,
        this.methods.createMethodChainsFromMethods(ownMethods)
      );

      return {
        name: source.name ?? base?.name,
        methods: {
          ...baseMethods,
          ...ownMethods
        },
        methodChains,
        diff: Array.isArray(source.diff) ? [...source.diff] : Array.isArray(base?.diff) ? [...base.diff] : []
      };
    },

    createMethodContext(this: any, context: any): any {
      return context;
    },

    normalizeCallParentArguments(this: any, parentArguments: any, currentContext: any, currentArgs: unknown[]): any {
      if (Array.isArray(parentArguments)) {
        return {
          args: parentArguments,
          context: currentContext
        };
      }

      if (parentArguments && typeof parentArguments === "object" && Array.isArray(parentArguments.args)) {
        return {
          args: parentArguments.args,
          context: parentArguments.context ?? currentContext
        };
      }

      if (parentArguments && typeof parentArguments === "object" && this.methods.isEntityRecordsSectionContext(parentArguments)) {
        return {
          args: currentArgs,
          context: parentArguments
        };
      }

      return {
        args: currentArgs,
        context: currentContext
      };
    },

    isEntityRecordsSectionContext(this: any, value: any): boolean {
      return Boolean(value && typeof value === "object" && "template" in value && "runMethod" in value);
    },

    async runMethodAt(
      this: any,
      name: string,
      methodIndex: number,
      methodContext: any,
      args: unknown[] = []
    ): Promise<unknown> {
      const chain = this.attributes.methodChainsRef.current?.[name];
      const method = Array.isArray(chain) ? chain[methodIndex] : undefined;

      if (typeof method !== "function") {
        throw new Error(`Base section method "${name}" is not registered.`);
      }

      const currentContext = this.methods.createMethodContext(methodContext);
      const self = this;
      const methodThis = {
        ...currentContext,
        context: currentContext,
        callParent(parentArguments?: unknown) {
          const parentIndex = methodIndex - 1;

          if (parentIndex < 0) {
            throw new Error(`Base section method "${name}" does not have a parent implementation.`);
          }

          const parentCall = self.methods.normalizeCallParentArguments(parentArguments, currentContext, args);
          return self.methods.runMethodAt(name, parentIndex, parentCall.context, parentCall.args);
        }
      };

      return method.call(methodThis, currentContext, ...args);
    },

    createSectionMethods(this: any): Record<string, unknown> {
      const result: Record<string, unknown> = {};

      for (const [name, chain] of Object.entries(this.attributes.methodChains)) {
        if (!Array.isArray(chain) || !chain.length) {
          continue;
        }

        const methodIndex = chain.length - 1;
        result[name] = (context: any, ...args: unknown[]) =>
          this.methods.runMethodAt(name, methodIndex, context, args);
      }

      return result;
    },

    createSectionContext(this: any, grid: any = null): Record<string, unknown> {
      const sectionContext: Record<string, unknown> = {
        client: this.attributes.gridProps.client,
        diff: this.attributes.normalizedTemplate.diff,
        entity: grid?.entity ?? this.attributes.resolvedEntity,
        grid,
        methods: this.attributes.sectionMethods,
        refresh: this.methods.refreshSection,
        runMethod: (name: string, ...args: unknown[]) => this.methods.runMethod(name, ...args),
        selectedRowKeys: grid?.selectedRowKeys ?? this.attributes.selectedRowKeys,
        selectedRows: grid?.selectedRows ?? this.attributes.selectedRows,
        selectionModeEnabled: grid?.selectionModeEnabled ?? this.attributes.selectionModeEnabled,
        template: this.attributes.normalizedTemplate
      };

      return sectionContext;
    },

    runMethod(this: any, name: string, ...args: unknown[]): Promise<unknown> {
      const chain = this.attributes.methodChainsRef.current?.[name];

      if (!Array.isArray(chain) || !chain.length) {
        throw new Error(`Base section method "${name}" is not registered.`);
      }

      return this.methods.runMethodAt(name, chain.length - 1, this.methods.createSectionContext(), args);
    },

    createRecordContext(this: any, row: any, rowIndex?: number, grid: any = null): Record<string, unknown> {
      const baseContext = this.methods.createSectionContext(grid);
      const draftContext = {
        ...baseContext,
        primaryValue: null,
        row,
        rowIndex
      };
      const primaryValue =
        this.attributes.getRowPrimaryValue?.(row, draftContext) ??
        (typeof rowIndex === "number" ? this.attributes.getRowKey?.(row, rowIndex) : undefined) ??
        this.methods.readDefaultPrimaryValue(row, baseContext.entity);

      return {
        ...draftContext,
        primaryValue: typeof primaryValue === "string" || typeof primaryValue === "number" ? primaryValue : null
      };
    },

    createRecordsContext(this: any, rows: readonly any[] = [], grid: any = null): Record<string, unknown> {
      const primaryValues = rows
        .map((row, rowIndex) => this.methods.createRecordContext(row, rowIndex, grid).primaryValue)
        .filter((value) => typeof value === "string" || typeof value === "number");

      return {
        ...this.methods.createSectionContext(grid),
        primaryValues,
        rows
      };
    },

    refreshSection(this: any): void {
      this.attributes.setRefreshVersion((value: number) => value + 1);
    },

    async handleOpenCreatePage(this: any): Promise<void> {
      await this.attributes.onOpenCreatePage?.(this.methods.createSectionContext());
    },

    async handleOpenEditPage(this: any, row: any, rowIndex?: number): Promise<void> {
      await this.attributes.onOpenEditPage?.(this.methods.createRecordContext(row, rowIndex));
    },

    async handleOpenDeletePage(this: any, row: any, rowIndex?: number): Promise<void> {
      await this.attributes.onOpenDeletePage?.(this.methods.createRecordContext(row, rowIndex));
    },

    async handleDeleteRecord(this: any, row: any, rowIndex?: number): Promise<void> {
      const context = this.methods.createRecordContext(row, rowIndex);

      if (context.primaryValue === null && !this.attributes.onDeleteRecord) {
        return;
      }

      const confirmed = await this.methods.resolveDeleteConfirmation(
        this.attributes.confirmDelete,
        this.attributes.confirmDeleteRecord ? () => this.attributes.confirmDeleteRecord(context) : undefined,
        this.attributes.labels.deleteRecordConfirm
      );

      if (!confirmed) {
        return;
      }

      this.attributes.setActionError(null);
      this.attributes.setActionLoading(true);

      try {
        if (this.attributes.onDeleteRecord) {
          await this.attributes.onDeleteRecord(context);
        } else if (this.attributes.gridProps.client && context.entity?.tableName && context.primaryValue !== null) {
          await this.attributes.gridProps.client.deleteById(
            context.entity.tableName,
            context.primaryValue,
            context.entity.primaryColumn
          );
        }

        this.methods.refreshSection();
      } catch (error) {
        this.attributes.setActionError(this.attributes.labels.deleteRecordError);
        throw error;
      } finally {
        this.attributes.setActionLoading(false);
      }
    },

    async handleOpenDeleteManyPage(this: any, rows?: readonly any[]): Promise<void> {
      const selectedRows = rows ?? this.attributes.selectedRows;

      if (!selectedRows.length) {
        return;
      }

      await this.attributes.onOpenDeleteManyPage?.(this.methods.createRecordsContext(selectedRows));
    },

    async handleDeleteSelectedRecords(this: any, rows?: readonly any[]): Promise<void> {
      const selectedRows = rows ?? this.attributes.selectedRows;

      if (!selectedRows.length) {
        return;
      }

      const context = this.methods.createRecordsContext(selectedRows);

      if (!context.primaryValues.length && !this.attributes.onDeleteRecords) {
        return;
      }

      const confirmed = await this.methods.resolveDeleteConfirmation(
        this.attributes.confirmDelete,
        this.attributes.confirmDeleteRecords ? () => this.attributes.confirmDeleteRecords(context) : undefined,
        this.attributes.labels.deleteSelectedRecordsConfirm
      );

      if (!confirmed) {
        return;
      }

      this.attributes.setActionError(null);
      this.attributes.setActionLoading(true);

      try {
        if (this.attributes.onDeleteRecords) {
          await this.attributes.onDeleteRecords(context);
        } else if (this.attributes.gridProps.client && context.entity?.tableName) {
          await Promise.all(
            context.primaryValues.map((primaryValue: string | number) =>
              this.attributes.gridProps.client.deleteById(
                context.entity.tableName,
                primaryValue,
                context.entity.primaryColumn
              )
            )
          );
        }

        this.attributes.gridRef.current?.clearSelection?.();
        this.methods.refreshSection();
      } catch (error) {
        this.attributes.setActionError(this.attributes.labels.deleteSelectedRecordsError);
        throw error;
      } finally {
        this.attributes.setActionLoading(false);
      }
    },

    areSelectionContextsEqual(this: any, current: any, next: any): boolean {
      const currentKeys = Array.isArray(current?.selectedRowKeys) ? current.selectedRowKeys : [];
      const nextKeys = Array.isArray(next?.selectedRowKeys) ? next.selectedRowKeys : [];

      if (currentKeys.length !== nextKeys.length) {
        return false;
      }

      if (currentKeys.some((key: unknown, index: number) => key !== nextKeys[index])) {
        return false;
      }

      const currentRows = Array.isArray(current?.selectedRows) ? current.selectedRows : [];
      const nextRows = Array.isArray(next?.selectedRows) ? next.selectedRows : [];

      if (currentRows.length !== nextRows.length) {
        return false;
      }

      if (currentRows.some((row: unknown, index: number) => row !== nextRows[index])) {
        return false;
      }

      return Boolean(current?.selectionModeEnabled) === Boolean(next?.selectionModeEnabled);
    },

    handleSelectionChange(this: any, context: any): void {
      const nextSelection = {
        selectedRowKeys: context?.selectedRowKeys ?? [],
        selectedRows: context?.selectedRows ?? [],
        selectionModeEnabled: Boolean(context?.selectionModeEnabled)
      };
      const selectionChanged = !this.methods.areSelectionContextsEqual(this.attributes.selection, nextSelection);

      this.attributes.setSelection((currentSelection: any) =>
        this.methods.areSelectionContextsEqual(currentSelection, nextSelection) ? currentSelection : nextSelection
      );

      if (selectionChanged) {
        this.attributes.onSelectionChange?.(context);
      }
    },

    handleRowClick(this: any, row: any, rowIndex?: number): void {
      this.attributes.onRowClick?.(row, rowIndex);
    },

    handleRowDoubleClick(this: any, row: any, rowIndex?: number): void {
      this.attributes.onRowDoubleClick?.(row, rowIndex);
      void this.methods.handleOpenEditPage(row, rowIndex);
    },

    wrapToolbarFactory(
      this: any,
      factory?: (context: any) => readonly unknown[],
      before?: (context: any) => readonly unknown[],
      after?: (context: any) => readonly unknown[]
    ): ((gridContext: any) => readonly unknown[]) | undefined {
      if (!factory && !before && !after) {
        return undefined;
      }

      return (gridContext: any) => {
        const context = this.methods.createSectionContext(gridContext);
        return [
          ...(before?.(context) ?? []),
          ...(factory?.(context) ?? []),
          ...(after?.(context) ?? [])
        ];
      };
    },

    createDefaultAddButtons(this: any, context: any): readonly unknown[] {
      const buttons: unknown[] = [];

      if (this.attributes.onOpenCreatePage) {
        buttons.push(
          this.renderDiff(
            [
              {
                component: "Titanic.UI.Button",
                key: "records-section-create",
                props: {
                  onClick: {
                    call: "createToolbarAction",
                    args: ["openCreate", context]
                  },
                  type: "button",
                  variant: "primary"
                },
                children: [{ text: { attr: "labels.createRecord" } }]
              }
            ],
            { toolbarContext: context }
          )
        );
      }

      buttons.push(...(this.attributes.createAddButtons?.(context) ?? []));
      return buttons;
    },

    createDefaultRightButtons(this: any, context: any): readonly unknown[] {
      if (
        !this.attributes.canDeleteSelectedRecords ||
        !context.selectionModeEnabled ||
        !context.selectedRows?.length
      ) {
        return [];
      }

      return [
        this.renderDiff(
          [
            {
              component: "Titanic.UI.Button",
              key: "records-section-delete-selected",
              props: {
                disabled: { attr: "actionLoading" },
                onClick: {
                  call: "createToolbarAction",
                  args: ["deleteSelected", context]
                },
                type: "button",
                variant: "danger"
              },
              children: [{ text: { attr: "labels.deleteSelectedRecords" } }]
            }
          ],
          { toolbarContext: context }
        )
      ];
    },

    createToolbarAction(this: any, action: string, context: any): () => void {
      return () => {
        if (action === "openCreate") {
          void this.attributes.onOpenCreatePage?.(context);
          return;
        }

        if (action === "deleteSelected") {
          void (
            this.attributes.onOpenDeleteManyPage
              ? this.attributes.onOpenDeleteManyPage(this.methods.createRecordsContext(context.selectedRows, context.grid))
              : this.methods.handleDeleteSelectedRecords(context.selectedRows)
          );
        }
      };
    },

    createEffectiveRowActions(this: any): readonly unknown[] {
      const actions: any[] = [];

      if (this.attributes.onOpenEditPage) {
        actions.push({
          key: "open",
          label: this.attributes.labelsProp?.openRecord ?? "Open",
          onClick: async (context: any) => {
            await this.methods.handleOpenEditPage(context.row, context.rowIndex);
            context.closeMenu?.();
          }
        });
      }

      if (this.attributes.canDeleteRecords) {
        actions.push({
          danger: true,
          disabled: this.attributes.actionLoading,
          key: "delete",
          label: this.attributes.labelsProp?.deleteRecord ?? "Delete",
          onClick: async (context: any) => {
            if (this.attributes.onOpenDeletePage) {
              await this.methods.handleOpenDeletePage(context.row, context.rowIndex);
            } else {
              await this.methods.handleDeleteRecord(context.row, context.rowIndex);
            }

            context.closeMenu?.();
          }
        });
      }

      return this.methods.mergeRowActions(actions, this.attributes.rowActions);
    },

    createHandle(this: any): Record<string, unknown> {
      return {
        clearSelection: () => this.attributes.gridRef.current?.clearSelection?.(),
        deleteRecord: (row: any) => this.methods.handleDeleteRecord(row),
        deleteSelectedRecords: (rows?: readonly any[]) => this.methods.handleDeleteSelectedRecords(rows),
        disableMultiSelect: () => this.attributes.gridRef.current?.disableMultiSelect?.(),
        enableMultiSelect: () => this.attributes.gridRef.current?.enableMultiSelect?.(),
        getSelectedRowKeys: () => this.attributes.gridRef.current?.getSelectedRowKeys?.() ?? [],
        getSelectedRows: () => this.attributes.gridRef.current?.getSelectedRows?.() ?? [],
        openCreatePage: () => this.methods.handleOpenCreatePage(),
        openDeleteManyPage: (rows?: readonly any[]) => this.methods.handleOpenDeleteManyPage(rows),
        openDeletePage: (row: any) => this.methods.handleOpenDeletePage(row),
        openEditPage: (row: any) => this.methods.handleOpenEditPage(row),
        refresh: () => this.methods.refreshSection(),
        runMethod: (name: string, ...args: unknown[]) => this.methods.runMethod(name, ...args)
      };
    },

    renderSelectedRecordsLabel(this: any): unknown {
      const label = this.attributes.labels.selectedRecords;
      const count = this.attributes.selectedRows.length;

      return typeof label === "function" ? label(count) : `Selected: ${count}`;
    },

    renderBottomStatus(this: any): unknown {
      return this.renderDiff([
        {
          tag: "span",
          when: { attr: "hasSelectedRecords" },
          props: { className: "titanic-records-section__status" },
          children: [{ text: { call: "renderSelectedRecordsLabel" } }]
        },
        {
          tag: "span",
          when: { attr: "actionError" },
          props: { className: "titanic-records-section__error" },
          children: [{ text: { attr: "actionError" } }]
        },
        { text: { attr: "bottom" } }
      ]);
    },

    renderCustomTopContainer(this: any): unknown {
      return this.attributes.renderTopContainer?.(this.attributes.top, this.attributes.sectionContext) ?? null;
    },

    renderCustomBottomContainer(this: any): unknown {
      return this.attributes.renderBottomContainer?.(
        this.attributes.bottomStatusContent,
        this.attributes.sectionContext
      ) ?? null;
    }
  },
  diff: [
    {
      component: "Titanic.UI.EntityContainer",
      props: {
        className: { attr: "rootClassName" }
      },
      children: [
        {
          call: "renderCustomTopContainer",
          when: { attr: "renderTopContainer" }
        },
        {
          component: "Titanic.UI.EntityContainer",
          unless: { attr: "renderTopContainer" },
          props: {
            className: "titanic-records-section__top"
          },
          children: [{ text: { attr: "top" } }]
        },
        {
          component: "Titanic.UI.EntityDataGrid",
          props: {
            $spread: { attr: "gridProps" },
            className: { attr: "resolvedGridClassName" },
            createToolbarCenterItems: {
              call: "wrapToolbarFactory",
              args: [{ attr: "createToolbarCenterItems" }]
            },
            createToolbarLeftItems: {
              call: "wrapToolbarFactory",
              args: [{ attr: "createToolbarLeftItems" }, { method: "createDefaultAddButtons" }]
            },
            createToolbarRightItems: {
              call: "wrapToolbarFactory",
              args: [
                { attr: "createToolbarRightItems" },
                { literal: undefined },
                { method: "createDefaultRightButtons" }
              ]
            },
            getRowKey: { attr: "getRowKey" },
            labels: { attr: "labelsProp" },
            onRowClick: { method: "handleRowClick" },
            onRowDoubleClick: { method: "handleRowDoubleClick" },
            onSelectionChange: { method: "handleSelectionChange" },
            ref: { attr: "gridRef" },
            refreshKey: { attr: "resolvedRefreshKey" },
            rowActions: { attr: "effectiveRowActions" }
          }
        },
        {
          call: "renderCustomBottomContainer",
          when: { attr: "renderBottomContainer" }
        },
        {
          component: "Titanic.UI.EntityContainer",
          unless: { attr: "renderBottomContainer" },
          props: {
            className: "titanic-records-section__bottom"
          },
          children: [{ text: { attr: "bottomStatusContent" } }]
        }
      ]
    }
  ]
});
