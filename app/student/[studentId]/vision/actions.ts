'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveVision(formData: FormData) {
  const studentId = formData.get('studentId') as string
  if (!studentId) return

  const items = await prisma.visionItem.findMany()

  for (const item of items) {
    const raw = formData.get(`importance-${item.id}`)
    const importance = Number(raw)
    if (!raw || Number.isNaN(importance) || importance < 1 || importance > 5) continue

    await prisma.studentVisionScore.upsert({
      where: { studentId_itemId: { studentId, itemId: item.id } },
      update: { importance },
      create: { studentId, itemId: item.id, importance },
    })
  }

  revalidatePath(`/student/${studentId}/vision`)
  revalidatePath(`/student/${studentId}`)
  revalidatePath('/ca')
}
