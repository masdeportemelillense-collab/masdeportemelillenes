import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavState = {
  ids: string[];
  toggle: (id: string) => void;
};

export const useFavorites = create<FavState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({
          ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id],
        })),
    }),
    { name: "melilla-directo-favs" },
  ),
);

export function useFavorite(id: string) {
  const ids = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return { fav: ready && ids.includes(id), toggle };
}

export function useFavoriteIds() {
  const ids = useFavorites((s) => s.ids);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready ? ids : [];
}
