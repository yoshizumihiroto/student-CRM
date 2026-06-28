import { prisma } from '@/lib/prisma'
import { proposeCompanies } from './actions'

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800">画面A：CA・企業提案</h1>

      {/* 学生選択 */}
      <section className="bg-white rounded border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-2">対象の学生を選ぶ</h2>
        <div className="flex gap-2 flex-wrap">
          {students.map((s) => (
            <a
              key={s.id}
              href={`/ca?studentId=${s.id}`}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selectedStudent?.id === s.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {s.name}
            </a>
          ))}
        </div>
      </section>

      {/* 学生へのリンク */}
      {selectedStudent && (
        <div className="text-sm text-gray-500">
          <a
            href={`/student/${selectedStudent.id}`}
            className="text-blue-600 hover:underline"
          >
            {selectedStudent.name} さんの学生ビューを開く →
          </a>
        </div>
      )}

      {/* 企業提案フォーム */}
      {selectedStudent && ca && (
        <form action={proposeCompanies} className="space-y-4">
          <input type="hidden" name="studentId" value={selectedStudent.id} />
          <input type="hidden" name="caId" value={ca.id} />

          <h2 className="text-sm font-semibold text-gray-600">
            {selectedStudent.name} さんへ提案する企業を選ぶ
          </h2>

          {companies.map((company) => {
            const isProposed = proposedCompanyIds.has(company.id)
            return (
              <div
                key={company.id}
                className="bg-white rounded border border-gray-200 p-4"
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="companyIds"
                    value={company.id}
                    disabled={isProposed}
                    defaultChecked={isProposed}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{company.name}</span>
                      {company.type && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                          {company.type}
                        </span>
                      )}
                      {isProposed && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          提案済み
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      {company.sessions.map((session) => (
                        <div
                          key={session.id}
                          className="text-xs text-gray-500 flex gap-3"
                        >
                          <span>
                            {new Date(session.startsAt).toLocaleDateString('ja-JP', {
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>{session.location}</span>
                          <span className="text-gray-400">残席 {session.remaining}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </label>
              </div>
            )
          })}

          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 text-sm font-medium"
          >
            提案する
          </button>
        </form>
      )}
    </div>
  )
}
