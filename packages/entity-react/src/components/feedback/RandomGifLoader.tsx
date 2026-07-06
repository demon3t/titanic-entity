// Компонент обратной связи 'RandomGifLoader' для общих UI-сценариев.
import { useEffect, useMemo, useState } from "react";
import type { GifCollectionResource } from "@titanic-entity/entity-resources";

export interface RandomGifLoaderProps {
  className?: string;
  collection: GifCollectionResource;
  label?: string;
}

export function RandomGifLoader({
  className = "",
  collection,
  label
}: RandomGifLoaderProps) {
  const gifs = collection.gifs;
  const [activeIndex, setActiveIndex] = useState(() => getRandomIndex(gifs.length));
  const activeGif = gifs[activeIndex] ?? gifs[0];
  const durationMs = activeGif?.durationMs ?? collection.defaultDurationMs ?? 1600;
  const rootClassName = useMemo(
    () => ["titanic-random-gif-loader", className].filter(Boolean).join(" "),
    [className]
  );

  useEffect(() => {
    if (gifs.length <= 1) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setActiveIndex((currentIndex) => getNextRandomIndex(gifs.length, currentIndex));
    }, durationMs);

    return () => window.clearTimeout(timerId);
  }, [durationMs, gifs.length, activeIndex]);

  if (!activeGif) {
    return null;
  }

  return (
    <div className={rootClassName} role="status" aria-live="polite">
      <img
        className="titanic-random-gif-loader__image"
        key={`${activeGif.src}-${activeIndex}`}
        src={activeGif.src}
        alt=""
        aria-hidden="true"
      />
      {label ? <span className="titanic-random-gif-loader__label">{label}</span> : null}
    </div>
  );
}

function getRandomIndex(length: number): number {
  return length > 0 ? Math.floor(Math.random() * length) : 0;
}

function getNextRandomIndex(length: number, currentIndex: number): number {
  if (length <= 1) {
    return currentIndex;
  }

  let nextIndex = getRandomIndex(length);

  while (nextIndex === currentIndex) {
    nextIndex = getRandomIndex(length);
  }

  return nextIndex;
}
