Titanic.define("Titanic.UI.DateTimeInput", {
  attributes: {
    id: {},
    name: {},
    value: {},
    disabled: { default: false },
    required: { default: false },
    className: { default: "" },
    locale: {},
    dateLabels: {},
    timeLabels: {},
    placeholder: {},
    datePlaceholder: {},
    timePlaceholder: {},
    renderFrame: { default: true },
    rootClassName: { default: "" },
    minuteStep: {},
    editable: { default: true },
    title: {},
    validationError: {},
    visible: { default: true },
    onChange: {},
    fallbackId: { id: true },
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
    normalizedValue: {
      value(this: any): string {
        return this.methods.normalizeDateTimeValue(this.attributes.value);
      }
    },
    dateValue: {
      value(this: any): string {
        return this.methods.getDatePart(this.attributes.normalizedValue);
      }
    },
    timeValue: {
      value(this: any): string {
        return this.methods.getTimePart(this.attributes.normalizedValue);
      }
    },
    readOnly: {
      value(this: any): boolean {
        return Boolean(this.attributes.disabled) || !this.attributes.editable;
      }
    },
    invalid: {
      value(this: any): boolean {
        return Boolean(this.attributes.validationError);
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
    rootClasses: {
      value(this: any): string {
        return this.methods.joinClassNames(
          "titanic-datetime-input",
          this.attributes.invalid ? "titanic-datetime-input_invalid" : "",
          this.attributes.rootClassName
        );
      }
    },
    useBaseControlClass: {
      value(this: any): boolean {
        return !this.methods.hasClassName(this.attributes.className, "titanic-field__control");
      }
    },
    controlClasses: {
      value(this: any): string {
        return this.methods.joinClassNames(
          this.attributes.useBaseControlClass ? "titanic-field__control" : "",
          "titanic-datetime-input__control",
          this.attributes.invalid ? "titanic-datetime-input__control_invalid" : "",
          this.attributes.readOnly ? "titanic-datetime-input__control_disabled" : "",
          this.attributes.className
        );
      }
    },
    resolvedDatePlaceholder: {
      value(this: any): string | undefined {
        return this.attributes.datePlaceholder ?? this.attributes.placeholder;
      }
    },
    dateInputId: {
      value(this: any): string {
        return this.attributes.resolvedId;
      }
    },
    dateInputName: {
      value(this: any): string {
        return `${this.attributes.resolvedName}Date`;
      }
    },
    timeInputId: {
      value(this: any): string {
        return `${this.attributes.resolvedId}-time`;
      }
    },
    timeInputName: {
      value(this: any): string {
        return `${this.attributes.resolvedName}Time`;
      }
    }
  },
  methods: {
    handleDateChange(this: any, nextDate: string | null): void {
      if (!nextDate) {
        this.attributes.onChange?.(null);
        return;
      }

      this.attributes.onChange?.(`${nextDate}T${this.attributes.timeValue || this.methods.getCurrentTime()}`);
    },

    handleTimeChange(this: any, nextTime: string | null): void {
      if (!nextTime) {
        if (this.attributes.dateValue) {
          this.attributes.onChange?.(`${this.attributes.dateValue}T00:00`);
          return;
        }

        this.attributes.onChange?.(null);
        return;
      }

      this.attributes.onChange?.(`${this.attributes.dateValue || this.methods.getCurrentDate()}T${nextTime}`);
    },

    hasClassName(this: any, className: string, targetClassName: string): boolean {
      return String(className).split(/\s+/).includes(targetClassName);
    },

    normalizeDateTimeValue(this: any, value: string | null | undefined): string {
      if (!value) {
        return "";
      }

      const normalizedValue = String(value).trim();
      const match = /^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{1,2}:\d{2})(?::\d{2}(?:\.\d+)?)?)?/.exec(normalizedValue);

      if (!match) {
        return "";
      }

      const date = this.methods.normalizeDatePart(match[1]);
      const time = this.methods.normalizeTimePart(match[2] ?? "00:00");

      return date && time ? `${date}T${time}` : "";
    },

    normalizeDatePart(this: any, value: string): string {
      return this.methods.parseIsoDate(value) ? value : "";
    },

    normalizeTimePart(this: any, value: string): string {
      const match = /^(\d{1,2}):(\d{2})$/.exec(value);

      if (!match) {
        return "";
      }

      const hour = Number(match[1]);
      const minute = Number(match[2]);

      if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return "";
      }

      return `${this.methods.padDateTimePart(hour)}:${this.methods.padDateTimePart(minute)}`;
    },

    parseIsoDate(this: any, value: string): Date | null {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

      if (!match) {
        return null;
      }

      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return this.methods.createValidDate(year, month, day);
    },

    createValidDate(this: any, year: number, month: number, day: number): Date | null {
      if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return null;
      }

      const date = new Date(year, month - 1, day);

      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
      }

      return date;
    },

    getDatePart(this: any, value: string): string {
      return value ? value.slice(0, 10) : "";
    },

    getTimePart(this: any, value: string): string {
      return value ? value.slice(11, 16) : "";
    },

    getCurrentDate(this: any): string {
      const now = new Date();
      return [
        now.getFullYear(),
        this.methods.padDateTimePart(now.getMonth() + 1),
        this.methods.padDateTimePart(now.getDate())
      ].join("-");
    },

    getCurrentTime(this: any): string {
      const now = new Date();
      return `${this.methods.padDateTimePart(now.getHours())}:${this.methods.padDateTimePart(now.getMinutes())}`;
    },

    padDateTimePart(this: any, value: number): string {
      return String(value).padStart(2, "0");
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
                className: { attr: "rootClasses" }
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
                      component: "Titanic.UI.DateInput",
                      props: {
                        id: { attr: "dateInputId" },
                        name: { attr: "dateInputName" },
                        disabled: { attr: "readOnly" },
                        required: { attr: "required" },
                        editable: { attr: "editable" },
                        visible: { attr: "visible" },
                        value: { attr: "dateValue" },
                        locale: { attr: "locale" },
                        labels: { attr: "dateLabels" },
                        placeholder: { attr: "resolvedDatePlaceholder" },
                        renderFrame: false,
                        rootClassName: "titanic-datetime-input__date",
                        className: "titanic-datetime-input__segment-control titanic-datetime-input__date-control",
                        validationError: { attr: "validationError" },
                        onChange: { method: "handleDateChange" }
                      }
                    },
                    {
                      tag: "span",
                      props: {
                        "aria-hidden": true,
                        className: "titanic-datetime-input__separator"
                      }
                    },
                    {
                      component: "Titanic.UI.TimeInput",
                      props: {
                        id: { attr: "timeInputId" },
                        name: { attr: "timeInputName" },
                        disabled: { attr: "readOnly" },
                        required: { attr: "required" },
                        editable: { attr: "editable" },
                        visible: { attr: "visible" },
                        value: { attr: "timeValue" },
                        locale: { attr: "locale" },
                        labels: { attr: "timeLabels" },
                        placeholder: { attr: "timePlaceholder" },
                        renderFrame: false,
                        rootClassName: "titanic-datetime-input__time",
                        className: "titanic-datetime-input__segment-control titanic-datetime-input__time-control",
                        minuteStep: { attr: "minuteStep" },
                        onChange: { method: "handleTimeChange" }
                      }
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
        className: { attr: "rootClasses" }
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
              component: "Titanic.UI.DateInput",
              props: {
                id: { attr: "dateInputId" },
                name: { attr: "dateInputName" },
                disabled: { attr: "readOnly" },
                required: { attr: "required" },
                editable: { attr: "editable" },
                visible: { attr: "visible" },
                value: { attr: "dateValue" },
                locale: { attr: "locale" },
                labels: { attr: "dateLabels" },
                placeholder: { attr: "resolvedDatePlaceholder" },
                renderFrame: false,
                rootClassName: "titanic-datetime-input__date",
                className: "titanic-datetime-input__segment-control titanic-datetime-input__date-control",
                validationError: { attr: "validationError" },
                onChange: { method: "handleDateChange" }
              }
            },
            {
              tag: "span",
              props: {
                "aria-hidden": true,
                className: "titanic-datetime-input__separator"
              }
            },
            {
              component: "Titanic.UI.TimeInput",
              props: {
                id: { attr: "timeInputId" },
                name: { attr: "timeInputName" },
                disabled: { attr: "readOnly" },
                required: { attr: "required" },
                editable: { attr: "editable" },
                visible: { attr: "visible" },
                value: { attr: "timeValue" },
                locale: { attr: "locale" },
                labels: { attr: "timeLabels" },
                placeholder: { attr: "timePlaceholder" },
                renderFrame: false,
                rootClassName: "titanic-datetime-input__time",
                className: "titanic-datetime-input__segment-control titanic-datetime-input__time-control",
                minuteStep: { attr: "minuteStep" },
                onChange: { method: "handleTimeChange" }
              }
            }
          ]
        }
      ]
    }
  ]
});
