"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface UrlQuery {
  get: (key: string) => string;
  /** Sets (or, with "" / null, removes) keys. Changing any filter returns to page 1. */
  set: (updates: Record<string, string | null>) => void;
  /** Removes every key. */
  clear: () => void;
  /** True when anything besides the page and sort is set. */
  filtered: boolean;
  params: URLSearchParams;
}

/** Search state lives in the URL, so a refresh, the back button and a shared link all keep the filters. */
export function useUrlQuery(): UrlQuery {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const go = useCallback(
    (next: URLSearchParams) => {
      const text = next.toString();
      router.replace(text ? `${pathname}?${text}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const set = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      if (!("page" in updates)) next.delete("page");
      go(next);
    },
    [params, go],
  );

  const clear = useCallback(() => go(new URLSearchParams()), [go]);
  const filtered = [...params.keys()].some((key) => key !== "page" && key !== "sort");

  return { get: (key) => params.get(key) ?? "", set, clear, filtered, params };
}
