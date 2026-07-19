Titanic.define("Titanic.UI.DateInput", {
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
    editable: { default: true },
    title: {},
    validationError: {},
    visible: { default: true },
    onChange: {},

    fallbackId: { id: true },
    rootRef: { ref: true, default: null },
    open: { state: true, default: false },
    viewDate: {
      state: true,
      default() {
        return new Date();
      }
    },
    calendarMode: { state: true, default: "day" },
    inputDraft: { state: true, default: "" },
    manualDraftActive: { state: true, default: false },

    resolvedId: {
      value(this: any) {
        return this.attributes.id ?? this.attributes.fallbackId;
      }
    },
    resolvedName: {
      value(this: any) {
        return this.attributes.name ?? this.attributes.resolvedId;
      }
    },
    hiddenInputId: {
      value(this: any) {
        return `${this.attributes.resolvedId}-native`;
      }
    },
    titleId: {
      value(this: any) {
        return this.attributes.title ? `${this.attributes.resolvedId}-label` : undefined;
      }
    },
    normalizedValue: {
      value(this: any) {
        return this.methods.normalizeDateValue(this.attributes.value);
      }
    },
    selectedDate: {
      value(this: any) {
        return this.methods.parseIsoDate(this.attributes.normalizedValue);
      }
    },
    currentLocale: {
      value(this: any) {
        return this.attributes.locale ?? this.methods.getBrowserLocale();
      }
    },
    resolvedLabels: {
      value(this: any) {
        return this.methods.getDateInputLabels(this.attributes.currentLocale, this.attributes.labels);
      }
    },
    displayValue: {
      value(this: any) {
        return this.methods.formatDisplayDate(this.attributes.selectedDate, this.attributes.currentLocale);
      }
    },
    parsedDraftDate: {
      value(this: any) {
        return this.methods.parseManualDate(this.attributes.inputDraft, this.attributes.currentLocale);
      }
    },
    draftHasText: {
      value(this: any) {
        return this.attributes.inputDraft.trim().length > 0;
      }
    },
    draftInvalid: {
      value(this: any) {
        return this.attributes.manualDraftActive && this.attributes.draftHasText && !this.attributes.parsedDraftDate;
      }
    },
    readOnly: {
      value(this: any) {
        return this.attributes.disabled || this.attributes.editable === false;
      }
    },
    invalid: {
      value(this: any) {
        return Boolean(this.attributes.validationError || this.attributes.draftInvalid);
      }
    },
    invalidForControl: {
      value(this: any) {
        return this.attributes.invalid ? true : undefined;
      }
    },
    errorId: {
      value(this: any) {
        return this.attributes.validationError ? `${this.attributes.resolvedId}-error` : undefined;
      }
    },
    calendarDays: {
      value(this: any) {
        return this.methods.createCalendarDays(this.attributes.viewDate);
      }
    },
    monthOptions: {
      value(this: any) {
        return this.methods.createMonthOptions(this.attributes.viewDate, this.attributes.currentLocale);
      }
    },
    yearRangeStart: {
      value(this: any) {
        return this.methods.getYearRangeStart(this.attributes.viewDate);
      }
    },
    yearOptions: {
      value(this: any) {
        return this.methods.createYearOptions(this.attributes.yearRangeStart);
      }
    },
    weekdayLabels: {
      value(this: any) {
        return this.methods.createWeekdayLabels(this.attributes.currentLocale, this.attributes.resolvedLabels);
      }
    },
    todayIsoDate: {
      value(this: any) {
        return this.methods.formatIsoDate(new Date());
      }
    },
    rootClasses: {
      value(this: any) {
        return this.methods.joinClassNames("titanic-date", this.attributes.rootClassName);
      }
    },
    useBaseControlClass: {
      value(this: any) {
        return !this.methods.hasClassName(this.attributes.className, "titanic-datetime-input__segment-control");
      }
    },
    controlClasses: {
      value(this: any) {
        return this.methods.joinClassNames(
          "titanic-date__control",
          this.attributes.useBaseControlClass ? "titanic-field__control" : undefined,
          this.attributes.className
        );
      }
    },
    inputClasses: {
      value(this: any) {
        return this.methods.joinClassNames(
          "titanic-date__input",
          this.attributes.invalid ? "titanic-date__input--invalid" : undefined
        );
      }
    },
    ariaLabel: {
      value(this: any) {
        return this.attributes.resolvedLabels.selectedDate;
      }
    },
    visibleMonthIndex: {
      value(this: any) {
        return this.attributes.viewDate.getMonth();
      }
    },
    visibleYear: {
      value(this: any) {
        return this.attributes.viewDate.getFullYear();
      }
    },
    visibleMonthLabel: {
      value(this: any) {
        return this.methods.capitalizeFirstLetter(
          this.attributes.viewDate.toLocaleDateString(this.attributes.currentLocale, {
            month: "long",
            year: "numeric"
          })
        );
      }
    },
    previousLabel: {
      value(this: any) {
        if (this.attributes.calendarMode === "year") {
          return `${this.attributes.yearRangeStart - 16}-${this.attributes.yearRangeStart - 1}`;
        }

        return this.attributes.resolvedLabels.previousMonth;
      }
    },
    nextLabel: {
      value(this: any) {
        if (this.attributes.calendarMode === "year") {
          return `${this.attributes.yearRangeStart + 16}-${this.attributes.yearRangeStart + 31}`;
        }

        return this.attributes.resolvedLabels.nextMonth;
      }
    },

    syncDraftEffect: {
      effect(this: any) {
        if (!this.attributes.manualDraftActive) {
          this.attributes.setInputDraft(this.attributes.displayValue);
        }
      },
      deps: { array: [{ attr: "displayValue" }, { attr: "manualDraftActive" }] }
    },
    openEffect: {
      effect(this: any) {
        if (!this.attributes.open) {
          return;
        }

        this.attributes.setViewDate(this.attributes.selectedDate ?? new Date());
        this.attributes.setCalendarMode("day");
      },
      deps: { array: [{ attr: "open" }, { attr: "normalizedValue" }] }
    },
    outsidePopoverEffect: {
      effect(this: any) {
        if (!this.attributes.open) {
          return undefined;
        }

        const handlePointerDown = (event: PointerEvent) => {
          const root = this.attributes.rootRef.current;

          if (root && !root.contains(event.target as Node)) {
            this.methods.finishManualInput();
            this.attributes.setOpen(false);
          }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            this.methods.finishManualInput();
            this.attributes.setOpen(false);
          }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
          document.removeEventListener("pointerdown", handlePointerDown);
          document.removeEventListener("keydown", handleKeyDown);
        };
      },
      deps: { array: [{ attr: "open" }] }
    }
  },
  methods: {
    getDateInputLabels(this: any, locale: string, overrides?: Record<string, any>) {
      const isRu = String(locale).toLowerCase().startsWith("ru");
      const defaults = isRu
        ? {
            clear: "Clear",
            days: "Days",
            month: "Month",
            nextMonth: "Next month",
            placeholder: "Select date",
            previousMonth: "Previous month",
            selectedDate: "Selected date",
            today: "Today",
            weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            year: "Year"
          }
        : {
            clear: "Clear",
            days: "Days",
            month: "Month",
            nextMonth: "Next month",
            placeholder: "Select date",
            previousMonth: "Previous month",
            selectedDate: "Selected date",
            today: "Today",
            weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            year: "Year"
          };

      return { ...defaults, ...(overrides ?? {}) };
    },
    createCalendarDays(this: any, viewDate: Date) {
      const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const startDate = new Date(firstDay);
      startDate.setDate(firstDay.getDate() - startOffset);

      return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        const isoDate = this.methods.formatIsoDate(date);

        return {
          date,
          isoDate,
          label: String(date.getDate()),
          inCurrentMonth: date.getMonth() === viewDate.getMonth(),
          today: isoDate === this.attributes.todayIsoDate,
          active: isoDate === this.attributes.normalizedValue,
          title: this.methods.formatFullDate(date, this.attributes.currentLocale)
        };
      });
    },
    createWeekdayLabels(this: any, locale: string, labels: Record<string, any>) {
      if (labels.weekdays?.length) {
        return labels.weekdays;
      }

      const baseDate = new Date(2021, 5, 7);

      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + index);
        return this.methods.capitalizeFirstLetter(date.toLocaleDateString(locale, { weekday: "short" }));
      });
    },
    createMonthOptions(this: any, viewDate: Date, locale: string) {
      return Array.from({ length: 12 }, (_, month) => {
        const date = new Date(viewDate.getFullYear(), month, 1);

        return {
          month,
          label: this.methods.capitalizeFirstLetter(date.toLocaleDateString(locale, { month: "short" }))
        };
      });
    },
    createYearOptions(yearRangeStart: number) {
      return Array.from({ length: 16 }, (_, index) => yearRangeStart + index);
    },
    getYearRangeStart(viewDate: Date) {
      return Math.floor(viewDate.getFullYear() / 16) * 16;
    },
    hasClassName(className: string | undefined, target: string) {
      return String(className ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .includes(target);
    },
    normalizeDateValue(this: any, value: string | null | undefined) {
      if (!value) {
        return "";
      }

      const parsedDate = this.methods.parseIsoDate(value);

      return parsedDate ? this.methods.formatIsoDate(parsedDate) : "";
    },
    parseManualDate(this: any, value: string, locale: string) {
      const draft = value.trim();

      if (!draft) {
        return null;
      }

      const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(draft);

      if (isoMatch) {
        return this.methods.createValidDate(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
      }

      const dotMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(draft);

      if (dotMatch) {
        return this.methods.createValidDate(Number(dotMatch[3]), Number(dotMatch[2]) - 1, Number(dotMatch[1]));
      }

      const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(draft);

      if (slashMatch) {
        const first = Number(slashMatch[1]);
        const second = Number(slashMatch[2]);
        const year = Number(slashMatch[3]);
        const dayFirst = String(locale).toLowerCase().startsWith("ru") || first > 12;
        return this.methods.createValidDate(year, dayFirst ? second - 1 : first - 1, dayFirst ? first : second);
      }

      const parsedTimestamp = Date.parse(draft);

      if (!Number.isNaN(parsedTimestamp)) {
        const date = new Date(parsedTimestamp);
        return this.methods.createValidDate(date.getFullYear(), date.getMonth(), date.getDate());
      }

      return null;
    },
    parseIsoDate(this: any, value: string | null | undefined) {
      if (!value) {
        return null;
      }

      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

      if (!match) {
        return null;
      }

      return this.methods.createValidDate(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    },
    createValidDate(year: number, month: number, day: number) {
      const date = new Date(year, month, day);

      if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return null;
      }

      return date;
    },
    formatDisplayDate(this: any, date: Date | null, locale: string) {
      return date ? date.toLocaleDateString(locale) : "";
    },
    formatIsoDate(this: any, date: Date) {
      return [date.getFullYear(), this.methods.padDatePart(date.getMonth() + 1), this.methods.padDatePart(date.getDate())].join("-");
    },
    formatFullDate(date: Date, locale: string) {
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    },
    getBrowserLocale() {
      if (typeof navigator === "undefined") {
        return "en-US";
      }

      return navigator.language || "en-US";
    },
    padDatePart(value: number) {
      return String(value).padStart(2, "0");
    },
    capitalizeFirstLetter(value: string) {
      return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    },
    joinClassNames(...classNames: Array<string | false | null | undefined>) {
      return classNames.filter(Boolean).join(" ");
    },
    getDayClassName(this: any, day: Record<string, any>) {
      return this.methods.joinClassNames(
        "titanic-date__day",
        !day.inCurrentMonth ? "titanic-date__day--muted" : undefined,
        day.today ? "titanic-date__day--today" : undefined,
        day.active ? "titanic-date__day--active" : undefined
      );
    },
    getMonthOptionClassName(this: any, option: Record<string, any>) {
      return this.methods.joinClassNames(
        "titanic-date__month-option",
        option.month === this.attributes.visibleMonthIndex ? "titanic-date__month-option--active" : undefined
      );
    },
    getYearOptionClassName(this: any, year: number) {
      return this.methods.joinClassNames(
        "titanic-date__year-option",
        year === this.attributes.visibleYear ? "titanic-date__year-option--active" : undefined
      );
    },
    changeVisiblePeriod(this: any, _event: any, offset: number) {
      const viewDate = new Date(this.attributes.viewDate);

      if (this.attributes.calendarMode === "year") {
        viewDate.setFullYear(viewDate.getFullYear() + offset * 16);
      } else if (this.attributes.calendarMode === "month") {
        viewDate.setFullYear(viewDate.getFullYear() + offset);
      } else {
        viewDate.setMonth(viewDate.getMonth() + offset);
      }

      this.attributes.setViewDate(viewDate);
    },
    openDayMode(this: any) {
      this.attributes.setCalendarMode("day");
    },
    openMonthMode(this: any) {
      this.attributes.setCalendarMode("month");
    },
    openYearMode(this: any) {
      this.attributes.setCalendarMode("year");
    },
    selectVisibleMonth(this: any, _event: any, month: number) {
      const nextDate = new Date(this.attributes.viewDate);
      nextDate.setMonth(month);
      this.attributes.setViewDate(nextDate);
      this.attributes.setCalendarMode("day");
    },
    selectVisibleYear(this: any, _event: any, year: number) {
      const nextDate = new Date(this.attributes.viewDate);
      nextDate.setFullYear(year);
      this.attributes.setViewDate(nextDate);
      this.attributes.setCalendarMode("month");
    },
    selectDate(this: any, _event: any, isoDate: string) {
      const nextDate = this.methods.parseIsoDate(isoDate);

      this.attributes.onChange?.(isoDate);
      this.attributes.setInputDraft(this.methods.formatDisplayDate(nextDate, this.attributes.currentLocale));
      this.attributes.setManualDraftActive(false);
      this.attributes.setOpen(false);
    },
    selectToday(this: any) {
      this.methods.selectDate(null, this.methods.formatIsoDate(new Date()));
    },
    clearDate(this: any) {
      this.attributes.onChange?.(null);
      this.attributes.setInputDraft("");
      this.attributes.setManualDraftActive(false);
      this.attributes.setOpen(false);
    },
    handleManualChange(this: any, event: any) {
      this.attributes.setManualDraftActive(true);
      this.attributes.setInputDraft(event.target.value);

      if (!this.attributes.open) {
        this.attributes.setOpen(true);
      }
    },
    finishManualInput(this: any) {
      if (!this.attributes.manualDraftActive) {
        return;
      }

      const draft = this.attributes.inputDraft.trim();

      if (!draft) {
        this.methods.clearDate();
        return;
      }

      const parsedDate = this.methods.parseManualDate(draft, this.attributes.currentLocale);

      if (parsedDate) {
        const isoDate = this.methods.formatIsoDate(parsedDate);
        this.attributes.onChange?.(isoDate);
        this.attributes.setInputDraft(this.methods.formatDisplayDate(parsedDate, this.attributes.currentLocale));
        this.attributes.setViewDate(parsedDate);
      } else {
        this.attributes.setInputDraft(this.attributes.displayValue);
      }

      this.attributes.setManualDraftActive(false);
    },
    handleInputBlur(this: any) {
      window.setTimeout(() => {
        if (!this.attributes.open) {
          this.methods.finishManualInput();
        }
      }, 0);
    },
    handleInputFocus(this: any) {
      if (!this.attributes.readOnly) {
        this.attributes.setOpen(true);
      }
    },
    handleInputKeyDown(this: any, event: any) {
      if (event.key === "Enter") {
        this.methods.finishManualInput();
        this.attributes.setOpen(false);
      }
    },
    toggleOpen(this: any) {
      if (this.attributes.readOnly) {
        return;
      }

      if (this.attributes.open) {
        this.methods.finishManualInput();
      }

      this.attributes.setOpen(!this.attributes.open);
    }
  },
  diff: [
    {
      component: "Titanic.UI.InputFieldFrame",
      when: { attr: "renderFrame" },
      props: {
        id: { attr: "resolvedId" },
        title: { attr: "title" },
        required: { attr: "required" },
        error: { attr: "validationError" },
        visible: { attr: "visible" },
        className: { attr: "rootClassName" },
        controlClassName: { attr: "className" }
      },
      diff: [
        {
          tag: "div",
          props: {
            ref: { attr: "rootRef" },
            className: { attr: "rootClasses" }
          },
          children: [
            {
              tag: "input",
              props: {
                id: { attr: "hiddenInputId" },
                name: { attr: "resolvedName" },
                type: "date",
                hidden: true,
                value: { attr: "normalizedValue" },
                readOnly: true,
                disabled: { attr: "disabled" }
              }
            },
            {
              tag: "div",
              props: {
                className: { attr: "controlClasses" },
                "aria-invalid": { attr: "invalidForControl" }
              },
              children: [
                {
                  tag: "input",
                  props: {
                    id: { attr: "resolvedId" },
                    className: { attr: "inputClasses" },
                    type: "text",
                    value: { attr: "inputDraft" },
                    placeholder: { coalesce: [{ attr: "placeholder" }, { path: "resolvedLabels.placeholder" }] },
                    disabled: { attr: "disabled" },
                    readOnly: { not: { attr: "editable" } },
                    "aria-label": { attr: "ariaLabel" },
                    "aria-invalid": { attr: "invalidForControl" },
                    "aria-describedby": { attr: "errorId" },
                    "aria-labelledby": { attr: "titleId" },
                    onChange: { method: "handleManualChange" },
                    onFocus: { method: "handleInputFocus" },
                    onBlur: { method: "handleInputBlur" },
                    onKeyDown: { method: "handleInputKeyDown" }
                  }
                },
                {
                  component: "Titanic.UI.Button",
                  props: {
                    type: "button",
                    variant: "ghost",
                    className: "titanic-date__trigger",
                    disabled: { attr: "readOnly" },
                    "aria-label": { path: "resolvedLabels.selectedDate" },
                    "aria-expanded": { attr: "open" },
                    onClick: { method: "toggleOpen" }
                  },
                  children: [{ tag: "span", props: { "aria-hidden": true }, text: "Calendar" }]
                }
              ]
            },
            {
              tag: "div",
              when: { attr: "open" },
              props: {
                className: "titanic-date-time-popover titanic-date__popover",
                role: "dialog"
              },
              children: [
                {
                  tag: "div",
                  props: { className: "titanic-date__header" },
                  children: [
                    {
                      component: "Titanic.UI.Button",
                      props: {
                        type: "button",
                        variant: "ghost",
                        className: "titanic-date__nav-button",
                        "aria-label": { attr: "previousLabel" },
                        onClick: { method: "changeVisiblePeriod", args: [-1] }
                      },
                      children: [{ tag: "span", props: { "aria-hidden": true }, text: "<" }]
                    },
                    {
                      tag: "div",
                      props: { className: "titanic-date__header-title" },
                      children: [
                        {
                          component: "Titanic.UI.Button",
                          props: {
                            type: "button",
                            variant: "ghost",
                            className: "titanic-date__mode-button",
                            onClick: { method: "openMonthMode" }
                          },
                          text: { attr: "visibleMonthLabel" }
                        },
                        {
                          component: "Titanic.UI.Button",
                          props: {
                            type: "button",
                            variant: "ghost",
                            className: "titanic-date__mode-button",
                            onClick: { method: "openYearMode" }
                          },
                          text: { attr: "visibleYear" }
                        }
                      ]
                    },
                    {
                      component: "Titanic.UI.Button",
                      props: {
                        type: "button",
                        variant: "ghost",
                        className: "titanic-date__nav-button",
                        "aria-label": { attr: "nextLabel" },
                        onClick: { method: "changeVisiblePeriod", args: [1] }
                      },
                      children: [{ tag: "span", props: { "aria-hidden": true }, text: ">" }]
                    }
                  ]
                },
                {
                  tag: "div",
                  when: { eq: [{ attr: "calendarMode" }, "day"] },
                  props: { className: "titanic-date__calendar", role: "grid" },
                  children: [
                    {
                      tag: "div",
                      props: { className: "titanic-date__weekdays", role: "row" },
                      each: { attr: "weekdayLabels" },
                      as: "weekday",
                      children: [
                        {
                          tag: "span",
                          props: { className: "titanic-date__weekday", role: "columnheader" },
                          text: { local: "weekday" }
                        }
                      ]
                    },
                    {
                      tag: "div",
                      props: { className: "titanic-date__days" },
                      each: { attr: "calendarDays" },
                      as: "day",
                      key: { local: "day.isoDate" },
                      children: [
                        {
                          tag: "button",
                          props: {
                            type: "button",
                            className: { call: "getDayClassName", args: [{ local: "day" }] },
                            title: { local: "day.title" },
                            "aria-pressed": { local: "day.active" },
                            onClick: { method: "selectDate", args: [{ local: "day.isoDate" }] }
                          },
                          text: { local: "day.label" }
                        }
                      ]
                    }
                  ]
                },
                {
                  tag: "div",
                  when: { eq: [{ attr: "calendarMode" }, "month"] },
                  props: { className: "titanic-date__month-grid" },
                  each: { attr: "monthOptions" },
                  as: "monthOption",
                  key: { local: "monthOption.month" },
                  children: [
                    {
                      tag: "button",
                      props: {
                        type: "button",
                        className: { call: "getMonthOptionClassName", args: [{ local: "monthOption" }] },
                        onClick: { method: "selectVisibleMonth", args: [{ local: "monthOption.month" }] }
                      },
                      text: { local: "monthOption.label" }
                    }
                  ]
                },
                {
                  tag: "div",
                  when: { eq: [{ attr: "calendarMode" }, "year"] },
                  props: { className: "titanic-date__year-grid" },
                  each: { attr: "yearOptions" },
                  as: "year",
                  key: { local: "year" },
                  children: [
                    {
                      tag: "button",
                      props: {
                        type: "button",
                        className: { call: "getYearOptionClassName", args: [{ local: "year" }] },
                        onClick: { method: "selectVisibleYear", args: [{ local: "year" }] }
                      },
                      text: { local: "year" }
                    }
                  ]
                },
                {
                  tag: "div",
                  props: { className: "titanic-date__actions" },
                  children: [
                    {
                      component: "Titanic.UI.Button",
                      props: {
                        type: "button",
                        variant: "ghost",
                        className: "titanic-date__action",
                        onClick: { method: "selectToday" }
                      },
                      text: { path: "resolvedLabels.today" }
                    },
                    {
                      component: "Titanic.UI.Button",
                      props: {
                        type: "button",
                        variant: "ghost",
                        className: "titanic-date__action",
                        disabled: { not: { attr: "normalizedValue" } },
                        onClick: { method: "clearDate" }
                      },
                      text: { path: "resolvedLabels.clear" }
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
      when: { and: [{ attr: "visible" }, { not: { attr: "renderFrame" } }] },
      props: {
        ref: { attr: "rootRef" },
        className: { attr: "rootClasses" }
      },
      children: [
        {
          tag: "input",
          props: {
            id: { attr: "hiddenInputId" },
            name: { attr: "resolvedName" },
            type: "date",
            hidden: true,
            value: { attr: "normalizedValue" },
            readOnly: true,
            disabled: { attr: "disabled" }
          }
        },
        {
          tag: "div",
          props: {
            className: { attr: "controlClasses" },
            "aria-invalid": { attr: "invalidForControl" }
          },
          children: [
            {
              tag: "input",
              props: {
                id: { attr: "resolvedId" },
                className: { attr: "inputClasses" },
                type: "text",
                value: { attr: "inputDraft" },
                placeholder: { coalesce: [{ attr: "placeholder" }, { path: "resolvedLabels.placeholder" }] },
                disabled: { attr: "disabled" },
                readOnly: { not: { attr: "editable" } },
                "aria-label": { attr: "ariaLabel" },
                "aria-invalid": { attr: "invalidForControl" },
                "aria-describedby": { attr: "errorId" },
                "aria-labelledby": { attr: "titleId" },
                onChange: { method: "handleManualChange" },
                onFocus: { method: "handleInputFocus" },
                onBlur: { method: "handleInputBlur" },
                onKeyDown: { method: "handleInputKeyDown" }
              }
            },
            {
              component: "Titanic.UI.Button",
              props: {
                type: "button",
                variant: "ghost",
                className: "titanic-date__trigger",
                disabled: { attr: "readOnly" },
                "aria-label": { path: "resolvedLabels.selectedDate" },
                "aria-expanded": { attr: "open" },
                onClick: { method: "toggleOpen" }
              },
              children: [{ tag: "span", props: { "aria-hidden": true }, text: "Calendar" }]
            }
          ]
        },
        {
          tag: "div",
          when: { attr: "open" },
          props: {
            className: "titanic-date-time-popover titanic-date__popover",
            role: "dialog"
          },
          children: [
            {
              tag: "div",
              props: { className: "titanic-date__header" },
              children: [
                {
                  component: "Titanic.UI.Button",
                  props: {
                    type: "button",
                    variant: "ghost",
                    className: "titanic-date__nav-button",
                    "aria-label": { attr: "previousLabel" },
                    onClick: { method: "changeVisiblePeriod", args: [-1] }
                  },
                  children: [{ tag: "span", props: { "aria-hidden": true }, text: "<" }]
                },
                {
                  tag: "div",
                  props: { className: "titanic-date__header-title" },
                  children: [
                    {
                      component: "Titanic.UI.Button",
                      props: {
                        type: "button",
                        variant: "ghost",
                        className: "titanic-date__mode-button",
                        onClick: { method: "openMonthMode" }
                      },
                      text: { attr: "visibleMonthLabel" }
                    },
                    {
                      component: "Titanic.UI.Button",
                      props: {
                        type: "button",
                        variant: "ghost",
                        className: "titanic-date__mode-button",
                        onClick: { method: "openYearMode" }
                      },
                      text: { attr: "visibleYear" }
                    }
                  ]
                },
                {
                  component: "Titanic.UI.Button",
                  props: {
                    type: "button",
                    variant: "ghost",
                    className: "titanic-date__nav-button",
                    "aria-label": { attr: "nextLabel" },
                    onClick: { method: "changeVisiblePeriod", args: [1] }
                  },
                  children: [{ tag: "span", props: { "aria-hidden": true }, text: ">" }]
                }
              ]
            },
            {
              tag: "div",
              when: { eq: [{ attr: "calendarMode" }, "day"] },
              props: { className: "titanic-date__calendar", role: "grid" },
              children: [
                {
                  tag: "div",
                  props: { className: "titanic-date__weekdays", role: "row" },
                  each: { attr: "weekdayLabels" },
                  as: "weekday",
                  children: [
                    {
                      tag: "span",
                      props: { className: "titanic-date__weekday", role: "columnheader" },
                      text: { local: "weekday" }
                    }
                  ]
                },
                {
                  tag: "div",
                  props: { className: "titanic-date__days" },
                  each: { attr: "calendarDays" },
                  as: "day",
                  key: { local: "day.isoDate" },
                  children: [
                    {
                      tag: "button",
                      props: {
                        type: "button",
                        className: { call: "getDayClassName", args: [{ local: "day" }] },
                        title: { local: "day.title" },
                        "aria-pressed": { local: "day.active" },
                        onClick: { method: "selectDate", args: [{ local: "day.isoDate" }] }
                      },
                      text: { local: "day.label" }
                    }
                  ]
                }
              ]
            },
            {
              tag: "div",
              when: { eq: [{ attr: "calendarMode" }, "month"] },
              props: { className: "titanic-date__month-grid" },
              each: { attr: "monthOptions" },
              as: "monthOption",
              key: { local: "monthOption.month" },
              children: [
                {
                  tag: "button",
                  props: {
                    type: "button",
                    className: { call: "getMonthOptionClassName", args: [{ local: "monthOption" }] },
                    onClick: { method: "selectVisibleMonth", args: [{ local: "monthOption.month" }] }
                  },
                  text: { local: "monthOption.label" }
                }
              ]
            },
            {
              tag: "div",
              when: { eq: [{ attr: "calendarMode" }, "year"] },
              props: { className: "titanic-date__year-grid" },
              each: { attr: "yearOptions" },
              as: "year",
              key: { local: "year" },
              children: [
                {
                  tag: "button",
                  props: {
                    type: "button",
                    className: { call: "getYearOptionClassName", args: [{ local: "year" }] },
                    onClick: { method: "selectVisibleYear", args: [{ local: "year" }] }
                  },
                  text: { local: "year" }
                }
              ]
            },
            {
              tag: "div",
              props: { className: "titanic-date__actions" },
              children: [
                {
                  component: "Titanic.UI.Button",
                  props: {
                    type: "button",
                    variant: "ghost",
                    className: "titanic-date__action",
                    onClick: { method: "selectToday" }
                  },
                  text: { path: "resolvedLabels.today" }
                },
                {
                  component: "Titanic.UI.Button",
                  props: {
                    type: "button",
                    variant: "ghost",
                    className: "titanic-date__action",
                    disabled: { not: { attr: "normalizedValue" } },
                    onClick: { method: "clearDate" }
                  },
                  text: { path: "resolvedLabels.clear" }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});
