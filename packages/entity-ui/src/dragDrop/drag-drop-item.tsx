import { defineComponentSchema } from "@titanic-entity/entity-base";
import { Titanic, type DefinedEntityReactComponent } from "@titanic-entity/entity-react";
import { entityReactComponentNames } from "@titanic-entity/entity-react/model";
import type {
  CSSProperties,
  DragEvent,
  ElementType,
  ReactNode
} from "react";

export type EntityDragDropItemElement = "article" | "div" | "li" | "section";

export interface EntityDragDropItemProps<TValue = unknown> {
  as?: EntityDragDropItemElement;
  children?: ReactNode;
  className?: string;
  dragValue?: TValue;
  draggable?: boolean;
  id?: string;
  style?: CSSProperties;
  title?: string;
  visible?: boolean;
  onDragEnd?: (event: DragEvent<HTMLElement>) => void;
  onDragOver?: (event: DragEvent<HTMLElement>) => void;
  onDragStart?: (event: DragEvent<HTMLElement>) => void;
  onDragValueChange?: (value: TValue | null, event: DragEvent<HTMLElement>) => void;
  onDrop?: (event: DragEvent<HTMLElement>) => void;
}

type EntityDragDropItemComponent =
  <TValue = unknown>(props: EntityDragDropItemProps<TValue>) => ReactNode;

export const EntityDragDropItem = Titanic.define<EntityDragDropItemProps<any>>("Titanic.UI.EntityDragDropItem", function EntityDragDropItem<TValue = unknown>({
  as = "div",
  children,
  className,
  dragValue,
  draggable = true,
  id,
  style,
  title,
  visible = true,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDragValueChange,
  onDrop
}: EntityDragDropItemProps<TValue>) {
  if (!visible) {
    return null;
  }

  const Component = as as ElementType;

  return (
    <Component
      className={joinClassNames(
        "titanic-drag-drop-item",
        draggable ? "titanic-drag-drop-item_draggable" : undefined,
        className
      )}
      draggable={draggable}
      id={id}
      style={style}
      title={title}
      onDragEnd={(event: DragEvent<HTMLElement>) => {
        onDragEnd?.(event);
        onDragValueChange?.(null, event);
      }}
      onDragOver={onDragOver}
      onDragStart={(event: DragEvent<HTMLElement>) => {
        onDragStart?.(event);
        onDragValueChange?.(dragValue ?? null, event);
      }}
      onDrop={(event: DragEvent<HTMLElement>) => {
        onDrop?.(event);
        onDragValueChange?.(null, event);
      }}
    >
      {children}
    </Component>
  );
}) as DefinedEntityReactComponent<EntityDragDropItemProps<any>> & EntityDragDropItemComponent;

function joinClassNames(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

export const dragDropItemComponentSchema = defineComponentSchema<EntityDragDropItemProps>({
  kind: "component",
  name: entityReactComponentNames.EntityDragDropItem,
  component: EntityDragDropItem
});
