# Создать отдельный пакет для коллекции иконок

## Package

cross-package

## Type

enhancement

## Priority

P2

## Release

0.1.0-beta.1

## Context

`@titanic-entity/entity-resources` сейчас хранит базовые системные иконки, GIF/media resources и схемы ресурсных модулей. Для расширяемых или прикладных наборов иконок нужен отдельный пакет, чтобы приложения могли подключать коллекции выборочно и не раздувать базовый ресурсный пакет.

## Scope

- Добавить workspace-пакет, например `packages/entity-icons` с именем `@titanic-entity/entity-icons`.
- Экспортировать typed icon maps на базе существующей модели `ResourceSvgIconMap`.
- Описать коллекцию через `defineIconModuleSchema`.
- Подключить package exports, `tsconfig`, сборку и typecheck в соответствии с текущими workspace-паттернами.
- Проверить регистрацию через обычный package registry / `Titanic.registerPackage(...)`.
- Документировать правила выбора между `entity-resources` и новым пакетом коллекции иконок.

## Acceptance Criteria

- [ ] Workspace содержит новый пакет и он участвует в build/typecheck.
- [ ] Пакет публикует стабильные entrypoints для импорта коллекций иконок.
- [ ] Пакет экспортирует icon module schema/descriptor, совместимый с `Titanic.icons`.
- [ ] После регистрации пакета иконки доступны через `Titanic.icons.get(...)`.
- [ ] Lookup работает по коротким путям коллекции и по package-qualified путям.
- [ ] Документация объясняет, что системные UI-иконки остаются в `entity-resources`, а расширяемые коллекции живут в отдельном пакете.

## Verification

- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] Добавлен или обновлен smoke test / demo usage для `Titanic.icons.get(...)`.
- [ ] Обновлены README/docs при изменении публичного поведения.

## Blockers / Decisions

- Утвердить итоговое имя пакета: `@titanic-entity/entity-icons` или коллекционно-специфичное имя.
- Решить, где должны жить общие типы иконок: оставить в `entity-resources` или вынести в `entity-base`, если появится риск dependency cycle.
- Определить первый состав коллекции: только новая коллекция или частичная миграция текущих иконок.

## Out Of Scope

- Перерисовка или замена существующих базовых UI-иконок.
- Полная миграция всех текущих иконок из `entity-resources` в первом проходе.
- Добавление app-specific branded icons в базовую коллекцию.
