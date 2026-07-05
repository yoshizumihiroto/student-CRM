'use client'

import { useRouter } from 'next/navigation'

export default function StudentSelect({
  students,
  selectedId,
}: {
  students: { id: string; name: string }[]
  selectedId?: string
}) {
  const router = useRouter()

  return (
    <select
      value={selectedId ?? ''}
      onChange={(e) => router.push(`/ca?studentId=${e.target.value}`)}
      className="w-full sm:w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
    >
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  )
}
