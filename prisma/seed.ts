import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const ca = await prisma.ca.upsert({
    where: { id: 'ca-001' },
    update: {},
    create: {
      id: 'ca-001',
      name: '田中 美咲',
    },
  })

  const [student1, student2, student3] = await Promise.all([
    prisma.student.upsert({
      where: { id: 'student-001' },
      update: {},
      create: { id: 'student-001', name: '山田 太郎', caId: ca.id },
    }),
    prisma.student.upsert({
      where: { id: 'student-002' },
      update: {},
      create: { id: 'student-002', name: '佐藤 花子', caId: ca.id },
    }),
    prisma.student.upsert({
      where: { id: 'student-003' },
      update: {},
      create: { id: 'student-003', name: '鈴木 一郎', caId: ca.id },
    }),
  ])

  const [companyA, companyB, companyC] = await Promise.all([
    prisma.company.upsert({
      where: { id: 'company-001' },
      update: {},
      create: { id: 'company-001', name: '株式会社テックビジョン', type: 'IT' },
    }),
    prisma.company.upsert({
      where: { id: 'company-002' },
      update: {},
      create: { id: 'company-002', name: '大和コンサルティング', type: 'コンサル' },
    }),
    prisma.company.upsert({
      where: { id: 'company-003' },
      update: {},
      create: { id: 'company-003', name: '東邦製作所', type: 'メーカー' },
    }),
  ])

  await Promise.all([
    prisma.infoSession.upsert({
      where: { id: 'session-001' },
      update: {},
      create: {
        id: 'session-001',
        companyId: companyA.id,
        startsAt: new Date('2026-07-10T10:00:00+09:00'),
        location: '東京本社 会議室A',
        capacity: 20,
        remaining: 15,
      },
    }),
    prisma.infoSession.upsert({
      where: { id: 'session-002' },
      update: {},
      create: {
        id: 'session-002',
        companyId: companyA.id,
        startsAt: new Date('2026-07-17T14:00:00+09:00'),
        location: 'オンライン（Zoom）',
        capacity: 50,
        remaining: 42,
      },
    }),
    prisma.infoSession.upsert({
      where: { id: 'session-003' },
      update: {},
      create: {
        id: 'session-003',
        companyId: companyB.id,
        startsAt: new Date('2026-07-12T13:00:00+09:00'),
        location: '渋谷オフィス セミナールーム',
        capacity: 30,
        remaining: 28,
      },
    }),
    prisma.infoSession.upsert({
      where: { id: 'session-004' },
      update: {},
      create: {
        id: 'session-004',
        companyId: companyB.id,
        startsAt: new Date('2026-07-20T10:00:00+09:00'),
        location: '大阪支店 研修室',
        capacity: 15,
        remaining: 10,
      },
    }),
    prisma.infoSession.upsert({
      where: { id: 'session-005' },
      update: {},
      create: {
        id: 'session-005',
        companyId: companyC.id,
        startsAt: new Date('2026-07-15T09:30:00+09:00'),
        location: '川崎工場 会議棟',
        capacity: 25,
        remaining: 20,
      },
    }),
    prisma.infoSession.upsert({
      where: { id: 'session-006' },
      update: {},
      create: {
        id: 'session-006',
        companyId: companyC.id,
        startsAt: new Date('2026-07-22T13:30:00+09:00'),
        location: 'オンライン（Teams）',
        capacity: 40,
        remaining: 35,
      },
    }),
  ])

  // キャリアビジョンの評価軸
  const visionItems = [
    { key: 'challenge', label: '挑戦できる環境', category: '価値観', order: 1 },
    { key: 'social', label: '社会貢献性', category: '価値観', order: 2 },
    { key: 'discretion', label: '裁量の大きさ', category: '役割', order: 3 },
    { key: 'specialty', label: '専門性が磨ける', category: '成長機会', order: 4 },
    { key: 'training', label: '研修・育成制度', category: '成長機会', order: 5 },
    { key: 'wlb', label: 'ワークライフバランス', category: '勤務条件', order: 6 },
    { key: 'salary', label: '給与水準', category: '勤務条件', order: 7 },
    { key: 'remote', label: 'リモート柔軟性', category: '勤務条件', order: 8 },
  ]

  const items: Record<string, { id: string }> = {}
  for (const item of visionItems) {
    items[item.key] = await prisma.visionItem.upsert({
      where: { key: item.key },
      update: { label: item.label, category: item.category, order: item.order },
      create: item,
    })
  }

  // 企業ごとの各軸の充実度（1〜5）
  const companyScores: [string, Record<string, number>][] = [
    [companyA.id, { challenge: 5, social: 3, discretion: 4, specialty: 5, training: 3, wlb: 4, salary: 4, remote: 5 }],
    [companyB.id, { challenge: 5, social: 3, discretion: 5, specialty: 4, training: 4, wlb: 2, salary: 5, remote: 3 }],
    [companyC.id, { challenge: 3, social: 4, discretion: 3, specialty: 4, training: 5, wlb: 5, salary: 3, remote: 2 }],
  ]

  for (const [companyId, scores] of companyScores) {
    for (const [key, score] of Object.entries(scores)) {
      await prisma.companyVisionScore.upsert({
        where: { companyId_itemId: { companyId, itemId: items[key].id } },
        update: { score },
        create: { companyId, itemId: items[key].id, score },
      })
    }
  }

  console.log('Seed completed:', {
    ca: ca.name,
    students: [student1.name, student2.name, student3.name],
    companies: [companyA.name, companyB.name, companyC.name],
    visionItems: visionItems.length,
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
