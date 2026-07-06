'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export async function registerStudent(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const dateOfBirthRaw = formData.get('dateOfBirth') as string
  const universityName = (formData.get('universityName') as string)?.trim()
  const faculty = (formData.get('faculty') as string)?.trim()
  const graduationYearRaw = formData.get('graduationYear') as string
  const caId = (formData.get('caId') as string)?.trim()

  if (!name || !email) return

  const graduationYear = graduationYearRaw ? parseInt(graduationYearRaw, 10) : null

  await prisma.student.create({
    data: {
      name,
      email: email || null,
      dateOfBirth: dateOfBirthRaw ? new Date(dateOfBirthRaw) : null,
      universityName: universityName || null,
      faculty: faculty || null,
      graduationYear: graduationYear || null,
      caId: caId || null,
    },
  })

  redirect('/register/complete')
}
