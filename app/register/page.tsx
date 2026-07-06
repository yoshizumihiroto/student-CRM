import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { registerStudent } from './actions'

const currentYear = 2026
const graduationYears = Array.from({ length: 7 }, (_, i) => currentYear + i)

export default async function RegisterPage() {
  const cas = await prisma.ca.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="space-y-6">
      <div>
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          ← ログイン画面に戻る
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">ユーザー登録</h1>
          <p className="text-sm text-slate-500 mt-1">プロフィール情報を入力してください</p>
        </div>

        <form action={registerStudent} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 名前 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                名前 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="例：山田 太郎"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* メールアドレス */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                メールアドレス <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="例：taro.yamada@example.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 生年月日 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                生年月日
              </label>
              <input
                type="date"
                name="dateOfBirth"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 卒業年度 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                卒業年度
              </label>
              <select
                name="graduationYear"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {graduationYears.map((year) => (
                  <option key={year} value={year}>
                    {year}年卒
                  </option>
                ))}
              </select>
            </div>

            {/* 大学名 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                大学名
              </label>
              <input
                type="text"
                name="universityName"
                placeholder="例：○○大学"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 学部 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                学部
                <span className="ml-1 text-xs text-slate-400">（任意）</span>
              </label>
              <input
                type="text"
                name="faculty"
                placeholder="例：経済学部"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 担当CA */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                担当CA
              </label>
              <select
                name="caId"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {cas.map((ca) => (
                  <option key={ca.id} value={ca.id}>
                    {ca.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
            >
              登録を確定する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
