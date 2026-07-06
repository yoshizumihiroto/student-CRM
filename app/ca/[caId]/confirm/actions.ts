'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function confirmProposal(formData: FormData) {
  const proposalId = formData.get('proposalId') as string
  const caId = formData.get('caId') as string
  if (!proposalId || !caId) return

  await prisma.proposal.update({
    where: { id: proposalId, caId, status: 'REQUESTED' },
    data: { status: 'CONFIRMED' },
  })

  revalidatePath(`/ca/${caId}/confirm`)
}
