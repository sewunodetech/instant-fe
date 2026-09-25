"use client";

import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { errorMessage } from "@/lib/api-client";

export type ApiState<T> = {
  data: T | undefined;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
  setData: (update: T | ((prev: T | undefined) => T | undefined)) => void;
};

type Result<T> = { key: string | null; data: T | undefined; error: string | null };

/**
 * Minimal fetch-on-mount hook. Pass `null` as the fetcher to skip (e.g. until auth is ready).
 * Refetches when `deps` change; responses for stale deps are ignored.
 */
export function useApi<T>(fetcher: (() => Promise<T>) | null, deps: DependencyList): ApiState<T> {
  const key = JSON.stringify(deps);
  const [result, setResult] = useState<Result<T>>({ key: null, data: undefined, error: null });
  const [reloading, setReloading] = useState(false);
  const fetcherRef = useRef(fetcher);
  const keyRef = useRef(key);

  useEffect(() => {
    fetcherRef.current = fetcher;
    keyRef.current = key;
  });

  const enabled = Boolean(fetcher);

  useEffect(() => {
    const fn = fetcherRef.current;
    if (!fn) return;
    let cancelled = false;
    fn().then(
      (data) => !cancelled && setResult({ key, data, error: null }),
      (e) => !cancelled && setResult((prev) => ({ key, data: prev.data, error: errorMessage(e) }))
    );
    return () => {
      cancelled = true;
    };
  }, [key, enabled]);

  const reload = useCallback(async () => {
    const fn = fetcherRef.current;
    if (!fn) return;
    const requestKey = keyRef.current;
    setReloading(true);
    try {
      const data = await fn();
      if (keyRef.current === requestKey) setResult({ key: requestKey, data, error: null });
    } catch (e) {
      if (keyRef.current === requestKey) setResult((prev) => ({ key: requestKey, data: prev.data, error: errorMessage(e) }));
    } finally {
      setReloading(false);
    }
  }, []);

  const setData = useCallback((update: T | ((prev: T | undefined) => T | undefined)) => {
    setResult((prev) => ({
      ...prev,
      data: typeof update === "function" ? (update as (p: T | undefined) => T | undefined)(prev.data) : update,
    }));
  }, []);

  return {
    data: result.data,
    error: result.key === key ? result.error : null,
    loading: enabled && (result.key !== key || reloading),
    reload,
    setData,
  };
}
