Titanic.define("Titanic.UI.BaseEntityPage", {
  attributes: {
    template: {},
    value: {},
    displayValues: {},
    recordId: {},
    loadRecord: { default: true },
    clientName: {},
    disabled: { default: false },
    className: { default: "" },
    top: {},
    bottom: {},
    submitLabel: {},
    manualCommitDelayMs: {},
    onChange: {},
    onSubmit: {},
    loadedRecord: { state: true, default: null },
    loadedRecordRef: { ref: true, default: null },
    loadedRecordKeyRef: { ref: true, default: null },
    recordLoadRequestRef: { ref: true, default: 0 },
    apiClient: {
      value(this: any): any {
        return this.methods.useOptionalEntityApiClient(this.attributes.clientName);
      }
    },
    pageMethods: {
      memo(this: any): Record<string, unknown> {
        return {
          destroy: (context: any) => this.methods.destroy(context),
          init: (context: any) => this.methods.init(context),
          loadEntity: (context: any, nextRecordId?: unknown) => this.methods.loadEntity(context, nextRecordId)
        };
      },
      deps: { array: [] }
    },
    mergedValue: {
      memo(this: any): any {
        return this.methods.mergeEntityValues(this.attributes.loadedRecord?.values, this.attributes.value);
      },
      deps: { array: [{ attr: "loadedRecord" }, { attr: "value" }] }
    },
    mergedDisplayValues: {
      memo(this: any): any {
        return this.methods.mergeEntityDisplayValues(
          this.attributes.loadedRecord?.displayValues,
          this.attributes.displayValues
        );
      },
      deps: { array: [{ attr: "displayValues" }, { attr: "loadedRecord" }] }
    },
    pageController: {
      value(this: any): any {
        return this.methods.useEntityEditPageController({
          template: this.attributes.template,
          value: this.attributes.mergedValue,
          displayValues: this.attributes.mergedDisplayValues,
          disabled: this.attributes.disabled,
          methods: this.attributes.pageMethods,
          onChange: this.attributes.onChange,
          onSubmit: this.attributes.onSubmit
        });
      }
    },
    normalizedTemplate: {
      value(this: any): any {
        return this.attributes.pageController.normalizedTemplate;
      }
    },
    context: {
      value(this: any): any {
        return this.attributes.pageController.context;
      }
    },
    submit: {
      value(this: any): any {
        return this.attributes.pageController.submit;
      }
    },
    effectiveRecordId: {
      value(this: any): unknown {
        return this.methods.getRecordId(
          this.attributes.recordId,
          this.attributes.value,
          this.attributes.normalizedTemplate.schema.primaryColumn
        );
      }
    },
    recordLoadKey: {
      value(this: any): string {
        return this.attributes.loadRecord && !this.methods.isEmptyRecordId(this.attributes.effectiveRecordId)
          ? this.methods.createRecordLoadKey(this.attributes.normalizedTemplate.schema, this.attributes.effectiveRecordId)
          : "";
      }
    },
    initLifecycle: {
      deps: {
        array: [
          { attr: "apiClient" },
          { attr: "context.runMethod" },
          { attr: "loadRecord" },
          { attr: "recordLoadKey" }
        ]
      },
      effect(this: any): () => void {
        let cancelled = false;

        void this.attributes.context.runMethod("init")
          .catch(() => {
            if (!cancelled) {
              this.attributes.loadedRecordKeyRef.current = null;
              if (this.attributes.loadedRecordRef.current !== null || this.attributes.loadedRecord !== null) {
                this.methods.setLoadedEntityRecord(null);
              }
            }
          });

        return () => {
          cancelled = true;
          void this.attributes.context.runMethod("destroy").catch(() => undefined);
        };
      }
    },
    diffItems: {
      value(this: any): readonly any[] {
        return Array.isArray(this.attributes.normalizedTemplate.diff)
          ? this.attributes.normalizedTemplate.diff
          : [];
      }
    },
    hasActions: {
      value(this: any): boolean {
        return this.methods.hasActionsDiffItem(this.attributes.diffItems);
      }
    },
    resolvedSubmitLabel: {
      value(this: any): string {
        return this.attributes.submitLabel ?? this.attributes.normalizedTemplate.submitLabel ?? "Save";
      }
    },
    topContent: {
      value(this: any): unknown {
        return this.attributes.top
          ? this.methods.resolveRenderValue(this.attributes.top, this.attributes.context)
          : null;
      }
    },
    bottomContent: {
      value(this: any): unknown {
        return this.attributes.bottom
          ? this.methods.resolveRenderValue(this.attributes.bottom, this.attributes.context)
          : null;
      }
    },
    defaultActionsContent: {
      value(this: any): unknown {
        if (this.attributes.hasActions || !this.attributes.onSubmit) {
          return null;
        }

        return this.renderDiff([
          {
            component: "Titanic.UI.EntityContainer",
            props: {
              className: "titanic-edit-page__actions"
            },
            children: [
              {
                component: "Titanic.UI.Button",
                props: {
                  disabled: { attr: "disabled" },
                  type: "submit"
                },
                children: [
                  {
                    text: { attr: "resolvedSubmitLabel" }
                  }
                ]
              }
            ]
          }
        ]);
      }
    },
    hasTopContent: {
      value(this: any): boolean {
        return Boolean(this.attributes.normalizedTemplate.title || this.attributes.topContent);
      }
    },
    hasBottomContent: {
      value(this: any): boolean {
        return Boolean(this.attributes.bottomContent || this.attributes.defaultActionsContent);
      }
    },
    rootClassName: {
      value(this: any): string {
        return this.methods.joinClassNames(
          "titanic-base-entity-page",
          "titanic-edit-page",
          this.attributes.className
        );
      }
    }
  },
  methods: {
    useOptionalEntityApiClient(this: any, clientName?: string): any {
      const hook = (Titanic as any).EntityReact?.useOptionalEntityApiClient;

      return typeof hook === "function" ? hook(clientName) : null;
    },

    useEntityEditPageController(this: any, options: any): any {
      const hook = (Titanic as any).EntityReact?.useEntityEditPageController;

      if (typeof hook !== "function") {
        throw new Error("Titanic.EntityReact.useEntityEditPageController is not registered.");
      }

      return hook(options);
    },

    setLoadedEntityRecord(this: any, nextRecord: any): void {
      this.attributes.loadedRecordRef.current = nextRecord;
      this.attributes.setLoadedRecord(nextRecord);
    },

    clearLoadedEntityRecord(this: any): void {
      this.attributes.recordLoadRequestRef.current += 1;
      this.attributes.loadedRecordKeyRef.current = null;
      if (this.attributes.loadedRecordRef.current !== null || this.attributes.loadedRecord !== null) {
        this.methods.setLoadedEntityRecord(null);
      }
    },

    async loadEntity(this: any, context: any, nextRecordId?: unknown): Promise<any> {
      const nextEffectiveRecordId = this.methods.getRecordId(
        nextRecordId,
        context.values,
        context.schema.primaryColumn
      );

      if (this.methods.isEmptyRecordId(nextEffectiveRecordId)) {
        this.methods.clearLoadedEntityRecord();
        return null;
      }

      if (!this.attributes.apiClient) {
        return null;
      }

      const entityCore = (Titanic as any).EntityCore;
      const loadKey = this.methods.createRecordLoadKey(context.schema, nextEffectiveRecordId);
      const requestId = this.attributes.recordLoadRequestRef.current + 1;
      this.attributes.recordLoadRequestRef.current = requestId;
      this.attributes.loadedRecordKeyRef.current = loadKey;

      try {
        const rows = await this.attributes.apiClient.select(
          entityCore.createEntityRecordQuery(context.schema, nextEffectiveRecordId)
        );

        if (this.attributes.recordLoadRequestRef.current !== requestId) {
          return this.attributes.loadedRecordRef.current;
        }

        const row = rows[0];
        const nextLoadedRecord = row
          ? {
            values: entityCore.toEntityValues(row),
            displayValues: entityCore.toEntityDisplayValues(row)
          }
          : null;

        this.methods.setLoadedEntityRecord(nextLoadedRecord);
        return nextLoadedRecord;
      } catch (error) {
        if (this.attributes.recordLoadRequestRef.current === requestId) {
          this.attributes.loadedRecordKeyRef.current = null;
          this.methods.setLoadedEntityRecord(null);
        }

        throw error;
      }
    },

    init(this: any, context: any): unknown {
      if (!this.attributes.loadRecord) {
        this.methods.clearLoadedEntityRecord();
        return null;
      }

      const nextEffectiveRecordId = this.methods.getRecordId(
        this.attributes.recordId,
        context.values,
        context.schema.primaryColumn
      );

      if (this.methods.isEmptyRecordId(nextEffectiveRecordId)) {
        this.methods.clearLoadedEntityRecord();
        return null;
      }

      const loadKey = this.methods.createRecordLoadKey(context.schema, nextEffectiveRecordId);
      if (this.attributes.loadedRecordKeyRef.current === loadKey) {
        return this.attributes.loadedRecordRef.current;
      }

      return context.runMethod("loadEntity", nextEffectiveRecordId);
    },

    destroy(this: any): null {
      this.attributes.recordLoadRequestRef.current += 1;
      this.attributes.loadedRecordKeyRef.current = null;
      this.attributes.loadedRecordRef.current = null;
      return null;
    },

    async handleSubmit(this: any, event: any): Promise<void> {
      event.preventDefault();
      await this.attributes.submit();
    },

    renderDiffItem(this: any, item: any, index: number): unknown {
      if (!this.methods.resolvePredicate(item.visible, this.attributes.context, true)) {
        return null;
      }

      const key = item.name ?? `${item.type}-${index}`;
      const style = this.methods.getGridSpanStyle(item.gridSpan);

      switch (item.type) {
        case "field":
          return this.methods.renderField(item, key);
        case "section":
          return this.renderDiff([
            {
              component: "Titanic.UI.EntityContainer",
              key,
              props: {
                className: this.methods.joinClassNames("titanic-edit-page__section", item.className),
                style
              },
              children: [
                item.title
                  ? {
                    component: "Titanic.UI.EntityLabel",
                    props: {
                      as: "h3",
                      value: this.methods.resolveRenderValue(item.title, this.attributes.context)
                    }
                  }
                  : null,
                {
                  component: "Titanic.UI.EntityGrid",
                  props: {
                    columns: item.columns,
                    gap: item.gap
                  },
                  children: [
                    {
                      call: "renderAttributeFields",
                      args: [item.attributes]
                    },
                    {
                      each: item.items ?? [],
                      as: "child",
                      indexAs: "childIndex",
                      diff: [
                        {
                          call: "renderDiffItem",
                          args: [{ local: "child" }, { local: "childIndex" }]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]);
        case "row":
          return this.renderDiff([
            {
              component: "Titanic.UI.EntityContainer",
              key,
              props: {
                className: this.methods.joinClassNames("titanic-edit-page__row", item.className),
                style
              },
              children: [
                {
                  component: "Titanic.UI.EntityGrid",
                  props: {
                    columns: item.columns,
                    gap: item.gap
                  },
                  children: [
                    {
                      call: "renderAttributeFields",
                      args: [item.attributes]
                    },
                    {
                      each: item.items ?? [],
                      as: "child",
                      indexAs: "childIndex",
                      diff: [
                        {
                          call: "renderDiffItem",
                          args: [{ local: "child" }, { local: "childIndex" }]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]);
        case "text":
          return this.renderDiff([
            {
              component: "Titanic.UI.EntityContainer",
              key,
              props: {
                className: this.methods.joinClassNames("titanic-edit-page__text", item.className),
                style
              },
              children: [
                {
                  text: this.methods.resolveRenderValue(item.text, this.attributes.context)
                }
              ]
            }
          ]);
        case "actions":
          return this.methods.renderActions(item, key, style);
        case "custom":
          return this.renderDiff([
            {
              component: "Titanic.UI.EntityContainer",
              key,
              props: {
                className: this.methods.joinClassNames("titanic-edit-page__custom", item.className),
                style
              },
              children: [
                {
                  text: item.render(this.attributes.context)
                }
              ]
            }
          ]);
        default:
          return null;
      }
    },

    renderAttributeFields(this: any, attributes: string[] | undefined): unknown[] {
      return (attributes ?? []).map((attribute, index) =>
        this.methods.renderField({ type: "field", attribute }, `attribute-${attribute}-${index}`)
      );
    },

    renderField(this: any, item: any, key: string): unknown {
      const column = this.attributes.context.template.columnsByAttribute[item.attribute];
      if (!column) {
        return null;
      }

      return this.renderDiff([
        {
          component: "Titanic.UI.EntityField",
          key,
          props: {
            className: item.className,
            column: {
              ...column,
              gridSpan: item.gridSpan ?? column.gridSpan
            },
            disabled: this.attributes.context.disabled || this.methods.resolvePredicate(
              item.disabled,
              this.attributes.context,
              false
            ),
            displayValues: this.attributes.context.displayValues,
            manualCommitDelayMs: this.attributes.manualCommitDelayMs,
            onChange: { literal: this.attributes.context.setValue },
            values: this.attributes.context.values
          }
        }
      ]);
    },

    renderActions(this: any, item: any, key: string, style: any): unknown {
      return this.renderDiff([
        {
          component: "Titanic.UI.EntityContainer",
          key,
          props: {
            className: this.methods.joinClassNames("titanic-edit-page__actions", item.className),
            style
          },
          children: [
            {
              each: item.actions,
              as: "action",
              indexAs: "actionIndex",
              diff: [
                {
                  call: "renderAction",
                  args: [{ local: "action" }, { local: "actionIndex" }]
                }
              ]
            }
          ]
        }
      ]);
    },

    renderAction(this: any, action: any, index: number): unknown {
      const key = action.name ?? `action-${index}`;
      const type = action.type ?? "button";
      const isNativeSubmit = type === "submit" && !action.method && !action.onClick;

      return this.renderDiff([
        {
          component: "Titanic.UI.Button",
          key,
          props: {
            className: this.methods.joinClassNames(
              this.methods.getActionVariantClassName(action.variant),
              action.className
            ),
            disabled: this.attributes.context.disabled || this.methods.resolvePredicate(
              action.disabled,
              this.attributes.context,
              false
            ),
            onClick: isNativeSubmit ? undefined : { literal: this.methods.createActionClickHandler(action, type) },
            type: isNativeSubmit ? "submit" : "button"
          },
          children: [
            {
              text: this.methods.resolveRenderValue(action.label, this.attributes.context)
            }
          ]
        }
      ]);
    },

    createActionClickHandler(this: any, action: any, type: string): () => void {
      return () => {
        void this.methods.runAction(action, type);
      };
    },

    async runAction(this: any, action: any, type: string): Promise<void> {
      if (action.onClick) {
        await action.onClick.call(
          this.methods.createActionMethodThis(action, this.attributes.context),
          this.attributes.context,
          ...(action.args ?? [])
        );
        return;
      }

      if (action.method) {
        await this.attributes.context.runMethod(action.method, ...(action.args ?? []));
        return;
      }

      if (type === "submit") {
        await this.attributes.context.submit();
        return;
      }

      if (type === "reset") {
        this.attributes.context.reset();
      }
    },

    hasActionsDiffItem(this: any, diff: readonly any[]): boolean {
      return diff.some((item) => {
        if (item.type === "actions") {
          return true;
        }

        return (item.type === "section" || item.type === "row") &&
          this.methods.hasActionsDiffItem(item.items ?? []);
      });
    },

    createActionMethodThis(this: any, action: any, context: any): any {
      return {
        ...context,
        context,
        callParent: () => {
          throw new Error(
            `Entity edit page action "${action.name ?? "anonymous"}" does not have a parent implementation.`
          );
        }
      };
    },

    mergeEntityValues(this: any, loadedValues: any, value: any): any {
      if (!loadedValues) {
        return value;
      }

      return {
        ...loadedValues,
        ...value
      };
    },

    mergeEntityDisplayValues(this: any, loadedDisplayValues: any, displayValues: any): any {
      if (!loadedDisplayValues) {
        return displayValues;
      }

      return {
        ...loadedDisplayValues,
        ...displayValues
      };
    },

    getRecordId(this: any, recordId: unknown, value: any, primaryColumn: string | undefined): unknown {
      if (!this.methods.isEmptyRecordId(recordId)) {
        return recordId;
      }

      return value?.[primaryColumn ?? "Id"];
    },

    isEmptyRecordId(this: any, value: unknown): boolean {
      return value === null || value === undefined || value === "";
    },

    createRecordLoadKey(this: any, schema: any, recordId: unknown): string {
      const columnsKey = schema.columns
        .map((column: any) => `${column.path}:${column.alias ?? ""}`)
        .join("|");

      return `${schema.tableName}:${schema.primaryColumn ?? "Id"}:${String(recordId)}:${columnsKey}`;
    },

    resolveRenderValue(this: any, value: any, context: any): any {
      return typeof value === "function" ? value(context) : value;
    },

    resolvePredicate(this: any, predicate: any, context: any, defaultValue: boolean): boolean {
      if (predicate === undefined) {
        return defaultValue;
      }

      return typeof predicate === "function" ? predicate(context) : predicate;
    },

    getGridSpanStyle(this: any, gridSpan?: number): Record<string, unknown> | undefined {
      return gridSpan ? { "--titanic-grid-span": gridSpan } : undefined;
    },

    getActionVariantClassName(this: any, variant: string | undefined): string {
      return variant ? `titanic-edit-page__button_${variant}` : "";
    },

    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    }
  },
  diff: [
    {
      tag: "form",
      props: {
        className: { attr: "rootClassName" },
        onSubmit: { method: "handleSubmit" }
      },
      children: [
        {
          component: "Titanic.UI.EntityContainer",
          when: { attr: "hasTopContent" },
          props: {
            className: "titanic-edit-page__top"
          },
          children: [
            {
              component: "Titanic.UI.EntityLabel",
              when: { attr: "normalizedTemplate.title" },
              props: {
                as: "h2",
                className: "titanic-edit-page__title",
                value: { attr: "normalizedTemplate.title" }
              }
            },
            {
              text: { attr: "topContent" }
            }
          ]
        },
        {
          component: "Titanic.UI.EntityGrid",
          props: {
            className: "titanic-edit-page__grid"
          },
          children: [
            {
              each: { attr: "diffItems" },
              as: "item",
              indexAs: "index",
              diff: [
                {
                  call: "renderDiffItem",
                  args: [{ local: "item" }, { local: "index" }]
                }
              ]
            }
          ]
        },
        {
          component: "Titanic.UI.EntityContainer",
          when: { attr: "hasBottomContent" },
          props: {
            className: "titanic-edit-page__bottom"
          },
          children: [
            {
              text: { attr: "bottomContent" }
            },
            {
              text: { attr: "defaultActionsContent" }
            }
          ]
        }
      ]
    }
  ]
});
