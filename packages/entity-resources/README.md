# @titanic-entity/entity-resources

Shared resource package for Titanic.Entity UI packages. This package ships reusable assets and resource schemas. Localized strings are owned by the package or application that renders the UI.

## Public Entrypoints

```ts
import {
  closeIcon,
  entityResourceIcons,
  type ResourceSvgIconResource
} from "@titanic-entity/entity-resources/icons";

import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";
```

Stable entrypoints:

- `@titanic-entity/entity-resources` - package descriptor, schemas and resource facade.
- `@titanic-entity/entity-resources/assets` - packaged asset groups.
- `@titanic-entity/entity-resources/icons` - icon resources and icon helper types.
- `@titanic-entity/entity-resources/media` - media resources.
- `@titanic-entity/entity-resources/schemas` - resource package schemas.
- `@titanic-entity/entity-resources/model` - package model constants.

This package intentionally has no localization entrypoint and does not ship localized strings.

## Icon Folders

Each icon lives in its own folder:

```text
src/assets/icons/close/
- index.ts
- icon.svg
```

`index.ts` exports the serializable runtime resource used by registries and renderers. `icon.svg` contains the same vector data for review without opening generated code.

The flat icon map and individual icons are exported from `src/assets/icons/index.ts`:

- `entityResourceIcons`
- `closeIcon`
- `calendarIcon`
- `ruRuIcon`
- `enUsIcon`

## Titanic.Icons

Register `titanicEntityResourcesPackage` to expose icons through the global Titanic facade:

```ts
import { Titanic } from "@titanic-entity/entity-base";
import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";

Titanic.registerPackage(titanicEntityResourcesPackage);

const closeIcon = Titanic.Icons.get("close");
const sameIcon = Titanic.Icons.close;
```

At runtime, registered icons are also exposed as properties on `Titanic.Icons`, for example `Titanic.Icons.close`.

Registered icons can be overridden by public path:

```ts
Titanic.Icons.override("close", appCloseIcon);
Titanic.Icons.overrideIcons({
  close: appCloseIcon
});
```

Later `registerIcons(...)` calls with the same flat icon name also replace the existing icon.

## Reusable Icon Packages

Other projects can register their own icon resources without hand-writing module schemas.

For direct runtime registration:

```ts
import { Titanic } from "@titanic-entity/entity-base";
import { appIcons } from "./icons";

Titanic.Icons.registerIcons(appIcons, {
  packageName: "Acme.App"
});

const saveIcon = Titanic.Icons.get("save");
const sameIcon = Titanic.Icons.save;
```

For a package descriptor that can be reused across apps:

```ts
import { defineIconPackage } from "@titanic-entity/entity-base";
import { appIcons } from "./icons";

export const acmeAppIconsPackage = defineIconPackage({
  name: "Acme.App.Resources",
  icons: appIcons
});
```

For mixed UI packages, add only the icon schema:

```ts
import { defineIconResources, definePackage } from "@titanic-entity/entity-base";
import { appIcons } from "./icons";

export const acmeAppPackage = definePackage({
  name: "Acme.App",
  schemas: [
    defineIconResources({
      name: "Acme.App.Icons",
      icons: appIcons
    })
  ]
});
```

When `groupName` is omitted, every top-level key in `icons` is registered directly on `Titanic.Icons`. Use `groupName` only when a package intentionally wants a grouped public path such as `Titanic.Icons.get("app.save")`.

## Themes

Most icons use `currentColor`; theme classes should set text/icon color on the host element and the SVG will update automatically:

```tsx
<ResourceSvgIcon className="app-theme-dark__icon" icon={closeIcon} />
```

When an icon needs a different vector shape per theme, define `themes` on the icon resource and resolve it explicitly:

```ts
const themedIcon = Titanic.Icons.get("themeLight", { theme: "dark" });
```

React renderers can also pass the optional `theme` prop to `ResourceSvgIcon`.

## Localization Boundary

Localization APIs belong to `@titanic-entity/entity-base`; localized strings are registered by consuming packages or applications.

```ts
import { Titanic } from "@titanic-entity/entity-base";

Titanic.Localization.registerGroup("app", {
  defaultLocale: "en-US",
  locales: {
    "en-US": { save: "Save" }
  }
});

const saveLabel = Titanic.Localization.t("app.save");
```

`entity-resources` only provides shared assets and resource schemas, so it does not include default UI text, culture dictionaries, or localization entrypoints.

## Resource Schemas

The exported schemas describe the supported resource package shapes. They are intentionally small and explicit so consumers can inspect resource packages without depending on internal folder layout.
