'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function proposeCompanies(formData: FormData) {
  const studentId = formData.get('studentId') as string
  const caId = formData.get('caId') as string
  const companyIds = formData.getAll('companyIds') as string[]

  if (!studentId || !caId || companyIds.length === 0) return

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { caId: true },
  })
  if (student?.caId !== caId) return

  const existing = await prisma.proposal.findMany({
    where: { studentId, companyId: { in: companyIds } },
    select: { companyId: true },
  })
  const existingSet = new Set(existing.map((p) => p.companyId))
  const newCompanyIds = companyIds.filter((id) => !existingSet.has(id))

  if (newCompanyIds.length > 0) {
    await prisma.proposal.createMany({
      data: newCompanyIds.map((companyId) => ({
        studentId,
        companyId,
        caId,
        status: 'PROPOSED',
      })),
    })
  }

  revalidatePath(`/ca/${caId}`)
}
