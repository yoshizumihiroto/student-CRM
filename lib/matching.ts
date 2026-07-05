import { prisma } from '@/lib/prisma'

export type MatchResult = {
  percent: number
  matches: string[] // 重視していて企業も強い軸（一致ポイント）
  gaps: string[]    // 重視しているが企業が弱い軸（ギャップ）
}

// 適合度 = Σ(重要度 × 企業スコア) / Σ(重要度 × 5) × 100
export async function getMatchResults(
  studentId: string,
  companyIds: string[],
): Promise<Map<string, MatchResult> | null> {
  const studentScores = await prisma.studentVisionScore.findMany({
    where: { studentId },
    include: { item: true },
  })
  if (studentScores.length === 0) return null

  const companyScores = await prisma.companyVisionScore.findMany({
    where: { companyId: { in: companyIds } },
  })
  const scoreByCompanyItem = new Map(
    companyScores.map((cs) => [`${cs.companyId}:${cs.itemId}`, cs.score]),
  )

  const results = new Map<string, MatchResult>()
  for (const companyId of companyIds) {
    let num = 0
    let den = 0
    const matched: { label: string; strength: number }[] = []
    const gapped: { label: string; importance: number }[] = []

    for (const ss of studentScores) {
      const companyScore = scoreByCompanyItem.get(`${companyId}:${ss.itemId}`)
      if (companyScore === undefined) continue
      num += ss.importance * companyScore
      den += ss.importance * 5
      if (ss.importance >= 3 && companyScore >= 4) {
        matched.push({ label: ss.item.label, strength: ss.importance * companyScore })
      }
      if (ss.importance >= 4 && companyScore <= 2) {
        gapped.push({ label: ss.item.label, importance: ss.importance })
      }
    }
    if (den === 0) continue

    results.set(companyId, {
      percent: Math.round((num / den) * 100),
      matches: matched.sort((a, b) => b.strength - a.strength).slice(0, 2).map((m) => m.label),
      gaps: gapped.sort((a, b) => b.importance - a.importance).slice(0, 2).map((g) => g.label),
    })
  }
  return results
}

export function matchBadgeColor(percent: number): string {
  if (percent >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (percent >= 60) return 'bg-blue-100 text-blue-700 border-blue-200'
  if (percent >= 40) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-slate-100 text-slate-500 border-slate-200'
}
