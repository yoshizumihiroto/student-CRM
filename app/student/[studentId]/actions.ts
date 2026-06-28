'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function requestSession(formData: FormData) {
  const proposalId = formData.get('proposalId') as string
  const sessionId = formData.get('sessionId') as string
  const studentId = formData.get('studentId') as string

  if (!proposalId || !sessionId) return

  await prisma.proposal.update({
    where: { id: proposalId, status: 'PROPOSED' },
    data: {
      status: 'REQUESTED',
      chosenSessionId: sessionId,
    },
  })

  revalidatePath(`/student/${studentId}`)
}
