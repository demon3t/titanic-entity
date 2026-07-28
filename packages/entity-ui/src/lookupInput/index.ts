import { defineComponentSchema, defineFieldSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames, entityReactFieldNames } from "@titanic-entity/entity-react/model";
import type { ReactNode } from "react";
import type { BaseInputFieldProps } from "../inputFieldFrame/base-input-field";
import "../button";
import "../inputFieldFrame";
import "./lookup-input";
import type { LookupInputLabels } from "./lookup-input-lcz";

export type LookupInputMode = "enum" | "lookup";
export type LookupInputValue = string | number | null;

export interface LookupInputItem {
  id?: LookupInputValue;
  value?: LookupInputValue;
  index?: number;
  title?: string;
  displayValue?: string;
}

type LookupInputChangeHandler<TItem extends LookupInputItem> = {
  bivarianceHack(value: LookupInputValue, item?: TItem): void;
}["bivarianceHack"];

export interface LookupInputProps<TItem extends LookupInputItem = LookupInputItem>
  extends Omit<BaseInputFieldProps<LookupInputValue, "lookup">, "value"> {
  id?: string;
  name?: string;
  value: LookupInputValue;
  displayValue?: string;
  items: TItem[];
  mode?: LookupInputMode;
  locale?: string;
  labels?: LookupInputLabels;
  disabled?: boolean;
  emptyText?: string;
  noResultsText?: string;
  loadingText?: string;
  loadingMoreText?: string;
  errorText?: string;
  className?: string;
  inputClassName?: string;
  renderFrame?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  error?: Error | null;
  searchDelayMs?: number;
  minSearchLength?: number;
  getId?: (item: TItem) => LookupInputValue;
  getLabel?: (item: TItem) => string;
  onChange: LookupInputChangeHandler<TItem>;
  onOpen?: (searchText: string) => void | Promise<void>;
  onSearchChange?: (value: string) => void | Promise<void>;
  onLoadMore?: () => void | Promise<void>;
}

export const LookupInput = Titanic.getReactModule<DefinedEntityReactComponent<LookupInputProps>>(
  "Titanic.UI.LookupInput"
)! as <TItem extends LookupInputItem = LookupInputItem>(props: LookupInputProps<TItem>) => ReactNode;

export const lookupInputComponentSchema = defineComponentSchema<LookupInputProps>({
  kind: "component",
  name: entityReactComponentNames.LookupInput,
  component: LookupInput
});

export const lookupInputFieldSchema = defineFieldSchema<LookupInputProps>({
  kind: "field",
  name: entityReactFieldNames.LookupInput,
  component: LookupInput
});

export {
  defaultLookupInputCulture,
  getLookupInputLabels,
  getLookupInputLocale,
  lookupInputLocalizationSchemaName
} from "./lookup-input-lcz";
export type { LookupInputCulture, LookupInputLabels, LookupInputResolvedLabels } from "./lookup-input-lcz";
