import type { Metadata } from 'next'
import './globals.css'
import NavLink from './nav-link'

export const metadata: Metadata = {
  title: '学生管理CRM',
  description: '新卒採用エージェント向け説明会調整ツール',
}

const students = [
  { id: 'student-001', name: '山田 太郎' },
  { id: 'student-002', name: '佐藤 花子' },
  { id: 'student-003', name: '鈴木 一郎' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-slate-50">
        <div className="flex min-h-screen">
          {/* サイドバー */}
          <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100">
              <span className="font-bold text-slate-800 tracking-tight text-lg">
                <span className="text-blue-600">●</span> 学生管理CRM
              </span>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
              <div>
                <p className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  CA メニュー
                </p>
                <div className="space-y-0.5">
                  <NavLink href="/ca" exact>📤 企業提案</NavLink>
                  <NavLink href="/ca/confirm">✅ 日程確定</NavLink>
                  <NavLink href="/ca/applications">📊 選考状況一覧</NavLink>
                </div>
              </div>

              <div>
                <p className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  管理者メニュー
                </p>
                <div className="space-y-0.5">
                  <NavLink href="/admin">📈 ダッシュボード</NavLink>
                </div>
              </div>

              <div>
                <p className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  学生ビュー
                </p>
                <div className="space-y-0.5">
                  {students.map((s) => (
                    <NavLink key={s.id} href={`/student/${s.id}`}>
                      🎓 {s.name}
                    </NavLink>
                  ))}
                </div>
              </div>

              <div>
                <p className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  学生登録
                </p>
                <div className="space-y-0.5">
                  <NavLink href="/login">👤 ユーザー登録</NavLink>
                </div>
              </div>
            </nav>

            <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
              開発用ビュー切替
            </div>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1 min-w-0 px-8 py-8">
            <div className="max-w-3xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
