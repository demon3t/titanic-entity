Titanic.define("Titanic.UI.TimeInput", {
  attributes: {
    id: {},
    name: {},
    value: {},
    disabled: { default: false },
    required: { default: false },
    className: { default: "" },
    locale: {},
    labels: {},
    placeholder: {},
    renderFrame: { default: true },
    rootClassName: { default: "" },
    minuteStep: { default: 5 },
    editable: { default: true },
    title: {},
    validationError: {},
    visible: { default: true },
    onChange: {},
    fallbackId: { id: true },
    rootRef: { ref: true, default: null },
    open: { state: true, default: false },
    inputDraft: { state: true, default: "" },
    manualDraftActive: { state: true, default: false },
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
    hiddenInputId: {
      value(this: any): string {
        return `${this.attributes.resolvedId}-value`;
      }
    },
    titleId: {
      value(this: any): string {
        return `${this.attributes.resolvedId}-title`;
      }
    },
    normalizedValue: {
      value(this: any): string {
        return this.methods.normalizeTimeValue(this.attributes.value);
      }
    },
    currentLocale: {
      value(this: any): string {
        return this.attributes.locale ?? this.methods.getBrowserLocale();
      }
    },
    resolvedLabels: {
      value(this: any): Record<string, string> {
        return {
          ...this.methods.getTimeInputLabels(this.attributes.currentLocale),
          ...(this.attributes.labels ?? {})
        };
      }
    },
    displayValue: {
      value(this: any): string {
        return this.attributes.normalizedValue;
      }
    },
    parsedDraftTime: {
      value(this: any): string | null {
        return this.methods.parseManualTime(this.attributes.inputDraft);
      }
    },
    draftHasText: {
      value(this: any): boolean {
        return String(this.attributes.inputDraft).trim().length > 0;
      }
    },
    draftInvalid: {
      value(this: any): boolean {
        return this.attributes.manualDraftActive && this.attributes.draftHasText && !this.attributes.parsedDraftTime;
      }
    },
    readOnly: {
      value(this: any): boolean {
        return Boolean(this.attributes.disabled) || !this.attributes.editable;
      }
    },
    invalid: {
      value(this: any): boolean {
        return this.attributes.draftInvalid || Boolean(this.attributes.validationError);
      }
    },
    invalidForControl: {
      value(this: any): boolean | undefined {
        return this.attributes.invalid || undefined;
      }
    },
    errorId: {
      value(this: any): string | undefined {
        return this.attributes.validationError ? `${this.attributes.resolvedId}-error` : undefined;
      }
    },
    step: {
      value(this: any): number {
        return this.methods.normalizeMinuteStep(this.attributes.minuteStep);
      }
    },
    selectedHour: {
      value(this: any): number | null {
        return this.methods.getHour(this.attributes.normalizedValue);
      }
    },
    selectedMinute: {
      value(this: any): number | null {
        return this.methods.getMinute(this.attributes.normalizedValue);
      }
    },
    fallbackHour: {
      value(this: any): number {
        return this.attributes.selectedHour ?? new Date().getHours();
      }
    },
    fallbackMinute: {
      value(this: any): number {
        return this.attributes.selectedMinute ?? this.methods.roundMinuteToStep(new Date().getMinutes(), this.attributes.step);
      }
    },
    hourOptions: {
      value(this: any): number[] {
        return this.methods.createHourOptions();
      }
    },
    minuteOptions: {
      value(this: any): number[] {
        return this.methods.createMinuteOptions(this.attributes.step, this.attributes.selectedMinute);
      }
    },
    rootClasses: {
      value(this: any): string {
        return this.methods.joinClassNames("titanic-time", this.attributes.rootClassName);
      }
    },
    useBaseControlClass: {
      value(this: any): boolean {
        return (
          !this.methods.hasClassName(this.attributes.className, "titanic-field__control") &&
          !this.methods.hasClassName(this.attributes.className, "titanic-datetime-input__segment-control")
        );
      }
    },
    controlClasses: {
      value(this: any): string {
        return this.methods.joinClassNames(
          this.attributes.useBaseControlClass ? "titanic-field__control" : "",
          "titanic-time__control",
          this.attributes.invalid ? "titanic-time__control_invalid" : "",
          this.attributes.readOnly ? "titanic-time__control_disabled" : "",
          this.attributes.className
        );
      }
    },
    ariaLabel: {
      value(this: any): string {
        return this.attributes.placeholder || this.attributes.resolvedLabels.placeholder;
      }
    },
    syncDraftEffect: {
      deps: { array: [{ attr: "displayValue" }, { attr: "manualDraftActive" }] },
      effect(this: any): void {
        if (!this.attributes.manualDraftActive) {
          this.attributes.setInputDraft(this.attributes.displayValue);
        }
      }
    },
    outsidePopoverEffect: {
      deps: {
        array: [
          { attr: "open" },
          { attr: "inputDraft" },
          { attr: "manualDraftActive" },
          { attr: "normalizedValue" }
        ]
      },
      effect(this: any): void | (() => void) {
        if (!this.attributes.open) {
          return;
        }

        const closeOnOutsidePointer = (event: PointerEvent) => {
          if (!this.attributes.rootRef.current?.contains(event.target as Node)) {
            this.attributes.setOpen(false);
            this.methods.finishManualInput();
          }
        };

        const closeOnEscape = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            this.attributes.setOpen(false);
            this.methods.finishManualInput();
          }
        };

        document.addEventListener("pointerdown", closeOnOutsidePointer, true);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
          document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
          document.removeEventListener("keydown", closeOnEscape);
        };
      }
    }
  },
  methods: {
    finishManualInput(this: any): void {
      const nextTime = this.methods.parseManualTime(this.attributes.inputDraft);

      if (nextTime) {
        this.attributes.setInputDraft(nextTime);
        this.attributes.setManualDraftActive(false);
        this.attributes.onChange?.(nextTime);
        return;
      }

      if (!String(this.attributes.inputDraft).trim()) {
        this.attributes.setManualDraftActive(false);

        if (!this.attributes.required) {
          this.attributes.onChange?.(null);
        }
      }
    },

    commitTime(this: any, nextHour: number, nextMinute: number, closeAfterSelect: boolean): void {
      const nextValue = `${this.methods.padTimePart(nextHour)}:${this.methods.padTimePart(nextMinute)}`;

      this.attributes.setInputDraft(nextValue);
      this.attributes.setManualDraftActive(false);
      this.attributes.onChange?.(nextValue);

      if (closeAfterSelect) {
        this.attributes.setOpen(false);
      }
    },

    commitHour(this: any, _event: any, hour: number): void {
      this.methods.commitTime(hour, this.attributes.fallbackMinute, false);
    },

    commitMinute(this: any, _event: any, minute: number): void {
      this.methods.commitTime(this.attributes.fallbackHour, minute, true);
    },

    handleManualChange(this: any, event: any): void {
      const nextText = event.target.value;

      this.attributes.setInputDraft(nextText);
      this.attributes.setManualDraftActive(true);

      const nextTime = this.methods.parseManualTime(nextText);

      if (nextTime) {
        this.attributes.onChange?.(nextTime);
        return;
      }

      if (!String(nextText).trim() && !this.attributes.required) {
        this.attributes.onChange?.(null);
      }
    },

    handleNow(this: any): void {
      const nextTime = this.methods.getCurrentTime();

      this.attributes.setInputDraft(nextTime);
      this.attributes.setManualDraftActive(false);
      this.attributes.onChange?.(nextTime);
      this.attributes.setOpen(false);
    },

    handleClear(this: any): void {
      this.attributes.setInputDraft("");
      this.attributes.setManualDraftActive(false);
      this.attributes.onChange?.(null);
      this.attributes.setOpen(false);
    },

    handleInputBlur(this: any): void {
      window.setTimeout(() => {
        if (this.attributes.rootRef.current?.contains(document.activeElement)) {
          return;
        }

        this.methods.finishManualInput();
      }, 0);
    },

    handleInputFocus(this: any): void {
      this.attributes.setOpen(true);
    },

    handleInputKeyDown(this: any, event: any): void {
      if (event.key === "Enter") {
        event.preventDefault();
        this.methods.finishManualInput();
        this.attributes.setOpen(false);
      }
    },

    toggleOpen(this: any): void {
      this.attributes.setOpen((currentValue: boolean) => !currentValue);
    },

    isHourActive(this: any, hour: number): boolean {
      return hour === this.attributes.selectedHour;
    },

    isMinuteActive(this: any, minute: number): boolean {
      return minute === this.attributes.selectedMinute;
    },

    getHourOptionClassName(this: any, hour: number): string {
      return this.methods.joinClassNames(
        "titanic-time__option",
        this.methods.isHourActive(hour) ? "titanic-time__option_active" : ""
      );
    },

    getMinuteOptionClassName(this: any, minute: number): string {
      return this.methods.joinClassNames(
        "titanic-time__option",
        this.methods.isMinuteActive(minute) ? "titanic-time__option_active" : ""
      );
    },

    getHourOptionTitle(this: any, hour: number): string | undefined {
      return this.methods.isHourActive(hour) ? this.attributes.resolvedLabels.selectedTime : undefined;
    },

    getMinuteOptionTitle(this: any, minute: number): string | undefined {
      return this.methods.isMinuteActive(minute) ? this.attributes.resolvedLabels.selectedTime : undefined;
    },

    hasClassName(this: any, className: string, targetClassName: string): boolean {
      return String(className).split(/\s+/).includes(targetClassName);
    },

    normalizeTimeValue(this: any, value: string | null | undefined): string {
      if (!value) {
        return "";
      }

      const normalizedValue = String(value).trim();
      const embeddedTime = /(?:^|[T\s])(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:$|[Z+\-\s])/.exec(normalizedValue);
      const timeSource = embeddedTime ? `${embeddedTime[1]}:${embeddedTime[2]}` : normalizedValue;

      return this.methods.parseManualTime(timeSource) ?? "";
    },

    parseManualTime(this: any, value: string): string | null {
      const normalizedValue = String(value).trim();

      if (!normalizedValue) {
        return null;
      }

      const separatedValue = normalizedValue.replace(/[.\s]+/g, ":");
      let hour: number | null = null;
      let minute: number | null = null;
      const separatedParts = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(separatedValue);

      if (separatedParts) {
        hour = Number(separatedParts[1]);
        minute = separatedParts[2] == null ? 0 : Number(separatedParts[2]);
      } else {
        const compactParts = /^(\d{3,4})$/.exec(normalizedValue);

        if (!compactParts) {
          return null;
        }

        const compactValue = compactParts[1];
        hour = Number(compactValue.slice(0, compactValue.length - 2));
        minute = Number(compactValue.slice(-2));
      }

      if (!this.methods.isValidTimePart(hour, 23) || !this.methods.isValidTimePart(minute, 59)) {
        return null;
      }

      return `${this.methods.padTimePart(hour)}:${this.methods.padTimePart(minute)}`;
    },

    isValidTimePart(this: any, value: number | null, max: number): boolean {
      return value != null && Number.isInteger(value) && value >= 0 && value <= max;
    },

    createHourOptions(): number[] {
      return Array.from({ length: 24 }, (_item, hour) => hour);
    },

    createMinuteOptions(this: any, step: number, selectedMinute: number | null): number[] {
      const values = new Set<number>();

      for (let minute = 0; minute < 60; minute += step) {
        values.add(minute);
      }

      if (selectedMinute != null) {
        values.add(selectedMinute);
      }

      return Array.from(values).sort((first, second) => first - second);
    },

    normalizeMinuteStep(this: any, value: number): number {
      if (!Number.isFinite(value)) {
        return 5;
      }

      const step = Math.trunc(value);
      return step >= 1 && step <= 30 ? step : 5;
    },

    roundMinuteToStep(this: any, minute: number, step: number): number {
      const roundedMinute = Math.round(minute / step) * step;
      return Math.min(60 - step, roundedMinute);
    },

    getHour(this: any, value: string): number | null {
      return value ? Number(value.slice(0, 2)) : null;
    },

    getMinute(this: any, value: string): number | null {
      return value ? Number(value.slice(3, 5)) : null;
    },

    getCurrentTime(this: any): string {
      const now = new Date();
      return `${this.methods.padTimePart(now.getHours())}:${this.methods.padTimePart(now.getMinutes())}`;
    },

    getBrowserLocale(): string {
      return typeof navigator === "undefined" ? "en-US" : navigator.language;
    },

    padTimePart(this: any, value: number): string {
      return String(value).padStart(2, "0");
    },

    getTimeInputLabels(this: any, locale: string): Record<string, string> {
      const language = String(locale).toLowerCase().startsWith("ru") ? "ru" : "en";

      if (language === "ru") {
        return {
          title: "Выбор времени",
          placeholder: "Выберите время",
          hour: "Часы",
          minute: "Минуты",
          now: "Сейчас",
          clear: "Очистить",
          selectedTime: "Выбранное время"
        };
      }

      return {
        title: "Select time",
        placeholder: "Select time",
        hour: "Hour",
        minute: "Minute",
        now: "Now",
        clear: "Clear",
        selectedTime: "Selected time"
      };
    },

    joinClassNames(this: any, ...classNames: Array<string | false | null | undefined>): string {
      return classNames.filter(Boolean).join(" ");
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
              diff: [
                {
                  tag: "input",
                  props: {
                    id: { attr: "hiddenInputId" },
                    name: { attr: "resolvedName" },
                    readOnly: true,
                    type: "hidden",
                    value: { attr: "normalizedValue" }
                  }
                },
                {
                  tag: "div",
                  props: {
                    "aria-errormessage": { attr: "errorId" },
                    "aria-invalid": { attr: "invalidForControl" },
                    className: { attr: "controlClasses" }
                  },
                  diff: [
                    {
                      tag: "input",
                      props: {
                        "aria-errormessage": { attr: "errorId" },
                        "aria-expanded": { attr: "open" },
                        "aria-haspopup": "dialog",
                        "aria-invalid": { attr: "invalid" },
                        "aria-label": { attr: "ariaLabel" },
                        className: "titanic-time__input",
                        disabled: { attr: "readOnly" },
                        id: { attr: "resolvedId" },
                        inputMode: "numeric",
                        placeholder: { attr: "placeholder" },
                        value: { attr: "inputDraft" },
                        onBlur: { method: "handleInputBlur" },
                        onChange: { method: "handleManualChange" },
                        onFocus: { method: "handleInputFocus" },
                        onKeyDown: { method: "handleInputKeyDown" }
                      }
                    },
                    {
                      component: "Titanic.UI.Button",
                      props: {
                        unstyled: true,
                        "aria-expanded": { attr: "open" },
                        "aria-haspopup": "dialog",
                        "aria-label": { attr: "ariaLabel" },
                        className: "titanic-time__dropdown-button",
                        disabled: { attr: "readOnly" },
                        type: "button",
                        onClick: { method: "toggleOpen" }
                      },
                      children: [
                        {
                          tag: "span",
                          props: {
                            "aria-hidden": true,
                            className: "titanic-time__icon"
                          }
                        }
                      ]
                    }
                  ]
                },
                {
                  tag: "div",
                  when: { attr: "open" },
                  props: {
                    "aria-labelledby": { attr: "titleId" },
                    "aria-modal": "false",
                    className: "titanic-date-time-popover titanic-time__popover",
                    role: "dialog"
                  },
                  diff: [
                    {
                      tag: "div",
                      props: {
                        className: "titanic-time__header"
                      },
                      children: [
                        {
                          tag: "strong",
                          props: {
                            id: { attr: "titleId" }
                          },
                          text: { attr: "resolvedLabels.title" }
                        }
                      ]
                    },
                    {
                      tag: "div",
                      props: {
                        className: "titanic-time__columns"
                      },
                      diff: [
                        {
                          tag: "div",
                          props: {
                            className: "titanic-time__column"
                          },
                          diff: [
                            {
                              tag: "span",
                              props: {
                                className: "titanic-time__column-title"
                              },
                              text: { attr: "resolvedLabels.hour" }
                            },
                            {
                              tag: "div",
                              props: {
                                "aria-label": { attr: "resolvedLabels.hour" },
                                className: "titanic-time__options",
                                role: "listbox"
                              },
                              children: [
                                {
                                  each: { attr: "hourOptions" },
                                  as: "hour",
                                  diff: [
                                    {
                                      component: "Titanic.UI.Button",
                                      key: { local: "hour" },
                                      props: {
                                        unstyled: true,
                                        "aria-selected": {
                                          call: "isHourActive",
                                          args: [{ local: "hour" }]
                                        },
                                        className: {
                                          call: "getHourOptionClassName",
                                          args: [{ local: "hour" }]
                                        },
                                        role: "option",
                                        title: {
                                          call: "getHourOptionTitle",
                                          args: [{ local: "hour" }]
                                        },
                                        type: "button",
                                        onClick: {
                                          method: "commitHour",
                                          args: [{ local: "hour" }]
                                        }
                                      },
                                      text: {
                                        call: "padTimePart",
                                        args: [{ local: "hour" }]
                                      }
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        },
                        {
                          tag: "div",
                          props: {
                            className: "titanic-time__column"
                          },
                          diff: [
                            {
                              tag: "span",
                              props: {
                                className: "titanic-time__column-title"
                              },
                              text: { attr: "resolvedLabels.minute" }
                            },
                            {
                              tag: "div",
                              props: {
                                "aria-label": { attr: "resolvedLabels.minute" },
                                className: "titanic-time__options",
                                role: "listbox"
                              },
                              children: [
                                {
                                  each: { attr: "minuteOptions" },
                                  as: "minute",
                                  diff: [
                                    {
                                      component: "Titanic.UI.Button",
                                      key: { local: "minute" },
                                      props: {
                                        unstyled: true,
                                        "aria-selected": {
                                          call: "isMinuteActive",
                                          args: [{ local: "minute" }]
                                        },
                                        className: {
                                          call: "getMinuteOptionClassName",
                                          args: [{ local: "minute" }]
                                        },
                                        role: "option",
                                        title: {
                                          call: "getMinuteOptionTitle",
                                          args: [{ local: "minute" }]
                                        },
                                        type: "button",
                                        onClick: {
                                          method: "commitMinute",
                                          args: [{ local: "minute" }]
                                        }
                                      },
                                      text: {
                                        call: "padTimePart",
                                        args: [{ local: "minute" }]
                                      }
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    },
                    {
                      tag: "div",
                      props: {
                        className: "titanic-time__actions"
                      },
                      diff: [
                        {
                          component: "Titanic.UI.Button",
                          props: {
                            unstyled: true,
                            type: "button",
                            onClick: { method: "handleNow" }
                          },
                          text: { attr: "resolvedLabels.now" }
                        },
                        {
                          component: "Titanic.UI.Button",
                          props: {
                            unstyled: true,
                            disabled: { or: [{ not: { attr: "normalizedValue" } }, { attr: "required" }] },
                            type: "button",
                            onClick: { method: "handleClear" }
                          },
                          text: { attr: "resolvedLabels.clear" }
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
      diff: [
        {
          tag: "input",
          props: {
            id: { attr: "hiddenInputId" },
            name: { attr: "resolvedName" },
            readOnly: true,
            type: "hidden",
            value: { attr: "normalizedValue" }
          }
        },
        {
          tag: "div",
          props: {
            "aria-errormessage": { attr: "errorId" },
            "aria-invalid": { attr: "invalidForControl" },
            className: { attr: "controlClasses" }
          },
          diff: [
            {
              tag: "input",
              props: {
                "aria-errormessage": { attr: "errorId" },
                "aria-expanded": { attr: "open" },
                "aria-haspopup": "dialog",
                "aria-invalid": { attr: "invalid" },
                "aria-label": { attr: "ariaLabel" },
                className: "titanic-time__input",
                disabled: { attr: "readOnly" },
                id: { attr: "resolvedId" },
                inputMode: "numeric",
                placeholder: { attr: "placeholder" },
                value: { attr: "inputDraft" },
                onBlur: { method: "handleInputBlur" },
                onChange: { method: "handleManualChange" },
                onFocus: { method: "handleInputFocus" },
                onKeyDown: { method: "handleInputKeyDown" }
              }
            },
            {
              component: "Titanic.UI.Button",
              props: {
                unstyled: true,
                "aria-expanded": { attr: "open" },
                "aria-haspopup": "dialog",
                "aria-label": { attr: "ariaLabel" },
                className: "titanic-time__dropdown-button",
                disabled: { attr: "readOnly" },
                type: "button",
                onClick: { method: "toggleOpen" }
              },
              children: [
                {
                  tag: "span",
                  props: {
                    "aria-hidden": true,
                    className: "titanic-time__icon"
                  }
                }
              ]
            }
          ]
        },
        {
          tag: "div",
          when: { attr: "open" },
          props: {
            "aria-labelledby": { attr: "titleId" },
            "aria-modal": "false",
            className: "titanic-date-time-popover titanic-time__popover",
            role: "dialog"
          },
          diff: [
            {
              tag: "div",
              props: {
                className: "titanic-time__header"
              },
              children: [
                {
                  tag: "strong",
                  props: {
                    id: { attr: "titleId" }
                  },
                  text: { attr: "resolvedLabels.title" }
                }
              ]
            },
            {
              tag: "div",
              props: {
                className: "titanic-time__columns"
              },
              diff: [
                {
                  tag: "div",
                  props: {
                    className: "titanic-time__column"
                  },
                  diff: [
                    {
                      tag: "span",
                      props: {
                        className: "titanic-time__column-title"
                      },
                      text: { attr: "resolvedLabels.hour" }
                    },
                    {
                      tag: "div",
                      props: {
                        "aria-label": { attr: "resolvedLabels.hour" },
                        className: "titanic-time__options",
                        role: "listbox"
                      },
                      children: [
                        {
                          each: { attr: "hourOptions" },
                          as: "hour",
                          diff: [
                            {
                              component: "Titanic.UI.Button",
                              key: { local: "hour" },
                              props: {
                                unstyled: true,
                                "aria-selected": {
                                  call: "isHourActive",
                                  args: [{ local: "hour" }]
                                },
                                className: {
                                  call: "getHourOptionClassName",
                                  args: [{ local: "hour" }]
                                },
                                role: "option",
                                title: {
                                  call: "getHourOptionTitle",
                                  args: [{ local: "hour" }]
                                },
                                type: "button",
                                onClick: {
                                  method: "commitHour",
                                  args: [{ local: "hour" }]
                                }
                              },
                              text: {
                                call: "padTimePart",
                                args: [{ local: "hour" }]
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                },
                {
                  tag: "div",
                  props: {
                    className: "titanic-time__column"
                  },
                  diff: [
                    {
                      tag: "span",
                      props: {
                        className: "titanic-time__column-title"
                      },
                      text: { attr: "resolvedLabels.minute" }
                    },
                    {
                      tag: "div",
                      props: {
                        "aria-label": { attr: "resolvedLabels.minute" },
                        className: "titanic-time__options",
                        role: "listbox"
                      },
                      children: [
                        {
                          each: { attr: "minuteOptions" },
                          as: "minute",
                          diff: [
                            {
                              component: "Titanic.UI.Button",
                              key: { local: "minute" },
                              props: {
                                unstyled: true,
                                "aria-selected": {
                                  call: "isMinuteActive",
                                  args: [{ local: "minute" }]
                                },
                                className: {
                                  call: "getMinuteOptionClassName",
                                  args: [{ local: "minute" }]
                                },
                                role: "option",
                                title: {
                                  call: "getMinuteOptionTitle",
                                  args: [{ local: "minute" }]
                                },
                                type: "button",
                                onClick: {
                                  method: "commitMinute",
                                  args: [{ local: "minute" }]
                                }
                              },
                              text: {
                                call: "padTimePart",
                                args: [{ local: "minute" }]
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              tag: "div",
              props: {
                className: "titanic-time__actions"
              },
              diff: [
                {
                  component: "Titanic.UI.Button",
                  props: {
                    unstyled: true,
                    type: "button",
                    onClick: { method: "handleNow" }
                  },
                  text: { attr: "resolvedLabels.now" }
                },
                {
                  component: "Titanic.UI.Button",
                  props: {
                    unstyled: true,
                    disabled: { or: [{ not: { attr: "normalizedValue" } }, { attr: "required" }] },
                    type: "button",
                    onClick: { method: "handleClear" }
                  },
                  text: { attr: "resolvedLabels.clear" }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
