# @titanic-entity/entity-resources

Shared resource package for Titanic.Entity UI packages.

## Public entrypoints

```ts
import {
  entityResourceIcons,
  entityCommonIcons,
  type ResourceSvgIconResource
} from "@titanic-entity/entity-resources/icons";

import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";
```

Stable entrypoints:

- `@titanic-entity/entity-resources` - package descriptor, schemas and resource facade.
- `@titanic-entity/entity-resources/icons` - icon resources and icon helper types.
- `@titanic-entity/entity-resources/media` - media resources.
- `@titanic-entity/entity-resources/assets` - assets facade.
- `@titanic-entity/entity-resources/schemas` - resource package schemas.
- `@titanic-entity/entity-resources/model` - package model constants.

## Icon folders

Each icon lives in its own folder:

```text
src/assets/icons/
  common/
    close/
      index.ts
      icon.svg
```

`index.ts` is the serializable runtime resource used by package registries and React renderers.
`icon.svg` is a preview file with the same vector data, so the icon can be opened directly from the repository.

Grouped icon maps are exported from `src/assets/icons/index.ts`:

- `entityCommonIcons`
- `entityDateInputIcons`
- `entityDataGridSettingsIcons`
- `entityDataGridRowActionIcons`
- `entitySiteShellIcons`
- `entityCultureIcons`
- `entityResourceIcons`

## Titanic.Icons

Register `titanicEntityResourcesPackage` to expose icons through the global Titanic facade:

```ts
import { Titanic } from "@titanic-entity/entity-base";
import { titanicEntityResourcesPackage } from "@titanic-entity/entity-resources";

Titanic.registerPackage(titanicEntityResourcesPackage);

const closeIcon = Titanic.Icons.get("common.close");
const sameIcon = Titanic.Icons.group("common")?.close;
```

At runtime, registered groups are also exposed as properties on `Titanic.Icons`, for example `Titanic.Icons.common`.

`Titanic.icons` remains as a deprecated compatibility alias for older code.

## Themes

Most icons use `currentColor`; theme classes should set text/icon color on the host element and the SVG will update automatically:

```tsx
<ResourceSvgIcon className="app-theme-dark__icon" icon={entityCommonIcons.close} />
```

When an icon needs a different vector shape per theme, define `themes` on the icon resource and resolve it explicitly:

```ts
const themedIcon = Titanic.Icons.get("siteShell.themeLight", { theme: "dark" });
```

React renderers can also pass the optional `theme` prop to `ResourceSvgIcon`.
