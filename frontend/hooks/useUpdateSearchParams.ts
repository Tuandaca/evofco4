"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useUpdateSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Updates search parameters in the URL without a full page reload.
   * If a value is empty (null, undefined, ""), the parameter is removed.
   */
  const updateParams = useCallback(
    (updates: Record<string, string | number | null | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      // Apply all updates
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      // Special case: When changing any filter EXCEPT page, we should reset page to 1
      const isOnlyPageUpdate = Object.keys(updates).length === 1 && "page" in updates;
      if (!isOnlyPageUpdate && current.has("page")) {
        current.delete("page");
      }

      // Generate the new search string
      const search = current.toString();
      const query = search ? `?${search}` : "";

      // Push to router
      router.push(`${pathname}${query}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return updateParams;
}
