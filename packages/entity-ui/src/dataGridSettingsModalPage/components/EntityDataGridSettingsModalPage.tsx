import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode
} from "react";
import type { EntityApiManagerStructureResponse } from "@titanic-entity/entity-api";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { Button } from "../../button";
import { EntityContainer } from "../../container";
import type {
  EntityDataGridColumn,
  EntityDataGridColumnSetting,
  EntityDataGridColumnSettingsMode
} from "../../dataGrid/data-grid-settings";
import {
  ColumnSettingsDialogLayout,
  ColumnSettingsFieldPickerSchema,
  ColumnSettingsModeTabs,
  ColumnSettingsVisibleFieldSchema,
  ColumnSettingsVisibleFieldsSchema
} from "../schemas";
import { columnSettingsDefinedComponentNames } from "../schemas/component-names";
import {
  clampGridColumns,
  clampGridSpan,
  columnEditorGap,
  columnEditorRowHeight,
  columnWidthUnit,
  addColumnToEditorSettings,
  createEditorDraftColumnSettingsForMode,
  createEditorDraftSettingsByMode,
  createModeSettingsPayload,
  getColumnBaseLabel,
  getColumnLabel,
  getColumnSettingId,
  getDefaultColumnSpan,
  getEditorGridColumns,
  getEditorGridRowCount,
  getMaxResizeSpanForCurrentRow,
  handleColumnDragStart,
  handleColumnDrop,
  mergeEditorColumns,
  moveDraftColumnSettings,
  normalizeColumnSettingsForEditorMode,
  type EditorDraftSettingsByMode
} from "../model/columnSettingsEditorModel";
import {
  createAvailableColumnPathOptions,
  createFieldPickerPathOptions,
  createFieldPickerState,
  createGridColumnFromFieldPickerItem,
  filterAvailableColumnSettings,
  filterAvailableColumnSettingsByPath,
  formatReferenceTrailLabel,
  getAvailableColumnPath,
  type ColumnSettingsAvailableColumnItem,
  type ColumnSettingsFieldPickerItem,
  type ColumnSettingsFieldPickerTrailItem
} from "../model/columnSettingsFieldPickerModel";
import type { EntityDataGridSettingsModalPageContext } from "../model/EntityDataGridSettingsModalPageContext";

type FieldPickerTrailItem = ColumnSettingsFieldPickerTrailItem;
type FieldPickerItem = ColumnSettingsFieldPickerItem;
type EntityDataGridSettingsModalPageComponent =
  <TRow>(props: EntityDataGridSettingsModalPageContext<TRow>) => ReactNode;

function EntityDataGridSettingsModalPageNative<TRow>({
  client,
  columns,
  columnSettingsMode,
  currentSettings,
  error,
  gridWidth,
  labels,
  columnPickerLabels,
  modeSettings,
  rootTableName,
  saving,
  structure,
  onApply,
  onClose,
  onSave,
  onSaveDefault
}: EntityDataGridSettingsModalPageContext<TRow>) {
  const gridColumns = clampGridColumns(gridWidth);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [loadedStructure, setLoadedStructure] = useState<EntityApiManagerStructureResponse | null>(null);
  const hasProvidedStructure = Boolean(structure?.entities?.length);
  const effectiveStructure = hasProvidedStructure ? structure : loadedStructure;
  const [draftSettingsByMode, setDraftSettingsByMode] = useState<EditorDraftSettingsByMode>(() => createEditorDraftSettingsByMode(
    columns,
    currentSettings,
    gridColumns,
    columnSettingsMode,
    modeSettings
  ));
  const [draftSettings, setDraftSettings] = useState(() => createEditorDraftColumnSettingsForMode(
    columns,
    currentSettings,
    gridColumns,
    columnSettingsMode,
    columnSettingsMode,
    modeSettings
  ));
  const [mode, setMode] = useState<EntityDataGridColumnSettingsMode>(columnSettingsMode);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [resizingKey, setResizingKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [fieldPickerTrail, setFieldPickerTrail] = useState<FieldPickerTrailItem[]>([]);
  const [fieldPickerSearch, setFieldPickerSearch] = useState("");
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [extraColumns, setExtraColumns] = useState<EntityDataGridColumn<TRow>[]>([]);
  const editorColumns = useMemo(() => mergeEditorColumns(columns, extraColumns), [columns, extraColumns]);
  const columnByKey = useMemo(() => new Map(editorColumns.map((column) => [column.key, column])), [editorColumns]);
  const editorGridColumns = getEditorGridColumns(gridColumns, mode, draftSettings);
  const editorSettings = useMemo(
    () => normalizeColumnSettingsForEditorMode(editorColumns, draftSettings, editorGridColumns, mode),
    [draftSettings, editorColumns, editorGridColumns, mode]
  );
  const visibleSettings = editorSettings.filter((setting) => setting.visible);
  const structureFieldPickerPathOptions = useMemo(
    () => createFieldPickerPathOptions(effectiveStructure, rootTableName, columnPickerLabels),
    [columnPickerLabels, effectiveStructure, rootTableName]
  );
  const fallbackFieldPickerRootLabel = useMemo(
    () => rootTableName
      ? columnPickerLabels?.entities?.[rootTableName] ?? rootTableName
      : labels.availableColumnsTitle,
    [columnPickerLabels, labels.availableColumnsTitle, rootTableName]
  );
  const fallbackFieldPickerPathOptions = useMemo(
    () => createAvailableColumnPathOptions(editorSettings, columnByKey, fallbackFieldPickerRootLabel),
    [columnByKey, editorSettings, fallbackFieldPickerRootLabel]
  );
  const fieldPickerPathOptions = structureFieldPickerPathOptions.length > 0
    ? structureFieldPickerPathOptions
    : fallbackFieldPickerPathOptions;
  const selectedFieldPickerPath = fieldPickerTrail.length > 0
    ? fieldPickerTrail[fieldPickerTrail.length - 1].path
    : "";
  const fieldPickerState = useMemo(
    () => createFieldPickerState(effectiveStructure, rootTableName, fieldPickerTrail, fieldPickerSearch, columnPickerLabels),
    [columnPickerLabels, effectiveStructure, fieldPickerSearch, fieldPickerTrail, rootTableName]
  );
  const searchedAvailableSettings = useMemo(
    () => filterAvailableColumnSettings(editorSettings, columnByKey, fieldPickerSearch),
    [columnByKey, editorSettings, fieldPickerSearch]
  );
  const filteredAvailableSettings = useMemo(
    () => fieldPickerState
      ? searchedAvailableSettings
      : filterAvailableColumnSettingsByPath(searchedAvailableSettings, columnByKey, selectedFieldPickerPath),
    [columnByKey, fieldPickerState, searchedAvailableSettings, selectedFieldPickerPath]
  );
  const visibleColumnKeys = useMemo(
    () => new Set(visibleSettings.map((setting) => setting.key)),
    [visibleSettings]
  );
  const availableColumnItems = useMemo<ColumnSettingsAvailableColumnItem[]>(() =>
    filteredAvailableSettings.flatMap((setting) => {
      const column = columnByKey.get(setting.key);

      return column
        ? [{
            isVisible: visibleColumnKeys.has(setting.key),
            key: setting.key,
            label: getColumnLabel(column, setting),
            path: getAvailableColumnPath(setting, column)
          }]
        : [];
    }),
  [columnByKey, filteredAvailableSettings, visibleColumnKeys]);
  const fieldPickerPathItems = useMemo(
    () => {
      if (fieldPickerState) {
        return [
          { label: fieldPickerState.rootLabel, path: "" },
          ...fieldPickerTrail.map((item) => ({ label: item.label, path: item.path }))
        ];
      }

      const selectedOption = fieldPickerPathOptions.find((option) => option.path === selectedFieldPickerPath)
        ?? fieldPickerPathOptions[0];

      if (!selectedOption) {
        return [];
      }

      return [
        { label: fieldPickerPathOptions[0]?.label ?? labels.availableColumnsTitle, path: "" },
        ...selectedOption.trail.map((item) => ({ label: item.label, path: item.path }))
      ];
    },
    [fieldPickerPathOptions, fieldPickerState, fieldPickerTrail, labels.availableColumnsTitle, selectedFieldPickerPath]
  );
  const editorRowCount = getEditorGridRowCount(visibleSettings, editorGridColumns);
  const editorGridContentHeight = (editorRowCount * columnEditorRowHeight) + (Math.max(0, editorRowCount - 1) * columnEditorGap);
  const editorStyle = {
    "--titanic-column-editor-columns": String(editorGridColumns),
    "--titanic-column-editor-cell-step": `${100 / editorGridColumns}%`,
    "--titanic-column-editor-grid-content-height": `${editorGridContentHeight}px`,
    "--titanic-column-editor-row-count": String(editorRowCount)
  } as CSSProperties;

  useEffect(() => {
    if (hasProvidedStructure || !client) {
      setLoadedStructure(null);
      return;
    }

    let cancelled = false;

    setLoadedStructure(null);
    client.getStructure()
      .then((nextStructure) => {
        if (!cancelled) {
          setLoadedStructure(nextStructure);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedStructure(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, hasProvidedStructure, structure]);

  useEffect(() => {
    const nextDraftSettingsByMode = createEditorDraftSettingsByMode(
      columns,
      currentSettings,
      gridColumns,
      columnSettingsMode,
      modeSettings
    );

    setDraftSettingsByMode(nextDraftSettingsByMode);
    setDraftSettings(nextDraftSettingsByMode[columnSettingsMode] ?? createEditorDraftColumnSettingsForMode(
      columns,
      currentSettings,
      gridColumns,
      columnSettingsMode,
      columnSettingsMode,
      modeSettings
    ));
    setMode(columnSettingsMode);
    setEditingKey(null);
    setExtraColumns([]);
    setFieldPickerTrail([]);
    setFieldPickerSearch("");
    setValidationWarning(null);
  }, [columns, columnSettingsMode, currentSettings, effectiveStructure, gridColumns, modeSettings, rootTableName]);

  const updateSetting = (key: string, updater: (setting: EntityDataGridColumnSetting) => EntityDataGridColumnSetting) => {
    setDraftSettings((settings) => {
      const nextSettings = settings.map((setting, index) => {
        const nextSetting = {
          ...setting,
          id: getColumnSettingId(setting, index)
        };

        return setting.key === key ? updater(nextSetting) : nextSetting;
      });

      return normalizeColumnSettingsForEditorMode(
        editorColumns,
        nextSettings,
        getEditorGridColumns(gridColumns, mode, nextSettings),
        mode
      );
    });
  };

  const addColumn = (key: string, column?: EntityDataGridColumn<TRow>) => {
    const hasColumn = columnByKey.has(key);
    const nextEditorColumns = column && !hasColumn
      ? mergeEditorColumns(editorColumns, [column])
      : editorColumns;

    if (column && !hasColumn) {
      setExtraColumns((currentColumns) => mergeEditorColumns(currentColumns, [column]));
    }

    setValidationWarning(null);
    setDraftSettings((settings) => addColumnToEditorSettings(
      nextEditorColumns,
      settings,
      key,
      getEditorGridColumns(gridColumns, mode, settings),
      mode,
      column
    ));
  };

  const removeColumn = (key: string) => {
    const column = columnByKey.get(key);

    if (column?.required) {
      return;
    }

    setValidationWarning(null);
    setDraftSettings((settings) => {
      const nextSettings = settings.map((setting) =>
        setting.key === key
          ? {
              ...setting,
              visible: false
            }
          : setting
      );

      return normalizeColumnSettingsForEditorMode(
        editorColumns,
        nextSettings,
        getEditorGridColumns(gridColumns, mode, nextSettings),
        mode
      );
    });
  };

  const moveColumn = (sourceKey: string, targetKey: string) => {
    if (sourceKey === targetKey) {
      return;
    }

    setDraftSettings((settings) => {
      const nextSettings = moveDraftColumnSettings(editorColumns, settings, sourceKey, targetKey, editorGridColumns);

      return normalizeColumnSettingsForEditorMode(
        editorColumns,
        nextSettings,
        getEditorGridColumns(gridColumns, mode, nextSettings),
        mode
      );
    });
  };

  const resizeColumn = (key: string, span: number) => {
    setDraftSettings((settings) => {
      const maxSpan = getMaxResizeSpanForCurrentRow(settings, key, editorGridColumns);
      const nextSpan = clampGridSpan(span, maxSpan);
      const nextSettings = settings.map((setting, index) => {
        const nextSetting = {
          ...setting,
          id: getColumnSettingId(setting, index)
        };

        return setting.key === key
          ? {
              ...nextSetting,
              span: nextSpan,
              width: nextSpan * columnWidthUnit
            }
          : nextSetting;
      });

      return normalizeColumnSettingsForEditorMode(
        editorColumns,
        nextSettings,
        getEditorGridColumns(gridColumns, mode, nextSettings),
        mode
      );
    });
  };

  const renameColumn = (key: string, label: string) => {
    const column = columnByKey.get(key);
    const trimmedLabel = label.trim();
    const baseLabel = getColumnBaseLabel(column);

    updateSetting(key, (setting) => ({
      ...setting,
      label: trimmedLabel && trimmedLabel !== baseLabel ? trimmedLabel : undefined
    }));
  };

  const changeMode = (nextMode: EntityDataGridColumnSettingsMode) => {
    const currentModeSettings = normalizeColumnSettingsForEditorMode(
      editorColumns,
      draftSettings,
      getEditorGridColumns(gridColumns, mode, draftSettings),
      mode
    );
    const nextDraftSettingsByMode = {
      ...draftSettingsByMode,
      [mode]: currentModeSettings
    };
    const nextModeSettings = nextDraftSettingsByMode[nextMode] ?? createEditorDraftColumnSettingsForMode(
      editorColumns,
      currentSettings,
      gridColumns,
      columnSettingsMode,
      nextMode,
      modeSettings
    );

    setDraftSettingsByMode(nextDraftSettingsByMode);
    setMode(nextMode);
    setValidationWarning(null);
    setDraftSettings(normalizeColumnSettingsForEditorMode(
      editorColumns,
      nextModeSettings,
      getEditorGridColumns(gridColumns, nextMode, nextModeSettings),
      nextMode
    ));
  };

  const createSettingsPayload = () => {
    const normalizedSettings = normalizeColumnSettingsForEditorMode(
      editorColumns,
      draftSettings,
      editorGridColumns,
      mode
    );
    const nextDraftSettingsByMode = {
      ...draftSettingsByMode,
      [mode]: normalizedSettings
    };

    return {
      modeSettings: createModeSettingsPayload(nextDraftSettingsByMode),
      settings: normalizedSettings
    };
  };

  const validateSettingsPayload = (payload: ReturnType<typeof createSettingsPayload>) => {
    if (payload.settings.some((setting) => setting.visible)) {
      setValidationWarning(null);
      return true;
    }

    setValidationWarning(labels.noColumnsToSaveWarning);
    return false;
  };

  const openReferenceField = (item: FieldPickerItem) => {
    const referenceTableName = item.referenceTableName;

    if (!referenceTableName) {
      return;
    }

    setFieldPickerSearch("");
    setFieldPickerTrail((trail) => [
      ...trail,
      {
        label: formatReferenceTrailLabel(item),
        path: item.path,
        tableName: referenceTableName
      }
    ]);
  };

  const openFieldPickerTrail = (index: number) => {
    setFieldPickerSearch("");
    setFieldPickerTrail((trail) => index < 0 ? [] : trail.slice(0, index + 1));
  };

  const beginResize = (event: ReactPointerEvent<HTMLElement>, key: string, initialSpan: number) => {
    event.preventDefault();
    event.stopPropagation();

    const gridRect = gridRef.current?.getBoundingClientRect();
    const availableWidth = Math.max(1, (gridRect?.width ?? 0) - ((editorGridColumns - 1) * columnEditorGap));
    const cellWidth = Math.max(1, availableWidth / editorGridColumns);
    const startX = event.clientX;
    const startSpan = clampGridSpan(initialSpan, editorGridColumns);

    setResizingKey(key);

    const handleMove = (moveEvent: PointerEvent) => {
      const deltaCells = Math.round((moveEvent.clientX - startX) / cellWidth);
      resizeColumn(key, startSpan + deltaCells);
    };

    const handleUp = () => {
      setResizingKey(null);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointercancel", handleUp);
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
    document.addEventListener("pointercancel", handleUp);
  };

  const renderEditableLabel = (setting: EntityDataGridColumnSetting, column: EntityDataGridColumn<TRow>) => {
    const label = getColumnLabel(column, setting);

    if (editingKey === setting.key) {
      return (
        <input
          autoFocus
          className="titanic-data-grid-column-modal__name-input"
          defaultValue={label}
          onBlur={(event) => {
            renameColumn(setting.key, event.target.value);
            setEditingKey(null);
          }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
              renameColumn(setting.key, event.currentTarget.value);
              setEditingKey(null);
            }

            if (event.key === "Escape") {
              setEditingKey(null);
            }
          }}
        />
      );
    }

    return (
      <Button unstyled
        className="titanic-data-grid-column-modal__field-name"
        title={labels.renameColumn}
        type="button"
        onClick={() => setEditingKey(setting.key)}
      >
        {label}
      </Button>
    );
  };

  const renderVisibleField = (setting: EntityDataGridColumnSetting) => {
    const column = columnByKey.get(setting.key);

    if (!column) {
      return null;
    }

    const span = clampGridSpan(setting.span ?? getDefaultColumnSpan(column, editorGridColumns), editorGridColumns);
    const canRemove = !column.required;
    const fieldStyle = {
      "--titanic-column-editor-span": String(span)
    } as CSSProperties;
    const fieldClassName = [
      "titanic-data-grid-column-modal__field",
      mode === "list" ? "titanic-data-grid-column-modal__field_list" : "titanic-data-grid-column-modal__field_tile",
      draggingKey === setting.key ? "titanic-data-grid-column-modal__field_dragging" : "",
      resizingKey === setting.key ? "titanic-data-grid-column-modal__field_resizing" : ""
    ].filter(Boolean).join(" ");

    return (
      <ColumnSettingsVisibleFieldSchema
        canRemove={canRemove}
        className={fieldClassName}
        dragValue={setting.key}
        draggable={editingKey !== setting.key}
        isRequired={Boolean(column.required)}
        key={setting.key}
        labels={labels}
        span={span}
        style={fieldStyle}
        onDragEnd={() => setDraggingKey(null)}
        onDragOver={(event) => event.preventDefault()}
        onDragStart={(event) => handleColumnDragStart(event, setting.key, setDraggingKey)}
        onDrop={(event) => handleColumnDrop(event, setting.key, draggingKey, moveColumn)}
        onRemove={() => removeColumn(setting.key)}
        onResizeStart={(event) => beginResize(event, setting.key, span)}
      >
        {renderEditableLabel(setting, column)}
      </ColumnSettingsVisibleFieldSchema>
    );
  };

  const addPickedField = (item: FieldPickerItem) => {
    addColumn(item.path, createGridColumnFromFieldPickerItem<TRow>(item, fieldPickerTrail));
  };
  const changeFieldPickerPath = (path: string) => {
    const nextOption = fieldPickerPathOptions.find((option) => option.path === path);

    if (!nextOption) {
      return;
    }

    setFieldPickerSearch("");
    setFieldPickerTrail([...nextOption.trail]);
  };
  const selectFieldPickerPath = (index: number) => {
    if (index <= 0) {
      openFieldPickerTrail(-1);
      return;
    }

    openFieldPickerTrail(index - 1);
  };
  const saveSettings = () => {
    const payload = createSettingsPayload();

    if (!validateSettingsPayload(payload)) {
      return;
    }

    void (onSave ?? onApply)(payload.settings, mode, payload.modeSettings);
  };
  const saveDefaultSettings = () => {
    const payload = createSettingsPayload();

    if (!validateSettingsPayload(payload)) {
      return;
    }

    void onSaveDefault(payload.settings, mode, payload.modeSettings);
  };

  return (
    <ColumnSettingsDialogLayout
      error={error}
      labels={labels}
      saving={saving}
      toolbar={<ColumnSettingsModeTabs labels={labels} mode={mode} onChange={changeMode} />}
      validationWarning={validationWarning}
      onClose={onClose}
      onSave={saveSettings}
      onSaveDefault={saveDefaultSettings}
    >
      <EntityContainer className="titanic-data-grid-column-modal__body">
        <ColumnSettingsVisibleFieldsSchema
          gridRef={gridRef}
          hasVisibleFields={visibleSettings.length > 0}
          labels={labels}
          mode={mode}
          style={editorStyle}
        >
          {visibleSettings.map(renderVisibleField)}
        </ColumnSettingsVisibleFieldsSchema>

        <ColumnSettingsFieldPickerSchema
          availableColumns={availableColumnItems}
          emptyText={labels.noAvailableColumns}
          isFieldVisible={(item) => visibleColumnKeys.has(item.path)}
          items={fieldPickerState?.items ?? null}
          labels={labels}
          pathItems={fieldPickerPathItems}
          pathOptions={fieldPickerPathOptions}
          searchValue={fieldPickerSearch}
          selectedPath={selectedFieldPickerPath}
          onAddAvailableColumn={(key) => addColumn(key)}
          onAddField={addPickedField}
          onOpenReference={openReferenceField}
          onPathChange={changeFieldPickerPath}
          onPathItemClick={selectFieldPickerPath}
          onSearchChange={setFieldPickerSearch}
        />
      </EntityContainer>
    </ColumnSettingsDialogLayout>
  );
}

Titanic.define<EntityDataGridSettingsModalPageContext<unknown>>(
  columnSettingsDefinedComponentNames.EntityDataGridSettingsModalPage,
  EntityDataGridSettingsModalPageNative as (props: EntityDataGridSettingsModalPageContext<unknown>) => ReactNode
);

export const EntityDataGridSettingsModalPage = Titanic.getReactModule<
  DefinedEntityReactComponent<EntityDataGridSettingsModalPageContext<unknown>>
>(
  columnSettingsDefinedComponentNames.EntityDataGridSettingsModalPage
)! as unknown as EntityDataGridSettingsModalPageComponent;
