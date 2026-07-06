export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { proposeCompanies } from './actions'
import StudentSelect from './student-select'
import { getMatchResults, matchBadgeColor } from '@/lib/matching'

export default async function CaPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>
}) {
  const { studentId } = await searchParams

  const [students, companies, ca] = await Promise.all([
    prisma.student.findMany({ orderBy: { name: 'asc' } }),
    prisma.company.findMany({
      include: { sessions: { orderBy: { startsAt: 'asc' } } },
      orderBy: { name: 'asc' },
    }),
    prisma.ca.findFirst(),
  ])

  const selectedStudent = students.find((s) => s.id === studentId) ?? students[0]

  const existingProposals = selectedStudent
    ? await prisma.proposal.findMany({
        where: { studentId: selectedStudent.id },
        select: { companyId: true, status: true },
      })
    : []
  const proposedCompanyIds = new Set(existingProposals.map((p) => p.companyId))

  // キャリアビジョン適合度スコア（未入力なら null）
  const matchResults = selectedStudent
    ? await getMatchResults(selectedStudent.id, companies.map((c) => c.id))
    : null

  // 適合度の高い順に並べる（スコアなしは末尾）
  const sortedCompanies = matchResults
    ? [...companies].sort(
        (a, b) =>
          (matchResults.get(b.id)?.percent ?? -1) - (matchResults.get(a.id)?.percent ?? -1),
      )
    : companies

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">企業提案</h1>
        <p className="text-sm text-slate-500 mt-1">学生に説明会を提案します</p>
      </div>

      {/* 学生選択 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">対象の学生</p>
        <StudentSelect
          students={students.map((s) => ({ id: s.id, name: s.name }))}
          selectedId={selectedStudent?.id}
        />
      </div>

      {/* 企業提案フォーム */}
      {selectedStudent && ca && (
        <form action={proposeCompanies} className="space-y-4">
          <input type="hidden" name="studentId" value={selectedStudent.id} />
          <input type="hidden" name="caId" value={ca.id} />

          {!matchResults && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-sm text-amber-700">
              💡 {selectedStudent.name} さんはキャリアビジョン未入力のため適合度スコアが表示されません。
              <a
                href={`/student/${selectedStudent.id}/vision`}
                className="ml-1 font-semibold underline hover:text-amber-900"
              >
                キャリアビジョンを入力する →
              </a>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">
              <span className="text-blue-600">{selectedStudent.name}</span> さんへ提案する企業を選択
              {matchResults && (
                <span className="ml-2 text-xs font-normal text-slate-400">適合度の高い順</span>
              )}
            </p>
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
            >
              選択した企業を提案する
            </button>
          </div>

          <div className="space-y-3">
            {sortedCompanies.map((company) => {
              const isProposed = proposedCompanyIds.has(company.id)
              const match = matchResults?.get(company.id)
              return (
                <label
                  key={company.id}
                  className={`block bg-white rounded-xl border shadow-sm p-5 transition-all ${
                    isProposed
                      ? 'border-emerald-200 bg-emerald-50/30 cursor-default'
                      : 'border-slate-200 cursor-pointer hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      name="companyIds"
                      value={company.id}
                      disabled={isProposed}
                      defaultChecked={isProposed}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">{company.name}</span>
                        {company.type && (
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                            {company.type}
                          </span>
                        )}
                        {isProposed && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            ✓ 提案済み
                          </span>
                        )}
                        {match && (
                          <span
                            className={`ml-auto text-xs px-2.5 py-0.5 rounded-full font-bold border ${matchBadgeColor(match.percent)}`}
                          >
                            適合度 {match.percent}%
                          </span>
                        )}
                      </div>
                      {match && (match.matches.length > 0 || match.gaps.length > 0) && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {match.matches.map((label) => (
                            <span
                              key={label}
                              className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100"
                            >
                              ◎ {label}
                            </span>
                          ))}
                          {match.gaps.map((label) => (
                            <span
                              key={label}
                              className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100"
                            >
                              △ {label}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 space-y-1.5">
                        {company.sessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2"
                          >
                            <span className="font-medium text-slate-600">
                              {new Date(session.startsAt).toLocaleDateString('ja-JP', {
                                month: 'long',
                                day: 'numeric',
                                weekday: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span>{session.location}</span>
                            <span className="ml-auto text-slate-400">残席 {session.remaining}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
            >
              選択した企業を提案する
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
