'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { SelectionStatus, Aspiration } from '@/app/generated/prisma/client'

function parseNextDate(value: FormDataEntryValue | null): Date | null {
  const s = typeof value === 'string' ? value.trim() : ''
  return s ? new Date(s) : null
}

export async function createApplication(formData: FormData) {
  const studentId = formData.get('studentId') as string
  const companyName = (formData.get('companyName') as string)?.trim()
  if (!studentId || !companyName) return

  await prisma.application.create({
    data: {
      studentId,
      companyName,
      status: (formData.get('status') as SelectionStatus) || 'ENTRY',
      aspiration: (formData.get('aspiration') as Aspiration) || 'MEDIUM',
      nextDate: parseNextDate(formData.get('nextDate')),
      memo: (formData.get('memo') as string)?.trim() || null,
    },
  })

  revalidatePath(`/student/${studentId}/applications`)
  revalidatePath('/ca/applications')
}

export async function updateApplication(formData: FormData) {
  const id = formData.get('id') as string
  const studentId = formData.get('studentId') as string
  if (!id) return

  await prisma.application.update({
    where: { id },
    data: {
      status: formData.get('status') as SelectionStatus,
      aspiration: formData.get('aspiration') as Aspiration,
      nextDate: parseNextDate(formData.get('nextDate')),
      memo: (formData.get('memo') as string)?.trim() || null,
    },
  })

  revalidatePath(`/student/${studentId}/applications`)
  revalidatePath('/ca/applications')
}

export async function deleteApplication(formData: FormData) {
  const id = formData.get('id') as string
  const studentId = formData.get('studentId') as string
  if (!id) return

  await prisma.application.delete({ where: { id } })

  revalidatePath(`/student/${studentId}/applications`)
  revalidatePath('/ca/applications')
}
