Titanic.define("Titanic.UI.LookupInput", {
  attributes: {
    id: {},
    name: {},
    value: { default: null },
    displayValue: { default: "" },
    items: { default: [] },
    mode: { default: "enum" },
    disabled: { default: false },
    emptyText: { default: "Not selected" },
    noResultsText: { default: "No results" },
    loadingText: { default: "Loading..." },
    loadingMoreText: { default: "Loading..." },
    errorText: { default: "Failed to load values" },
    className: {},
    inputClassName: {},
    editable: { default: true },
    renderFrame: { default: true },
    loading: { default: false },
    loadingMore: { default: false },
    hasMore: { default: false },
    error: { default: null },
    searchDelayMs: { default: 1500 },
    minSearchLength: { default: 3 },
    getId: {},
    getLabel: {},
    required: { default: false },
    title: {},
    validationError: {},
    visible: { default: true },
    onChange: {},
    onOpen: {},
    onSearchChange: {},
    onLoadMore: {},
    fallbackId: { id: true },
    rootRef: { ref: true, default: null },
    modalRef: { ref: true, default: null },
    loadMorePendingRef: { ref: true, default: false },
    searchTimerRef: { ref: true, default: null },
    searchRequestIdRef: { ref: true, default: 0 },
    suggestionsOpen: { state: true, default: false },
    modalOpen: { state: true, default: false },
    searchPending: { state: true, default: false },
    resolvedId: {
      value(this: any): string {
        return this.attributes.id ?? this.attributes.fallbackId;
      }
    },
    resolvedName: {
      value(this: any): string {
        return this.attributes.name ?? this.attributes.id ?? String(this.attributes.fallbackId).replace(/:/g, "");
      }
    },
    readOnly: {
      value(this: any): boolean {
        return Boolean(this.attributes.disabled) || !this.attributes.editable;
      }
    },
    resolvedSearchDelayMs: {
      value(this: any): number {
        return this.methods.normalizeLookupSearchDelayMs(this.attributes.searchDelayMs);
      }
    },
    resolvedMinSearchLength: {
      value(this: any): number {
        return this.methods.normalizeLookupMinSearchLength(this.attributes.minSearchLength);
      }
    },
    errorId: {
      value(this: any): string | undefined {
        return this.attributes.validationError ? `${this.attributes.resolvedId}-error` : undefined;
      }
    },
    validationControlProps: {
      value(this: any): Record<string, unknown> {
        return this.methods.getValidationControlProps(this.attributes.resolvedId, this.attributes.validationError);
      }
    },
    normalizedValue: {
      value(this: any): string {
        return this.methods.normalizeLookupValue(this.attributes.value);
      }
    },
    normalizedItems: {
      deps: { array: [{ attr: "items" }, { attr: "getId" }, { attr: "getLabel" }] },
      memo(this: any): readonly any[] {
        const items = Array.isArray(this.attributes.items) ? this.attributes.items : [];

        return items.map((item: any) => {
          const itemValue = this.methods.getItemId(item);
          const label = this.methods.getItemLabel(item);

          return {
            item,
            label,
            normalizedValue: this.methods.normalizeLookupValue(itemValue),
            searchValue: this.methods.createLookupSearchValue(label, itemValue),
            value: itemValue
          };
        });
      }
    },
    selectedOption: {
      value(this: any): any {
        return this.attributes.normalizedItems.find((item: any) => item.normalizedValue === this.attributes.normalizedValue);
      }
    },
    selectedLabel: {
      value(this: any): string {
        return this.attributes.selectedOption?.label
          ?? this.attributes.displayValue
          ?? (this.attributes.normalizedValue ? this.attributes.normalizedValue : "");
      }
    },
    draft: {
      state: true,
      default(this: any): string {
        return this.attributes.selectedLabel;
      }
    },
    optionSearchText: {
      value(this: any): string {
        return this.attributes.draft === this.attributes.selectedLabel ? "" : this.attributes.draft;
      }
    },
    visibleItems: {
      deps: { array: [{ attr: "normalizedItems" }, { attr: "optionSearchText" }, { attr: "searchPending" }] },
      memo(this: any): readonly any[] {
        const normalizedSearchText = this.methods.normalizeLookupSearchText(this.attributes.optionSearchText);

        if (!normalizedSearchText || this.attributes.searchPending) {
          return this.attributes.normalizedItems;
        }

        return this.attributes.normalizedItems.filter((item: any) => item.searchValue.includes(normalizedSearchText));
      }
    },
    rootClasses: {
      value(this: any): string {
        return this.methods.joinClassNames(
          "titanic-lookup",
          "titanic-field__control",
          "titanic-lookup_framed",
          this.attributes.readOnly ? "titanic-lookup_disabled" : undefined,
          this.attributes.className
        );
      }
    },
    controlClasses: {
      value(this: any): string {
        return this.methods.joinClassNames(
          "titanic-lookup__control",
          "titanic-lookup__control_embedded",
          this.attributes.readOnly ? "titanic-lookup__control_disabled" : undefined
        );
      }
    },
    inputClasses: {
      value(this: any): string {
        return this.methods.joinClassNames("titanic-lookup__input", this.attributes.inputClassName);
      }
    },
    actionAriaExpanded: {
      value(this: any): boolean {
        return this.attributes.mode === "lookup" ? this.attributes.modalOpen : this.attributes.suggestionsOpen;
      }
    },
    actionAriaHasPopup: {
      value(this: any): string {
        return this.attributes.mode === "lookup" ? "dialog" : "listbox";
      }
    },
    actionAriaLabel: {
      value(this: any): string {
        return this.attributes.mode === "lookup" ? "Open search" : "Open list";
      }
    },
    actionIconClass: {
      value(this: any): string {
        return this.attributes.mode === "lookup" ? "titanic-lookup__search-icon" : "titanic-lookup__chevron";
      }
    },
    ariaBusy: {
      value(this: any): boolean {
        return Boolean(this.attributes.loading || this.attributes.loadingMore);
      }
    },
    shouldRenderSuggestions: {
      value(this: any): boolean {
        return this.attributes.suggestionsOpen
          && this.methods.canRenderOptionList(
            this.attributes.visibleItems,
            this.attributes.loading,
            this.attributes.loadingMore,
            this.attributes.error
          );
      }
    },
    shouldRenderModalList: {
      value(this: any): boolean {
        return this.methods.canRenderOptionList(
          this.attributes.visibleItems,
          this.attributes.loading,
          this.attributes.loadingMore,
          this.attributes.error
        );
      }
    },
    modalTitleId: {
      value(this: any): string {
        return `${this.attributes.resolvedId}-lookup-title`;
      }
    },
    modalListClasses: {
      value(this: any): string {
        return this.methods.joinClassNames("titanic-lookup__popover", "titanic-lookup__modal-list");
      }
    },
    syncDraftEffect: {
      deps: { array: [{ attr: "modalOpen" }, { attr: "selectedLabel" }, { attr: "suggestionsOpen" }] },
      effect(this: any): void {
        if (!this.attributes.suggestionsOpen && !this.attributes.modalOpen) {
          this.attributes.setDraft(this.attributes.selectedLabel);
        }
      }
    },
    outsidePopoverEffect: {
      deps: { array: [{ attr: "modalOpen" }, { attr: "suggestionsOpen" }] },
      effect(this: any): void | (() => void) {
        if (!this.attributes.suggestionsOpen && !this.attributes.modalOpen) {
          return;
        }

        const handlePointerDown = (event: PointerEvent) => {
          const target = event.target as Node;
          const modal = this.attributes.modalRef.current;
          const root = this.attributes.rootRef.current;

          if (modal?.contains(target) || root?.contains(target)) {
            return;
          }

          this.attributes.setSuggestionsOpen(false);
          this.attributes.setModalOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key !== "Escape") {
            return;
          }

          this.attributes.setSuggestionsOpen(false);
          this.attributes.setModalOpen(false);
        };

        document.addEventListener("pointerdown", handlePointerDown, true);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
          document.removeEventListener("pointerdown", handlePointerDown, true);
          document.removeEventListener("keydown", handleKeyDown);
        };
      }
    },
    loadingMoreEffect: {
      deps: { array: [{ attr: "loadingMore" }] },
      effect(this: any): void {
        if (!this.attributes.loadingMore) {
          this.attributes.loadMorePendingRef.current = false;
        }
      }
    },
    cleanupSearchEffect: {
      deps: { array: [] },
      effect(this: any): () => void {
        return () => {
          this.methods.clearScheduledSearch();
          this.attributes.searchRequestIdRef.current += 1;
        };
      }
    }
  },
  methods: {
    defaultEntityId(this: any, item: any): string | number | null {
      return item?.value ?? item?.id ?? null;
    },

    defaultEntityLabel(this: any, item: any): string {
      const title = item?.displayValue
        || item?.title
        || (item?.value == null ? "" : String(item.value))
        || (item?.id == null ? "" : String(item.id));

      return item?.index == null ? title : `${item.index}. ${title}`;
    },

    getItemId(this: any, item: any): string | number | null {
      return this.attributes.getId ? this.attributes.getId(item) : this.methods.defaultEntityId(item);
    },

    getItemLabel(this: any, item: any): string {
      return this.attributes.getLabel ? this.attributes.getLabel(item) : this.methods.defaultEntityLabel(item);
    },

    getValidationControlProps(this: any, fieldId: string, validationError?: string | null): Record<string, unknown> {
      return validationError
        ? {
            "aria-errormessage": `${fieldId}-error`,
            "aria-invalid": true
          }
        : {};
    },

    normalizeLookupValue(this: any, value: string | number | null): string {
      return value == null ? "" : String(value);
    },

    createLookupSearchValue(this: any, label: string, value: string | number | null): string {
      return this.methods.normalizeLookupSearchText(`${label} ${this.methods.normalizeLookupValue(value)}`);
    },

    normalizeLookupSearchText(this: any, value: string): string {
      return String(value ?? "").trim().toLocaleLowerCase();
    },

    normalizeLookupSearchDelayMs(this: any, value: number): number {
      return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    },

    normalizeLookupMinSearchLength(this: any, value: number): number {
      return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    },

    canRenderOptionList(this: any, items: readonly any[], loading: boolean, loadingMore: boolean, error?: Error | null): boolean {
      return items.length > 0 || loading || loadingMore || Boolean(error);
    },

    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
    },

    getOptionClassName(this: any, option: any): string {
      return this.methods.joinClassNames(
        "titanic-lookup__option",
        option?.normalizedValue === this.attributes.normalizedValue ? "titanic-lookup__option_active" : undefined
      );
    },

    getOptionKey(this: any, option: any, index: number): string {
      return `${option?.normalizedValue ?? "lookup-option"}-${index}`;
    },

    clearScheduledSearch(this: any): void {
      if (this.attributes.searchTimerRef.current == null) {
        return;
      }

      clearTimeout(this.attributes.searchTimerRef.current);
      this.attributes.searchTimerRef.current = null;
    },

    cancelPendingSearch(this: any): void {
      this.methods.clearScheduledSearch();
      this.attributes.searchRequestIdRef.current += 1;
      this.attributes.setSearchPending(false);
    },

    runSearch(this: any, nextValue: string): void {
      this.methods.clearScheduledSearch();

      const requestId = this.attributes.searchRequestIdRef.current + 1;
      this.attributes.searchRequestIdRef.current = requestId;
      this.attributes.setSearchPending(true);

      Promise.resolve(this.attributes.onSearchChange?.(nextValue)).finally(() => {
        if (this.attributes.searchRequestIdRef.current === requestId) {
          this.attributes.setSearchPending(false);
        }
      });
    },

    scheduleSearch(this: any, nextValue: string): boolean {
      const normalizedSearchText = this.methods.normalizeLookupSearchText(nextValue);

      this.methods.clearScheduledSearch();

      if (normalizedSearchText.length < this.attributes.resolvedMinSearchLength) {
        this.attributes.searchRequestIdRef.current += 1;
        this.attributes.setSearchPending(false);
        return false;
      }

      this.attributes.setSearchPending(true);

      if (this.attributes.resolvedSearchDelayMs <= 0) {
        this.methods.runSearch(nextValue);
        return true;
      }

      this.attributes.searchTimerRef.current = setTimeout(
        () => this.methods.runSearch(nextValue),
        this.attributes.resolvedSearchDelayMs
      );
      return true;
    },

    requestOpen(this: any): void {
      if (this.attributes.readOnly) {
        return;
      }

      void this.attributes.onOpen?.();
    },

    openSuggestions(this: any): void {
      if (this.attributes.readOnly) {
        return;
      }

      this.attributes.setSuggestionsOpen(true);
      this.methods.requestOpen();
    },

    openModal(this: any): void {
      if (this.attributes.readOnly) {
        return;
      }

      this.attributes.setSuggestionsOpen(false);
      this.attributes.setModalOpen(true);
      this.methods.requestOpen();
    },

    toggleAction(this: any): void {
      if (this.attributes.mode === "lookup") {
        this.methods.openModal();
        return;
      }

      if (this.attributes.suggestionsOpen) {
        this.attributes.setSuggestionsOpen(false);
        return;
      }

      this.methods.openSuggestions();
    },

    updateSearch(this: any, nextValue: string): void {
      this.attributes.setDraft(nextValue);

      if (this.attributes.readOnly) {
        return;
      }

      const normalizedSearchText = this.methods.normalizeLookupSearchText(nextValue);

      if (!normalizedSearchText) {
        this.methods.cancelPendingSearch();
        this.attributes.setSuggestionsOpen(false);

        if (this.attributes.value != null) {
          this.attributes.onChange?.(null);
        }

        return;
      }

      const searchScheduled = this.methods.scheduleSearch(nextValue);
      this.attributes.setSuggestionsOpen(searchScheduled);
    },

    handleDraftChange(this: any, event: any): void {
      this.methods.updateSearch(event.target.value);
    },

    handleModalSearchChange(this: any, event: any): void {
      const nextValue = event.target.value;
      this.attributes.setDraft(nextValue);
      this.methods.scheduleSearch(nextValue);
    },

    selectOption(this: any, _event: any, option: any): void {
      this.attributes.onChange?.(option?.value ?? null, option?.item);
      this.attributes.setDraft(option?.label ?? "");
      this.attributes.setSuggestionsOpen(false);
      this.attributes.setModalOpen(false);
    },

    handleListScroll(this: any, event: any): void {
      const element = event.currentTarget;
      const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

      if (
        distanceToBottom > 32
        || !this.attributes.hasMore
        || !this.attributes.onLoadMore
        || this.attributes.loading
        || this.attributes.loadingMore
        || this.attributes.loadMorePendingRef.current
      ) {
        return;
      }

      this.attributes.loadMorePendingRef.current = true;
      void this.attributes.onLoadMore?.();
    },

    closeModal(this: any): void {
      this.attributes.setModalOpen(false);
    }
  },
  diff: [
    {
      component: "Titanic.UI.InputFieldFrame",
      when: { and: [{ attr: "visible" }, { attr: "renderFrame" }] },
      props: {
        control: {
          diff: [
            {
              tag: "div",
              props: {
                className: { attr: "rootClasses" },
                ref: { attr: "rootRef" }
              },
              children: [
                {
                  tag: "div",
                  props: {
                    className: { attr: "controlClasses" }
                  },
                  children: [
                    {
                      tag: "input",
                      props: {
                        $spread: { attr: "validationControlProps" },
                        autoComplete: "off",
                        className: { attr: "inputClasses" },
                        disabled: { attr: "readOnly" },
                        id: { attr: "resolvedId" },
                        name: { attr: "resolvedName" },
                        required: { attr: "required" },
                        type: "text",
                        value: { attr: "draft" },
                        onChange: { method: "handleDraftChange" },
                        onFocus: { method: "openSuggestions" }
                      }
                    },
                    {
                      component: "Titanic.UI.Button",
                      props: {
                        unstyled: true,
                        "aria-expanded": { attr: "actionAriaExpanded" },
                        "aria-haspopup": { attr: "actionAriaHasPopup" },
                        "aria-label": { attr: "actionAriaLabel" },
                        className: "titanic-lookup__action",
                        disabled: { attr: "readOnly" },
                        onClick: { method: "toggleAction" },
                        type: "button"
                      },
                      children: [
                        {
                          tag: "span",
                          props: {
                            "aria-hidden": true,
                            className: { attr: "actionIconClass" }
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  tag: "div",
                  when: { attr: "shouldRenderSuggestions" },
                  props: {
                    "aria-busy": { attr: "ariaBusy" },
                    className: "titanic-lookup__popover",
                    role: "listbox",
                    onScroll: { method: "handleListScroll" }
                  },
                  children: [
                    {
                      tag: "div",
                      when: { attr: "loading" },
                      props: { className: "titanic-lookup__status" },
                      text: { attr: "loadingText" }
                    },
                    {
                      tag: "div",
                      when: { attr: "error" },
                      props: { className: "titanic-lookup__error" },
                      text: { attr: "errorText" }
                    },
                    {
                      each: { attr: "visibleItems" },
                      as: "option",
                      indexAs: "optionIndex",
                      diff: [
                        {
                          component: "Titanic.UI.Button",
                          key: { call: "getOptionKey", args: [{ local: "option" }, { local: "optionIndex" }] },
                          props: {
                            unstyled: true,
                            "aria-selected": { eq: [{ local: "option.normalizedValue" }, { attr: "normalizedValue" }] },
                            className: { call: "getOptionClassName", args: [{ local: "option" }] },
                            onClick: { method: "selectOption", args: [{ local: "option" }] },
                            role: "option",
                            type: "button"
                          },
                          text: { local: "option.label" }
                        }
                      ]
                    },
                    {
                      tag: "div",
                      when: { attr: "loadingMore" },
                      props: { className: "titanic-lookup__status" },
                      text: { attr: "loadingMoreText" }
                    }
                  ]
                },
                {
                  tag: "div",
                  when: { attr: "modalOpen" },
                  props: {
                    className: "titanic-lookup__modal-backdrop",
                    role: "presentation"
                  },
                  children: [
                    {
                      tag: "div",
                      props: {
                        "aria-labelledby": { attr: "modalTitleId" },
                        "aria-modal": true,
                        className: "titanic-lookup__modal",
                        ref: { attr: "modalRef" },
                        role: "dialog"
                      },
                      children: [
                        {
                          tag: "div",
                          props: { className: "titanic-lookup__modal-header" },
                          children: [
                            {
                              tag: "h2",
                              props: {
                                className: "titanic-lookup__modal-title",
                                id: { attr: "modalTitleId" }
                              },
                              text: { coalesce: [{ attr: "title" }, { attr: "emptyText" }] }
                            },
                            {
                              component: "Titanic.UI.Button",
                              props: {
                                unstyled: true,
                                "aria-label": "Close",
                                className: "titanic-lookup__modal-close",
                                onClick: { method: "closeModal" },
                                type: "button"
                              },
                              children: [
                                {
                                  tag: "span",
                                  props: {
                                    "aria-hidden": true,
                                    className: "titanic-lookup__close-icon"
                                  }
                                }
                              ]
                            }
                          ]
                        },
                        {
                          tag: "input",
                          props: {
                            autoComplete: "off",
                            className: "titanic-lookup__modal-search",
                            type: "text",
                            value: { attr: "draft" },
                            onChange: { method: "handleModalSearchChange" }
                          }
                        },
                        {
                          tag: "div",
                          when: { attr: "shouldRenderModalList" },
                          props: {
                            "aria-busy": { attr: "ariaBusy" },
                            className: { attr: "modalListClasses" },
                            role: "listbox",
                            onScroll: { method: "handleListScroll" }
                          },
                          children: [
                            {
                              tag: "div",
                              when: { attr: "loading" },
                              props: { className: "titanic-lookup__status" },
                              text: { attr: "loadingText" }
                            },
                            {
                              tag: "div",
                              when: { attr: "error" },
                              props: { className: "titanic-lookup__error" },
                              text: { attr: "errorText" }
                            },
                            {
                              each: { attr: "visibleItems" },
                              as: "option",
                              indexAs: "optionIndex",
                              diff: [
                                {
                                  component: "Titanic.UI.Button",
                                  key: { call: "getOptionKey", args: [{ local: "option" }, { local: "optionIndex" }] },
                                  props: {
                                    unstyled: true,
                                    "aria-selected": { eq: [{ local: "option.normalizedValue" }, { attr: "normalizedValue" }] },
                                    className: { call: "getOptionClassName", args: [{ local: "option" }] },
                                    onClick: { method: "selectOption", args: [{ local: "option" }] },
                                    role: "option",
                                    type: "button"
                                  },
                                  text: { local: "option.label" }
                                }
                              ]
                            },
                            {
                              tag: "div",
                              when: { attr: "loadingMore" },
                              props: { className: "titanic-lookup__status" },
                              text: { attr: "loadingMoreText" }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        errorId: { attr: "errorId" },
        htmlFor: { attr: "resolvedId" },
        required: { attr: "required" },
        title: { attr: "title" },
        validationError: { attr: "validationError" }
      }
    },
    {
      tag: "div",
      when: { and: [{ attr: "visible" }, { not: { attr: "renderFrame" } }] },
      props: {
        className: { attr: "rootClasses" },
        ref: { attr: "rootRef" }
      },
      children: [
        {
          tag: "div",
          props: {
            className: { attr: "controlClasses" }
          },
          children: [
            {
              tag: "input",
              props: {
                $spread: { attr: "validationControlProps" },
                autoComplete: "off",
                className: { attr: "inputClasses" },
                disabled: { attr: "readOnly" },
                id: { attr: "resolvedId" },
                name: { attr: "resolvedName" },
                required: { attr: "required" },
                type: "text",
                value: { attr: "draft" },
                onChange: { method: "handleDraftChange" },
                onFocus: { method: "openSuggestions" }
              }
            },
            {
              component: "Titanic.UI.Button",
              props: {
                unstyled: true,
                "aria-expanded": { attr: "actionAriaExpanded" },
                "aria-haspopup": { attr: "actionAriaHasPopup" },
                "aria-label": { attr: "actionAriaLabel" },
                className: "titanic-lookup__action",
                disabled: { attr: "readOnly" },
                onClick: { method: "toggleAction" },
                type: "button"
              },
              children: [
                {
                  tag: "span",
                  props: {
                    "aria-hidden": true,
                    className: { attr: "actionIconClass" }
                  }
                }
              ]
            }
          ]
        },
        {
          tag: "div",
          when: { attr: "shouldRenderSuggestions" },
          props: {
            "aria-busy": { attr: "ariaBusy" },
            className: "titanic-lookup__popover",
            role: "listbox",
            onScroll: { method: "handleListScroll" }
          },
          children: [
            {
              tag: "div",
              when: { attr: "loading" },
              props: { className: "titanic-lookup__status" },
              text: { attr: "loadingText" }
            },
            {
              tag: "div",
              when: { attr: "error" },
              props: { className: "titanic-lookup__error" },
              text: { attr: "errorText" }
            },
            {
              each: { attr: "visibleItems" },
              as: "option",
              indexAs: "optionIndex",
              diff: [
                {
                  component: "Titanic.UI.Button",
                  key: { call: "getOptionKey", args: [{ local: "option" }, { local: "optionIndex" }] },
                  props: {
                    unstyled: true,
                    "aria-selected": { eq: [{ local: "option.normalizedValue" }, { attr: "normalizedValue" }] },
                    className: { call: "getOptionClassName", args: [{ local: "option" }] },
                    onClick: { method: "selectOption", args: [{ local: "option" }] },
                    role: "option",
                    type: "button"
                  },
                  text: { local: "option.label" }
                }
              ]
            },
            {
              tag: "div",
              when: { attr: "loadingMore" },
              props: { className: "titanic-lookup__status" },
              text: { attr: "loadingMoreText" }
            }
          ]
        },
        {
          tag: "div",
          when: { attr: "modalOpen" },
          props: {
            className: "titanic-lookup__modal-backdrop",
            role: "presentation"
          },
          children: [
            {
              tag: "div",
              props: {
                "aria-labelledby": { attr: "modalTitleId" },
                "aria-modal": true,
                className: "titanic-lookup__modal",
                ref: { attr: "modalRef" },
                role: "dialog"
              },
              children: [
                {
                  tag: "div",
                  props: { className: "titanic-lookup__modal-header" },
                  children: [
                    {
                      tag: "h2",
                      props: {
                        className: "titanic-lookup__modal-title",
                        id: { attr: "modalTitleId" }
                      },
                      text: { coalesce: [{ attr: "title" }, { attr: "emptyText" }] }
                    },
                    {
                      component: "Titanic.UI.Button",
                      props: {
                        unstyled: true,
                        "aria-label": "Close",
                        className: "titanic-lookup__modal-close",
                        onClick: { method: "closeModal" },
                        type: "button"
                      },
                      children: [
                        {
                          tag: "span",
                          props: {
                            "aria-hidden": true,
                            className: "titanic-lookup__close-icon"
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  tag: "input",
                  props: {
                    autoComplete: "off",
                    className: "titanic-lookup__modal-search",
                    type: "text",
                    value: { attr: "draft" },
                    onChange: { method: "handleModalSearchChange" }
                  }
                },
                {
                  tag: "div",
                  when: { attr: "shouldRenderModalList" },
                  props: {
                    "aria-busy": { attr: "ariaBusy" },
                    className: { attr: "modalListClasses" },
                    role: "listbox",
                    onScroll: { method: "handleListScroll" }
                  },
                  children: [
                    {
                      tag: "div",
                      when: { attr: "loading" },
                      props: { className: "titanic-lookup__status" },
                      text: { attr: "loadingText" }
                    },
                    {
                      tag: "div",
                      when: { attr: "error" },
                      props: { className: "titanic-lookup__error" },
                      text: { attr: "errorText" }
                    },
                    {
                      each: { attr: "visibleItems" },
                      as: "option",
                      indexAs: "optionIndex",
                      diff: [
                        {
                          component: "Titanic.UI.Button",
                          key: { call: "getOptionKey", args: [{ local: "option" }, { local: "optionIndex" }] },
                          props: {
                            unstyled: true,
                            "aria-selected": { eq: [{ local: "option.normalizedValue" }, { attr: "normalizedValue" }] },
                            className: { call: "getOptionClassName", args: [{ local: "option" }] },
                            onClick: { method: "selectOption", args: [{ local: "option" }] },
                            role: "option",
                            type: "button"
                          },
                          text: { local: "option.label" }
                        }
                      ]
                    },
                    {
                      tag: "div",
                      when: { attr: "loadingMore" },
                      props: { className: "titanic-lookup__status" },
                      text: { attr: "loadingMoreText" }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
