# @titanic-entity/entity-icons

Reusable icon collections for Titanic.Entity UI packages.

Use this package for stable, feature-level icon collections that are shared by React/UI packages or applications. It exports typed maps and a package schema that can be registered with the Titanic package registry.

## Entry Points

- `@titanic-entity/entity-icons`
- `@titanic-entity/entity-icons/icons`
- `@titanic-entity/entity-icons/assets/icons`
- `@titanic-entity/entity-icons/schemas`
- `@titanic-entity/entity-icons/model`

## Resource Boundaries

Use `@titanic-entity/entity-resources` for tiny system resources, fallback assets, flags, theme icons, media, and primitives that should remain available without higher-level UI collections.

Use `@titanic-entity/entity-icons` for reusable feature collections with stable lookup paths, such as `dataGrid.columns`, `dateInput.calendar`, and `siteShell.currentUser`.

App-specific or branded icons should stay in the app package until they are reused by more than one package.

## Registry

```ts
import { Titanic } from "@titanic-entity/entity-base";
import { titanicEntityIconsPackage } from "@titanic-entity/entity-icons";

Titanic.registerPackage(titanicEntityIconsPackage);

Titanic.Icons.get("dataGrid.columns");
Titanic.Icons.get("Titanic.EntityIcons.dataGrid.columns");
Titanic.Icons.get("Titanic.EntityIcons.Icons.dataGrid.columns");
```
