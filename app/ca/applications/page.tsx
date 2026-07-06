export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  selectionStatusLabels,
  selectionStatusColors,
  aspirationLabels,
  aspirationColors,
} from '@/lib/labels'

export default async function CaApplicationsPage() {
  const students = await prisma.student.findMany({
    include: {
      applications: {
        orderBy: [{ nextDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
      },
    },
    orderBy: { name: 'asc' },
  })

  const totalCount = students.reduce((sum, s) => sum + s.applications.length, 0)

  // 直近1週間以内の次回選考
  const now = new Date()
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcoming = students
    .flatMap((s) => s.applications.map((a) => ({ ...a, studentName: s.name })))
    .filter((a) => a.nextDate && a.nextDate >= now && a.nextDate <= oneWeekLater)
    .sort((a, b) => a.nextDate!.getTime() - b.nextDate!.getTime())

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">選考状況一覧</h1>
        <p className="text-sm text-slate-500 mt-1">
          担当学生の選考状況を確認できます（全 {totalCount} 件）
        </p>
      </div>

      {/* 直近の選考予定 */}
      {upcoming.length > 0 && (
        <section className="bg-amber-50 rounded-xl border border-amber-200 p-5">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3">
            ⏰ 1週間以内の選考予定
          </p>
          <div className="space-y-2">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-slate-700 w-32 shrink-0">
                  {a.nextDate!.toLocaleDateString('ja-JP', {
                    month: 'short', day: 'numeric', weekday: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
                <span className="text-slate-600">{a.studentName}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">{a.companyName}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${selectionStatusColors[a.status]}`}
                >
                  {selectionStatusLabels[a.status]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 学生ごとの選考一覧 */}
      {students.map((student) => (
        <section key={student.id} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
              {student.name[0]}
            </div>
            <h2 className="font-bold text-slate-800">{student.name}</h2>
            <span className="text-xs text-slate-400">{student.applications.length} 社</span>
            <Link
              href={`/student/${student.id}/applications`}
              className="ml-auto text-xs text-blue-600 hover:underline"
            >
              学生ビューで編集 →
            </Link>
          </div>

          {student.applications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-sm text-slate-400">
              登録された選考はありません
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">企業名</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">ステータス</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">志望度</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">次回選考</th>
                  </tr>
                </thead>
                <tbody>
                  {student.applications.map((app) => (
                    <tr key={app.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700">{app.companyName}</p>
                        {app.memo && (
                          <p className="text-xs text-slate-400 mt-0.5 whitespace-pre-wrap">📝 {app.memo}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${selectionStatusColors[app.status]}`}
                        >
                          {selectionStatusLabels[app.status]}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${aspirationColors[app.aspiration]}`}>
                        {aspirationLabels[app.aspiration]}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {app.nextDate
                          ? app.nextDate.toLocaleDateString('ja-JP', {
                              month: 'long', day: 'numeric', weekday: 'short',
                              hour: '2-digit', minute: '2-digit',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
