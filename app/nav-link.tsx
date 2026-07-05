'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function NavLinkInner({
  href,
  children,
  exact = false,
}: {
  href: string
  children: React.ReactNode
  exact?: boolean
}) {
  const pathname = usePathname()
  useSearchParams() // searchParams変更時も再評価させる
  const basePath = href.split('?')[0]
  const isActive = exact ? pathname === basePath : pathname.startsWith(basePath)

  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {children}
    </Link>
  )
}

export default function NavLink(props: {
  href: string
  children: React.ReactNode
  exact?: boolean
}) {
  return (
    <Suspense>
      <NavLinkInner {...props} />
    </Suspense>
  )
}
