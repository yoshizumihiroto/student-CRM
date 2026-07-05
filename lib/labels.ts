import type { SelectionStatus, Aspiration } from '@/app/generated/prisma/client'

export const selectionStatusLabels: Record<SelectionStatus, string> = {
  ENTRY: 'エントリー',
  DOCUMENT: '書類選考',
  FIRST_INTERVIEW: '一次面接',
  SECOND_INTERVIEW: '二次面接',
  FINAL_INTERVIEW: '最終面接',
  OFFER: '内定',
  REJECTED: 'お見送り',
}

export const selectionStatusColors: Record<SelectionStatus, string> = {
  ENTRY: 'bg-slate-100 text-slate-600 border-slate-200',
  DOCUMENT: 'bg-amber-100 text-amber-700 border-amber-200',
  FIRST_INTERVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
  SECOND_INTERVIEW: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  FINAL_INTERVIEW: 'bg-purple-100 text-purple-700 border-purple-200',
  OFFER: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-slate-100 text-slate-400 border-slate-200',
}

export const aspirationLabels: Record<Aspiration, string> = {
  HIGH: '◎ 高',
  MEDIUM: '○ 中',
  LOW: '△ 低',
}

export const aspirationColors: Record<Aspiration, string> = {
  HIGH: 'text-rose-600',
  MEDIUM: 'text-amber-600',
  LOW: 'text-slate-400',
}
