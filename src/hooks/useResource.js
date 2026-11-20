import { useEffect, useState } from 'react'
export default function useResource(load, initial = []) {
  const [state, setState] = useState({ data: initial, loading: true, error: '' })
  useEffect(() => {
    const controller = new AbortController()
    setState((old) => ({ ...old, loading: true, error: '' }))
    load({ signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setState({ data, loading: false, error: '' })
    }).catch((err) => {
      if (!controller.signal.aborted) setState((old) => ({ ...old, loading: false, error: err.message }))
    })
    return () => controller.abort()
  }, [load])
  return state
}
