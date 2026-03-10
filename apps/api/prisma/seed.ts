import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const SALT_ROUNDS = 12;

  // ── Owner ──────────────────────────────────────────────────────────────────
  const ownerPassword = await bcrypt.hash('owner123', SALT_ROUNDS);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@flowqueue.com' },
    update: {},
    create: {
      email: 'owner@flowqueue.com',
      password: ownerPassword,
      name: 'FlowQueue Owner',
      role: UserRole.OWNER,
    },
  });
  console.log(`✅ Owner created: ${owner.email}`);

  // ── Manager ────────────────────────────────────────────────────────────────
  const managerPassword = await bcrypt.hash('manager123', SALT_ROUNDS);
  const manager = await prisma.user.upsert({
    where: { email: 'manager1@flowqueue.com' },
    update: {},
    create: {
      email: 'manager1@flowqueue.com',
      password: managerPassword,
      name: 'Alex Manager',
      role: UserRole.MANAGEMENT,
      managementProfile: {
        create: {
          department: 'Operations',
          permissions: ['assign_workers', 'communicate_clients', 'view_projects'],
        },
      },
    },
  });
  console.log(`✅ Manager created: ${manager.email}`);

  // ── Worker ─────────────────────────────────────────────────────────────────
  const workerPassword = await bcrypt.hash('worker123', SALT_ROUNDS);
  const worker = await prisma.user.upsert({
    where: { email: 'worker1@flowqueue.com' },
    update: {},
    create: {
      email: 'worker1@flowqueue.com',
      password: workerPassword,
      name: 'Sam Worker',
      role: UserRole.WORKER,
      workerProfile: {
        create: {
          skills: ['web-development', 'react', 'nodejs', 'typescript'],
          availability: true,
          bio: 'Full-stack developer with 5 years of experience.',
          hourlyRate: 50,
        },
      },
    },
  });
  console.log(`✅ Worker created: ${worker.email}`);

  // ── Client ─────────────────────────────────────────────────────────────────
  const clientPassword = await bcrypt.hash('client123', SALT_ROUNDS);
  const client = await prisma.user.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      email: 'client1@example.com',
      password: clientPassword,
      name: 'Jane Client',
      role: UserRole.CLIENT,
      clientProfile: {
        create: {
          freeProjectsUsed: 0,
          freeProjectsLimit: 3,
          company: 'Example Corp',
          phone: '+1-555-0100',
        },
      },
    },
  });
  console.log(`✅ Client created: ${client.email}`);

  // ── Sample project (in SUBMITTED state for admin to review) ────────────────
  const sampleProject = await prisma.project.upsert({
    where: { id: 'sample-project-001' },
    update: {},
    create: {
      id: 'sample-project-001',
      title: 'E-commerce Website',
      description:
        'Build a modern e-commerce website with product catalog, shopping cart, and payment integration.',
      category: 'Web Development',
      tier: 'STANDARD',
      status: 'SUBMITTED',
      priority: 'NORMAL',
      isFree: true,
      submittedAt: new Date(),
      submittedById: client.id,
      budget: 2500,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1_000), // 30 days from now
      deliverables: 'Responsive website, admin panel, payment gateway integration',
    },
  });
  console.log(`✅ Sample project created: ${sampleProject.title}`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('   Owner:   owner@flowqueue.com   / owner123');
  console.log('   Manager: manager1@flowqueue.com / manager123');
  console.log('   Worker:  worker1@flowqueue.com  / worker123');
  console.log('   Client:  client1@example.com    / client123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
