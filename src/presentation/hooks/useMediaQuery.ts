"use client";

import { useSyncExternalStore } from "react";

/**
 * THE SITE'S ONE MEDIA-QUERY SUBSCRIPTION, shared by every caller of the same query.
 *
 * It exists because three separate hooks were about to grow their own copy of the same
 * eight lines, and because `matchMedia` is exactly the sort of thing
 * `useSyncExternalStore` is for: a value that lives outside React, changes without React
 * being told, and must not be read during render in a way that tears.
 *
 * IT IS FALSE ON THE SERVER AND ON THE FIRST CLIENT RENDER, always, whatever the query
 * says. There is no viewport during a prerender, so any answer would be a guess, and a
 * guess that differs from the browser's is a hydration mismatch. Every caller is written
 * so that `false` is the state that needs no JavaScript: the motion layers are off, the
 * pointer is assumed coarse, the drawer is assumed to be a drawer. What arrives is the
 * plain version, and the enhancement is added a frame later.
 *
 * The store is cached per query string so ten components asking the same question share
 * one listener rather than registering ten.
 */
const stores = new Map<
  string,
  { subscribe: (callback: () => void) => () => void; getSnapshot: () => boolean }
>();

function storeFor(query: string) {
  const existing = stores.get(query);
  if (existing) {
    return existing;
  }
  const store = {
    subscribe(callback: () => void): () => void {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    getSnapshot(): boolean {
      return window.matchMedia(query).matches;
    },
  };
  stores.set(query, store);
  return store;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useMediaQuery(query: string): boolean {
  const store = storeFor(query);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);
}
