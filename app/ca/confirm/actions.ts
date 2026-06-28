'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function confirmProposal(formData: FormData) {
  const proposalId = formData.get('proposalId') as string
  if (!proposalId) return

  await prisma.proposal.update({
    where: { id: proposalId, status: 'REQUESTED' },
    data: { status: 'CONFIRMED' },
  })

  revalidatePath('/ca/confirm')
}
