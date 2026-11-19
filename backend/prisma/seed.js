
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Member@123', 12);
  const member = await prisma.user.upsert({
    where: { email: 'member@svce.edu' },
    update: {},
    create: {
      name: 'SVCE Team Member',
      email: 'member@svce.edu',
      password,
      employeeId: 'SVCE-TM-001',
      department: 'Computer Science',
      designation: 'Team Member',
      role: 'TEAM_MEMBER'
    }
  });

  const project = await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      name: 'SVCE ERP Portal',
      description: 'Demo project for the Team Member module'
    }
  });

  const count = await prisma.task.count({ where: { assignedToId: member.id } });
  if (count === 0) {
    await prisma.task.createMany({
      data: [
        {
          title: 'Develop dashboard components',
          description: 'Build responsive dashboard cards and navigation.',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          progress: 45,
          assignedToId: member.id,
          projectId: project.id,
          dueDate: new Date(Date.now() + 5 * 86400000)
        },
        {
          title: 'Test profile page',
          description: 'Verify profile details and edit functionality.',
          priority: 'MEDIUM',
          status: 'ASSIGNED',
          progress: 0,
          assignedToId: member.id,
          projectId: project.id,
          dueDate: new Date(Date.now() + 8 * 86400000)
        }
      ]
    });
  }
  console.log('Seed complete. Demo login: member@svce.edu / Member@123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
