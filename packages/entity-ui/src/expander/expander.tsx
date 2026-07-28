import { defineComponentSchema } from "@titanic-entity/entity-base";
import type { EntityColumnDefinition, EntityValues } from "@titanic-entity/entity-core";
import { Titanic } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import {
  useState,
  type CSSProperties,
  type ReactNode
} from "react";
import { Container } from "../container";
import { Label } from "../label";
import { ResourceSvgIcon, type ResourceSvgIconInput } from "../resourceSvgIcon/resource-svg-icon";

export interface ExpanderProps {
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

export const Expander = Titanic.define<ExpanderProps>("Titanic.UI.Expander", function Expander({
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
}: ExpanderProps) {
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
    <Container
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
        <Label
          className={joinClassNames("titanic-expander__label", labelClassName)}
          column={labelColumn}
          value={label}
          values={labelValues}
        />
      </button>
      <Container
        className={joinClassNames("titanic-expander__content", contentClassName)}
        visible={isExpanded}
      >
        {children}
      </Container>
    </Container>
  );
});

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export type EntityExpanderProps = ExpanderProps;
export const EntityExpander = Expander;

export const expanderComponentSchema = defineComponentSchema<ExpanderProps>({
  kind: "component",
  name: entityReactComponentNames.Expander,
  component: Expander
});
