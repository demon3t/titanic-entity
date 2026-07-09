# @titanic-entity/entity-react

React/TypeScript библиотека для работы с `Titanic.Entity` и Entity ORM API. Пакет `entity-react` отвечает за React-слой: headless hooks, визуальные компоненты, layout, fields, grids, templates, ресурсы и стили. HTTP-клиент, ESQ builder, core-модели и package registry остаются в профильных пакетах и доступны из `entity-react` через совместимый root-фасад.

## Для чего нужен пакет

- Выполнять `Select`, `Save`, `Delete`, `Batch` и загрузку структуры провайдера через `EntityApiClient`.
- Описывать Entity UI через `EntitySchema` и колонки, а не через ручную верстку каждой формы.
- Строить ESQ-запросы через `entityQuery(...)`, без ручной сборки JSON.
- Использовать базовые поля, формы, таблицы, гриды, action-кнопки и шаблоны страниц.
- Подключать несколько Entity API провайдеров через один `EntityApiProvider`.
- Регистрировать UI как пакеты: страницы, разделы, рабочие места, шаблоны, поля, гриды, enum, модули и компоненты.
- Переопределять или расширять элементы базового пакета в пакетах-наследниках.

## Установка

```bash
npm install @titanic-entity/entity-react
```

Для локальной разработки из демо-приложения:

```bash
npm install ../titanic-entity-react
```

Стили подключаются один раз в приложении или через бандл библиотеки:

```tsx
import "@titanic-entity/entity-react/styles.css";
```

## Структура проекта

```text
src/
  packages/
    entity-base/       Базовый пакет: package registry, схемы, провайдер и Titanic
    entity-core/       Entity-модели, схемы и React provider
    entity-api/        HTTP-клиент, ESQ и API-схемы
    entity-resources/  ресурсы и иконки
    entity-react/      React headless hooks, components, fields, grids, layout, templates, resources, styles
    entity-ui/         UI package schemas: components, fields, grids, templates
```

Подробности пакетной архитектуры: [docs/PACKAGE_ARCHITECTURE.md](docs/PACKAGE_ARCHITECTURE.md).

## Быстрый старт

```tsx
import {
  EntityApiClient,
  entityQuery
} from "@titanic-entity/entity-api";
import {
  EntityApiProvider,
  EntityFieldKind,
  useEntityQuery,
  type EntitySchema
} from "@titanic-entity/entity-core";
import { EntityForm } from "@titanic-entity/entity-react/components";
import { EntityTable } from "@titanic-entity/entity-react/grids";
import "@titanic-entity/entity-react/styles.css";

const client = new EntityApiClient({
  baseUrl: "http://localhost:5006",
  apiPath: "/entity/local",
  getHeaders: () => ({ Authorization: "Bearer token" })
});

const departmentSchema: EntitySchema = {
  tableName: "department",
  primaryColumn: "Id",
  displayColumn: "Name",
  title: "Отдел",
  columns: [
    { path: "Id", label: "Id", readOnly: true, hidden: true },
    { path: "Name", label: "Название", kind: EntityFieldKind.String, required: true, gridSpan: 12 },
    { path: "Description", label: "Описание", kind: EntityFieldKind.Text, gridSpan: 24 }
  ]
};

function DepartmentList() {
  const query = entityQuery(departmentSchema.tableName)
    .select("Id", "Name", "Description")
    .take(20)
    .orderBy("Name");

  const { data, loading, error } = useEntityQuery(query);

  if (error) {
    return <div>{error.message}</div>;
  }

  return <EntityTable schema={departmentSchema} rows={data ?? []} loading={loading} />;
}

export function App() {
  return (
    <EntityApiProvider client={client}>
      <DepartmentList />
      <EntityForm schema={departmentSchema} />
    </EntityApiProvider>
  );
}
```

## EntityApiClient

`EntityApiClient` инкапсулирует транспорт к Entity ORM API.

Основные методы:

- `execute(request)` - выполнить одну операцию Entity API.
- `batch(request)` - выполнить пакет операций.
- `select(query)` - выполнить ESQ select.
- `selectEntityRows(request)` - выполнить простой select по таблице через объект запроса.
- `selectRows(tableName, columns, options)` - выполнить короткий select по таблице.
- `save(tableName, values)` - создать или обновить запись.
- `delete(tableName, filter)` - удалить записи по фильтру.
- `deleteById(tableName, id, primaryColumn)` - удалить одну запись по primary key.
- `loadById(tableName, id, columns, primaryColumn)` - загрузить одну запись по primary key.
- `getStructure()` - получить структуру провайдера: сущности, колонки, справочные связи.
- `getEntityUserProfile(key, userId, options)` и `saveEntityUserProfile(...)` - работать с профилем пользователя.

## Query builder

Для ESQ-запросов используйте цепочку методов:

```ts
const query = entityQuery("app_user")
  .select("Id", "Login", "DisplayName", "IsActive")
  .contains("DisplayName", search)
  .orderBy("DisplayName")
  .take(50);

const rows = await client.select(query);
```

Группы фильтров можно собирать так:

```ts
const query = entityQuery("app_user")
  .select("Id", "Login")
  .and((filter) => filter.equal("IsActive", true).isNotNull("Login"));
```

## React provider и несколько Entity API провайдеров

`EntityApiProvider` хранит основной клиент и именованные клиенты. Это нужно, когда разные данные живут в разных БД или разных Entity managers.

```tsx
<EntityApiProvider
  client={mainClient}
  clients={{ personalData: personalDataClient }}
>
  <UsersPage />
</EntityApiProvider>
```

В компоненте:

```tsx
const mainClient = useEntityApiClient();
const personalClient = useEntityApiClient("personalData");
```

## Базовые UI-компоненты

- `EntityForm` - форма по `EntitySchema`.
- `EntityField` - базовое поле для одной колонки.
- `EntityTable` - простая таблица по `EntitySchema` и строкам Entity API.
- `EntityDataGrid` - унифицированный грид с загрузкой структуры провайдера, выбором колонок и сохранением настроек.
- `EntityOrmList` - список с кастомным маппингом строк Entity API в DTO.
- `EntityRegistry` - базовая поверхность реестра записей.
- `EntityRecordDetails` - карточка просмотра одной Entity API записи.
- `EntityPageActions` и `EntityPageActionButton` - базовые action-кнопки страницы.
- `RandomGifLoader` - loader с рандомным проигрыванием GIF из коллекции ресурсов.
- `ResourceSvgIcon` - отрисовка SVG-иконок из ресурсов пакета.

## Публичные React entrypoints

Для нового кода предпочтительны явные entrypoints:

- `@titanic-entity/entity-react/headless` - headless state hooks и контроллеры без визуального слоя.
- `@titanic-entity/entity-react/components` - общие визуальные компоненты: формы, actions, records, icons, feedback и site controls.
- `@titanic-entity/entity-react/fields` - поля и input-компоненты.
- `@titanic-entity/entity-react/grids` - гриды, таблицы, списки и grid-модели.
- `@titanic-entity/entity-react/layout` - layout primitives и site shell.
- `@titanic-entity/entity-react/templates` - шаблоны страниц.
- `@titanic-entity/entity-react/resources` - React resources и локализации.
- `@titanic-entity/entity-react/system` - системные Entity helpers для React UI.
- `@titanic-entity/entity-react/schemas` и `/model` - схемы пакета и имена registry-элементов.

Root import `@titanic-entity/entity-react` остается совместимым фасадом для приложений, но глубокие импорты в файлы вроде `components/grid/EntityDataGrid` или `grids/column-settings/model/*` считаются внутренними и не являются стабильным API.

## Ресурсы и иконки

Ресурсы живут в `@titanic-entity/entity-resources`. Для иконок используйте явный entrypoint:

```ts
import {
  entityCommonIcons,
  entityResourceIcons
} from "@titanic-entity/entity-resources/icons";
```

Каждая иконка лежит в собственной папке с `index.ts` для runtime-кода и `icon.svg` для прямого просмотра. После регистрации `titanicEntityResourcesPackage` иконки можно получать через `Titanic.Icons.get("common.close")` или через группу `Titanic.Icons.group("common")?.close`.

Темы по умолчанию применяются через CSS: большинство иконок использует `currentColor`, поэтому достаточно выдать нужный className элементу или его контейнеру. Для иконок с реальными тематическими вариантами можно использовать `themes` в ресурсе и получать вариант через `Titanic.Icons.get(path, { theme })` или prop `theme` у `ResourceSvgIcon`.

## Headless hooks

Headless-слой отделяет состояние от представления:

```tsx
import { useEntityFormState } from "@titanic-entity/entity-react/headless";

const { values, setValue, getValues } = useEntityFormState({
  schema,
  value,
  onChange
});
```

`useEntityFormState` управляет значениями schema-driven формы. `useEntityEditPageController` строит контроллер для `EntityEditPage` template: нормализованный template, context, submit и reset.

## EntityDataGrid

`EntityDataGrid` подходит для реестров и системных списков. Если переданы `client` и `tableName`, грид сам загрузит структуру провайдера через Entity ORM API и позволит выбрать отображаемые колонки.

```tsx
<EntityDataGrid
  gridId="system-reference-objects"
  client={client}
  tableName="department"
  title="Отделы"
  rowCount={50}
/>
```

Если строки уже загружены снаружи, можно передать `rows` и `columns`:

```tsx
<EntityDataGrid
  gridId="loaded-users"
  rows={users}
  columns={[
    { key: "login", label: "Логин", render: (row) => row.login },
    { key: "name", label: "Имя", render: (row) => row.displayName }
  ]}
/>
```

## Пакетная архитектура

Библиотека содержит базовый UI-пакет `titanicEntityUiPackage`. Он регистрирует UI-элементы как пакетные схемы и зависит от `titanicEntityReactUiPackage`:

- `template` - шаблоны страниц, например `EntityEditPage`.
- `field` - поля, например `EntityField`, `NumberInput`, `SelectEntity`.
- `grid` - гриды и списки, например `EntityDataGrid`, `EntityTable`, `EntityOrmList`.
- `enum` - перечисления регистрируются в профильных пакетах, например `EntityFieldKind` в `Titanic.Entity`, `ConditionOperator` в `Titanic.EntityApi`.
- `component` - общий fallback для компонентов, которые не относятся к более узкому типу.

Пакет-наследник может заменить или расширить любой элемент через `replaces` и `extension`.

```tsx
const customPackage = definePackage({
  name: "Titanic.Custom",
  dependsOn: ["Titanic.EntityUi"],
  schemas: [
    defineFieldSchema<EntityFieldProps>({
      kind: "field",
      name: "EntityField",
      replaces: "Titanic.EntityUi.EntityField",
      extension: ({ baseComponent: BaseField }) => (props) => (
        <div className="custom-field-shell">
          {BaseField ? <BaseField {...props} /> : null}
        </div>
      )
    })
  ]
});
```

## Соглашения по коду

- Публичные TSDoc-комментарии для методов, hooks и типов пишутся на английском.
- Новые UI-элементы сначала проектируются как переиспользуемые компоненты, затем регистрируются в пакетном формате.
- Если элемент относится к форме, гриду, шаблону или enum, используйте специализированные схемы `field`, `grid`, `template`, `enum`, а не только `component`.
- Новые зависимости не добавляются без явной причины.
- Для доступности у интерактивных элементов должны быть `type`, `aria-*`, `id` или `name`, где это применимо.
- Runtime-поведение после изменений проверяется сборкой и smoke-check в демо-приложении.

## Команды разработки

```bash
npm run typecheck
npm run build
```

`npm run build` собирает JavaScript/CSS через Vite и генерирует `.d.ts` через TypeScript.

## Публикация

Публикация выполняется через GitHub Actions workflow `Publish npm packages`.

Перед первой публикацией добавьте в репозиторий GitHub secret:

- `NPM_TOKEN` - npm automation token с правом публикации пакетов в scope `@titanic-entity`.

Ручной dry-run можно запустить из GitHub UI:

```text
Actions -> Publish npm packages -> Run workflow -> dry_run: true, npm_tag: beta
```

Реальная beta-публикация запускается двумя способами:

- автоматически при merge/push в ветку `main`;
- вручную через `Run workflow` с `dry_run: false` и `npm_tag: beta`.

Workflow выполняет `npm ci`, `npm run typecheck`, `npm run build`, временно заменяет внутренние `file:../...` зависимости на версии workspace-пакетов и публикует пакеты в npm в правильном порядке. Для первого релиза используется версия `0.1.0-beta.0`, чтобы пакеты устанавливались через `npm install @titanic-entity/entity-react@beta`.
