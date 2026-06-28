import { prisma } from '@/lib/prisma'
import { confirmProposal } from './actions'

export default async function CaConfirmPage() {
  const proposals = await prisma.proposal.findMany({
    where: { status: { in: ['REQUESTED', 'CONFIRMED'] } },
    include: {
      student: true,
      company: true,
      chosenSession: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  const requested = proposals.filter((p) => p.status === 'REQUESTED')
  const confirmed = proposals.filter((p) => p.status === 'CONFIRMED')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800">画面C：CA・日程確定</h1>

      {/* 希望受領済み（要確定） */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-600">
          希望受領済み（確定待ち）
          <span className="ml-2 text-blue-600">{requested.length} 件</span>
        </h2>

        {requested.length === 0 && (
          <div className="bg-white rounded border border-gray-200 p-4 text-gray-400 text-sm">
            確定待ちの希望はありません。
          </div>
        )}

        {requested.map((proposal) => (
          <div key={proposal.id} className="bg-white rounded border border-gray-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{proposal.student.name}</span>
              <span className="text-gray-400 text-sm">→</span>
              <span className="font-medium text-gray-800">{proposal.company.name}</span>
              {proposal.company.type && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  {proposal.company.type}
                </span>
              )}
            </div>

            {proposal.chosenSession && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">希望日程：</span>
                {new Date(proposal.chosenSession.startsAt).toLocaleDateString('ja-JP', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                　{proposal.chosenSession.location}
              </div>
            )}

            <form action={confirmProposal}>
              <input type="hidden" name="proposalId" value={proposal.id} />
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-green-700"
              >
                この日程で確定する
              </button>
            </form>
          </div>
        ))}
      </section>

      {/* 確定済み */}
      {confirmed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-600">
            確定済み
            <span className="ml-2 text-green-600">{confirmed.length} 件</span>
          </h2>

          {confirmed.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded border border-gray-200 p-4 space-y-2 opacity-80"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">{proposal.student.name}</span>
                <span className="text-gray-400 text-sm">→</span>
                <span className="font-medium text-gray-700">{proposal.company.name}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                  確定済み
                </span>
              </div>

              {proposal.chosenSession && (
                <div className="text-sm text-gray-500">
                  {new Date(proposal.chosenSession.startsAt).toLocaleDateString('ja-JP', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  　{proposal.chosenSession.location}
                </div>
              )}

              <p className="text-xs text-green-700">✓ 学生・企業に通知済み</p>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
