/**
 * Tries each backend URL in order until one responds.
 * Returns { res, data } from the first reachable host.
 * Throws if all hosts fail (network-level error — backend is fully down).
 */
const BACKEND_URLS = [
  process.env.BACKEND_URL || 'http://localhost:8000',
  'http://127.0.0.1:8000',
]

export async function backendFetch(path, options = {}) {
  let lastError

  for (const base of BACKEND_URLS) {
    try {
      const res = await fetch(`${base}${path}`, {
        ...options,
        cache: 'no-store',
      })
      const data = await res.json()
      return { res, data }
    } catch (err) {
      console.warn(`[backend] ${base}${path} unreachable — ${err?.message ?? err}`)
      lastError = err
    }
  }

  throw new Error(
    `All backend hosts unreachable (${BACKEND_URLS.join(', ')}): ${lastError?.message ?? lastError}`
  )
}

/**
 * Normalises FastAPI error details into a plain string.
 * FastAPI can return either:
 *   { detail: "string" }
 *   { detail: [{ msg: "...", loc: [...] }, ...] }
 */
export function parseBackendError(data, fallback = 'Request failed') {
  if (!data?.detail) return fallback
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg).join(', ')
  }
  return String(data.detail)
}
