import { Titanic } from "@titanic-entity/entity-react";
import { Button } from "../button";
import { Container } from "../container";

export interface NavigationTrailItem {
  id?: string;
  label: string;
  path?: string;
  title?: string;
  disabled?: boolean;
}

export interface NavigationTrailClassNames {
  root?: string;
  list?: string;
  item?: string;
  activeItem?: string;
  step?: string;
  separator?: string;
}

export interface NavigationTrailProps {
  ariaLabel?: string;
  activeIndex?: number;
  classNames?: NavigationTrailClassNames;
  items: readonly NavigationTrailItem[];
  separator?: string;
  title?: string;
  onItemClick?: (item: NavigationTrailItem, index: number) => void;
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function getItemKey(item: NavigationTrailItem, index: number): string {
  return item.id ?? item.path ?? `${index}:${item.label}`;
}

export const NavigationTrail = Titanic.define<NavigationTrailProps>("Titanic.UI.NavigationTrail", function NavigationTrail({
  ariaLabel,
  activeIndex,
  classNames,
  items,
  separator = "-",
  title,
  onItemClick
}: NavigationTrailProps) {
  if (items.length === 0) {
    return null;
  }

  const currentIndex = activeIndex ?? Math.max(0, items.length - 1);
  const trailLabel = ariaLabel ?? items.map((item) => item.label).join(` ${separator} `);

  return (
    <Container
      ariaLabel={trailLabel}
      className={joinClassNames("titanic-navigation-trail", classNames?.root)}
      role="navigation"
      title={title ?? trailLabel}
    >
      <Container className={joinClassNames("titanic-navigation-trail__list", classNames?.list)}>
        {items.map((item, index) => {
          const isActive = index === currentIndex;
          const crumb = (
            <Button unstyled
              aria-current={isActive ? "page" : undefined}
              className={joinClassNames(
                "titanic-navigation-trail__item",
                classNames?.item,
                isActive ? "titanic-navigation-trail__item_active" : undefined,
                isActive ? classNames?.activeItem : undefined
              )}
              disabled={item.disabled}
              title={item.title}
              type="button"
              onClick={() => onItemClick?.(item, index)}
            >
              {item.label}
            </Button>
          );

          return index === 0 ? (
            <span key={getItemKey(item, index)}>{crumb}</span>
          ) : (
            <span
              className={joinClassNames("titanic-navigation-trail__step", classNames?.step)}
              key={getItemKey(item, index)}
            >
              <span className={joinClassNames("titanic-navigation-trail__separator", classNames?.separator)}>
                {separator}
              </span>
              {crumb}
            </span>
          );
        })}
      </Container>
    </Container>
  );
});
