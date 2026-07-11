# @titanic-entity/entity-icons

Extensible icon collections for Titanic.Entity applications.

System UI icon descriptors live in `@titanic-entity/entity-resources`. This package composes those descriptors into a separately registerable collection that applications can depend on, extend, or replace without moving the base resources.

```ts
import { Titanic } from "@titanic-entity/entity-base";
import {
  entityIcons,
  titanicEntityIconsPackage
} from "@titanic-entity/entity-icons";

Titanic.registerPackage(titanicEntityIconsPackage);

const calendar = Titanic.Icons.get("calendar");
const sameCalendar = Titanic.Icons.get("Titanic.EntityIcons.calendar");
```

Stable entrypoints:

- `@titanic-entity/entity-icons`
- `@titanic-entity/entity-icons/icons`
- `@titanic-entity/entity-icons/assets`
- `@titanic-entity/entity-icons/assets/icons`
- `@titanic-entity/entity-icons/schemas`
- `@titanic-entity/entity-icons/model`
