export interface GifResource {
  src: string;
  title?: string;
  durationMs?: number;
}

export interface GifCollectionResource {
  gifs: readonly GifResource[];
  defaultDurationMs?: number;
}
