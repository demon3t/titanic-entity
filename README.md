# @titanic-entity/entity-react

React/TypeScript библиотека для работы с `Titanic.Entity` и Entity ORM API. Пакеты репозитория закрывают HTTP-клиент, EntityQuery builder, core-модели, React provider/headless hooks, ресурсы и runtime-регистрацию через глобальный фасад `Titanic`.

Новые сущности объявляются через `Titanic.Entity.define(...)`, существующие расширяются через `Titanic.Entity.override(...)`, а новые сущности на основе существующих создаются через `Titanic.Entity.extend(...)`. Runtime-компоненты, страницы и секции объявляются через `Titanic.define(...)`; локализация - через `Titanic.Localization.define(...)`.

## Для чего нужен пакет

- Выполнять `Select`, `Save`, `Delete`, `Batch` и загрузку структуры провайдера через `EntityApiClient`.
- Описывать сущности через `Titanic.Entity.define(...)`, `Titanic.Entity.override(...)`, `Titanic.Entity.extend(...)` и типизированные колонки.
- Строить EntityQuery-запросы через `entityQuery(...)`, без ручной сборки JSON.
- Подключать один или несколько Entity API провайдеров через `EntityApiProvider`.
- Использовать headless hooks для загрузки данных и управления состоянием Entity-форм.
- Объявлять runtime-компоненты, страницы и секции через `Titanic.define(...)`.
- Объявлять локализацию через `Titanic.Localization.define(...)`.
- Получать ресурсы и строки через `Titanic.Icons` и `Titanic.Localization`.

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
packages/
  entity-base/       базовый фасад Titanic, реестры ресурсов и общие типы
  entity-core/       Entity-модели, схемы, EntityQuery builder, фильтры и доменные utilities
  entity-api/        HTTP-клиент и API-модели
  entity-resources/  системные ресурсы, SVG descriptors и Titanic.Localization.define
  entity-icons/      расширяемые коллекции иконок
  entity-react/      React provider, headless hooks, runtime Titanic.define и стили
  entity-ui/         поставка runtime-элементов, объявленных через Titanic.define
```

Root import `@titanic-entity/entity-react` остается основным фасадом для приложений: из него доступны клиент, provider, query builder, core-типы, React helpers и `Titanic`.

## Быстрый старт

```tsx
import {
  EntityApiClient,
  EntityApiProvider,
  StringColumn,
  Titanic,
  entityQuery,
  useEntityQuery
} from "@titanic-entity/entity-react";
import "@titanic-entity/entity-react/styles.css";

const client = new EntityApiClient({
  baseUrl: "http://localhost:5006",
  apiPath: "/entity/local",
  getHeaders: () => ({ Authorization: "Bearer token" })
});

const Department = Titanic.Entity.define("TitanicMain.Department", {
  name: "department",
  providerName: "default",
  primaryColumn: "Id",
  displayColumn: "Name",
  title: "Отдел",
  columns: {
    id: new StringColumn("Id", "", { hidden: true, readOnly: true }),
    departmentName: new StringColumn("Name", "", {
      label: "Название",
      required: true
    }),
    description: new StringColumn("Description", "", { label: "Описание" })
  },
  methods: {
    getTitleColumn() {
      return this.departmentName;
    }
  }
});

function DepartmentRows() {
  const query = entityQuery(Department.name)
    .select(
      Department.id.path,
      Department.departmentName.path,
      Department.description.path
    )
    .take(20)
    .orderBy(Department.departmentName.path);

  const { data, loading, error } = useEntityQuery(query);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return <pre>{JSON.stringify(data ?? [], null, 2)}</pre>;
}

export function App() {
  return (
    <EntityApiProvider client={client}>
      <DepartmentRows />
    </EntityApiProvider>
  );
}
```

## Сущности

Новая сущность объявляется через `Titanic.Entity.define(className, config)`. Существующая сущность расширяется через `Titanic.Entity.override(className, patch)`. Новая сущность на основе существующей объявляется через `Titanic.Entity.extend(className, config)`, где базовая сущность передается в `config.extend`. `className` - полное runtime-имя, `name` - имя таблицы Entity ORM, `providerName` - имя API-провайдера, `primaryColumn` и `displayColumn` - ключевая и отображаемая колонки. `columns` содержит типизированные колонки, `methods` получает типизированный `this`, а производная `schema` используется headless hooks и API helpers.

```ts
import {
  BooleanColumn,
  LookupColumn,
  StringColumn,
  Titanic
} from "@titanic-entity/entity-react";

export const AppUser = Titanic.Entity.define("TitanicMain.AppUser", {
  name: "app_user",
  providerName: "default",
  primaryColumn: "Id",
  displayColumn: "DisplayName",
  columns: {
    id: new StringColumn("Id", "", { hidden: true }),
    userName: new StringColumn("UserName"),
    displayName: new StringColumn("DisplayName"),
    workEmail: new StringColumn("WorkEmail"),
    role: new StringColumn("Role"),
    departmentId: new LookupColumn("DepartmentId"),
    employeeId: new LookupColumn("EmployeeId"),
    officeId: new LookupColumn("OfficeId"),
    isActive: new BooleanColumn("IsActive")
  },
  methods: {
    getTitleColumn() {
      return this.displayName;
    }
  }
});

export type AppUser = typeof AppUser;
export const appUserEntity = AppUser;
export const appUserColumns = appUserEntity;

Titanic.Entity.override("TitanicMain.AppUser", {
  columns: {
    preferredContactTime: new StringColumn("PreferredContactTime")
  }
});

export const PortalAppUser = Titanic.Entity.extend(
  "TitanicMain.PortalAppUser",
  {
    extend: AppUser,
    name: "portal_app_user",
    providerName: "default",
    primaryColumn: "Id",
    displayColumn: "DisplayName",
    columns: {
      portalLogin: new StringColumn("PortalLogin")
    }
  }
);
```

`name` задает имя таблицы Entity ORM, `providerName` - провайдер API, `primaryColumn` и `displayColumn` - ключевую и отображаемую колонки. Экспорт `appUserEntity` удобен для запросов, а `appUserColumns` - для мест, где нужен доступ к колонкам как к константам.

## EntityApiClient

`EntityApiClient` инкапсулирует транспорт к Entity ORM API.

Основные методы:

- `execute(request)` - выполнить одну операцию Entity API.
- `batch(request)` - выполнить пакет операций.
- `select(query)` - выполнить EntityQuery select.
- `queryEntityRows(request)` - выполнить простой query по таблице через объект запроса.
- `selectRows(tableName, columns, options)` - выполнить короткий select по таблице.
- `save(tableName, values)` - создать или обновить запись.
- `delete(tableName, filter)` - удалить записи по фильтру.
- `deleteById(tableName, id, primaryColumn)` - удалить одну запись по primary key.
- `loadById(tableName, id, columns, primaryColumn)` - загрузить одну запись по primary key.
- `getStructure()` - получить структуру провайдера: сущности, колонки, справочные связи.
- `getEntityUserProfile(key, userId, options)` и `saveEntityUserProfile(...)` - работать с профилем пользователя.

## Query builder

EntityQuery builder, EntityQuery-модели и enum-ы экспортируются из `@titanic-entity/entity-core`. `@titanic-entity/entity-api` сохраняет re-export-ы для старых импортов и использует core-модели внутри HTTP-клиента.

Для EntityQuery-запросов используйте цепочку методов:

```ts
const query = entityQuery("app_user")
  .select("Id", "Login", "DisplayName", "IsActive")
  .contains("DisplayName", search)
  .orderBy("DisplayName")
  .take(50);

const rows = await client.select(query);
```

Колонки можно добавлять постепенно, включая агрегаты:

```ts
const totalsQuery = entityQuery("invoice")
  .addAggregateColumn(EntityAggregationType.None, "CustomerId")
  .addAggregateColumn(EntityAggregationType.Sum, "Amount", "totalAmount")
  .addAggregateColumn(EntityAggregationType.Count, "Id", "invoiceCount")
  .groupBy("CustomerId");
```

`addAggregateColumn` также принимает подзапрос:

```ts
const paidInvoiceAmounts = entityQuery("invoice")
  .column("Amount")
  .equal("CustomerId", "$parent.Id")
  .equal("Status.Code", "Paid");

const customerQuery = entityQuery("customer")
  .column("Id")
  .column("Name")
  .addAggregateColumn(EntityAggregationType.Sum, paidInvoiceAmounts, "paidAmount");
```

В EntityQuery такая колонка уйдет как `{ aggregationType, alias, subQuery }`. Для короткой записи доступны методы `.sum/.count/.avg/.min/.max`.

`column` и `addColumn` принимают строку, готовый `EntityQueryColumn` или options-объект: `.column("Amount", { alias: "total", aggregationType: EntityAggregationType.Sum })`.

Группы фильтров можно собирать так:

```ts
const query = entityQuery("app_user")
  .select("Id", "Login")
  .and((filter) => filter.equal("IsActive", true).isNotNull("Login"));
```

Если нужен готовый EntityQuery-фильтр без query builder, `entity-core` добавляет factory-методы в `Titanic`:

```ts
import { Titanic } from "@titanic-entity/entity-core";

const filters = Titanic.createFilterCollection([
  Titanic.createIsEqualFilter("IsActive", true),
  Titanic.createIsNullFilter("DeletedOn")
]);
```

Доступны `createIsEqualFilter`, `createIsNotEqualFilter`, `createIsGreaterThanFilter`, `createIsGreaterThanOrEqualFilter`, `createIsLessThanFilter`, `createIsLessThanOrEqualFilter`, `createIsInFilter`, `createIsNotInFilter`, `createIsContainsFilter`, `createIsNullFilter`, `createIsNotNullFilter`, а также `createAndFilter`, `createOrFilter` и `createFilterCollection`.

Для ручной типизации EntityQuery доступны типы `EntityQuery`, `EntityQueryColumn`, `EntityQueryFilter`, `EntityQueryFilterCollection` и `EntityQueryOrder`.

## React provider

`EntityApiProvider` хранит основной клиент и именованные клиенты. Это нужно, когда разные данные живут в разных БД или разных Entity managers.

```tsx
<EntityApiProvider
  client={mainClient}
  clients={{ personalData: personalDataClient }}
>
  <UsersPage />
</EntityApiProvider>
```

Внутри React-дерева клиент доступен через hook:

```tsx
const mainClient = useEntityApiClient();
const personalClient = useEntityApiClient("personalData");
```

## Headless hooks

Headless-слой отделяет состояние от представления:

```tsx
import { useEntityFormState } from "@titanic-entity/entity-react/headless";
import { AppUser } from "./entities/app-user";

const { values, setValue, getValues } = useEntityFormState({
  schema: AppUser.schema,
  value,
  onChange
});
```

`useEntityFormState` управляет значениями формы, построенной по `schema` сущности. `useEntityQuery` выполняет EntityQuery-запрос через текущий `EntityApiProvider`. `useEntityEditPageController` строит контроллер для template-контекста: нормализует template, собирает context, submit и reset.

## Titanic.define

`Titanic.define(className, definition)` - основной runtime API для объявления компонентов, страниц и секций. Имя должно быть стабильным и полным, например `Titanic.Crm.CustomerBadge` или `Titanic.App.CustomerPage`.

Компонент можно объявить обычной React-функцией:

```tsx
import { Titanic } from "@titanic-entity/entity-react";

export interface CustomerBadgeProps {
  title: string;
  tone?: "neutral" | "success";
}

export function CustomerBadge({
  title,
  tone = "neutral"
}: CustomerBadgeProps) {
  return (
    <span className={`customer-badge customer-badge_${tone}`}>
      {title}
    </span>
  );
}

Titanic.define<CustomerBadgeProps>(
  "Titanic.Crm.CustomerBadge",
  CustomerBadge
);
```

Если нужен декларативный runtime-компонент, передайте объект с `attributes`, `methods` и `diff`:

```tsx
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";

export interface StatusPillProps {
  label: string;
  status?: "draft" | "active" | "blocked";
}

Titanic.define<StatusPillProps>("Titanic.Crm.StatusPill", {
  attributes: {
    label: {},
    status: { default: "draft" },
    className: {
      value(this: any): string {
        return `status-pill status-pill_${this.attributes.status}`;
      }
    }
  },
  diff: [
    {
      tag: "span",
      props: {
        className: { attr: "className" }
      },
      text: { attr: "label" }
    }
  ]
});

export const StatusPill = Titanic.getReactModule<
  DefinedEntityReactComponent<StatusPillProps>
>("Titanic.Crm.StatusPill");
```

В декларативном компоненте `attributes` описывает входные props, derived-значения, state, refs и эффекты. `methods` содержит функции, доступные из выражений. `diff` описывает React-дерево через `tag`, `props`, `children`, `text`, `when`, `unless`, `each`, `slot` и вызовы методов.

## Titanic.Localization.define

Локализация объявляется рядом с модулем или ресурсом через `Titanic.Localization.define(schemaName, locale, localization, options)`.

```ts
import { Titanic } from "@titanic-entity/entity-resources";

export interface CustomerPageLocalization {
  title: string;
  actions: {
    save: string;
    cancel: string;
  };
  empty: string;
}

Titanic.Localization.define<CustomerPageLocalization>(
  "Titanic.Crm.CustomerPage",
  "en-US",
  {
    title: "Customers",
    actions: {
      save: "Save",
      cancel: "Cancel"
    },
    empty: "No records"
  },
  { defaultLocale: "en-US" }
);

Titanic.Localization.define<CustomerPageLocalization>(
  "Titanic.Crm.CustomerPage",
  "ru-RU",
  {
    title: "Клиенты",
    actions: {
      save: "Сохранить",
      cancel: "Отменить"
    },
    empty: "Нет записей"
  },
  { defaultLocale: "en-US" }
);
```

Получение строк:

```ts
Titanic.Localization.setLocale("ru-RU");

const title = Titanic.Localization.t("Titanic.Crm.CustomerPage.title");
const labels = Titanic.Localization.forSchema<CustomerPageLocalization>(
  "Titanic.Crm.CustomerPage"
);

console.log(title);
console.log(labels.actions.save);
```

`schemaName` связывает локализацию с runtime-компонентом, страницей или ресурсом. `locale` задает конкретную культуру. `defaultLocale` используется как fallback, когда для текущей культуры нет строки.

## Ресурсы

Ресурсные реестры доступны через фасад `Titanic`.

```ts
import { Titanic } from "@titanic-entity/entity-react";

const closeIcon = Titanic.Icons.get("close");
const hasCalendar = Titanic.Icons.has("calendar");
const maybeSearchIcon = Titanic.Icons.find("search");
```

`Titanic.Icons.get(...)` возвращает иконку или fallback-иконку. `Titanic.Icons.find(...)` возвращает `undefined`, если путь не найден. Локализованные строковые ресурсы объявляются через `Titanic.Localization.define(...)` с тем же `schemaName`, что у runtime-компонента, страницы или ресурса.

## Public entrypoints

Для нового кода используйте стабильные entrypoints:

- `@titanic-entity/entity-react` - основной фасад для приложения.
- `@titanic-entity/entity-core` - колонки, EntityQuery builder, фильтры и базовые модели.
- `@titanic-entity/entity-react/headless` - hooks и контроллеры без визуального слоя.
- `@titanic-entity/entity-resources` - ресурсы и `Titanic.Localization.define(...)`.
- `@titanic-entity/entity-react/system` - системные Entity helpers для React-слоя.
- `@titanic-entity/entity-react/schemas` и `/model` - публичные типы и имена runtime-элементов.

Глубокие импорты из конкретных файлов пакета считаются внутренними и не являются стабильным API.

## Соглашения по коду

- Публичные TSDoc-комментарии для методов, hooks и типов пишутся на английском.
- Новые сущности объявляются через `Titanic.Entity.define(...)`; существующие расширяются через `Titanic.Entity.override(...)`; новые сущности на основе существующих создаются через `Titanic.Entity.extend(...)`; производная `schema` используется React/API helpers.
- Новые runtime-компоненты, страницы и секции объявляются через `Titanic.define(...)`.
- Новая локализация объявляется через `Titanic.Localization.define(...)`.
- Новые зависимости не добавляются без явной причины.
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
Actions -> Publish npm packages -> Run workflow -> dry_run: true, npm_tag: latest
```

Реальная stable-публикация запускается двумя способами:

- автоматически при merge/push в ветку `main`;
- вручную через `Run workflow` с `dry_run: false` и `npm_tag: latest`.

Workflow выполняет `npm ci`, `npm run typecheck`, `npm run build`, временно заменяет внутренние `file:../...` зависимости на версии workspace-пакетов и публикует пакеты в npm в правильном порядке. Для stable-релиза используется версия `0.1.0`, чтобы пакеты устанавливались через `npm install @titanic-entity/entity-react`.
