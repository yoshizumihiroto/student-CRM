export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getMatchResults } from '@/lib/matching'
import { selectionStatusLabels, selectionStatusColors } from '@/lib/labels'
import type { SelectionStatus } from '@/app/generated/prisma/client'

const statusBarColors: Record<SelectionStatus, string> = {
  ENTRY: 'bg-slate-400',
  DOCUMENT: 'bg-amber-400',
  FIRST_INTERVIEW: 'bg-blue-400',
  SECOND_INTERVIEW: 'bg-indigo-400',
  FINAL_INTERVIEW: 'bg-purple-400',
  OFFER: 'bg-emerald-500',
  REJECTED: 'bg-slate-300',
}

export default async function AdminDashboardPage() {
  const [students, companies, proposals, applications] = await Promise.all([
    prisma.student.findMany({
      include: {
        proposals: true,
        applications: true,
        visionScores: { select: { id: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.company.findMany({ select: { id: true } }),
    prisma.proposal.findMany(),
    prisma.application.findMany(),
  ])

  // ファネル：提案 → 希望受領 → 確定
  const totalProposals = proposals.length
  const reachedRequested = proposals.filter((p) => p.status !== 'PROPOSED').length
  const reachedConfirmed = proposals.filter((p) => p.status === 'CONFIRMED').length
  const funnel = [
    { label: '提案', count: totalProposals, color: 'bg-blue-500' },
    { label: '希望受領', count: reachedRequested, color: 'bg-indigo-500' },
    { label: '確定', count: reachedConfirmed, color: 'bg-emerald-500' },
  ]

  // リードタイム：確定済み提案の 作成→確定 平均
  const confirmedProposals = proposals.filter((p) => p.status === 'CONFIRMED')
  const avgLeadHours =
    confirmedProposals.length > 0
      ? confirmedProposals.reduce(
          (sum, p) => sum + (p.updatedAt.getTime() - p.createdAt.getTime()) / 3600000,
          0,
        ) / confirmedProposals.length
      : null
  const leadTimeLabel =
    avgLeadHours === null
      ? '—'
      : avgLeadHours < 48
      ? `${avgLeadHours.toFixed(1)} 時間`
      : `${(avgLeadHours / 24).toFixed(1)} 日`

  // 選考ステータス分布
  const statusCounts = new Map<SelectionStatus, number>()
  for (const app of applications) {
    statusCounts.set(app.status, (statusCounts.get(app.status) ?? 0) + 1)
  }
  const maxStatusCount = Math.max(1, ...statusCounts.values())
  const offerCount = statusCounts.get('OFFER') ?? 0

  // 学生別サマリー（平均適合度含む）
  const companyIds = companies.map((c) => c.id)
  const studentRows = await Promise.all(
    students.map(async (s) => {
      const matchResults =
        s.visionScores.length > 0 ? await getMatchResults(s.id, companyIds) : null
      const percents = matchResults ? [...matchResults.values()].map((m) => m.percent) : []
      const avgMatch =
        percents.length > 0
          ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
          : null
      return {
        id: s.id,
        name: s.name,
        hasVision: s.visionScores.length > 0,
        proposalCount: s.proposals.length,
        confirmedCount: s.proposals.filter((p) => p.status === 'CONFIRMED').length,
        applicationCount: s.applications.length,
        offerCount: s.applications.filter((a) => a.status === 'OFFER').length,
        avgMatch,
      }
    }),
  )

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">管理ダッシュボード</h1>
        <p className="text-sm text-slate-500 mt-1">採用支援の全体状況を確認できます</p>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: '担当学生', value: students.length, unit: '名' },
          { label: '提案', value: totalProposals, unit: '件' },
          { label: '説明会確定', value: reachedConfirmed, unit: '件' },
          { label: '選考中', value: applications.length, unit: '件' },
          { label: '内定', value: offerCount, unit: '件' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-400">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">
              {kpi.value}
              <span className="text-sm font-medium text-slate-400 ml-1">{kpi.unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 説明会調整ファネル */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">説明会調整ファネル</h2>
          <div className="space-y-3">
            {funnel.map((stage) => {
              const rate = totalProposals > 0 ? stage.count / totalProposals : 0
              return (
                <div key={stage.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">{stage.label}</span>
                    <span className="text-slate-400">
                      {stage.count} 件（{Math.round(rate * 100)}%）
                    </span>
                  </div>
                  <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all`}
                      style={{ width: `${Math.max(rate * 100, stage.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            提案から確定までの平均リードタイム：
            <span className="font-bold text-slate-600 ml-1">{leadTimeLabel}</span>
          </p>
        </section>

        {/* 選考ステータス分布 */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">選考ステータス分布</h2>
          {applications.length === 0 ? (
            <p className="text-sm text-slate-400">選考データがまだありません</p>
          ) : (
            <div className="space-y-2.5">
              {(Object.keys(selectionStatusLabels) as SelectionStatus[]).map((status) => {
                const count = statusCounts.get(status) ?? 0
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs font-medium text-slate-500">
                      {selectionStatusLabels[status]}
                    </span>
                    <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${statusBarColors[status]} rounded-full`}
                        style={{ width: `${(count / maxStatusCount) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-slate-600">{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* 学生別サマリー */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">学生別サマリー</h2>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">学生</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">ビジョン</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">平均適合度</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">提案</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">説明会確定</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">選考中</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">内定</th>
              </tr>
            </thead>
            <tbody>
              {studentRows.map((row) => (
                <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/student/${row.id}`}
                      className="font-medium text-slate-700 hover:text-blue-600"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {row.hasVision ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        入力済み
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                        未入力
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-600">
                    {row.avgMatch !== null ? `${row.avgMatch}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{row.proposalCount}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{row.confirmedCount}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{row.applicationCount}</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    {row.offerCount > 0 ? row.offerCount : <span className="text-slate-300 font-normal">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}
