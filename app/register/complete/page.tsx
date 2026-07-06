import Link from 'next/link'

export default function RegisterCompletePage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-6">
          <div className="text-5xl">✅</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-800">登録完了</h1>
            <p className="text-sm text-slate-500">
              ユーザー登録が完了しました。
              <br />
              担当CAの学生一覧に反映されました。
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            ログイン画面へ
          </Link>
        </div>
      </div>
    </div>
  )
}
