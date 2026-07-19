import { defineComponentSchema } from "@titanic-entity/entity-base";
import type { EntityColumnDefinition, EntityValues } from "@titanic-entity/entity-core";
import {
  useState,
  type CSSProperties,
  type ReactNode
} from "react";
import { EntityContainer } from "../container";
import { EntityLabel } from "../label";
import { ResourceSvgIcon, type ResourceSvgIconInput } from "../resourceSvgIcon/resource-svg-icon";

export interface EntityExpanderProps {
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  defaultExpanded?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  headerClassName?: string;
  icon?: ResourceSvgIconInput;
  id?: string;
  label?: ReactNode;
  labelClassName?: string;
  labelColumn?: EntityColumnDefinition;
  labelValues?: EntityValues;
  style?: CSSProperties;
  visible?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function EntityExpander({
  children,
  className,
  contentClassName,
  defaultExpanded = false,
  disabled = false,
  expanded,
  headerClassName,
  icon = "panelChevron",
  id,
  label,
  labelClassName,
  labelColumn,
  labelValues,
  style,
  visible = true,
  onExpandedChange
}: EntityExpanderProps) {
  const [innerExpanded, setInnerExpanded] = useState(defaultExpanded);
  const isExpanded = expanded ?? innerExpanded;

  if (!visible) {
    return null;
  }

  const toggleExpanded = () => {
    if (disabled) {
      return;
    }

    const nextExpanded = !isExpanded;

    if (expanded === undefined) {
      setInnerExpanded(nextExpanded);
    }

    onExpandedChange?.(nextExpanded);
  };

  return (
    <EntityContainer
      className={joinClassNames("titanic-expander", isExpanded ? "titanic-expander_expanded" : undefined, className)}
      id={id}
      style={style}
    >
      <button
        aria-expanded={isExpanded}
        className={joinClassNames("titanic-expander__header", headerClassName)}
        disabled={disabled}
        type="button"
        onClick={toggleExpanded}
      >
        <span className="titanic-expander__icon" aria-hidden="true">
          <ResourceSvgIcon icon={icon} />
        </span>
        <EntityLabel
          className={joinClassNames("titanic-expander__label", labelClassName)}
          column={labelColumn}
          value={label}
          values={labelValues}
        />
      </button>
      <EntityContainer
        className={joinClassNames("titanic-expander__content", contentClassName)}
        visible={isExpanded}
      >
        {children}
      </EntityContainer>
    </EntityContainer>
  );
}

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const expanderComponentSchema = defineComponentSchema<EntityExpanderProps>({
  kind: "component",
  name: "EntityExpander",
  component: EntityExpander
});
