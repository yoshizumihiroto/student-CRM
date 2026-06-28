import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

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

  console.log('Seed completed:', {
    ca: ca.name,
    students: [student1.name, student2.name, student3.name],
    companies: [companyA.name, companyB.name, companyC.name],
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
