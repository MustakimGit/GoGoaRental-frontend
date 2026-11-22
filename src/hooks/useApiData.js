import { useCallback, useEffect, useState } from 'react'

/**
 * Loads data with `load()` on mount and whenever `deps` change.
 * Returns { data, error, loading, reload, setData }; setData lets callers apply a server response without refetching.
 */
export default function useApiData(load, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps)

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    try {
      const data = await run()
      setState({ data, error: null, loading: false })
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }))
    }
  }, [run])

  useEffect(() => {
    let cancelled = false
    run().then(
      (data) => !cancelled && setState({ data, error: null, loading: false }),
      (error) => !cancelled && setState((s) => ({ ...s, error, loading: false })),
    )
    return () => {
      cancelled = true
    }
  }, [run])

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }))
  }, [])

  return { ...state, reload, setData }
}
