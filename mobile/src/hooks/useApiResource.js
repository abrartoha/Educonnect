import { useCallback, useEffect, useRef, useState } from 'react';

// Generic data-fetching hook.
//
// Design notes — written defensively for React 19 / Strict Mode:
// * `fetcher` is stored in a ref so we always call the latest closure
//   without putting the fetcher itself in a dependency array.
// * `deps` is hashed to a stable string key so the effect only re-runs
//   when the values actually change (not when the array identity does).
// * `refetch` is a stable function reference.
//
// Loading semantics — chosen to avoid mid-action "flash":
// * Initial mount: loading=true until first response, then loading=false.
// * Deps change (different query key): clear the stale data and show
//   loading again so we don't render the wrong content.
// * Refetch (same deps): KEEP existing data on screen, don't toggle loading.
//   Consumers see the result swap in atomically when the new fetch resolves.
export function useApiResource(fetcher, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const hasDataRef = useRef(false);
  const prevDepsKeyRef = useRef(null);

  const depsKey = Array.isArray(deps)
    ? deps.map((d) => (d === undefined ? 'u' : d === null ? 'n' : String(d))).join('|')
    : '';

  useEffect(() => {
    let alive = true;

    const depsChanged =
      prevDepsKeyRef.current !== null && prevDepsKeyRef.current !== depsKey;
    if (depsChanged) {
      // The query key shifted — drop stale data so we don't briefly render the
      // previous resource against the new id.
      setData(null);
      hasDataRef.current = false;
    }
    prevDepsKeyRef.current = depsKey;

    // Spinner only when we have nothing to show. Refetches keep the UI alive.
    if (!hasDataRef.current) setLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await fetcherRef.current();
        if (alive) {
          setData(result);
          if (result != null) hasDataRef.current = true;
        }
      } catch (err) {
        if (alive) setError(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, reloadTick]);

  const refetch = useCallback(() => setReloadTick((t) => t + 1), []);

  return { data, loading, error, refetch, setData };
}
