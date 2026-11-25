'use client'

import NextLink from 'next/link'
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation'
import { useCallback, useMemo, type ComponentProps } from 'react'

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
  to: string
}

const STATE_KEY = 'taiomei.navState'

export function Link({ to, ...rest }: LinkProps) {
  return <NextLink href={to} {...rest} />
}

export function useLocation() {
  const pathname = usePathname() || '/'
  const searchParams = useNextSearchParams()
  const qs = searchParams?.toString() ?? ''
  let state: unknown = null
  if (typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(STATE_KEY)
      if (raw) state = JSON.parse(raw)
    } catch {
      state = null
    }
  }
  return {
    pathname,
    search: qs ? `?${qs}` : '',
    hash: '',
    state,
  }
}

export function useNavigate() {
  const router = useRouter()
  return useCallback(
    (to: string | number, opts?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === 'number') {
        if (to < 0) router.back()
        return
      }
      if (typeof window !== 'undefined') {
        try {
          if (opts?.state !== undefined) sessionStorage.setItem(STATE_KEY, JSON.stringify(opts.state))
          else sessionStorage.removeItem(STATE_KEY)
        } catch {
          // ignore storage errors
        }
      }
      if (opts?.replace) router.replace(to)
      else router.push(to)
    },
    [router]
  )
}

export function useParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  return useNextParams() as T
}

export function useSearchParams(): [
  URLSearchParams,
  (
    next: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams),
    opts?: { replace?: boolean }
  ) => void
] {
  const router = useRouter()
  const pathname = usePathname() || '/'
  const nextParams = useNextSearchParams()

  const params = useMemo(() => new URLSearchParams(nextParams?.toString() ?? ''), [nextParams])

  const setSearchParams = useCallback(
    (
      next: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams),
      opts?: { replace?: boolean }
    ) => {
      const currentCopy = new URLSearchParams(params.toString())
      const sp =
        typeof next === 'function'
          ? next(currentCopy)
          : next instanceof URLSearchParams
          ? next
          : new URLSearchParams(next)
      const q = sp.toString()
      const url = q ? `${pathname}?${q}` : pathname
      if (opts?.replace) router.replace(url, { scroll: false })
      else router.push(url, { scroll: false })
    },
    [params, pathname, router]
  )

  return [params, setSearchParams]
}
