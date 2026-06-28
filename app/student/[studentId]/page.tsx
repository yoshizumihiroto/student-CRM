import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { requestSession } from './actions'

export default async function StudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })
  if (!student) notFound()

  const proposals = await prisma.proposal.findMany({
    where: { studentId },
    include: {
      company: {
        include: { sessions: { orderBy: { startsAt: 'asc' } } },
      },
      chosenSession: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">画面B：学生・説明会選択</h1>
        <p className="text-sm text-gray-500 mt-1">{student.name} さん</p>
      </div>

      {proposals.length === 0 && (
        <div className="bg-white rounded border border-gray-200 p-6 text-gray-400 text-sm">
          まだ提案された企業はありません。CAが企業を提案するとここに表示されます。
        </div>
      )}

      {proposals.map((proposal) => {
        const isEditable = proposal.status === 'PROPOSED'
        const statusLabel =
          proposal.status === 'PROPOSED'
            ? '提案中'
            : proposal.status === 'REQUESTED'
            ? '希望送信済み'
            : '確定済み'

        const statusColor =
          proposal.status === 'PROPOSED'
            ? 'bg-yellow-100 text-yellow-700'
            : proposal.status === 'REQUESTED'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-green-100 text-green-700'

        return (
          <div key={proposal.id} className="bg-white rounded border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-800">{proposal.company.name}</span>
                {proposal.company.type && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    {proposal.company.type}
                  </span>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            </div>

            {!isEditable && proposal.chosenSession && (
              <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                <span className="font-medium">選択した日程：</span>
                {new Date(proposal.chosenSession.startsAt).toLocaleDateString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                　{proposal.chosenSession.location}
                {proposal.status === 'CONFIRMED' && (
                  <span className="ml-2 text-green-700 font-medium">✓ 学生・企業に通知済み</span>
                )}
              </div>
            )}

            {isEditable && (
              <form action={requestSession} className="space-y-2">
                <input type="hidden" name="proposalId" value={proposal.id} />
                <input type="hidden" name="studentId" value={studentId} />
                <p className="text-sm text-gray-600">参加希望の日程を1つ選んでください：</p>
                <div className="space-y-2">
                  {proposal.company.sessions.map((session) => (
                    <label
                      key={session.id}
                      className="flex items-start gap-3 p-3 rounded border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                    >
                      <input
                        type="radio"
                        name="sessionId"
                        value={session.id}
                        required
                        className="mt-0.5 h-4 w-4 border-gray-300 text-blue-600"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-gray-700">
                          {new Date(session.startsAt).toLocaleDateString('ja-JP', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-gray-500">
                          {session.location}　残席 {session.remaining}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
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
