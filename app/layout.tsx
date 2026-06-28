import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '学生管理CRM',
  description: '新卒採用エージェント向け説明会調整ツール',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex gap-6 items-center">
          <span className="font-semibold text-gray-800">学生管理CRM</span>
          <nav className="flex gap-4 text-sm">
            <a href="/ca" className="text-blue-600 hover:underline">CA・提案</a>
            <a href="/ca/confirm" className="text-blue-600 hover:underline">CA・確定</a>
          </nav>
          <span className="ml-auto text-xs text-gray-400">開発用ビュー切替：</span>
        </header>
        <main className="p-6">{children}</main>
      </body>
    </html>
  )
}
