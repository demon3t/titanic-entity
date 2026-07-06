// Базовая страница реестра записей Entity ORM API: грид, модальное редактирование и настройка формы.
import { useEffect, useMemo, useState, type CSSProperties, type DragEvent, type PointerEvent } from "react";
import {
  createEntityGuid,
  getEntityValue,
  type EntityApiClient,
  type EntityApiEntity,
  type EntityGridColumnSettingsClient,
  type ESQOrderJsonModel
} from "@titanic/entity-api";
import { getSaveValues, toEntityValues, type EntityColumnSchema, type EntitySchema, type EntityValues } from "@titanic/entity-core";
import { entityCommonIcons } from "@titanic/entity-resources";
import { EntityForm } from "../EntityForm";
import { EntityDataGrid } from "../grid/EntityDataGrid";
import { ResourceSvgIcon } from "../icons/ResourceSvgIcon";
import type { EntityDataGridColumn, EntityDataGridLabels } from "../../grids";

export interface EntityRecordPageConfig {
  tableName: string;
  primaryColumn: string;
  displayColumn?: string;
  orderColumn?: string;
}

export interface EntityRecordsPageLabels {
  recordsTitle: string;
  createRecord: string;
  saveRecord: string;
  deleteRecord: string;
  cancelEdit: string;
  newRecordTitle: string;
  editRecordTitle: string;
  selectRecord: string;
  deleteConfirm: string;
  loadError: string;
  closeModal?: string;
  configureForm?: string;
  formDesignerTitle?: string;
  formDesignerCaption?: string;
  visibleFieldsTitle?: string;
  availableFieldsTitle?: string;
  addField?: string;
  removeField?: string;
  moveField?: string;
  resizeField?: string;
  saveFormLayout?: string;
}

export interface EntityRecordsFormLayoutField {
  path: string;
  hidden?: boolean;
  gridSpan?: number;
  order?: number;
}

export interface EntityRecordsPageProps {
  client: EntityApiClient;
  columnSettingsClient?: EntityGridColumnSettingsClient;
  columns: readonly EntityDataGridColumn<EntityApiEntity>[];
  currentUserId?: string;
  defaultVisibleColumnKeys: readonly string[];
  deleteBlockedMessage?: string;
  gridId: string;
  gridLabels?: Partial<EntityDataGridLabels>;
  isDeleteBlocked?: (values: EntityValues) => boolean;
  labels: EntityRecordsPageLabels;
  orders?: readonly ESQOrderJsonModel[];
  record: EntityRecordPageConfig;
  rowCount?: number;
  schema: EntitySchema;
  title: string;
  onBeforeSave?: (saveValues: EntityValues, values: EntityValues) => Promise<void> | void;
  onFormLayoutSave?: (fields: EntityRecordsFormLayoutField[]) => Promise<void> | void;
}

export function EntityRecordsPage({
  client,
  columnSettingsClient,
  columns,
  currentUserId,
  defaultVisibleColumnKeys,
  deleteBlockedMessage,
  gridId,
  gridLabels,
  isDeleteBlocked,
  labels,
  orders = [],
  record,
  rowCount,
  schema,
  title,
  onBeforeSave,
  onFormLayoutSave
}: EntityRecordsPageProps) {
  const [selectedValues, setSelectedValues] = useState<EntityValues | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [formDesignerOpen, setFormDesignerOpen] = useState(false);
  const [draftColumns, setDraftColumns] = useState<EntityColumnSchema[]>(() => normalizeColumns(schema.columns));
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const effectiveSchema = useMemo(() => ({
    ...schema,
    columns: normalizeColumns(schema.columns)
  }), [schema]);
  const draftSchema = useMemo(() => ({
    ...effectiveSchema,
    columns: draftColumns
  }), [draftColumns, effectiveSchema]);
  const selectedPrimaryValue = selectedValues?.[record.primaryColumn];
  const selectedRecordKey = selectedPrimaryValue == null ? null : String(selectedPrimaryValue);
  const deleteBlocked = selectedValues ? Boolean(isDeleteBlocked?.(selectedValues)) : false;

  useEffect(() => {
    setDraftColumns(effectiveSchema.columns);
  }, [effectiveSchema]);

  const startCreate = () => {
    setActionError(null);
    setFormDesignerOpen(false);
    setDraftColumns(effectiveSchema.columns);
    setSelectedValues(createEntityRecordValues(effectiveSchema, record.primaryColumn));
    setEditorMode("create");
  };

  const selectRecord = (row: EntityApiEntity) => {
    setActionError(null);
    setFormDesignerOpen(false);
    void openFullRecord(row);
  };

  const openFullRecord = async (row: EntityApiEntity) => {
    const rowValues = toEntityValues(row);
    const primaryValue = rowValues[record.primaryColumn];

    if (!primaryValue) {
      setDraftColumns(effectiveSchema.columns);
      setSelectedValues(rowValues);
      setEditorMode("edit");
      return;
    }

    setActionLoading(true);

    try {
      const fullRow = await client.loadById(
        record.tableName,
        primaryValue,
        getRecordLoadColumnPaths(effectiveSchema),
        record.primaryColumn
      );

      setDraftColumns(effectiveSchema.columns);
      setSelectedValues(toEntityValues(fullRow ?? row));
      setEditorMode("edit");
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : labels.loadError);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelEdit = () => {
    setActionError(null);
    setFormDesignerOpen(false);
    setSelectedValues(null);
    setEditorMode(null);
  };

  const saveRecord = async (values: EntityValues) => {
    const saveValues = getSaveValues(draftSchema, values);

    if (!saveValues[record.primaryColumn]) {
      saveValues[record.primaryColumn] = createEntityGuid();
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await onBeforeSave?.(saveValues, values);
      const savedRow = await client.save(record.tableName, saveValues);

      setSelectedValues(toEntityValues(savedRow));
      setEditorMode("edit");
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : labels.loadError);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteRecord = async () => {
    if (deleteBlocked) {
      setActionError(deleteBlockedMessage ?? labels.loadError);
      return;
    }

    if (!selectedPrimaryValue || !globalThis.confirm(labels.deleteConfirm)) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await client.deleteById(record.tableName, selectedPrimaryValue, record.primaryColumn);
      setSelectedValues(null);
      setEditorMode(null);
      setFormDesignerOpen(false);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : labels.loadError);
    } finally {
      setActionLoading(false);
    }
  };

  const saveFormLayout = async () => {
    if (!onFormLayoutSave) {
      return;
    }

    setActionLoading(true);
    setActionError(null);

    try {
      await onFormLayoutSave(draftColumns.map((column, index) => ({
        path: column.path,
        hidden: column.hidden,
        gridSpan: column.gridSpan ?? 12,
        order: index
      })));
      setFormDesignerOpen(false);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : labels.loadError);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section className="system-designer-page__section system-designer-records-page" aria-label={labels.recordsTitle}>
      <div className="system-designer-records-page__toolbar">
        <h2>{title}</h2>
        <button className="titanic-records-page__button titanic-records-page__button_primary" type="button" onClick={startCreate}>
          {labels.createRecord}
        </button>
      </div>

      {actionError ? <p className="titanic-records-page__error">{actionError}</p> : null}

      <EntityDataGrid<EntityApiEntity>
        className="system-designer-page__records-grid"
        activeRowKey={selectedRecordKey}
        client={client}
        columnSettingsClient={columnSettingsClient}
        columns={columns}
        currentUserId={currentUserId}
        defaultVisibleColumnKeys={defaultVisibleColumnKeys}
        gridId={gridId}
        orders={orders}
        refreshKey={refreshKey}
        rowCount={rowCount}
        tableName={record.tableName}
        title={labels.recordsTitle}
        getRowKey={(row) => String(getEntityValue(row, record.primaryColumn) ?? "")}
        labels={gridLabels}
        onRowDoubleClick={selectRecord}
      />

      {selectedValues ? (
        <div className="titanic-record-modal" role="dialog" aria-modal="true" aria-label={editorMode === "create" ? labels.newRecordTitle : labels.editRecordTitle}>
          <div className="titanic-record-modal__backdrop" onClick={cancelEdit} />
          <section className="titanic-record-modal__card">
            <header className="titanic-record-modal__header">
              <div>
                <span>{editorMode === "create" ? labels.newRecordTitle : labels.editRecordTitle}</span>
                <strong>{title}</strong>
              </div>
              <div className="titanic-record-modal__header-actions">
                {onFormLayoutSave ? (
                  <button
                    className="titanic-records-page__button titanic-records-page__button_secondary"
                    type="button"
                    onClick={() => setFormDesignerOpen((value) => !value)}
                  >
                    {labels.configureForm ?? "Configure form"}
                  </button>
                ) : null}
                <button className="titanic-records-page__button titanic-records-page__button_secondary" type="button" onClick={cancelEdit}>
                  {labels.closeModal ?? labels.cancelEdit}
                </button>
              </div>
            </header>

            {formDesignerOpen ? (
              <EntityRecordFormDesigner
                columns={draftColumns}
                disabled={actionLoading}
                labels={labels}
                onChange={setDraftColumns}
                onSave={saveFormLayout}
              />
            ) : (
              <EntityForm
                disabled={actionLoading}
                schema={draftSchema}
                submitLabel={labels.saveRecord}
                value={selectedValues}
                onChange={setSelectedValues}
                onSubmit={saveRecord}
              />
            )}

            {editorMode === "edit" && !formDesignerOpen ? (
              <footer className="titanic-record-modal__footer">
                {deleteBlocked && deleteBlockedMessage ? (
                  <p className="titanic-records-page__notice">{deleteBlockedMessage}</p>
                ) : null}
                <button
                  className="titanic-records-page__button titanic-records-page__button_danger"
                  type="button"
                  disabled={actionLoading || deleteBlocked}
                  onClick={deleteRecord}
                >
                  {labels.deleteRecord}
                </button>
              </footer>
            ) : null}
          </section>
        </div>
      ) : null}
    </section>
  );
}

export function createEntityRecordValues(schema: EntitySchema, primaryColumn: string): EntityValues {
  return Object.fromEntries(schema.columns.map((column) => [
    column.path,
    column.path === primaryColumn ? createEntityGuid() : column.defaultValue ?? ""
  ]));
}

function EntityRecordFormDesigner({
  columns,
  disabled,
  labels,
  onChange,
  onSave
}: {
  columns: EntityColumnSchema[];
  disabled: boolean;
  labels: EntityRecordsPageLabels;
  onChange: (columns: EntityColumnSchema[]) => void;
  onSave: () => void;
}) {
  const [draggingPath, setDraggingPath] = useState<string | null>(null);
  const visibleColumns = columns.filter((column) => !column.hidden);
  const hiddenColumns = columns.filter((column) => column.hidden);

  const updateColumn = (path: string, updater: (column: EntityColumnSchema) => EntityColumnSchema) => {
    onChange(columns.map((column) => column.path === path ? updater(column) : column));
  };

  const hideColumn = (path: string) => {
    updateColumn(path, (column) => ({ ...column, hidden: true }));
  };

  const showColumn = (path: string) => {
    const targetColumn = columns.find((column) => column.path === path);
    const nextColumns = [
      ...columns.filter((column) => column.path !== path),
      targetColumn ? { ...targetColumn, hidden: false, order: visibleColumns.length } : null
    ].filter((column): column is EntityColumnSchema => Boolean(column));

    onChange(normalizeFormDesignerColumns(nextColumns));
  };

  const resizeColumn = (path: string, gridSpan: number) => {
    updateColumn(path, (column) => ({ ...column, gridSpan: clampDesignerGridSpan(gridSpan) }));
  };

  const moveColumn = (sourcePath: string, targetPath: string) => {
    if (sourcePath === targetPath) {
      return;
    }

    const nextVisibleColumns = [...visibleColumns];
    const sourceIndex = nextVisibleColumns.findIndex((column) => column.path === sourcePath);
    const targetIndex = nextVisibleColumns.findIndex((column) => column.path === targetPath);

    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const [sourceColumn] = nextVisibleColumns.splice(sourceIndex, 1);
    nextVisibleColumns.splice(targetIndex, 0, sourceColumn);

    const nextVisibleByPath = new Map(nextVisibleColumns.map((column, index) => [
      column.path,
      { ...column, order: index }
    ]));

    onChange(columns.map((column) => nextVisibleByPath.get(column.path) ?? column));
  };

  return (
    <section className="titanic-record-form-designer">
      <div className="titanic-record-form-designer__heading">
        <div>
          <strong>{labels.formDesignerTitle ?? "Form layout"}</strong>
          <span>{labels.formDesignerCaption ?? "Configure fields in the modal form grid."}</span>
        </div>
        <button className="titanic-records-page__button titanic-records-page__button_primary" type="button" disabled={disabled} onClick={onSave}>
          {labels.saveFormLayout ?? labels.saveRecord}
        </button>
      </div>

      <div className="titanic-record-form-designer__layout">
        <section className="titanic-record-form-designer__panel">
          <h3>{labels.visibleFieldsTitle ?? "Visible fields"}</h3>
          <div className="titanic-record-form-designer__grid">
            {visibleColumns.map((column) => {
              const span = clampDesignerGridSpan(column.gridSpan ?? 12);

              return (
                <article
                  className={draggingPath === column.path
                    ? "titanic-record-form-designer__field titanic-record-form-designer__field_dragging"
                    : "titanic-record-form-designer__field"}
                  draggable={!disabled}
                  key={column.path}
                  style={{ "--titanic-grid-span": span } as CSSProperties}
                  onDragEnd={() => setDraggingPath(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDragStart={(event) => handleDesignerDragStart(event, column.path, setDraggingPath)}
                  onDrop={(event) => handleDesignerDrop(event, column.path, draggingPath, moveColumn)}
                >
                  <div className="titanic-record-form-designer__field-head">
                    <button
                      aria-label={labels.moveField ?? "Move"}
                      className="titanic-record-form-designer__drag-handle"
                      disabled={disabled}
                      title={labels.moveField ?? "Move"}
                      type="button"
                    >
                      <RecordDesignerDragIcon />
                    </button>
                    <div>
                      <strong>{column.label ?? column.path}</strong>
                      <small>{column.path}</small>
                    </div>
                    <button type="button" disabled={disabled} onClick={() => hideColumn(column.path)}>
                      {labels.removeField ?? "Remove"}
                    </button>
                  </div>
                  <button
                    aria-label={labels.resizeField ?? "Resize"}
                    className="titanic-record-form-designer__resize-handle"
                    disabled={disabled}
                    title={labels.resizeField ?? "Resize"}
                    type="button"
                    onPointerDown={(event) => startDesignerResize(event, column.path, span, resizeColumn)}
                  />
                </article>
              );
            })}
          </div>
        </section>

        <aside className="titanic-record-form-designer__panel titanic-record-form-designer__available">
          <h3>{labels.availableFieldsTitle ?? "Available fields"}</h3>
          {hiddenColumns.length > 0 ? hiddenColumns.map((column) => (
            <button type="button" key={column.path} disabled={disabled} onClick={() => showColumn(column.path)}>
              <span>{column.label ?? column.path}</span>
              <small>{labels.addField ?? "Add"}</small>
            </button>
          )) : (
            <p>{labels.selectRecord}</p>
          )}
        </aside>
      </div>
    </section>
  );
}
function normalizeFormDesignerColumns(columns: readonly EntityColumnSchema[]): EntityColumnSchema[] {
  const visibleColumns = columns.filter((column) => !column.hidden);
  const hiddenColumns = columns.filter((column) => column.hidden);

  return [
    ...visibleColumns.map((column, index) => ({ ...column, order: index })),
    ...hiddenColumns
  ];
}

function handleDesignerDragStart(
  event: DragEvent<HTMLElement>,
  path: string,
  setDraggingPath: (value: string | null) => void
): void {
  setDraggingPath(path);
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", path);
}

function handleDesignerDrop(
  event: DragEvent<HTMLElement>,
  targetPath: string,
  draggingPath: string | null,
  moveColumn: (sourcePath: string, targetPath: string) => void
): void {
  event.preventDefault();
  const sourcePath = draggingPath || event.dataTransfer.getData("text/plain");

  if (sourcePath) {
    moveColumn(sourcePath, targetPath);
  }
}

function startDesignerResize(
  event: PointerEvent<HTMLElement>,
  path: string,
  startSpan: number,
  resizeColumn: (path: string, span: number) => void
): void {
  event.preventDefault();
  event.stopPropagation();

  const startX = event.clientX;
  const handleMove = (moveEvent: globalThis.PointerEvent) => {
    const deltaSpan = Math.round((moveEvent.clientX - startX) / 32);
    resizeColumn(path, startSpan + deltaSpan);
  };
  const handleUp = () => {
    document.removeEventListener("pointermove", handleMove);
    document.removeEventListener("pointerup", handleUp);
  };

  document.addEventListener("pointermove", handleMove);
  document.addEventListener("pointerup", handleUp);
}

function clampDesignerGridSpan(value: number): number {
  return Math.max(2, Math.min(24, Math.round(value)));
}

function RecordDesignerDragIcon() {
  return <ResourceSvgIcon className="titanic-record-form-designer__drag-icon" icon={entityCommonIcons.dragHandle} />;
}

function normalizeColumns(columns: readonly EntityColumnSchema[]): EntityColumnSchema[] {
  const hasExplicitOrder = columns.some((column) => typeof (column as { order?: unknown }).order === "number");

  return [...columns].sort((left, right) => {
    if (hasExplicitOrder) {
      const leftOrder = Number((left as { order?: unknown }).order ?? Number.MAX_SAFE_INTEGER);
      const rightOrder = Number((right as { order?: unknown }).order ?? Number.MAX_SAFE_INTEGER);

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
    }

    return left.path.localeCompare(right.path);
  });
}

function getRecordLoadColumnPaths(schema: EntitySchema): string[] {
  return [...new Set(schema.columns.map((column) => column.path))];
}
