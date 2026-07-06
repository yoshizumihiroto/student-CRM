export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { confirmProposal } from './actions'

export default async function CaConfirmPage({
  params,
}: {
  params: Promise<{ caId: string }>
}) {
  const { caId } = await params

  const ca = await prisma.ca.findUnique({ where: { id: caId } })
  if (!ca) notFound()

  const proposals = await prisma.proposal.findMany({
    where: { caId, status: { in: ['REQUESTED', 'CONFIRMED'] } },
    include: { student: true, company: true, chosenSession: true },
    orderBy: { updatedAt: 'desc' },
  })

  const requested = proposals.filter((p) => p.status === 'REQUESTED')
  const confirmed = proposals.filter((p) => p.status === 'CONFIRMED')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">日程確定</h1>
        <p className="text-sm text-slate-500 mt-1">学生からの希望を確認して日程を確定します</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">確定待ち</h2>
          {requested.length > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {requested.length}
            </span>
          )}
        </div>

        {requested.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-slate-500 font-medium">すべて処理済みです</p>
          </div>
        )}

        {requested.map((proposal) => (
          <div key={proposal.id} className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                {proposal.student.name[0]}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{proposal.student.name}</span>
                <span className="text-slate-400 text-sm">→</span>
                <span className="font-semibold text-slate-800">{proposal.company.name}</span>
                {proposal.company.type && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {proposal.company.type}
                  </span>
                )}
              </div>
              <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                希望受領済み
              </span>
            </div>

            <div className="px-5 py-4 flex items-center justify-between gap-4">
              {proposal.chosenSession ? (
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5 flex-1">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      {new Date(proposal.chosenSession.startsAt).toLocaleDateString('ja-JP', {
                        month: 'long', day: 'numeric', weekday: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-slate-500">{proposal.chosenSession.location}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">日程未選択</p>
              )}

              <form action={confirmProposal} className="shrink-0">
                <input type="hidden" name="proposalId" value={proposal.id} />
                <input type="hidden" name="caId" value={caId} />
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-colors whitespace-nowrap"
                >
                  この日程で確定する
                </button>
              </form>
            </div>
          </div>
        ))}
      </section>

      {confirmed.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">確定済み</h2>
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {confirmed.length}
            </span>
          </div>

          {confirmed.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-xl border border-emerald-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0">
                  {proposal.student.name[0]}
                </div>
                <span className="text-sm font-medium text-slate-700">{proposal.student.name}</span>
                <span className="text-slate-400 text-xs">→</span>
                <span className="text-sm font-medium text-slate-700">{proposal.company.name}</span>
                {proposal.chosenSession && (
                  <>
                    <span className="text-slate-300 text-xs">·</span>
                    <span className="text-xs text-slate-500">
                      {new Date(proposal.chosenSession.startsAt).toLocaleDateString('ja-JP', {
                        month: 'short', day: 'numeric', weekday: 'short',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </>
                )}
                <span className="ml-auto text-xs text-emerald-600 font-semibold">✓ 通知済み</span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
