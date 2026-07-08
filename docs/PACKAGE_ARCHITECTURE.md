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
  dependsOn: ["Titanic.EntityUi"],
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

`@titanic-entity/entity-core` расширяет статический `Titanic` factory-методами для фильтров: `Titanic.createEqualFilter(...)`, `Titanic.createIsNullFilter(...)`, `Titanic.createAndFilter(...)`, `Titanic.createFilterCollection(...)` и другими методами по `ConditionOperator`.

Query builder поддерживает постепенное добавление колонок, сортировки, фильтры, группы фильтров и агрегаты:

```ts
const query = entityQuery("invoice")
  .column("CustomerId")
  .sum("Amount", "totalAmount")
  .count("Id", "invoiceCount")
  .groupBy("CustomerId");
```

## Базовый UI-пакет

`packages/entity-ui/src/index.ts` ???????????? `titanicEntityUiPackage`. ?? ???????????? ??????? UI-???????? ?????????? ? ??????? ?? ??????? `Titanic.Entity`, `Titanic.EntityApi`, `Titanic.EntityResources` ? `Titanic.EntityReact`.

????? ?????? `packages/entity-ui/src` ????????????? ?? ?????????? ????????: `components`, `fields`, `grids`, `templates`. Runtime ????? ? ????????? ??????? ????? ? `packages/entity-react/src/grids`, ? ????? `packages/entity-ui/src/grids` ???????????????? ?? ? ????????? schema-???????????.

### Template

- `EntityEditPage`

### Field

- `EntityField`
- `NumberInput`
- `SelectEntity`

### Grid

- `EntityDataGrid`
- `EntityGrid`
- `EntityOrmList`
- `EntityRegistry`
- `EntityTable`

### Enum

Enum регистрируются в профильных пакетах: `EntityFieldKind` в `Titanic.Entity`, API enum в `Titanic.EntityApi`.

### Component

Все элементы также доступны через общий component registry, чтобы старый код продолжал работать и чтобы компоненты без узкой категории можно было получать единым способом.

## Получение элементов из registry

```tsx
const Field = useUiField("EntityField", EntityField);
const Grid = useUiGrid("EntityDataGrid", EntityDataGrid);
const Template = useUiTemplate("EntityEditPage", EntityEditPage);
const fieldKinds = useUiEnum("EntityFieldKind", EntityFieldKind);
```

Если компонент обязателен и fallback не нужен, можно использовать registry напрямую:

```ts
const registry = useUiPackageRegistry();
const EntityField = registry?.getField("EntityField");
```

## Расширение компонента

Расширение получает базовый компонент и возвращает новый компонент с той же сигнатурой props.

```tsx
import { defineFieldSchema, type EntityFieldProps } from "@titanic-entity/entity-react";

export const strictFieldSchema = defineFieldSchema<EntityFieldProps>({
  kind: "field",
  name: "EntityField",
  replaces: "Titanic.EntityUi.EntityField",
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
const customFieldKindSchema = defineEnumSchema({
  kind: "enum",
  name: "EntityFieldKind",
  replaces: "Titanic.Entity.EntityFieldKind",
  extension: ({ baseValues }) => ({
    ...(baseValues ?? {}),
    File: "file"
  })
});
```

В registry enum сохраняется под коротким именем и полным именем пакета. Например, `EntityFieldKind` и `Titanic.Entity.EntityFieldKind`.

## Descriptor JSON

Пакет можно описывать JSON-дескриптором, а `entity-base` соберет схемы через `createPackageFromDescriptor`.

```json
{
  "name": "Titanic.Main",
  "version": "0.1.0",
  "dependsOn": ["Titanic.EntityUi"],
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

1. ???? ??????? ????? ?????? ???????, ??????? ??? ? `packages/entity-react/src/components` ??? `packages/entity-react/src/templates` ???????? ??????.
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
