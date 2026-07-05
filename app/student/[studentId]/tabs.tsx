import Link from 'next/link'

export default function StudentTabs({
  studentId,
  active,
}: {
  studentId: string
  active: 'sessions' | 'applications' | 'vision'
}) {
  const tabs = [
    { key: 'sessions', label: '説明会の日程選択', href: `/student/${studentId}` },
    { key: 'applications', label: '選考管理', href: `/student/${studentId}/applications` },
    { key: 'vision', label: 'キャリアビジョン', href: `/student/${studentId}/vision` },
  ] as const

  return (
    <div className="flex gap-1 border-b border-slate-200">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            active === tab.key
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
