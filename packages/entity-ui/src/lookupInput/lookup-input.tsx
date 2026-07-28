import { Titanic } from "@titanic-entity/entity-react";
import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type UIEvent } from "react";
import { Button } from "../button";
import { InputFieldFrame } from "../inputFieldFrame";
import { getLookupInputLabels, getLookupInputLocale } from "./lookup-input-lcz";
import type { LookupInputItem, LookupInputProps, LookupInputValue } from "./index";

interface NormalizedLookupItem<TItem extends LookupInputItem> {
  item: TItem;
  label: string;
  normalizedValue: string;
  searchValue: string;
  value: LookupInputValue;
}

export const LookupInput = Titanic.define<LookupInputProps<any>>(
  "Titanic.UI.LookupInput",
  function LookupInput<TItem extends LookupInputItem = LookupInputItem>({
    id,
    name,
    value = null,
    displayValue = "",
    items = [],
    mode = "enum",
    locale,
    labels,
    disabled = false,
    emptyText,
    noResultsText,
    loadingText,
    loadingMoreText,
    errorText,
    className,
    inputClassName,
    editable = true,
    renderFrame = true,
    loading = false,
    loadingMore = false,
    hasMore = false,
    error = null,
    searchDelayMs = 1500,
    minSearchLength = 3,
    getId,
    getLabel,
    required = false,
    title,
    validationError,
    visible = true,
    onChange,
    onOpen,
    onSearchChange,
    onLoadMore
  }: LookupInputProps<TItem>) {
    const fallbackId = useId();
    const resolvedId = id ?? fallbackId;
    const resolvedName = name ?? id ?? fallbackId.replace(/:/g, "");
    const rootRef = useRef<HTMLDivElement | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const loadMorePendingRef = useRef(false);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchRequestIdRef = useRef(0);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchPending, setSearchPending] = useState(false);
    const readOnly = disabled || !editable;
    const resolvedSearchDelayMs = normalizePositiveInteger(searchDelayMs);
    const resolvedMinSearchLength = normalizePositiveInteger(minSearchLength);
    const errorId = validationError ? `${resolvedId}-error` : undefined;
    const currentLocale = getLookupInputLocale(locale);
    const resolvedLabels = mergeLookupLabels(
      { ...getLookupInputLabels(currentLocale), ...(labels ?? {}) },
      { emptyText, noResultsText, loadingText, loadingMoreText, errorText }
    );
    const normalizedValue = normalizeLookupValue(value);
    const normalizedItems = useMemo<readonly NormalizedLookupItem<TItem>[]>(() => (
      (Array.isArray(items) ? items : []).map((item) => {
        const itemValue = getId ? getId(item) : defaultEntityId(item);
        const label = getLabel ? getLabel(item) : defaultEntityLabel(item);
        return {
          item,
          label,
          normalizedValue: normalizeLookupValue(itemValue),
          searchValue: normalizeLookupSearchText(`${label} ${normalizeLookupValue(itemValue)}`),
          value: itemValue
        };
      })
    ), [getId, getLabel, items]);
    const selectedOption = normalizedItems.find((item) => item.normalizedValue === normalizedValue);
    const selectedLabel = normalizedValue
      ? selectedOption?.label ?? displayValue ?? normalizedValue
      : "";
    const [draft, setDraft] = useState(selectedLabel);
    const optionSearchText = draft === selectedLabel ? "" : draft;
    const visibleItems = useMemo(() => {
      const normalizedSearchText = normalizeLookupSearchText(optionSearchText);
      return !normalizedSearchText
        ? normalizedItems
        : normalizedItems.filter((item) => item.searchValue.includes(normalizedSearchText));
    }, [normalizedItems, optionSearchText]);

    const clearScheduledSearch = () => {
      if (searchTimerRef.current != null) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    };

    const runSearch = (nextValue: string) => {
      clearScheduledSearch();
      const requestId = searchRequestIdRef.current + 1;
      searchRequestIdRef.current = requestId;
      setSearchPending(true);

      Promise.resolve(onSearchChange?.(nextValue)).finally(() => {
        if (searchRequestIdRef.current === requestId) {
          setSearchPending(false);
        }
      });
    };

    const scheduleSearch = (nextValue: string): boolean => {
      const normalizedSearchText = normalizeLookupSearchText(nextValue);
      clearScheduledSearch();

      if (normalizedSearchText.length < resolvedMinSearchLength) {
        searchRequestIdRef.current += 1;
        setSearchPending(false);
        return false;
      }

      setSearchPending(true);
      if (resolvedSearchDelayMs <= 0) {
        runSearch(nextValue);
      } else {
        searchTimerRef.current = setTimeout(() => runSearch(nextValue), resolvedSearchDelayMs);
      }

      return true;
    };

    useEffect(() => {
      if (!suggestionsOpen && !modalOpen) {
        setDraft(selectedLabel);
      }
    }, [selectedLabel]);

    useEffect(() => {
      if (!suggestionsOpen && !modalOpen) {
        return;
      }

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        if (modalRef.current?.contains(target) || rootRef.current?.contains(target)) {
          return;
        }

        setSuggestionsOpen(false);
        setModalOpen(false);
        setDraft(selectedLabel);
      };
      const handleKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.key === "Escape") {
          setSuggestionsOpen(false);
          setModalOpen(false);
          setDraft(selectedLabel);
        }
      };

      document.addEventListener("pointerdown", handlePointerDown, true);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [modalOpen, selectedLabel, suggestionsOpen]);

    useEffect(() => {
      if (!loadingMore) {
        loadMorePendingRef.current = false;
      }
    }, [loadingMore]);

    useEffect(() => () => {
      clearScheduledSearch();
      searchRequestIdRef.current += 1;
    }, []);

    if (!visible) {
      return null;
    }

    const requestOpen = (searchText: string) => {
      if (!readOnly) {
        void onOpen?.(searchText);
      }
    };

    const openSuggestions = () => {
      if (readOnly) {
        return;
      }

      setSuggestionsOpen(true);
      requestOpen(optionSearchText);
    };

    const openModal = () => {
      if (readOnly) {
        return;
      }

      setSuggestionsOpen(false);
      setModalOpen(true);
      requestOpen(optionSearchText);
    };

    const toggleAction = () => {
      if (mode === "lookup") {
        openModal();
      } else if (suggestionsOpen) {
        setSuggestionsOpen(false);
        setDraft(selectedLabel);
      } else {
        openSuggestions();
      }
    };

    const updateSearch = (nextValue: string) => {
      setDraft(nextValue);

      if (readOnly) {
        return;
      }

      if (!normalizeLookupSearchText(nextValue)) {
        clearScheduledSearch();
        searchRequestIdRef.current += 1;
        setSearchPending(false);
        setSuggestionsOpen(false);
        if (value != null) {
          onChange(null);
        }
        return;
      }

      setSuggestionsOpen(scheduleSearch(nextValue));
    };

    const selectOption = (option: NormalizedLookupItem<TItem>) => {
      onChange(option.value, option.item);
      setDraft(option.label);
      setSuggestionsOpen(false);
      setModalOpen(false);
    };

    const handleListScroll = (event: UIEvent<HTMLDivElement>) => {
      const element = event.currentTarget;
      const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight;

      if (
        distanceToBottom > 32
        || !hasMore
        || !onLoadMore
        || loading
        || loadingMore
        || loadMorePendingRef.current
      ) {
        return;
      }

      loadMorePendingRef.current = true;
      void onLoadMore();
    };

    const renderOptionList = (listClassName: string, shouldRender: boolean) => shouldRender ? (
      <div
        aria-busy={Boolean(loading || loadingMore || searchPending)}
        className={listClassName}
        role="listbox"
        onScroll={handleListScroll}
      >
        {loading ? <div className="titanic-lookup__status">{resolvedLabels.loadingText}</div> : null}
        {error ? <div className="titanic-lookup__error">{resolvedLabels.errorText}</div> : null}
        {visibleItems.map((option, optionIndex) => {
          const active = option.normalizedValue === normalizedValue;
          return (
            <Button
              unstyled
              aria-selected={active}
              className={joinClassNames("titanic-lookup__option", active && "titanic-lookup__option_active")}
              key={`${option.normalizedValue || "lookup-option"}-${optionIndex}`}
              role="option"
              type="button"
              onClick={() => selectOption(option)}
            >
              {option.label}
            </Button>
          );
        })}
        {loadingMore ? <div className="titanic-lookup__status">{resolvedLabels.loadingMoreText}</div> : null}
      </div>
    ) : null;

    const canRenderOptionList = visibleItems.length > 0 || loading || loadingMore || Boolean(error);
    const control = (
      <div
        className={joinClassNames(
          "titanic-lookup",
          "titanic-field__control",
          "titanic-lookup_framed",
          readOnly && "titanic-lookup_disabled",
          className
        )}
        ref={rootRef}
      >
        <div className={joinClassNames(
          "titanic-lookup__control",
          "titanic-lookup__control_embedded",
          readOnly && "titanic-lookup__control_disabled"
        )}>
          <input
            aria-errormessage={errorId}
            aria-invalid={validationError ? true : undefined}
            autoComplete="off"
            className={joinClassNames("titanic-lookup__input", inputClassName)}
            disabled={readOnly}
            id={resolvedId}
            name={resolvedName}
            required={required}
            type="text"
            value={draft}
            onChange={(event: ChangeEvent<HTMLInputElement>) => updateSearch(event.target.value)}
            onFocus={openSuggestions}
          />
          <Button
            unstyled
            aria-expanded={mode === "lookup" ? modalOpen : suggestionsOpen}
            aria-haspopup={mode === "lookup" ? "dialog" : "listbox"}
            aria-label={mode === "lookup" ? resolvedLabels.openSearch : resolvedLabels.openList}
            className="titanic-lookup__action"
            disabled={readOnly}
            type="button"
            onClick={toggleAction}
          >
            <span
              aria-hidden
              className={mode === "lookup" ? "titanic-lookup__search-icon" : "titanic-lookup__chevron"}
            />
          </Button>
        </div>

        {renderOptionList(
          "titanic-lookup__popover",
          suggestionsOpen && canRenderOptionList
        )}

        {modalOpen ? (
          <div className="titanic-lookup__modal-backdrop" role="presentation">
            <div
              aria-labelledby={`${resolvedId}-lookup-title`}
              aria-modal
              className="titanic-lookup__modal"
              ref={modalRef}
              role="dialog"
            >
              <div className="titanic-lookup__modal-header">
                <h2 className="titanic-lookup__modal-title" id={`${resolvedId}-lookup-title`}>
                  {title ?? resolvedLabels.emptyText}
                </h2>
                <Button
                  unstyled
                  aria-label={resolvedLabels.close}
                  className="titanic-lookup__modal-close"
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setDraft(selectedLabel);
                  }}
                >
                  <span aria-hidden className="titanic-lookup__close-icon" />
                </Button>
              </div>
              <input
                autoComplete="off"
                className="titanic-lookup__modal-search"
                type="text"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  scheduleSearch(event.target.value);
                }}
              />
              {renderOptionList(
                "titanic-lookup__popover titanic-lookup__modal-list",
                canRenderOptionList
              )}
            </div>
          </div>
        ) : null}
      </div>
    );

    return renderFrame ? (
      <InputFieldFrame
        control={control}
        errorId={errorId}
        htmlFor={resolvedId}
        required={required}
        title={title}
        validationError={validationError}
      />
    ) : control;
  }
);

function mergeLookupLabels<T extends Record<string, string>>(
  labels: T,
  overrides: Record<string, unknown>
): T {
  const merged = { ...labels };

  Object.entries(overrides).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      (merged as Record<string, string>)[key] = String(value);
    }
  });

  return merged;
}

function defaultEntityId(item: LookupInputItem): LookupInputValue {
  return item?.value ?? item?.id ?? null;
}

function defaultEntityLabel(item: LookupInputItem): string {
  const itemValue = item?.value;
  const itemId = item?.id;
  const label = item?.displayValue
    || item?.title
    || (itemValue == null ? "" : String(itemValue))
    || (itemId == null ? "" : String(itemId));

  return item?.index == null ? label : `${item.index}. ${label}`;
}

function normalizeLookupValue(value: LookupInputValue): string {
  return value == null ? "" : String(value);
}

function normalizeLookupSearchText(value: string): string {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function normalizePositiveInteger(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}
