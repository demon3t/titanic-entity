import { defineIconModuleSchema } from "@titanic-entity/entity-base";
import { titanicCommonIcons } from "@titanic-entity/entity-icons";

export { titanicCommonIcons } from "@titanic-entity/entity-icons";

export const titanicRecordsPageIcons = {
  titanicDragHandle: titanicCommonIcons.titanicDragHandle
} as const;

export const titanicRecordsPageIconGroups = {
  recordsPage: titanicRecordsPageIcons
} as const;

export const recordsPageIconModuleSchema = defineIconModuleSchema({
  name: "Titanic.EntityUi.RecordsPage.Icons",
  exports: {
    icons: titanicRecordsPageIconGroups,
    titanicRecordsPageIconGroups,
    titanicRecordsPageIcons
  }
});

export const recordsPageIconSchemas = [
  recordsPageIconModuleSchema
] as const;
