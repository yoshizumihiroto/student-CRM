import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import StudentTabs from '../tabs'
import { saveVision } from './actions'

export default async function StudentVisionPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) notFound()

  const [items, scores] = await Promise.all([
    prisma.visionItem.findMany({ orderBy: { order: 'asc' } }),
    prisma.studentVisionScore.findMany({ where: { studentId } }),
  ])
  const importanceByItem = new Map(scores.map((s) => [s.itemId, s.importance]))

  // カテゴリごとにグループ化
  const categories = [...new Set(items.map((i) => i.category))]

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
          {student.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
          <p className="text-sm text-slate-500">
            働くうえで大切にしたいことを教えてください。企業との適合度スコアに使われます
          </p>
        </div>
      </div>

      <StudentTabs studentId={studentId} active="vision" />

      {scores.length === 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-sm text-blue-700">
          💡 各項目の「重視する度合い」を選んで保存すると、提案された企業ごとに適合度スコアが表示されるようになります。
        </div>
      )}

      <form action={saveVision} className="space-y-6">
        <input type="hidden" name="studentId" value={studentId} />

        {categories.map((category) => (
          <section
            key={category}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4"
          >
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {category}
            </h2>

            {items
              .filter((i) => i.category === category)
              .map((item) => {
                const current = importanceByItem.get(item.id) ?? 3
                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <p className="w-48 shrink-0 text-sm font-medium text-slate-700">
                      {item.label}
                    </p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label key={n} className="cursor-pointer">
                          <input
                            type="radio"
                            name={`importance-${item.id}`}
                            value={n}
                            defaultChecked={current === n}
                            className="peer sr-only"
                          />
                          <span className="flex w-10 h-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-400 transition-colors hover:border-blue-300 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600">
                            {n}
                          </span>
                        </label>
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 hidden sm:block">
                      1: 重視しない 〜 5: とても重視
                    </span>
                  </div>
                )
              })}
          </section>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
        >
          キャリアビジョンを保存する
        </button>
      </form>
    </div>
  )
}
