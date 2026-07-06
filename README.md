# @titanic/entity-react

React/TypeScript библиотека для работы с `Titanic.Entity` и Entity ORM API. Пакет объединяет HTTP-клиент, модели ESQ, React hooks, базовые UI-компоненты, базовый пакет `entity-base` и расширяемые шаблоны страниц.

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
npm install @titanic/entity-react
```

Для локальной разработки из демо-приложения:

```bash
npm install ../titanic-entity-react
```

Стили подключаются один раз в приложении или через бандл библиотеки:

```tsx
import "@titanic/entity-react/styles.css";
```

## Структура проекта

```text
src/
  packages/
    entity-base/       Базовый пакет: package registry, схемы, провайдер и Titanic
    entity-core/       Entity-модели, схемы и React provider
    entity-api/        HTTP-клиент, ESQ и API-схемы
    entity-resources/  ресурсы и иконки
    entity-react/      React-компоненты, templates, resources, styles
    entity-ui/         UI package schemas: components, fields, grids, templates
```

Подробности пакетной архитектуры: [docs/PACKAGE_ARCHITECTURE.md](docs/PACKAGE_ARCHITECTURE.md).

## Быстрый старт

```tsx
import {
  EntityApiClient,
  EntityApiProvider,
  EntityFieldKind,
  EntityForm,
  EntityTable,
  entityQuery,
  useEntityQuery,
  type EntitySchema
} from "@titanic/entity-react";
import "@titanic/entity-react/styles.css";

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

- Комментарии в исходниках пишутся на русском.
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

```bash
npm run build
npm publish --access public
```

Перед публикацией проверьте `name`, `version`, содержимое `dist`, `README.md` и `docs`.

