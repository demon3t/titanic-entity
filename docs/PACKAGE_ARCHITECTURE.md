# Пакетная архитектура @titanic-entity/entity-react

Этот документ описывает, как UI-элементы библиотеки регистрируются через базовый пакет `entity-base` и как их расширять в прикладных пакетах.

## Цели

- Держать базовый UI в общем пакете, а прикладные настройки в пакетах приложения.
- Разрешить пакетам-наследникам переопределять внутреннюю логику компонента без копирования всего компонента.
- Описывать страницы и разделы декларативно, ближе к BPMSoft/Creatio-подходу.
- Разделить разные типы UI-элементов: шаблоны, поля, гриды, enum, модули, компоненты.
- Сохранить обратную совместимость через общий `component` registry.

## Основные понятия

### Package

Пакет описывается через `definePackage`.

```ts
export const packageDescriptor = definePackage({
  name: "Titanic.Main",
  version: "0.1.0",
  dependsOn: ["Titanic.UI"],
  schemas: []
});
```

`dependsOn` задает порядок регистрации. Зависимости регистрируются раньше, поэтому дочерний пакет может заменить схему базового пакета.

### Schema

Schema - единица регистрации внутри пакета. Сейчас поддерживаются следующие виды:

| kind | Назначение |
| --- | --- |
| `workspace` | Рабочее место в навигации |
| `section` | Раздел внутри рабочего места или самостоятельный раздел |
| `page` | Страница с React-компонентом |
| `template` | Переиспользуемый шаблон страницы |
| `field` | Переиспользуемый элемент поля |
| `grid` | Переиспользуемый грид, список или реестр |
| `enum` | Перечисление, доступное через пакетный registry |
| `module` | Произвольный экспорт пакета |
| `component` | Общий компонент, если более узкий тип не подходит |

## Границы `entity-base`

`@titanic-entity/entity-base` содержит только фундаментальный слой пакетной системы:

- общие типы схем, descriptor и registry;
- `define*Schema` helpers и `definePackage`;
- сборку runtime registry через `createPackageRegistry` и `createPackageFromDescriptor`;
- React provider/hooks для доступа к уже собранному registry;
- глобальный `Titanic` registry для enum и icon resources.

Доменные Entity API модели, готовые UI-компоненты, ресурсы, стили и бизнес-логика остаются в профильных пакетах. Для npm-пакета публичными entrypoints считаются корневой импорт `@titanic-entity/entity-base`, а также совместимые subpath-импорты `@titanic-entity/entity-base/enumValues` и `@titanic-entity/entity-base/Titanic`. Внутренние файлы `src/*` не считаются публичным API.

## Границы `entity-resources`

`@titanic-entity/entity-resources` содержит сериализуемые ресурсы, которые могут потребляться React-компонентами, package registry и прикладными пакетами.

Стабильные entrypoints:

| entrypoint | Назначение |
| --- | --- |
| `@titanic-entity/entity-resources` | Совместимый root-фасад, descriptor `titanicEntityResourcesPackage`, схемы и ресурсы |
| `@titanic-entity/entity-resources/icons` | SVG icon resources, сгруппированные icon maps и helper-типы |
| `@titanic-entity/entity-resources/media` | Медиа-ресурсы |
| `@titanic-entity/entity-resources/assets` | Общий facade ресурсов |
| `@titanic-entity/entity-resources/schemas` | Package schemas ресурсов |
| `@titanic-entity/entity-resources/model` | Имена модулей и package constants |

Иконки лежат по одной в папке. В каждой папке есть `index.ts` с serializable resource descriptor и `icon.svg` с тем же вектором для прямого просмотра:

```text
src/assets/icons/close/
  index.ts
  icon.svg
```

После регистрации `titanicEntityResourcesPackage` иконки доступны через `Titanic.Icons`:

```ts
Titanic.registerPackage(titanicEntityResourcesPackage);

const closeIcon = Titanic.Icons.get("close");
const sameIcon = Titanic.Icons.close;
```

В runtime зарегистрированные иконки также доступны как динамические свойства самого registry, например `Titanic.Icons.close`. Если путь не найден, `Titanic.Icons.get(...)` возвращает default-иконку `unknown`; реальное наличие проверяется через `Titanic.Icons.has(...)` или `Titanic.Icons.find(...)`.
Иконки можно переопределять по публичному пути:

```ts
Titanic.Icons.override("close", appCloseIcon);
Titanic.Icons.overrideIcons({
  close: appCloseIcon
});
Titanic.Icons.overrideDefault(appUnknownIcon);
```

Основной сценарий темизации иконок - CSS-класс темы и `currentColor`. Если конкретной иконке нужен другой vector resource для темы, она может объявить `themes`, а потребитель может получить вариант через `Titanic.Icons.get("path.to.icon", { theme })` или `ResourceSvgIcon` с prop `theme`. `ResourceSvgIcon` принимает как ресурс, так и строковый путь; для `undefined` или отсутствующего пути будет отрисована default-иконка.

## Границы `entity-icons`

`@titanic-entity/entity-icons` содержит расширяемые коллекции иконок. Пакет может переиспользовать descriptors из `entity-resources`, но не владеет системными SVG-файлами: базовые UI icon resources остаются в `entity-resources`, а новые прикладные наборы публикуются как отдельные icon packages.

Стабильные entrypoints:

| entrypoint | Назначение |
| --- | --- |
| `@titanic-entity/entity-icons` | Root-фасад, descriptor `titanicEntityIconsPackage`, коллекции и схемы |
| `@titanic-entity/entity-icons/icons` | Плоский typed icon map `entityIcons` и direct icon exports |
| `@titanic-entity/entity-icons/assets` | Общий facade assets |
| `@titanic-entity/entity-icons/assets/icons` | Icon collection assets |
| `@titanic-entity/entity-icons/schemas` | Package schemas коллекции иконок |
| `@titanic-entity/entity-icons/model` | Имена package и icon module |

Коллекция описывается через `defineIconResources`, поэтому она совместима с глобальным registry:

```ts
import { Titanic } from "@titanic-entity/entity-base";
import { titanicEntityIconsPackage } from "@titanic-entity/entity-icons";

Titanic.registerPackage(titanicEntityIconsPackage);

const shortPath = Titanic.Icons.get("calendar");
const packagePath = Titanic.Icons.get("Titanic.EntityIcons.calendar");
const modulePath = Titanic.Icons.get("Titanic.EntityIcons.Icons.calendar");
```

Для новых прикладных или продуктовых наборов используйте такую же форму: typed flat icon map, schema через `defineIconResources`, package descriptor через `definePackage` или `defineIconPackage`, отдельные стабильные entrypoints для runtime imports.

## Границы `entity-react`

`@titanic-entity/entity-react` отвечает только за React-слой поверх `entity-base`, `entity-core`, `entity-api` и `entity-resources`.

Стабильные entrypoints для React-приложений:

| entrypoint | Назначение |
| --- | --- |
| `@titanic-entity/entity-react` | Совместимый root-фасад и descriptor `titanicEntityReactUiPackage` |
| `@titanic-entity/entity-react/headless` | State hooks и контроллеры без визуального слоя |
| `@titanic-entity/entity-react/components` | Общие React-компоненты: forms, actions, records, icons, feedback, site controls |
| `@titanic-entity/entity-react/fields` | Поля и input-компоненты |
| `@titanic-entity/entity-react/grids` | Гриды, таблицы, списки, registry-компоненты и grid-модели |
| `@titanic-entity/entity-react/layout` | Layout primitives и site shell |
| `@titanic-entity/entity-react/templates` | Переиспользуемые page templates |
| `@titanic-entity/entity-react/resources` | React UI resources и локализации |
| `@titanic-entity/entity-react/system` | Системные helper-модели для React UI |
| `@titanic-entity/entity-react/schemas` и `/model` | Package schemas и registry names |

Внутренними считаются прямые импорты в файлы реализации, например `grids/EntityDataGrid`, `fields/EntityField`, `grids/column-settings/model/*` и `templates/entity-edit/models/*`. Их можно менять при внутреннем рефакторинге без отдельной гарантии совместимости. Для публичных методов и hooks TSDoc-комментарии пишутся на английском.

Headless-слой содержит логику состояния, которую можно переиспользовать без готового visual component:

- `useEntityFormState` - управляет значениями schema-driven формы.
- `useEntityEditPageController` - строит controller/context для `EntityEditPage` template.

## Навигация

Навигация строится из `workspace` и `section`.

Можно использовать один из двух режимов:

1. Есть рабочие места, а разделы входят в рабочие места.
2. Рабочих мест нет, а разделы живут самостоятельно.

Смешивать эти режимы нельзя. Если зарегистрировано хотя бы одно рабочее место, каждый раздел должен быть привязан к рабочему месту через `workspaceName` или через список `sections` в рабочем месте.

```ts
defineWorkspaceSchema({
  kind: "workspace",
  name: "Administration",
  title: "Администрирование",
  sections: ["Users", "Dictionaries"]
});

defineSectionSchema({
  kind: "section",
  name: "Users",
  title: "Пользователи",
  pageName: "UsersPage"
});
```

## Привязка к сущности

Страницы, разделы, шаблоны, поля, гриды и модули могут иметь привязку к Entity ORM объекту.

```ts
defineSectionSchema({
  kind: "section",
  name: "Users",
  title: "Пользователи",
  entity: {
    entityName: "app_user",
    providerName: "default"
  }
});
```

Если нужен только объект без провайдера, можно использовать короткий вариант:

```ts
entityName: "app_user"
```

## Entity API и ESQ

`@titanic-entity/entity-api` содержит HTTP-клиент, модели запросов и fluent builder `entityQuery(...)` для сборки ESQ без ручного JSON.

Публичные ESQ-модели доступны под короткими именами: `ESQ`, `ESQColumn`, `ESQFilter`, `ESQFilterCollection`, `ESQOrder`.

`@titanic-entity/entity-core` расширяет статический `Titanic` factory-методами для фильтров: `Titanic.createIsEqualFilter(...)`, `Titanic.createIsNullFilter(...)`, `Titanic.createAndFilter(...)`, `Titanic.createFilterCollection(...)` и другими методами по `ConditionOperator`.

Query builder поддерживает постепенное добавление колонок, сортировки, фильтры, группы фильтров и агрегаты:

```ts
const query = entityQuery("invoice")
  .column("CustomerId")
  .sum("Amount", "totalAmount")
  .count("Id", "invoiceCount")
  .groupBy("CustomerId");
```

## Базовый UI-пакет

`packages/entity-ui/src/index.ts` экспортирует `titanicUIPackage`. Он регистрирует набор UI-элементов библиотеки и зависит от пакетов `Titanic.Entity`, `Titanic.EntityApi`, `Titanic.EntityResources` и `Titanic.EntityReact`.

Файлы UI-объектов внутри `packages/entity-ui/src` лежат сразу на верхнем уровне: `form`, `field`, `dataGrid`, `editPage` и так далее. Runtime может жить в соседнем пакете, например в `packages/entity-react/src/grids`, а `packages/entity-ui/src/dataGrid` регистрирует его в пакетных schema-дескрипторах.

Каждый UI-объект лежит в отдельной папке:

```text
dataGrid/
  icons/
    index.ts
  resources/
    index.ts
  index.ts
  DataGrid.ts
```

Вложенные UI-объекты, например row context menu для `dataGrid`, выносятся в собственную папку с такой же структурой. Групповые файлы вроде `components.ts`, `fields.ts`, `grids.ts`, `templates.ts` и `schemas.ts` остаются агрегаторами и импортируют схемы из папок конкретных UI-объектов.

Стабильные entrypoints для schema-пакета:

| entrypoint | Назначение |
| --- | --- |
| `@titanic-entity/entity-ui` | Root-фасад, descriptor `titanicUIPackage` и совместимые re-export'ы |
| `@titanic-entity/entity-ui/components` | Агрегированный набор component schemas |
| `@titanic-entity/entity-ui/fields` | Агрегированный набор field schemas |
| `@titanic-entity/entity-ui/grids` | Агрегированный набор grid schemas, настройки и публичные grid-типы |
| `@titanic-entity/entity-ui/templates` | Агрегированный набор template schemas |
| `@titanic-entity/entity-ui/<uiObject>` | Схемы конкретного UI-объекта, например `form`, `dataGrid`, `editPage` |
| `@titanic-entity/entity-ui/<uiObject>/icons` | Иконки конкретного UI-объекта |
| `@titanic-entity/entity-ui/<uiObject>/resources` | Resources конкретного UI-объекта |
| `@titanic-entity/entity-ui/schemas` | Агрегированный набор схем `entityUiSchemas` |
| `@titanic-entity/entity-ui/styles.css` | Совместимый style entrypoint, который пробрасывает базовые стили из `entity-react` |

`entity-ui` не владеет runtime CSS для компонентов. Базовые стили живут в `packages/entity-react/src/styles`, а `entity-ui/styles.css` остается тонким публичным входом для совместимого подключения.

### Template

- `editPage`

### Field

- `dateInput`
- `field`
- `jsonEditor`
- `lookupInput`
- `numberInput`

### Grid

- `dataGrid`
- `grid`

### Enum

Enum регистрируются в профильных пакетах: `EntityColumnKind` в `Titanic.Entity`, API enum в `Titanic.EntityApi`.

### Component

Все элементы также доступны через общий component registry, чтобы старый код продолжал работать и чтобы компоненты без узкой категории можно было получать единым способом.

## Получение элементов из registry

```tsx
const Field = useUiField("EntityField", EntityField);
const Grid = useUiGrid("EntityDataGrid", EntityDataGrid);
const Template = useUiTemplate("EntityEditPage", EntityEditPage);
const columnKinds = useUiEnum("EntityColumnKind", EntityColumnKind);
```

Если компонент обязателен и fallback не нужен, можно использовать registry напрямую:

```ts
const registry = useUiPackageRegistry();
const EntityField = registry?.getField("EntityField");
```

## Расширение компонента

Расширение получает базовый компонент и возвращает новый компонент с той же сигнатурой props.

```tsx
import { defineFieldSchema } from "@titanic-entity/entity-base";
import type { EntityFieldProps } from "@titanic-entity/entity-react/fields";

export const strictFieldSchema = defineFieldSchema<EntityFieldProps>({
  kind: "field",
  name: "EntityField",
  replaces: "Titanic.UI.EntityField",
  extension: ({ baseComponent: BaseField }) => function StrictField(props) {
    return (
      <div className="strict-field">
        {BaseField ? <BaseField {...props} /> : null}
      </div>
    );
  }
});
```

Правило: если пакет только меняет внешний контейнер или добавляет поведение, используйте `extension`. Если компонент полностью другой, используйте `component` и `replaces`.

## Расширение enum

Enum можно заменить или дополнить через `extension`.

```ts
const customColumnKindSchema = defineEnumSchema({
  kind: "enum",
  name: "EntityColumnKind",
  replaces: "Titanic.Entity.EntityColumnKind",
  extension: ({ baseValues }) => ({
    ...(baseValues ?? {}),
    File: 10
  })
});
```

В registry enum сохраняется под коротким именем и полным именем пакета. Например, `EntityColumnKind` и `Titanic.Entity.EntityColumnKind`.

## Descriptor JSON

Пакет можно описывать JSON-дескриптором, а `entity-base` соберет схемы через `createPackageFromDescriptor`.

```json
{
  "name": "Titanic.Main",
  "version": "0.1.0",
  "dependsOn": ["Titanic.UI"],
  "schemas": [
    {
      "kind": "page",
      "name": "UsersPage",
      "path": "./Schemas/UsersPage",
      "component": "UsersPage"
    },
    {
      "kind": "section",
      "name": "Users",
      "title": "Пользователи",
      "path": "./Schemas/UsersPage",
      "page": "UsersPage",
      "entity": {
        "entityName": "app_user",
        "providerName": "default"
      }
    }
  ]
}
```

Для descriptor-based пакетов приложение передает карту модулей:

```ts
const modules = import.meta.glob("./packages/**/{Schemas,Resources}/**/*.{ts,tsx}", {
  eager: true
});
```

## Ресурсы

Ресурсы пакета должны лежать рядом с пакетом и описывать логический элемент: страницу, сущность, workspace или другое самостоятельное место.

Пример структуры:

```text
Resources/
  DemoWorkspacePage/
    en-US.ts
    ru-RU.ts
    cultureIcons.ts
    shellIcons.ts
    loaderGifs.ts
  quality_gate/
    en-US.ts
    ru-RU.ts
```

Иконки и GIF-коллекции тоже считаются ресурсами. Для них есть общие типы:

- `ResourceSvgIconResource`
- `ResourceSvgIconMap`
- `GifCollectionResource`

Расширяемые и прикладные коллекции иконок вынесены в отдельные ресурсные пакеты, чтобы не перегружать базовый `@titanic-entity/entity-resources` и подключать коллекции выборочно. Общая UI-коллекция живет в `@titanic-entity/entity-icons`: пакет зависит от `@titanic-entity/entity-base` и `@titanic-entity/entity-resources`, экспортирует typed icon maps через стабильные entrypoints и регистрирует `defineIconResources` descriptor обычной регистрацией пакетов. После регистрации lookup работает через `Titanic.Icons.get(...)` и совместимый alias `Titanic.icons.get(...)` по коротким путям вроде `dataGrid.columns`, а также по package-qualified путям вроде `Titanic.EntityIcons.dataGrid.columns` и `Titanic.EntityIcons.Icons.dataGrid.columns`. Базовый `entity-resources` остается местом для системных UI-иконок, fallback-ресурсов, флагов культур и GIF/media primitives.

## EntityDataGrid как общий грид

`EntityDataGrid` - основной переиспользуемый грид для реестров.

Что он умеет:

- Загружает структуру провайдера через `EntityApiClient.getStructure()`.
- Строит список доступных колонок по структуре Entity ORM API.
- Позволяет выбрать видимые колонки.
- Сохраняет настройки видимых колонок в `localStorage`.
- Может работать с внешними `rows` и `columns`, если данные загружены снаружи.
- Поддерживает loader через `GifCollectionResource`.

Минимальный пример:

```tsx
<EntityDataGrid
  gridId="department-grid"
  client={client}
  tableName="department"
  rowCount={50}
/>
```

## EntityApiProvider и несколько клиентов

`EntityApiProvider` принимает основной клиент и дополнительные клиенты.

```tsx
<EntityApiProvider
  client={mainClient}
  clients={{ personalData: personalDataClient }}
>
  <AppPage />
</EntityApiProvider>
```

Получение клиента:

```ts
const defaultClient = useEntityApiClient();
const personalClient = useEntityApiClient("personalData");
```

## Правила добавления новых UI-элементов

1. Если элемент нужен базовой библиотеке, добавляйте его в подходящий каталог `packages/entity-react/src/components` или `packages/entity-react/src/templates`.
2. Если элемент является полем, регистрируйте его через `defineFieldSchema`.
3. Если элемент является гридом, списком или реестром, регистрируйте его через `defineGridSchema`.
4. Если элемент является шаблоном страницы, регистрируйте его через `defineTemplateSchema`.
5. Если добавляется enum, регистрируйте его через `defineEnumSchema`.
6. Если элемент прикладной и нужен только одному приложению, держите его в пакете приложения.
7. Если пакет-наследник меняет поведение базового элемента, используйте `replaces` и `extension`.

## Проверка изменений

Для библиотеки минимум:

```bash
npm run typecheck
npm run build
```

Если изменение затрагивает демо-приложение, дополнительно запускайте сборку демо:

```bash
cd ../titanic-entity-react-demo
npm run build
```
