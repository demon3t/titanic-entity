import { defineIconModuleSchema } from "@titanic-entity/entity-base";
import { titanicCommonIcons, titanicDateInputIcons } from "@titanic-entity/entity-icons";

export { titanicCommonIcons, titanicDateInputIcons } from "@titanic-entity/entity-icons";

export const titanicDateInputCommonIcons = {
  titanicChevronLeft: titanicCommonIcons.titanicChevronLeft,
  titanicChevronRight: titanicCommonIcons.titanicChevronRight
} as const;

export const titanicDateInputIconGroups = {
  common: titanicDateInputCommonIcons,
  dateInput: titanicDateInputIcons
} as const;

export const dateInputIconModuleSchema = defineIconModuleSchema({
  name: "Titanic.EntityUi.DateInput.Icons",
  exports: {
    icons: titanicDateInputIconGroups,
    titanicDateInputCommonIcons,
    titanicDateInputIconGroups,
    titanicDateInputIcons
  }
});

export const dateInputIconSchemas = [
  dateInputIconModuleSchema
] as const;
