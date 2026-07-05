import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import StudentTabs from '../tabs'
import { createApplication, updateApplication, deleteApplication } from './actions'
import {
  selectionStatusLabels,
  selectionStatusColors,
  aspirationLabels,
} from '@/lib/labels'
import type { SelectionStatus, Aspiration } from '@/app/generated/prisma/client'

function toLocalInputValue(d: Date | null) {
  if (!d) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const statusOptions = Object.entries(selectionStatusLabels) as [SelectionStatus, string][]
const aspirationOptions = Object.entries(aspirationLabels) as [Aspiration, string][]

export default async function StudentApplicationsPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) notFound()

  const applications = await prisma.application.findMany({
    where: { studentId },
    orderBy: [{ nextDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
  })

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
          {student.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
          <p className="text-sm text-slate-500">受けている企業の選考状況を管理しましょう</p>
        </div>
        <div className="ml-auto text-sm text-slate-400">{applications.length} 社選考中</div>
      </div>

      <StudentTabs studentId={studentId} active="applications" />

      {/* 新規登録フォーム */}
      <form
        action={createApplication}
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4"
      >
        <input type="hidden" name="studentId" value={studentId} />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          選考中の企業を追加
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">企業名</label>
            <input
              type="text"
              name="companyName"
              required
              placeholder="例：株式会社サンプル"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">選考ステータス</label>
            <select
              name="status"
              defaultValue="ENTRY"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">志望度</label>
            <select
              name="aspiration"
              defaultValue="MEDIUM"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {aspirationOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">次回選考日程（任意）</label>
            <input
              type="datetime-local"
              name="nextDate"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">メモ（任意）</label>
            <textarea
              name="memo"
              rows={2}
              placeholder="例：面接で聞かれたこと、企業の雰囲気、対策メモなど"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
        >
          追加する
        </button>
      </form>

      {/* 選考一覧 */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-500 font-medium">まだ登録された選考はありません</p>
          <p className="text-slate-400 text-sm mt-1">上のフォームから選考中の企業を追加できます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-slate-800">{app.companyName}</span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${selectionStatusColors[app.status]}`}
                >
                  {selectionStatusLabels[app.status]}
                </span>
                {app.nextDate && (
                  <span className="ml-auto text-xs text-slate-500">
                    次回：
                    <span className="font-semibold text-slate-700">
                      {app.nextDate.toLocaleDateString('ja-JP', {
                        month: 'long', day: 'numeric', weekday: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </span>
                )}
              </div>

              <form action={updateApplication} className="space-y-3">
                <input type="hidden" name="id" value={app.id} />
                <input type="hidden" name="studentId" value={studentId} />
                <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">ステータス</label>
                  <select
                    name="status"
                    defaultValue={app.status}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">志望度</label>
                  <select
                    name="aspiration"
                    defaultValue={app.aspiration}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {aspirationOptions.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">次回選考日程</label>
                  <input
                    type="datetime-local"
                    name="nextDate"
                    defaultValue={toLocalInputValue(app.nextDate)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">メモ</label>
                  <textarea
                    name="memo"
                    rows={2}
                    defaultValue={app.memo ?? ''}
                    placeholder="面接メモ、企業の印象など"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="bg-slate-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                  >
                    更新
                  </button>
                  <button
                    type="submit"
                    formAction={deleteApplication}
                    className="text-slate-400 px-2 py-1.5 rounded-lg text-sm hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
