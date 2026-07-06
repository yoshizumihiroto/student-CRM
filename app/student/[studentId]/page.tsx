export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { requestSession } from './actions'
import StudentTabs from './tabs'
import { getMatchResults, matchBadgeColor } from '@/lib/matching'

export default async function StudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) notFound()

  const proposals = await prisma.proposal.findMany({
    where: { studentId },
    include: {
      company: { include: { sessions: { orderBy: { startsAt: 'asc' } } } },
      chosenSession: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  const matchResults = await getMatchResults(
    studentId,
    proposals.map((p) => p.companyId),
  )

  const statusConfig = {
    PROPOSED:  { label: '日程を選んでください', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    REQUESTED: { label: '希望送信済み',         color: 'bg-blue-100 text-blue-700 border-blue-200' },
    CONFIRMED: { label: '確定済み',             color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg shrink-0">
          {student.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{student.name}</h1>
          <p className="text-sm text-slate-500">説明会の日程を選んで希望を送りましょう</p>
        </div>
        <div className="ml-auto text-sm text-slate-400">
          {proposals.length} 社提案中
        </div>
      </div>

      <StudentTabs studentId={studentId} active="sessions" />

      {proposals.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-500 font-medium">まだ提案された企業はありません</p>
          <p className="text-slate-400 text-sm mt-1">CAが企業を提案するとここに表示されます</p>
        </div>
      )}

      {proposals.map((proposal) => {
        const isEditable = proposal.status === 'PROPOSED'
        const { label, color } = statusConfig[proposal.status]
        const match = matchResults?.get(proposal.companyId)

        return (
          <div
            key={proposal.id}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
              proposal.status === 'CONFIRMED' ? 'border-emerald-200' : 'border-slate-200'
            }`}
          >
            {/* カードヘッダー */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-lg">{proposal.company.name}</span>
                  {proposal.company.type && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                      {proposal.company.type}
                    </span>
                  )}
                  {match && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${matchBadgeColor(match.percent)}`}
                    >
                      あなたとの適合度 {match.percent}%
                    </span>
                  )}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${color}`}>
                  {label}
                </span>
              </div>
              {match && (match.matches.length > 0 || match.gaps.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {match.matches.map((l) => (
                    <span key={l} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                      ◎ {l} が合っています
                    </span>
                  ))}
                  {match.gaps.map((l) => (
                    <span key={l} className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                      △ {l} は要確認
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 確定済み・希望送信済みの場合：選択日程を表示 */}
            {!isEditable && proposal.chosenSession && (
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">選択した日程</p>
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="font-semibold text-slate-700">
                      {new Date(proposal.chosenSession.startsAt).toLocaleDateString('ja-JP', {
                        month: 'long', day: 'numeric', weekday: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-slate-500">{proposal.chosenSession.location}</p>
                  </div>
                  {proposal.status === 'CONFIRMED' && (
                    <span className="ml-auto text-sm text-emerald-600 font-semibold">✓ 通知済み</span>
                  )}
                </div>
              </div>
            )}

            {/* 提案中：日程選択フォーム */}
            {isEditable && (
              <form action={requestSession} className="px-5 py-4 space-y-3">
                <input type="hidden" name="proposalId" value={proposal.id} />
                <input type="hidden" name="studentId" value={studentId} />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">参加希望の日程を1つ選んでください</p>
                <div className="space-y-2">
                  {proposal.company.sessions.map((session) => (
                    <label
                      key={session.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                    >
                      <input
                        type="radio"
                        name="sessionId"
                        value={session.id}
                        required
                        className="h-4 w-4 border-slate-300 text-blue-600 shrink-0"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-700 text-sm">
                          {new Date(session.startsAt).toLocaleDateString('ja-JP', {
                            month: 'long', day: 'numeric', weekday: 'short',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        <p className="text-xs text-slate-500">{session.location}</p>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">残席 {session.remaining}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
                >
                  参加希望を送る
                </button>
              </form>
            )}
          </div>
        )
      })}
    </div>
  )
}
