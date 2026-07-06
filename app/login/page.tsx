import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-3">🎓</div>
            <h1 className="text-2xl font-bold text-slate-800">学生管理CRM</h1>
            <p className="text-sm text-slate-500">新卒採用エージェント向け就活サポートシステム</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/register"
              className="block w-full text-center bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
            >
              ユーザー登録
            </Link>
            <p className="text-center text-xs text-slate-400">
              はじめての方はユーザー登録から始めてください
            </p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <p className="text-xs text-center text-slate-400">
              CA・管理者の方は
              <Link href="/ca" className="text-blue-600 hover:underline ml-1">
                CAメニュー
              </Link>
              をご利用ください
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
